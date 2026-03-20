from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db.mongodb import users_collection

router = APIRouter()


@router.get("/", summary="Get all workers")
async def get_workers():
    return {"workers": []}


@router.get("/{worker_id}", summary="Get worker details")
async def get_worker(worker_id: str):
    return {"worker_id": worker_id, "name": "N/A", "risk_score": 0.0}

class UpdateCityRequest(BaseModel):
    worker_email: str
    new_city: str

@router.patch("/update-city")
async def update_city(request: UpdateCityRequest):
    if not request.worker_email or not request.worker_email.strip():
        raise HTTPException(status_code=400, detail="worker_email is required")
    if not request.new_city or not request.new_city.strip():
        raise HTTPException(status_code=400, detail="new_city is required")

    user_email = request.worker_email.strip().lower()
    user = users_collection.find_one({"email": user_email}) or users_collection.find_one({"email": request.worker_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    users_collection.update_one(
        {"email": user_email},
        {"$set": {"city": request.new_city}},
    )

    return {"message": f"City updated to {request.new_city}", "city": request.new_city}
