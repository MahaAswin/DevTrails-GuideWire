from pydantic import BaseModel

class Policy(BaseModel):
    policy_id: str
    policy_type: str
    weekly_price: float
    coverage_amount: float
    trigger_condition: str
