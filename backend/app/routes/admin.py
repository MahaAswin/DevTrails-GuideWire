from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel, Field
from app.database.mongodb import users_collection, policies_collection, claims_collection, reports_collection, payments_collection, claim_reports_collection, wallet_transactions_collection, reward_payouts_collection, DATABASE_NAME
from datetime import datetime
from bson import ObjectId

router = APIRouter()

# --- Models ---
class PolicyCreate(BaseModel):
    name: str = Field(..., example="Monsoon Heatwave Protection")
    platform: str = Field(..., example="Zomato") # Or "All"
    weekly_premium: int = Field(..., example=45)
    max_coverage: int = Field(..., example=5000)
    trigger_condition: str = Field(..., example="IMD Red Alert or Temp > 45°C")
    description: str = Field(..., example="Comprehensive coverage against extreme monsoon conditions.")
    detailed_benefits: str = Field(..., example="Includes protection for lost income and accidental damages.")

def serialize_mongo_doc(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

# --- Routes ---

@router.get("/users")
async def get_all_users():
    users = []
    for user in users_collection.find():
        users.append(serialize_mongo_doc(user))
    return users

@router.get("/policies")
async def get_all_policies():
    policies = []
    for policy in policies_collection.find():
        policies.append(serialize_mongo_doc(policy))
    return policies

@router.post("/add-policy")
async def add_policy(policy: PolicyCreate):
    policy_dict = policy.model_dump()
    result = policies_collection.insert_one(policy_dict)
    
    response_data = policy.model_dump()
    response_data["id"] = str(result.inserted_id)
    return {"message": "Policy created successfully", "policy": response_data}

@router.get("/reports")
async def get_all_reports():
    reports = []
    for report in reports_collection.find():
        reports.append(serialize_mongo_doc(report))
    return reports

@router.get("/claims")
async def get_all_claims():
    claims = []
    for claim in claims_collection.find():
        claims.append(serialize_mongo_doc(claim))
    return claims

from fastapi import Body

@router.get("/db-stats")
async def get_db_stats():
    return {
        "database": DATABASE_NAME,
        "counts": {
            "users": users_collection.count_documents({}),
            "policies": policies_collection.count_documents({}),
            "claims": claims_collection.count_documents({}),
            "reports": reports_collection.count_documents({}),
            "payments": payments_collection.count_documents({}),
            "claim_reports": claim_reports_collection.count_documents({})
        }
    }

@router.get("/pending-payments")
async def get_pending_payments():
    payments = []
    for p in payments_collection.find({"status": "pending"}):
        p["id"] = str(p["_id"])
        del p["_id"]
        payments.append(p)
    return payments

@router.post("/approve-payment")
async def approve_payment(payload: dict = Body(...)):
    payment_id = payload.get("payment_id")
    status_choice = payload.get("status") # 'approved' or 'rejected'
    
    payment = payments_collection.find_one({"_id": ObjectId(payment_id)})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if status_choice == "approved":
        users_collection.update_one(
            {"_id": ObjectId(payment["user_id"])},
            {"$inc": {"wallet_balance": payment["amount"]}}
        )
        payments_collection.update_one({"_id": ObjectId(payment_id)}, {"$set": {"status": "approved"}})
        
        # Log to ledger
        wallet_transactions_collection.insert_one({
            "user_id": str(payment["user_id"]),
            "type": "deposit",
            "amount": payment["amount"],
            "reference_payment_id": str(payment["_id"]),
            "description": f"Deposit Verified: {payment.get('payment_method', 'Manual')}",
            "created_at": datetime.utcnow()
        })
        
        return {"message": "Payment approved and wallet balance updated."}
    else:
        payments_collection.update_one({"_id": ObjectId(payment_id)}, {"$set": {"status": "rejected"}})
        return {"message": "Payment rejected."}

@router.get("/pending-claims")
async def get_pending_claims():
    claims = []
    for c in claim_reports_collection.find({"status": {"$in": ["pending", "under_review"]}}):
        c["id"] = str(c["_id"])
        del c["_id"]
        claims.append(c)
    return claims

@router.post("/verify-claim")
async def verify_claim(payload: dict = Body(...)):
    claim_id = payload.get("claim_id")
    status_choice = payload.get("status") # 'approved' or 'rejected'
    payout_amt = payload.get("payout_amount", 0)
    
    claim = claim_reports_collection.find_one({"_id": ObjectId(claim_id)})
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    if status_choice == "approved":
        users_collection.update_one(
            {"_id": ObjectId(claim["worker_id"])},
            {"$inc": {"wallet_balance": payout_amt}}
        )
        
        payments_collection.insert_one({
            "user_id": claim["worker_id"],
            "worker_name": claim["worker_name"],
            "amount": payout_amt,
            "payment_method": "Insurance Claim",
            "transaction_id": f"CLM-{ObjectId()}",
            "status": "approved",
            "description": f"Claim Approved: {claim['report_type']}",
            "created_at": datetime.utcnow()
        })
        
        # Log to ledger
        wallet_transactions_collection.insert_one({
            "user_id": str(claim["worker_id"]),
            "type": "claim_credit",
            "amount": payout_amt,
            "reference_payment_id": str(claim["_id"]),
            "description": f"Claim Approved: {claim.get('report_type', 'Emergency')}",
            "created_at": datetime.utcnow()
        })
        
        claim_reports_collection.update_one(
            {"_id": ObjectId(claim_id)},
            {"$set": {"status": "approved", "payout": payout_amt}}
        )
        return {"message": "Claim approved and paid out."}
    else:
        claim_reports_collection.update_one(
            {"_id": ObjectId(claim_id)},
            {"$set": {"status": "rejected"}}
        )
        return {"message": "Claim rejected."}

@router.post("/resolve-report")
async def resolve_report(payload: dict = Body(...)):
    report_id = payload.get("report_id")
    payout_amount = payload.get("payout_amount", 0)
    
    report = reports_collection.find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    worker_id = report.get("worker_id")
    # Payout to wallet
    users_collection.update_one(
        {"_id": ObjectId(worker_id)},
        {"$inc": {"wallet_balance": payout_amount}}
    )
    
    # Mark report as resolved
    reports_collection.update_one(
        {"_id": ObjectId(report_id)},
        {"$set": {"status": "resolved", "payout": payout_amount}}
    )

    # Log to ledger
    wallet_transactions_collection.insert_one({
        "user_id": str(worker_id),
        "type": "claim_credit",
        "amount": payout_amount,
        "reference_payment_id": str(report["_id"]),
        "description": f"Report Resolved: {report.get('report_type', 'Manual Credit')}",
        "created_at": datetime.utcnow()
    })
    
@router.get("/reward-payouts/pending")
async def get_pending_reward_payouts():
    payouts = []
    for p in reward_payouts_collection.find({"status": "pending"}):
        p["id"] = str(p["_id"])
        del p["_id"]
        payouts.append(p)
    return payouts

@router.post("/process-reward-payout")
async def process_reward_payout(payload: dict = Body(...)):
    payout_id = payload.get("payout_id")
    status_choice = payload.get("status") # 'approved' or 'rejected'
    
    payout = reward_payouts_collection.find_one({"_id": ObjectId(payout_id)})
    if not payout:
        raise HTTPException(status_code=404, detail="Payout request not found")
        
    user_id = payout["user_id"]
    
    if status_choice == "approved":
        # Credit ₹10 to wallet
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"wallet_balance": 10}}
        )
        
        # Log to wallet transactions
        wallet_transactions_collection.insert_one({
            "user_id": user_id,
            "type": "reward_credit",
            "amount": 10,
            "description": "Reward Points Exchange (1000 pts -> ₹10)",
            "status": "approved",
            "created_at": datetime.utcnow()
        })
        
        reward_payouts_collection.update_one(
            {"_id": ObjectId(payout_id)},
            {"$set": {"status": "approved", "processed_at": datetime.utcnow()}}
        )
        return {"message": "Payout approved! ₹10 credited to worker wallet."}
    else:
        # Refund 1000 points
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"rewardPoints": 1000}}
        )
        
        reward_payouts_collection.update_one(
            {"_id": ObjectId(payout_id)},
            {"$set": {"status": "rejected", "processed_at": datetime.utcnow()}}
        )
        return {"message": "Payout rejected. 1000 points refunded to worker."}
