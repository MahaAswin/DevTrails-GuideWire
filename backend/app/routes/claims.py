from fastapi import APIRouter, HTTPException, Form, File, UploadFile, status
from typing import List, Optional
import os
import uuid
from datetime import datetime
from app.db.mongodb import claims_collection, users_collection

router = APIRouter()

UPLOAD_DIR = "uploads/claims"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def submit_claim(
    worker_email: str = Form(...),
    claim_type: str = Form(...), # medical, bike repair, etc.
    description: str = Form(...),
    proof_images: List[UploadFile] = File(...),
    bills: List[UploadFile] = File(...)
):
    user = users_collection.find_one({"email": worker_email.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    image_urls = []
    for img in proof_images:
        ext = os.path.splitext(img.filename)[1] if img.filename else ".jpg"
        filename = f"proof_{uuid.uuid4()}{ext}"
        path = os.path.join(UPLOAD_DIR, filename)
        with open(path, "wb") as f:
            f.write(await img.read())
        image_urls.append(filename)

    bill_urls = []
    for bill in bills:
        ext = os.path.splitext(bill.filename)[1] if bill.filename else ".pdf"
        filename = f"bill_{uuid.uuid4()}{ext}"
        path = os.path.join(UPLOAD_DIR, filename)
        with open(path, "wb") as f:
            f.write(await bill.read())
        bill_urls.append(filename)

    claim_doc = {
        "user_id": str(user["_id"]),
        "worker_name": user["name"],
        "type": claim_type,
        "description": description,
        "proof_images": image_urls,
        "bills": bill_urls,
        "status": "pending",
        "created_at": datetime.utcnow()
    }

    result = claims_collection.insert_one(claim_doc)
    return {"message": "Claim submitted successfully", "claim_id": str(result.inserted_id)}

@router.get("/my-claims/{email}")
async def get_my_claims(email: str):
    user = users_collection.find_one({"email": email.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    claims = list(claims_collection.find({"user_id": str(user["_id"])}).sort("created_at", -1))
    for c in claims:
        c["id"] = str(c["_id"])
        c.pop("_id")
    return claims
