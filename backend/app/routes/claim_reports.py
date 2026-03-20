from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
import os
import uuid
from bson import ObjectId

from app.database.mongodb import claim_reports_collection, users_collection

router = APIRouter()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


def serialize_report(report):
    report["id"] = str(report["_id"])
    del report["_id"]
    return report


@router.post("/submit", summary="Submit a claim with evidence")
async def submit_claim(
    worker_email: str = Form(...),
    report_type: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    landmark: Optional[str] = Form(None),
    files: List[UploadFile] = File([])
):
    user = users_collection.find_one({"email": worker_email})
    if not user:
        raise HTTPException(status_code=404, detail="Worker not found")

    saved_files = []
    for file in files:
        file_extension = os.path.splitext(file.filename)[1]
        if file_extension.lower() not in [".jpg", ".png", ".jpeg", ".pdf"]:
            continue
        filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        saved_files.append(filename)

    report_doc = {
        "worker_id": str(user["_id"]),
        "worker_name": user["name"],
        "platform": user.get("platform", "Unknown"),
        "report_type": report_type,
        "description": description,
        "location": location,
        "landmark": landmark,
        "proof_images": saved_files,
        "status": "pending",
        "fraud_flags": [],
        "payout": 0,
        "created_at": datetime.utcnow()
    }

    result = claim_reports_collection.insert_one(report_doc)
    return {
        "message": "Claim submitted successfully.",
        "report_id": str(result.inserted_id),
        "status": "pending"
    }


@router.get("/my-claims/{email}")
async def get_my_claims(email: str):
    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    claims = []
    for c in claim_reports_collection.find({"worker_id": str(user["_id"])}).sort("created_at", -1):
        claims.append(serialize_report(c))
    return claims
