from pydantic import BaseModel, Field

class Claim(BaseModel):
    claim_id: str = Field(..., description="Unique identifier for the claim")
    worker_id: str = Field(..., description="ID of the worker making the claim")
    trigger_event: str = Field(..., description="Event that triggered the claim (e.g., accident, weather)")
    claim_amount: float = Field(..., description="Amount being claimed")
    status: str = Field(default="pending", description="Current status of the claim (pending, approved, rejected)")
