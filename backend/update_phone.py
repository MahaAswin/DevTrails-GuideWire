import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env from current directory
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "shieldgig_db")

print(f"Connecting to {MONGO_URI}, DB: {DATABASE_NAME}")

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
users_collection = db["users"]

email = "mahaaswinsb@gmail.com"
new_phone = "9344179922"

user = users_collection.find_one({"email": email})
if user:
    result = users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"phone": new_phone}}
    )
    print(f"Set phone for {email} to {new_phone}")
else:
    # Try with .lower() just in case
    user = users_collection.find_one({"email": email.lower()})
    if user:
        users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"phone": new_phone}}
        )
        print(f"Set phone for {email.lower()} to {new_phone}")
    else:
        print(f"User {email} not found.")

client.close()
