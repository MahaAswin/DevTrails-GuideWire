from pydantic import BaseModel, Field

class Policy(BaseModel):
    policy_id: str = Field(..., description="Unique identifier for the policy")
    policy_type: str = Field(..., description="Type of coverage (e.g., Health, Accident, Vehicle)")
    weekly_price: float = Field(..., description="Weekly premium cost for this policy")
    coverage_amount: float = Field(..., description="Maximum payout amount")
    trigger_condition: str = Field(..., description="Condition that triggers a parametric payout")
