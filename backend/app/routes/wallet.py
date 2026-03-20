from fastapi import APIRouter, HTTPException, Body, Form, File, UploadFile, status, BackgroundTasks
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
import os
import uuid

from app.db.mongodb import (
    users_collection,
    payments_collection,
    transactions_collection, # Unified collection
)
from app.utils.logger import log_event, log_error

router = APIRouter()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def serialize_mongo_doc(doc: dict) -> dict:
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


@router.get("/balance/{email}")
async def get_balance(email: str):
    user = users_collection.find_one({"email": email.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"wallet_balance": user.get("wallet_balance", 0.0)}


@router.get("/transactions/{email}")
async def get_transactions(email: str):
    user = users_collection.find_one({"email": email.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_id_str = str(user["_id"])
    txs = list(transactions_collection.find({"user_id": user_id_str}).sort("created_at", -1))
    return [serialize_mongo_doc(t) for t in txs]


@router.post("/convert-points")
async def convert_points(payload: dict = Body(...)):
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    points = user.get("referral_points", 0)
    if points < 1000:
        raise HTTPException(status_code=400, detail="Minimum 1000 points required for conversion")

    conversations = points // 1000
    amount_to_add = conversations * 10

    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"referral_points": -(conversations * 1000), "wallet_balance": amount_to_add}},
    )

    transactions_collection.insert_one({
        "user_id": user_id,
        "type": "credit",
        "category": "referral_reward",
        "amount": amount_to_add,
        "description": f"Converted {conversations * 1000} points to ₹{amount_to_add}",
        "status": "approved",
        "created_at": datetime.utcnow(),
    })

    log_event(f"Points converted for user {user_id}: {amount_to_add} INR")
    return {"message": "Points converted successfully", "amount": amount_to_add}


@router.post("/add-money")
async def add_money(
    background_tasks: BackgroundTasks,
    amount: float = Form(...),
    payment_method: str = Form(...),
    transaction_id: str = Form(...),
    worker_email: str = Form(...),
    screenshot: UploadFile = File(...),
):
    if payments_collection.find_one({"transaction_id": transaction_id}):
        raise HTTPException(status_code=400, detail="Transaction ID already exists.")

    user = users_collection.find_one({"email": worker_email.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="Worker not found")

    ext = os.path.splitext(screenshot.filename)[1] if screenshot.filename else ".jpg"
    filename = f"pay_{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        f.write(await screenshot.read())

    payment_doc = {
        "user_id": str(user["_id"]),
        "worker_name": user["name"],
        "amount": amount,
        "payment_method": payment_method,
        "transaction_id": transaction_id,
        "screenshot_url": filename,
        "status": "pending",
        "created_at": datetime.utcnow(),
    }

    result = payments_collection.insert_one(payment_doc)

    # Use email utility for notification
    from app.utils.email import send_email
    background_tasks.add_task(
        send_email,
        "Payment Submitted 💰",
        user["email"],
        f"Hello {user['name']}, your payment of ₹{amount} has been submitted and is pending admin approval."
    )

    return {"message": "Payment submitted successfully", "payment_id": str(result.inserted_id)}

@router.post("/debit")
async def debit_wallet(payload: dict = Body(...)):
    """Internal/Admin tool to debit wallet, preventing negative balance"""
    user_id = payload.get("user_id")
    amount = float(payload.get("amount", 0))
    description = payload.get("description", "Wallet Debit")

    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    current_balance = user.get("wallet_balance", 0.0)
    if current_balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"wallet_balance": -amount}}
    )

    transactions_collection.insert_one({
        "user_id": user_id,
        "type": "debit",
        "amount": amount,
        "description": description,
        "status": "approved",
        "created_at": datetime.utcnow()
    })

    return {"message": "Wallet debited successfully", "new_balance": current_balance - amount}
