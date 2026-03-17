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

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    # Check if user exists
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user document
    user_dict = user.model_dump()
    user_dict["password"] = hash_password(user_dict["password"])
    
    result = users_collection.insert_one(user_dict)
    
    # Return response without password
    response_data = user.model_dump(exclude={"password"})
    response_data["id"] = str(result.inserted_id)
    
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
        "platform": user.get("platform", "None"),
        "city": user.get("city", "None"),
        "role": user.get("role", "worker")
    }
