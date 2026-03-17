import asyncio
import sys
import os

# Add the parent directory to sys.path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.weather_service import weather_service
from app.database.mongodb import users_collection, weather_claims_collection, wallet_transactions_collection

async def test_weather_logic():
    print("--- Testing Weather Logic ---")
    
    # Test rain processing logic directly
    cities = ["Mumbai", "London", "Coimbatore"]
    for city in cities:
        data = await weather_service.get_weather(city)
        print(f"City: {data['city']}, Weather: {data['weather']}, Rain: {data['rain_level']}mm, Eligible: {data['eligible_for_claim']}, Payout: ₹{data['payout']}")
    
    # Mock user for claim testing
    email = "test_worker@shieldgig.com"
    user = users_collection.find_one({"email": email})
    if not user:
        users_collection.insert_one({
            "name": "Test Worker",
            "email": email,
            "platform": "Zomato",
            "city": "Coimbatore",
            "wallet_balance": 1000,
            "role": "worker"
        })
        user = users_collection.find_one({"email": email})
    
    print(f"\nInitial Balance for {email}: ₹{user['wallet_balance']}")
    
    # Clean up previous claims for today to allow testing
    from datetime import datetime
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    weather_claims_collection.delete_many({"user_id": str(user["_id"]), "created_at": {"$gte": today_start}})
    
    # We can't easily call the route without a running server here, but we can test the internal logic
    # extracted from the route:
    
    # 1. Get eligible weather
    weather_info = {
        "eligible_for_claim": True,
        "rain_level": 5.5,
        "payout": 200
    }
    
    # 2. Record claim
    claim_record = {
        "user_id": str(user["_id"]),
        "city": "Coimbatore",
        "rain_level": weather_info["rain_level"],
        "payout": weather_info["payout"],
        "status": "approved",
        "created_at": datetime.utcnow()
    }
    weather_claims_collection.insert_one(claim_record)
    
    # 3. Update wallet
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$inc": {"wallet_balance": weather_info["payout"]}}
    )
    
    updated_user = users_collection.find_one({"email": email})
    print(f"Updated Balance for {email}: ₹{updated_user['wallet_balance']}")
    
    if updated_user['wallet_balance'] == user['wallet_balance'] + weather_info['payout']:
        print("✅ Wallet update successful!")
    else:
        print("❌ Wallet update failed!")

if __name__ == "__main__":
    asyncio.run(test_weather_logic())
