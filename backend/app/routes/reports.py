from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.database.mongodb import reports_collection

router = APIRouter()

class ReportCreate(BaseModel):
    worker_id: str = Field(..., example="WK-12001")
    platform: str = Field(..., example="Zomato")
    location: str = Field(..., example="Indiranagar, Bangalore")
    problem_type: str = Field(..., example="Heavy Rain")
    description: str = Field(..., example="Streets flooded entirely")

@router.post("/", summary="Submit a new emergency report")
async def create_report(report: ReportCreate):
    report_dict = report.model_dump()
    result = reports_collection.insert_one(report_dict)
    return {
        "status": "success",
        "message": "Your report has been submitted. Our AI system will verify the disruption and process your claim."
    }
