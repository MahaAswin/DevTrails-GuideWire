import hashlib
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_new(password: str) -> str:
    pre_hash = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(pre_hash)

def verify_dual(plain_password: str, hashed_password: str) -> bool:
    # 1. New logic
    pre_hash = hashlib.sha256(plain_password.encode()).hexdigest()
    try:
        if pwd_context.verify(pre_hash, hashed_password):
            return True
    except: pass
    
    # 2. Old logic
    try:
        if pwd_context.verify(plain_password, hashed_password):
            return True
    except: pass
    return False

# Test 1: Standard Password (Old Logic Compatibility)
old_password = "short_password"
old_hash = pwd_context.hash(old_password)
print(f"Old verify: {verify_dual(old_password, old_hash)}")

# Test 2: Long Password (New Logic)
long_password = "a" * 100
new_hash = hash_new(long_password)
print(f"New verify (Long): {verify_dual(long_password, new_hash)}")

# Test 3: Standard Password (New Logic)
std_password = "standard_pass"
std_hash = hash_new(std_password)
print(f"New verify (Std): {verify_dual(std_password, std_hash)}")

# Test 4: Wrong Password
print(f"Wrong verify: {verify_dual('wrong', std_hash)}")
