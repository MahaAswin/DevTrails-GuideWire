import uuid
from datetime import datetime

def generate_id(prefix: str = "id") -> str:
    """Generate a unique ID with a prefix."""
    return f"{prefix}_{uuid.uuid4().hex[:8]}"

def get_current_timestamp() -> str:
    """Return the current ISO formatted timestamp."""
    return datetime.utcnow().isoformat()
