import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "shieldgig_db")

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
users_collection = db["users"]

email = "mahaaswin@gmail.com"
user = users_collection.find_one({"email": email})

if user:
    print(f"User found: {user['email']}")
    print(f"Hashed password in DB: {user.get('password')}")
    print(f"Name: {user.get('name')}")
else:
    print(f"User {email} not found in {DATABASE_NAME}")
    # List all users in the collection
    all_users = list(users_collection.find({}, {"email": 1}))
    print(f"All users in DB: {[u['email'] for u in all_users]}")
