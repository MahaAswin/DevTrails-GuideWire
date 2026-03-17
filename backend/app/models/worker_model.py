from pydantic import BaseModel, Field
from typing import Optional

class Worker(BaseModel):
    worker_id: str = Field(..., description="Unique identifier for the worker")
    name: str = Field(..., description="Full name of the worker")
    platform: str = Field(..., description="Gig platform (e.g., Zomato, Swiggy, Amazon)")
    city: str = Field(..., description="City of operation")
    risk_score: Optional[float] = Field(None, description="AI-calculated risk score")
    weekly_premium: Optional[float] = Field(None, description="Calculated weekly insurance premium")
