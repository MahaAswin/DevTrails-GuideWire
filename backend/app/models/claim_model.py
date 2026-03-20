from pydantic import BaseModel

class Claim(BaseModel):
    claim_id: str
    worker_id: str
    trigger_event: str
    claim_amount: float
    status: str = "pending"
