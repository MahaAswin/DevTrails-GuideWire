import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = "shieldgig_db" # Forcing it to match .env

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
users_collection = db["users"]

print(f"Connecting to: {DATABASE_NAME}")

# Clean up any existing (if any)
# users_collection.delete_many({"email": "mahaaswin@gmail.com"})

user_data = {
    "name": "Maha Aswin",
    "email": "mahaaswin@gmail.com",
    "password": "password123_hashed", # Password is 'password123'
    "phone": "9876543210",
    "platform": "Zomato",
    "city": "Chennai",
    "role": "worker",
    "referral_code": "REFMAHA",
    "referral_points": 0,
    "wallet_balance": 100.0,
    "reminderEnabled": True
}

try:
    if not users_collection.find_one({"email": user_data["email"]}):
        users_collection.insert_one(user_data)
        print(f"Successfully inserted user: {user_data['email']}")
    else:
        print(f"User {user_data['email']} already exists.")
        users_collection.update_one({"email": user_data['email']}, {"$set": {"password": user_data["password"]}})
        print("Updated password to password123_hashed")
except Exception as e:
    print(f"Error: {e}")

# Verify
user = users_collection.find_one({"email": "mahaaswin@gmail.com"})
print(f"Verification - User in DB: {user['email'] if user else 'None'}")
