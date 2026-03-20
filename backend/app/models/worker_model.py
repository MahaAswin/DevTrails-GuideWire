from pydantic import BaseModel
from typing import Optional

class Worker(BaseModel):
    worker_id: str
    name: str
    platform: str
    city: str
    risk_score: Optional[float] = 0.0
    weekly_premium: Optional[float] = 0.0
