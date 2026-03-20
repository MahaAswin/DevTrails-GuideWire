import hashlib
import bcrypt

def hash_new(password: str) -> str:
    pre_hash = hashlib.sha256(password.encode()).hexdigest()
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pre_hash.encode(), salt).decode()

def verify_dual(plain_password: str, hashed_password: str) -> bool:
    p_bytes = plain_password.encode()
    h_bytes = hashed_password.encode()
    
    # 1. New logic
    pre_hash = hashlib.sha256(p_bytes).hexdigest().encode()
    try:
        if bcrypt.checkpw(pre_hash, h_bytes):
            return True
    except: pass
    
    # 2. Old logic
    try:
        if bcrypt.checkpw(p_bytes, h_bytes):
            return True
    except: pass
    return False

# Test 1: Standard Password (Old Logic Compatibility)
old_password = "short_password"
old_hash = bcrypt.hashpw(old_password.encode(), bcrypt.gensalt()).decode()
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
