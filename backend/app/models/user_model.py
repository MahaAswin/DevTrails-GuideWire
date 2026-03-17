from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    name: str = Field(..., example="Ramesh Sharma")
    email: EmailStr = Field(..., example="ramesh@example.com")
    password: str = Field(..., min_length=6, example="securepassword")
    platform: str = Field(..., example="Zomato") # Zomato, Swiggy, Zepto, Amazon, Dunzo
    city: str = Field(..., example="Bangalore")
    role: Optional[str] = Field("worker", example="worker") # worker or admin

class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="ramesh@example.com")
    password: str = Field(..., example="securepassword")

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    platform: str
    city: str
    role: str
