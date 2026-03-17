from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class WeatherData(BaseModel):
    city: str
    weather: str
    rain_level: float
    temperature: float
    eligible_for_claim: bool
    payout: float

class WeatherClaim(BaseModel):
    user_id: str
    city: str
    rain_level: float
    payout: float
    status: str = "approved"
    created_at: datetime = Field(default_factory=datetime.utcnow)
