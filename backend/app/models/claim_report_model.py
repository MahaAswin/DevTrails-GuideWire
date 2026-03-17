from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class ClaimReportCreate(BaseModel):
    worker_id: str
    platform: str
    report_type: str
    description: str
    location: str
    landmark: Optional[str] = None

class ClaimReportResponse(BaseModel):
    id: str
    worker_id: str
    worker_name: str
    platform: str
    report_type: str
    description: str
    location: str
    landmark: Optional[str] = None
    proof_images: List[str]
    status: str # pending, approved, rejected, under_review
    payout: float = 0
    created_at: datetime
    fraud_flags: List[str] = []
