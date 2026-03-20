from fastapi import APIRouter, HTTPException, Body, Form, File, UploadFile, status, BackgroundTasks
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
import os
import uuid

from app.database.mongodb import (
    users_collection,
    payments_collection,
    wallet_transactions_collection,
)

router = APIRouter()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


def serialize_mongo_doc(doc: dict) -> dict:
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


@router.get("/balance/{email}")
async def get_balance(email: str):
    user = users_collection.find_one({"email": email.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"wallet_balance": user.get("wallet_balance", 0)}


@router.get("/transactions/{email}")
async def get_transactions(email: str):
    """
    Wallet audit ledger for the wallet UI.
    Frontend expects: created_at, amount, type, status?, description?, transaction_id?, id?
    """
    user = users_collection.find_one({"email": email.lower()})
    if not user:
        # Keep consistent with other endpoints: missing user is a hard error
        raise HTTPException(status_code=404, detail="User not found")

    user_id_str = str(user["_id"])
    txs = list(wallet_transactions_collection.find({"user_id": user_id_str}).sort("created_at", -1))
    serialized: List[dict] = []
    for t in txs:
        if "created_at" not in t:
            t["created_at"] = datetime.utcnow()
        if "status" not in t and t.get("type"):
            t["status"] = "approved"
        serialized.append(serialize_mongo_doc(t))
    return serialized


@router.post("/convert-points")
async def convert_points(payload: dict = Body(...)):
    """
    Convert 1000 referral points -> ₹10 and credit wallet only after conversion.
    """
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
    points_to_deduct = conversations * 1000
    amount_to_add = conversations * 10

    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"referral_points": -points_to_deduct, "wallet_balance": amount_to_add}},
    )

    wallet_transactions_collection.insert_one(
        {
            "user_id": user_id,
            "type": "reward_credit",
            "amount": amount_to_add,
            "description": f"Converted {points_to_deduct} points to ₹{amount_to_add}",
            "status": "approved",
            "created_at": datetime.utcnow(),
        }
    )

    return {
        "message": f"Successfully converted {points_to_deduct} points to ₹{amount_to_add}",
        "new_points": points - points_to_deduct,
        "new_balance": user.get("wallet_balance", 0) + amount_to_add,
    }


@router.post("/add-money")
async def add_money(
    background_tasks: BackgroundTasks,
    amount: float = Form(...),
    payment_method: str = Form(...),
    transaction_id: str = Form(...),
    worker_email: str = Form(...),
    screenshot: UploadFile = File(...),
):
    """
    Submit a deposit request. Admin approval flow should update `wallet_balance`
    and write to `wallet_transactions`.
    """
    if not screenshot:
        raise HTTPException(status_code=400, detail="Proof of payment image is required")

    # Fraud prevention: check for duplicate transaction ID
    if payments_collection.find_one({"transaction_id": transaction_id}):
        raise HTTPException(status_code=400, detail="Transaction ID already exists.")

    user = users_collection.find_one({"email": worker_email.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="Worker not found")

    file_extension = os.path.splitext(screenshot.filename)[1] if screenshot.filename else ""
    screenshot_filename = f"pay_{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, screenshot_filename)
    with open(file_path, "wb") as f:
        f.write(await screenshot.read())

    payment_doc = {
        "user_id": str(user["_id"]),
        "worker_name": user["name"],
        "amount": amount,
        "payment_method": payment_method,
        "transaction_id": transaction_id,
        "screenshot_url": screenshot_filename,
        "status": "pending",
        "created_at": datetime.utcnow(),
    }

    result = payments_collection.insert_one(payment_doc)

    # --- AI Email Notification ---
    from app.utils.ai_email import generate_email_content
    from app.utils.email import send_email
    
    async def send_payment_email():
        try:
            email_body = await generate_email_content("payment", user["name"], amount)
            await send_email("Payment Successful 💰", user["email"], email_body)
        except Exception as e:
            print(f"Error executing email task: {e}")
        
    background_tasks.add_task(send_payment_email)
    # ----------------------------

    return {"message": "Payment submitted successfully. Waiting for admin verification.", "payment_id": str(result.inserted_id)}
