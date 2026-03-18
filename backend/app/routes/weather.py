from fastapi import APIRouter, HTTPException, Depends
from app.services.weather_service import weather_service
from app.database.mongodb import users_collection, weather_claims_collection, wallet_transactions_collection
from app.models.weather_model import WeatherClaim
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.get("/current")
async def get_current_weather(city: str):
    weather_data = await weather_service.get_weather(city)
    return weather_data

@router.post("/weather-claim")
async def process_weather_claim(claim_data: dict):
    user_email = claim_data.get("email")
    city = claim_data.get("city")
    
    if not user_email or not city:
        raise HTTPException(status_code=400, detail="Email and city are required")

    user = users_collection.find_one({"email": user_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch current weather to verify eligibility
    weather_info = await weather_service.get_weather(city)
    
    if not weather_info["eligible_for_claim"]:
        raise HTTPException(status_code=400, detail="Not eligible for claim based on current weather")

    # Prevent duplicate claims for the same user on the same day (simplified check)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    existing_claim = weather_claims_collection.find_one({
        "user_id": str(user["_id"]),
        "created_at": {"$gte": today_start}
    })
    
    if existing_claim:
        raise HTTPException(status_code=400, detail="Daily claim already processed")

    # Record the claim
    claim_record = {
        "user_id": str(user["_id"]),
        "city": city,
        "rain_level": weather_info["rain_level"],
        "payout": weather_info["payout"],
        "status": "approved",
        "created_at": datetime.utcnow()
    }
    weather_claims_collection.insert_one(claim_record)

    # Update wallet balance
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$inc": {"wallet_balance": weather_info["payout"]}}
    )

    # Log wallet transaction
    transaction_log = {
        "user_id": str(user["_id"]),
        "amount": weather_info["payout"],
        "type": "claim_credit",
        "description": f"Weather Claim Payout (Rain: {weather_info['rain_level']}mm)",
        "status": "approved",
        "created_at": datetime.utcnow()
    }
    wallet_transactions_collection.insert_one(transaction_log)

    return {
        "status": "success", 
        "message": f"Claim approved! ₹{weather_info['payout']} added to your wallet.",
        "payout": weather_info["payout"]
    }
