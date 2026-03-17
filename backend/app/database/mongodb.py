import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "GuideWire")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)

try:
    client.server_info()
    print("MongoDB connected successfully")
except Exception as e:
    print("MongoDB connection failed:", e)

db = client[DATABASE_NAME]
print(f"Connected to MongoDB at {MONGO_URI}")
print(f"Using database: {DATABASE_NAME}")
print(f"Collections detected: {db.list_collection_names()}")

users_collection = db["users"]
policies_collection = db["policies"]
claims_collection = db["claims"]
reports_collection = db["reports"]
payments_collection = db["payments"]
claim_reports_collection = db["claim_reports"]
wallet_transactions_collection = db["wallet_transactions"]
weather_claims_collection = db["weather_claims"]

def get_db():
    return db

def get_collection(collection_name: str):
    return db[collection_name]