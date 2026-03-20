from fastapi import APIRouter
from pydantic import BaseModel
from app.db.mongodb import reports_collection, users_collection
from datetime import datetime

router = APIRouter()

class ReportCreate(BaseModel):
    worker_id: str
    platform: str
    location: str
    problem_type: str
    description: str

@router.post("/", summary="Submit a new emergency report")
async def create_report(report: ReportCreate):
    report_dict = report.dict()
    report_dict["created_at"] = datetime.utcnow()
    reports_collection.insert_one(report_dict)
    return {
        "status": "success",
        "message": "Your report has been submitted. Our AI system will verify the disruption and process your claim."
    }
