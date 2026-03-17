from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.mongodb import users_collection, policies_collection, wallet_transactions_collection
from bson import ObjectId

router = APIRouter()

class ActivatePolicyRequest(BaseModel):
    worker_email: str
    policy_id: str

@router.post("/activate-policy")
async def activate_policy(request: ActivatePolicyRequest):
    # Check if user exists and has enough balance
    user = users_collection.find_one({"email": request.worker_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check if policy exists
    policy = policies_collection.find_one({"_id": ObjectId(request.policy_id)})
    if not policy:
        policy = policies_collection.find_one({"name": request.policy_id})
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
    
    premium = policy.get("weekly_premium", 0)
    current_balance = user.get("wallet_balance", 0)
    
    if current_balance < premium:
        raise HTTPException(status_code=400, detail=f"Insufficient wallet balance. Policy requires ₹{premium}, you have ₹{current_balance}.")
    
    # Update user's active policies and deduct balance
    users_collection.update_one(
        {"email": request.worker_email},
        {
            "$addToSet": {"active_policies": str(policy.get("_id")) or policy.get("name")},
            "$inc": {"wallet_balance": -premium}
        }
    )
    
    # Record the transaction
    from datetime import datetime
    wallet_transactions_collection.insert_one({
        "user_id": str(user["_id"]),
        "type": "policy_payment",
        "amount": -premium,
        "reference_payment_id": str(policy.get("_id")) or policy.get("name"),
        "description": f"Policy Activation: {policy['name']}",
        "created_at": datetime.utcnow()
    })
    
    return {"message": f"Policy activated. ₹{premium} deducted from wallet."}

@router.get("/", summary="Get all workers")
async def get_workers():
    # ... existing code ...
    return {"message": "List of workers"}

@router.get("/{worker_id}", summary="Get worker details")
async def get_worker(worker_id: str):
    return {"worker_id": worker_id, "name": "John Doe", "risk_score": 0.5}

class UpdateCityRequest(BaseModel):
    worker_email: str
    new_city: str

@router.patch("/update-city")
async def update_city(request: UpdateCityRequest):
    user = users_collection.find_one({"email": request.worker_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    users_collection.update_one(
        {"email": request.worker_email},
        {"$set": {"city": request.new_city}}
    )
    
    return {"message": f"City updated to {request.new_city}", "city": request.new_city}
