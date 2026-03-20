from pydantic import BaseModel, EmailStr, constr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: constr(pattern=r"^\+?[1-9]\d{9,14}$")
    password: constr(min_length=6)
    platform: str  # Zomato, Swiggy, Zepto, Amazon, Dunzo
    city: str
    role: Optional[str] = "worker"  # worker or admin
    referred_by: str = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

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
