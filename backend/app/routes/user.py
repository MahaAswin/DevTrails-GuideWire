from fastapi import APIRouter, HTTPException, Body, status
from app.db.mongodb import users_collection, db
from bson import ObjectId
from typing import Dict

router = APIRouter()

@router.get("/profile/{user_id}")
async def get_user_profile(user_id: str):
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    user = users_collection.find_one({"_id": oid})
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

@router.put("/update-profile")
async def update_profile(data: Dict = Body(...)):
    user_id = data.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    update_data = {}
    if "name" in data:
        update_data["name"] = data["name"]

    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    user = users_collection.find_one({"_id": ObjectId(user_id)})
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
    }
