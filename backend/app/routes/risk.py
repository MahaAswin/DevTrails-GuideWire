from fastapi import APIRouter
from app.services.risk_engine import calculate_risk

router = APIRouter()

@router.get("/{worker_id}", summary="Get AI risk score for a worker")
async def get_worker_risk(worker_id: str):
    risk_score = calculate_risk(worker_id)
    return {"worker_id": worker_id, "risk_score": risk_score}
