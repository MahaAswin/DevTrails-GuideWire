from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class PaymentSubmit(BaseModel):
    amount: float = Field(..., gt=0)
    payment_method: str # UPI or Bank Transfer
    transaction_id: str

class PaymentResponse(BaseModel):
    id: str
    user_id: str
    amount: float
    payment_method: str
    transaction_id: str
    status: str
    screenshot_url: Optional[str] = None
    created_at: datetime

class WalletTransaction(BaseModel):
    user_id: str
    type: str # deposit, policy_payment, claim_credit
    amount: float
    reference_payment_id: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PaymentVerify(BaseModel):
    payment_id: str
    status: str # approved or rejected
    payout_amount: Optional[float] = None # For report resolutions
