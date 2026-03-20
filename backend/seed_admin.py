import os
import random
import string
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "GuideWire")

def hash_password(password: str) -> str:
    # Deterministic hash compatible with backend/app/routes/auth.py
    return password + "_hashed"

def generate_referral_code(length: int = 8) -> str:
    return "REF" + "".join(random.choices(string.ascii_uppercase + string.digits, k=length - 3))

def seed_admin():
    print(f"Connecting to MongoDB at {MONGO_URI}...")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[DATABASE_NAME]
    users_collection = db["users"]

    admin_email = "shieldgigofficial@gmail.com"
    admin_password = "admin123"

    # 1. Delete any existing admin users
    print("Removing existing admin users...")
    delete_result = users_collection.delete_many({"role": "admin"})
    print(f"Deleted {delete_result.deleted_count} existing admin(s).")

    # 2. Check if the specific email exists (even if not admin) to avoid duplicates
    existing_user = users_collection.find_one({"email": admin_email})
    if existing_user:
        print(f"User with email {admin_email} already exists. Removing it to ensure fresh admin setup...")
        users_collection.delete_one({"email": admin_email})

    # 3. Create the admin user
    referral_code = generate_referral_code()
    # Ensure referral code is unique
    while users_collection.find_one({"referral_code": referral_code}):
        referral_code = generate_referral_code()

    admin_user = {
        "name": "System Admin",
        "email": admin_email,
        "phone": "+910000000000",
        "password": hash_password(admin_password),
        "platform": "Admin",
        "city": "System",
        "role": "admin",
        "referral_code": referral_code,
        "referral_points": 0,
        "wallet_balance": 0.0,
        "reminderEnabled": True,
        "created_at": datetime.utcnow()
    }

    print(f"Inserting new admin user: {admin_email}")
    result = users_collection.insert_one(admin_user)
    
    if result.inserted_id:
        print(f"Admin user created successfully with ID: {result.inserted_id}")
        print(f"Credentials: Email: {admin_email}, Password: {admin_password}")
    else:
        print("Failed to create admin user.")

    client.close()

if __name__ == "__main__":
    seed_admin()
