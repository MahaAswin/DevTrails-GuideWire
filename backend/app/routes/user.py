from fastapi import APIRouter, HTTPException, Body, status
from app.database.mongodb import users_collection, reward_payouts_collection
from bson import ObjectId
from typing import Dict
from datetime import datetime
import random
import string

def generate_referral_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

router = APIRouter()

@router.put("/reminder-toggle")
async def toggle_reminder(data: Dict = Body(...)):
    user_id = data.get("user_id")
    enabled = data.get("enabled")
    
    if user_id is None or enabled is None:
        raise HTTPException(status_code=400, detail="user_id and enabled are required")
    
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"reminderEnabled": enabled}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": f"Reminders {'enabled' if enabled else 'disabled'} successfully"}

@router.get("/rewards/{user_id}")
async def get_rewards(user_id: str):
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    points = user.get("rewardPoints", 0)
    return {
        "rewardPoints": points,
        "eligible_for_claim": points >= 1000
    }

@router.post("/claim-reward")
async def claim_reward(data: Dict = Body(...)):
    user_id = data.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
        
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    points = user.get("rewardPoints", 0)
    if points < 1000:
        raise HTTPException(status_code=400, detail="Insufficient reward points (minimum 1000 required)")
        
    # Deduct points immediately to prevent double-spending
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"rewardPoints": -1000}}
    )
    
    # Create a pending payout request
    payout_request = {
        "user_id": user_id,
        "user_name": user.get("name"),
        "user_email": user.get("email"),
        "points_deducted": 1000,
        "amount_inr": 10,
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    reward_payouts_collection.insert_one(payout_request)
    
@router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Auto-generate referral code if missing
    ref_code = user.get("referralCode")
    if not ref_code or ref_code == "N/A":
        ref_code = generate_referral_code()
        # Ensure name unique-ness isn't needed here, just code needs to be unique-ish
        users_collection.update_one({"_id": user["_id"]}, {"$set": {"referralCode": ref_code}})
        
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone", "N/A"),
        "platform": user.get("platform", "Unknown"),
        "city": user.get("city", "Unknown"),
        "role": user.get("role", "worker"),
        "referralCode": ref_code,
        "rewardPoints": user.get("rewardPoints", 0),
        "reminderEnabled": user.get("reminderEnabled", True),
        "wallet_balance": user.get("wallet_balance", 0)
    }

@router.put("/update-profile")
async def update_profile(data: Dict = Body(...)):
    user_id = data.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
        
    update_data = {}
    if "phone" in data:
        update_data["phone"] = data["phone"]
    if "city" in data:
        update_data["city"] = data["city"]
        
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Return updated profile
    return await get_profile(user_id)
