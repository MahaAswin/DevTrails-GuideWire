from pydantic import BaseModel, confloat
from datetime import datetime

class PaymentSubmit(BaseModel):
    amount: confloat(gt=0)
    payment_method: str # UPI or Bank Transfer
    transaction_id: str
    proofImage: str # Required field for screenshot filename or base64

class PaymentResponse(BaseModel):
    id: str
    user_id: str
    amount: float
    payment_method: str
    transaction_id: str
    status: str
    screenshot_url: str = ""
    created_at: datetime

class WalletTransaction(BaseModel):
    user_id: str
    type: str # deposit, policy_payment, claim_credit
    amount: float
    reference_payment_id: str = ""
    description: str = ""
    created_at: datetime = datetime.utcnow()

class PaymentVerify(BaseModel):
    payment_id: str
    status: str # approved or rejected
    payout_amount: float = 0 # For report resolutions
