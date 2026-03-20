import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = MongoClient(MONGO_URI)

# Check GuideWire DB
db_name = "GuideWire"
db = client[db_name]
print(f"Checking database: {db_name}")

try:
    collections = db.list_collection_names()
    print(f"Collections: {collections}")
    if "users" in collections:
        count = db["users"].count_documents({})
        print(f"Users count: {count}")
        user = db["users"].find_one({"email": "mahaaswin@gmail.com"})
        if user:
            print(f"!!! User mahaaswin@gmail.com FOUND !!!")
            print(f"Password in DB: {user.get('password')}")
        else:
            print("User not found in this DB.")
            all_emails = [u.get('email') for u in db["users"].find({}, {"email": 1})]
            print(f"Other emails: {all_emails}")
except Exception as e:
    print(f"Error checking {db_name}: {e}")

# Also check shieldgig_db just in case it was a different collection name
db_name = "shieldgig_db"
db = client[db_name]
print(f"\nChecking database: {db_name}")
try:
    collections = db.list_collection_names()
    print(f"Collections: {collections}")
except Exception as e:
    print(f"Error checking {db_name}: {e}")
