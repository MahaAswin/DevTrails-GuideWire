from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    name: str = Field(..., example="Ramesh Sharma")
    email: EmailStr = Field(..., example="ramesh@example.com")
    phone: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$", example="+919876543210")
    password: str = Field(..., min_length=6, example="securepassword")
    platform: str = Field(..., example="Zomato") # Zomato, Swiggy, Zepto, Amazon, Dunzo
    city: str = Field(..., example="Bangalore")
    role: Optional[str] = Field("worker", example="worker") # worker or admin
    referred_by: Optional[str] = Field(None, example="REF123")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="ramesh@example.com")
    password: str = Field(..., example="securepassword")

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str
    platform: str
    city: str
    role: str
    referral_code: str
    referral_points: int
    reminderEnabled: bool
    wallet_balance: Optional[float] = 0
