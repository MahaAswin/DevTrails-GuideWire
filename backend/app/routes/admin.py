from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from app.db.mongodb import (
    users_collection,
    policies_collection,
    claims_collection,
    transactions_collection,
    wallet_transactions_collection,
    reports_collection,
    reward_payouts_collection,
    referrals_collection,
    payments_collection
)
from app.utils.logger import log_event, log_error
from app.utils.email import send_email


router = APIRouter()


def serialize_mongo_doc(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


def _safe_object_id(oid: str) -> Optional[ObjectId]:
    try:
        return ObjectId(oid)
    except Exception:
        return None


class PolicyCreate(BaseModel):
    name: str
    platform: str
    weekly_premium: int
    max_coverage: int
    trigger_condition: str
    description: str
    detailed_benefits: str


class VerifyClaimBody(BaseModel):
    claim_id: str
    status: str  # approved / rejected
    payout_amount: float = 0


class ApprovePaymentBody(BaseModel):
    payment_id: str
    status: str  # approved / rejected


class ResolveReportBody(BaseModel):
    report_id: str
    payout_amount: float = 0


class ProcessRewardPayoutBody(BaseModel):
    payout_id: str
    status: str  # approved / rejected


@router.get("/users")
async def get_all_users():
    return [serialize_mongo_doc(u) for u in users_collection.find()]


@router.get("/policies")
async def get_all_policies():
    return [serialize_mongo_doc(p) for p in policies_collection.find()]


@router.post("/add-policy")
async def add_policy(policy: PolicyCreate):
    doc = policy.dict()
    doc["created_at"] = datetime.utcnow()
    result = policies_collection.insert_one(doc)
    return {"message": "Policy created successfully", "policy_id": str(result.inserted_id)}


@router.get("/claims")
async def get_all_claims():
    return [serialize_mongo_doc(c) for c in claims_collection.find().sort("created_at", -1)]


@router.get("/pending-claims")
async def get_pending_claims():
    claims = claims_collection.find({"status": {"$in": ["pending", "under_review"]}}).sort(
        "created_at", -1
    )
    return [serialize_mongo_doc(c) for c in claims]


@router.post("/verify-claim")
async def verify_claim(body: VerifyClaimBody, background_tasks: BackgroundTasks):
    claim_oid = _safe_object_id(body.claim_id)
    if not claim_oid:
        raise HTTPException(status_code=400, detail="Invalid claim_id")

    claim = claims_collection.find_one({"_id": claim_oid})
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    user_id = claim.get("user_id")
    user = users_collection.find_one({"_id": ObjectId(user_id)}) if user_id else None

    if body.status == "approved":
        payout_amt = float(body.payout_amount or 0)
        if user:
            users_collection.update_one({"_id": user["_id"]}, {"$inc": {"wallet_balance": payout_amt}})

        claims_collection.update_one(
            {"_id": claim_oid},
            {"$set": {"status": "approved", "payout": payout_amt, "verified_at": datetime.utcnow()}},
        )

        transactions_collection.insert_one({
            "user_id": user_id,
            "type": "credit",
            "category": "claim_payout",
            "amount": payout_amt,
            "description": f"Claim Approved: {claim.get('type', 'Medical')}",
            "status": "approved",
            "reference_id": str(claim_oid),
            "created_at": datetime.utcnow(),
        })

        if user:
            background_tasks.add_task(send_email, "Claim Approved", user["email"], f"Your claim for {claim.get('type')} has been approved. INR {payout_amt} credited to your wallet.")
        
        log_event(f"Claim approved: {body.claim_id} for user {user_id}")
        return {"message": "Claim approved and paid out."}

    if body.status == "rejected":
        claims_collection.update_one({"_id": claim_oid}, {"$set": {"status": "rejected", "verified_at": datetime.utcnow()}})
        if user:
            background_tasks.add_task(send_email, "Claim Rejected", user["email"], f"Your claim for {claim.get('type')} has been rejected.")
        return {"message": "Claim rejected."}

    raise HTTPException(status_code=400, detail="status must be approved or rejected")


@router.get("/reports")
async def get_all_reports():
    return [serialize_mongo_doc(r) for r in reports_collection.find()]


@router.post("/resolve-report")
async def resolve_report(body: ResolveReportBody):
    report_oid = _safe_object_id(body.report_id)
    if not report_oid:
        raise HTTPException(status_code=400, detail="Invalid report_id")

    report = reports_collection.find_one({"_id": report_oid})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    payout_amount = float(body.payout_amount or 0)
    worker_id = report.get("worker_id")
    worker_oid = _safe_object_id(str(worker_id)) if worker_id else None

    if worker_oid:
        users_collection.update_one({"_id": worker_oid}, {"$inc": {"wallet_balance": payout_amount}})

    reports_collection.update_one(
        {"_id": report_oid},
        {"$set": {"status": "resolved", "payout": payout_amount}},
    )

    wallet_transactions_collection.insert_one(
        {
            "user_id": str(worker_id),
            "type": "claim_credit",
            "amount": payout_amount,
            "description": f"Report Resolved: {report.get('problem_type', 'Manual Credit')}",
            "status": "approved",
            "reference_payment_id": str(report_oid),
            "transaction_id": f"RPT-{str(report_oid)}",
            "created_at": datetime.utcnow(),
        }
    )

    return {"message": "Report resolved and payout sent to worker wallet."}


@router.get("/pending-payments")
async def get_pending_payments():
    pending = payments_collection.find({"status": "pending"}).sort("created_at", -1)
    return [serialize_mongo_doc(p) for p in pending]


@router.post("/approve-payment")
async def approve_payment(body: ApprovePaymentBody, background_tasks: BackgroundTasks):
    payment_oid = _safe_object_id(body.payment_id)
    if not payment_oid:
        raise HTTPException(status_code=400, detail="Invalid payment_id")

    payment = payments_collection.find_one({"_id": payment_oid})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    user_id = payment.get("user_id")
    user = users_collection.find_one({"_id": ObjectId(user_id)}) if user_id else None

    if body.status == "approved":
        amount = float(payment.get("amount", 0))
        if user:
            users_collection.update_one({"_id": user["_id"]}, {"$inc": {"wallet_balance": amount}})

        payments_collection.update_one({"_id": payment_oid}, {"$set": {"status": "approved", "verified_at": datetime.utcnow()}})

        transactions_collection.insert_one({
            "user_id": user_id,
            "type": "credit",
            "category": "deposit",
            "amount": amount,
            "description": f"Deposit Verified via {payment.get('payment_method', 'Manual')}",
            "status": "approved",
            "reference_id": payment.get("transaction_id"),
            "created_at": datetime.utcnow(),
        })

        if user:
            background_tasks.add_task(send_email, "Payment Approved", user["email"], f"Your deposit of INR {amount} has been approved and credited to your wallet.")

        log_event(f"Payment approved: {body.payment_id} for user {user_id}")
        return {"message": "Payment approved and wallet balance updated."}

    if body.status == "rejected":
        payments_collection.update_one({"_id": payment_oid}, {"$set": {"status": "rejected", "verified_at": datetime.utcnow()}})
        if user:
            background_tasks.add_task(send_email, "Payment Rejected", user["email"], f"Your deposit of INR {payment.get('amount')} has been rejected.")
        return {"message": "Payment rejected."}

    raise HTTPException(status_code=400, detail="status must be approved or rejected")


@router.get("/reward-payouts/pending")
async def get_pending_reward_payouts():
    payouts = reward_payouts_collection.find({"status": "pending"}).sort("created_at", -1)
    return [serialize_mongo_doc(p) for p in payouts]


@router.post("/process-reward-payout")
async def process_reward_payout(body: ProcessRewardPayoutBody):
    payout_oid = _safe_object_id(body.payout_id)
    if not payout_oid:
        raise HTTPException(status_code=400, detail="Invalid payout_id")

    payout = reward_payouts_collection.find_one({"_id": payout_oid})
    if not payout:
        raise HTTPException(status_code=404, detail="Payout request not found")

    user_oid = _safe_object_id(str(payout.get("user_id", "")))
    amount_inr = float(payout.get("amount_inr", 10))

    if body.status == "approved":
        if user_oid:
            users_collection.update_one({"_id": user_oid}, {"$inc": {"wallet_balance": amount_inr}})

        reward_payouts_collection.update_one(
            {"_id": payout_oid},
            {"$set": {"status": "approved", "processed_at": datetime.utcnow()}},
        )

        wallet_transactions_collection.insert_one(
            {
                "user_id": str(payout.get("user_id", "")),
                "type": "reward_credit",
                "amount": amount_inr,
                "description": "Reward Points Exchange",
                "status": "approved",
                "transaction_id": f"RWD-{str(payout_oid)}",
                "created_at": datetime.utcnow(),
            }
        )

        return {"message": "Payout approved! INR credited to worker wallet."}

    if body.status == "rejected":
        refund_points = float(payout.get("points_deducted", 1000))
        if user_oid:
            users_collection.update_one({"_id": user_oid}, {"$inc": {"referral_points": refund_points}})

        reward_payouts_collection.update_one(
            {"_id": payout_oid},
            {"$set": {"status": "rejected", "processed_at": datetime.utcnow()}},
        )
        return {"message": "Payout rejected. Points refunded to worker."}

    raise HTTPException(status_code=400, detail="status must be approved or rejected")
