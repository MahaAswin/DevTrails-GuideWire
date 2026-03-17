from fastapi import APIRouter, HTTPException, status, Body, Form, File, UploadFile
from app.models.payment_model import PaymentSubmit, PaymentResponse
from app.database.mongodb import payments_collection, users_collection, wallet_transactions_collection
from datetime import datetime
from bson import ObjectId
from typing import Optional
import os
import uuid

router = APIRouter()

UPLOAD_DIR = "uploads"

def serialize_mongo_doc(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@router.post("/add-money")
async def add_money(
    amount: float = Form(...),
    payment_method: str = Form(...),
    transaction_id: str = Form(...),
    worker_email: str = Form(...),
    screenshot: Optional[UploadFile] = File(None)
):
    # Fraud prevention: check for duplicate transaction ID
    if payments_collection.find_one({"transaction_id": transaction_id}):
        raise HTTPException(status_code=400, detail="Transaction ID already exists.")

    user = users_collection.find_one({"email": worker_email})
    if not user:
        raise HTTPException(status_code=404, detail="Worker not found")

    screenshot_filename = None
    if screenshot:
        file_extension = os.path.splitext(screenshot.filename)[1]
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
        "created_at": datetime.utcnow()
    }

    result = payments_collection.insert_one(payment_doc)
    return {"message": "Payment submitted successfully. Waiting for admin verification.", "payment_id": str(result.inserted_id)}

@router.get("/balance/{email}")
async def get_balance(email: str):
    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"wallet_balance": user.get("wallet_balance", 0)}

@router.get("/transactions/{email}")
async def get_transactions(email: str):
    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = str(user["_id"])
    
    # Try fetching from the new audit ledger first
    transactions = []
    ledger_items = list(wallet_transactions_collection.find({"user_id": user_id}).sort("created_at", -1))
    
    if ledger_items:
        for itm in ledger_items:
            transactions.append(serialize_mongo_doc(itm))
    else:
        # Fallback to payments for history if ledger is empty (for backward compatibility)
        for p in payments_collection.find({"user_id": user_id}).sort("created_at", -1):
            pmt = serialize_mongo_doc(p)
            # Add description for legacy UI compliance
            pmt["description"] = f"Deposit: {pmt['payment_method']}" if pmt['status'] == 'approved' else f"Request ({pmt['status']})"
            transactions.append(pmt)
    
    return transactions
