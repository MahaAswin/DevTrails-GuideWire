from fastapi import APIRouter, HTTPException, status
from app.models.user_model import UserCreate, UserLogin, UserResponse
from app.database.mongodb import users_collection
from bson import ObjectId

router = APIRouter()

# Simple mock hashing for the prototype, in production use passlib/bcrypt
def hash_password(password: str) -> str:
    return password + "_hashed"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return plain_password + "_hashed" == hashed_password

import random
import string

def generate_referral_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    # Check if email exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if phone exists (for uniqueness)
    if users_collection.find_one({"phone": user.phone}):
        raise HTTPException(status_code=400, detail="Phone number already registered")

    # Generate unique referral code for new user
    referral_code = generate_referral_code()
    while users_collection.find_one({"referralCode": referral_code}):
        referral_code = generate_referral_code()

    # Create new user document
    user_dict = user.model_dump()
    user_dict["password"] = hash_password(user_dict["password"])
    user_dict["referralCode"] = referral_code
    user_dict["rewardPoints"] = 0
    user_dict["reminderEnabled"] = True
    
    # Handle referral logic
    if user.referredBy:
        if user.referredBy == referral_code:
             raise HTTPException(status_code=400, detail="You cannot refer yourself")
        
        referrer = users_collection.find_one({"referralCode": user.referredBy})
        if referrer:
            # Credit both users 100 points
            user_dict["rewardPoints"] += 100
            users_collection.update_one(
                {"_id": referrer["_id"]},
                {"$inc": {"rewardPoints": 100}}
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid referral code")

    result = users_collection.insert_one(user_dict)
    
    # Return response
    response_data = user.model_dump(exclude={"password"})
    response_data["id"] = str(result.inserted_id)
    response_data["referralCode"] = referral_code
    response_data["rewardPoints"] = user_dict["rewardPoints"]
    response_data["reminderEnabled"] = True
    response_data["wallet_balance"] = user_dict.get("wallet_balance", 0)
    
    return response_data

@router.post("/login", response_model=UserResponse)
async def login_user(login_data: UserLogin):
    user = users_collection.find_one({"email": login_data.email})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    if not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    # Return user details for frontend state (simulating JWT payload)
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone", "N/A"),
        "platform": user.get("platform", "None"),
        "city": user.get("city", "None"),
        "role": user.get("role", "worker"),
        "referralCode": user.get("referralCode", "N/A"),
        "rewardPoints": user.get("rewardPoints", 0),
        "reminderEnabled": user.get("reminderEnabled", True),
        "wallet_balance": user.get("wallet_balance", 0)
    }
