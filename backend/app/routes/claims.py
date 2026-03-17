from fastapi import APIRouter
from app.models.claim_model import Claim

router = APIRouter()

@router.get("/", summary="Get all claims")
async def get_claims():
    return {"message": "List of claims"}

@router.post("/", summary="Submit a new claim")
async def create_claim(claim: Claim):
    return {"message": "Claim submitted successfully", "claim": claim}
