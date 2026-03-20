from datetime import datetime, timedelta
import os
import random
import string

from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from starlette.requests import Request
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
import asyncio

# Enable insecure transport for local development (fixes 'mismatching_state' CSRF)
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

from passlib.context import CryptContext

from app.models.user_model import UserCreate, UserLogin, UserResponse
from app.db.mongodb import users_collection

# Import AI utilities (wrapped in try for safety during install/setup)
try:
    from app.utils.ai_email import generate_email_content
    from app.utils.email import send_email
except ImportError:
    print("Warning: Email utilities or Gemini not fully installed yet.")
    generate_email_content = None
    send_email = None


router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", os.getenv("SECRET_KEY", "shieldgig-jwt-secret"))
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24  # 24 hours

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

oauth = OAuth()
if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    oauth.register(
        name="google",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"}
    )

security = HTTPBearer()

import hashlib
import bcrypt
from passlib.context import CryptContext

# Maintain pwd_context for potential other uses or legacy checks if needed, 
# but we will use direct bcrypt for primary hashing/verification to fix compatibility issues.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash password with SHA-256 before bcrypt to bypass 72-byte limit."""
    pre_hash = hashlib.sha256(password.encode()).hexdigest()
    # bcrypt expects bytes for both password and salt
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pre_hash.encode(), salt)
    return hashed.decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password with dual strategy for backward compatibility."""
    try:
        # Binary versions needed for bcrypt
        p_bytes = plain_password.encode()
        h_bytes = hashed_password.encode()

        # 1. Try with SHA-256 pre-hash (New logic)
        pre_hash = hashlib.sha256(p_bytes).hexdigest().encode()
        if bcrypt.checkpw(pre_hash, h_bytes):
            return True

        # 2. Try WITHOUT pre-hash (Old logic for existing users)
        if bcrypt.checkpw(p_bytes, h_bytes):
            return True
            
    except Exception as e:
        # Fallback to passlib if direct bcrypt fails (e.g. for legacy identifying prefixes)
        try:
            # Try new logic with passlib
            pre_hash_str = hashlib.sha256(plain_password.encode()).hexdigest()
            if pwd_context.verify(pre_hash_str, hashed_password):
                return True
            # Try old logic with passlib
            if pwd_context.verify(plain_password, hashed_password):
                return True
        except:
            pass
            
    return False


def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def generate_referral_code(length: int = 8) -> str:
    return "REF" + "".join(random.choices(string.ascii_uppercase + string.digits, k=length - 3))


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, background_tasks: BackgroundTasks):
    if len(user.password) > 128:
        raise HTTPException(status_code=400, detail="Password too long (max 128 characters)")
    
    try:
        if users_collection.find_one({"email": user.email}):
            raise HTTPException(status_code=400, detail="Email already registered")

        if users_collection.find_one({"phone": user.phone}):
            raise HTTPException(status_code=400, detail="Phone number already registered")

        referral_code = generate_referral_code()
        while users_collection.find_one({"referral_code": referral_code}):
            referral_code = generate_referral_code()

        user_dict = user.model_dump()
        user_dict["password"] = hash_password(user_dict["password"])
        user_dict["referral_code"] = referral_code
        user_dict["referral_points"] = 0
        user_dict["wallet_balance"] = 0.0
        user_dict["reminderEnabled"] = True
        user_dict["created_at"] = datetime.utcnow()
        user_dict["role"] = user_dict.get("role") or "worker"

        result = users_collection.insert_one(user_dict)
        user_id = str(result.inserted_id)

        # --- AI Email Notification (Non-blocking) ---
        if generate_email_content and send_email:
            async def send_welcome_email_task():
                try:
                    email_body = await generate_email_content("register", user_dict["name"])
                    await send_email("Welcome to ShieldGig 🎉", user.email, email_body)
                    log_event(f"Welcome email sent to {user.email}")
                except Exception as e:
                    log_error(f"Background email task failed for {user.email}: {e}", traceback.format_exc())
            
            background_tasks.add_task(send_welcome_email_task)
        # ----------------------------

        log_event(f"New user registered: {user.email}")

        response_data = {
            "id": user_id,
            "name": user_dict["name"],
            "email": user_dict["email"],
            "phone": user_dict.get("phone", "N/A"),
            "platform": user_dict.get("platform", "None"),
            "city": user_dict.get("city", "None"),
            "role": user_dict["role"],
            "referral_code": referral_code,
            "referral_points": 0,
            "wallet_balance": 0.0,
            "reminderEnabled": True
        }

        return response_data
    except HTTPException as he:
        raise he
    except Exception as e:
        error_trace = traceback.format_exc()
        logger.error(f"CRITICAL: Registration failed for {user.email}\n{error_trace}")
        raise HTTPException(status_code=500, detail="Registration failed due to server error. Please try again later.")


@router.post("/login", response_model=UserResponse)
async def login_user(login_data: UserLogin):
    user = users_collection.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone", "N/A"),
        "platform": user.get("platform", "None"),
        "city": user.get("city", "None"),
        "role": user.get("role", "worker"),
        "referral_code": user.get("referral_code", "N/A"),
        "referral_points": user.get("referral_points", 0),
        "reminderEnabled": user.get("reminderEnabled", True),
        "wallet_balance": user.get("wallet_balance", 0.0),
    }


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/token", response_model=TokenResponse)
async def login_token(login_data: UserLogin):
    user = users_collection.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"]), "email": user["email"]})
    return TokenResponse(access_token=token)


@router.get("/google/login")
async def google_login(request: Request):
    if not oauth.google:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    return await oauth.google.authorize_redirect(request, GOOGLE_REDIRECT_URI)


@router.get("/google/callback")
async def google_callback(request: Request):
    if not oauth.google:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
        
    try:
        # Explicitly pass redirect_uri to prevent 'invalid_grant' on local environments
        token_data = await oauth.google.authorize_access_token(request)
    except Exception as e:
        print(f"OAuth Exchange Error: {e}")
        raise HTTPException(status_code=400, detail=f"OAuth failed: {e}")
        
    user_info = token_data.get("userinfo")
    if not user_info:
        try:
            user_info = await oauth.google.parse_id_token(request, token_data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch user info: {str(e)}")
            
    if not user_info:
        raise HTTPException(status_code=400, detail="Failed to fetch user info from Google entirely")
        
    email = user_info.get("email")
    name = user_info.get("name")
    
    user = users_collection.find_one({"email": email})
    if not user:
        referral_code = generate_referral_code()
        while users_collection.find_one({"referral_code": referral_code}):
            referral_code = generate_referral_code()
            
        new_user = {
            "name": name,
            "email": email,
            "password": hash_password(os.urandom(16).hex()),
            "referral_code": referral_code,
            "referral_points": 0,
            "wallet_balance": 0.0,
            "reminderEnabled": True,
            "created_at": datetime.utcnow(),
            "role": "worker"
        }
        result = users_collection.insert_one(new_user)
        user_id = str(result.inserted_id)
        
        # Async email for new Google user
        if generate_email_content and send_email:
            async def send_welcome():
                try:
                    email_body = await generate_email_content("register", name)
                    await send_email("Welcome to ShieldGig 🎉", email, email_body)
                except Exception as e:
                    print(f"Error sending welcome email: {e}")
            asyncio.create_task(send_welcome())
    else:
        user_id = str(user["_id"])

    token = create_access_token({"sub": user_id, "email": email})
    redirect_url = f"{FRONTEND_URL}/?token={token}"
    return RedirectResponse(url=redirect_url)


@router.get("/me", response_model=UserResponse)
async def get_me(credentials: HTTPAuthorizationCredentials = security):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone", "N/A"),
        "platform": user.get("platform", "None"),
        "city": user.get("city", "None"),
        "role": user.get("role", "worker"),
        "referral_code": user.get("referral_code", "N/A"),
        "referral_points": user.get("referral_points", 0),
        "reminderEnabled": user.get("reminderEnabled", True),
        "wallet_balance": user.get("wallet_balance", 0.0),
    }
