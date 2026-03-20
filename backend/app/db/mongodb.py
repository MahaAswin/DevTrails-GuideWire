import os
import time
from pymongo import MongoClient, errors
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI") or os.getenv("DATABASE_URL") or "mongodb://localhost:27017"
DATABASE_NAME = os.getenv("DATABASE_NAME", "shieldgig_db")

def get_database_with_retry(uri, db_name, retries=5, delay=2):
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    for i in range(retries):
        try:
            client.server_info()
            print(f"✅ MongoDB connected successfully to {db_name}")
            return client, client[db_name]
        except errors.ServerSelectionTimeoutError as e:
            print(f"❌ MongoDB connection attempt {i+1} failed: {e}")
            if i < retries - 1:
                time.sleep(delay)
            else:
                raise e

client, db = get_database_with_retry(MONGO_URI, DATABASE_NAME)

# Collections
users_collection = db["users"]
policies_collection = db["policies"]
claims_collection = db["claims"]
reports_collection = db["reports"]
payments_collection = db["payments"]
claim_reports_collection = db["claim_reports"]
wallet_transactions_collection = db["wallet_transactions"]
# Standardize 'transactions' for production usage
transactions_collection = db["transactions"]
weather_claims_collection = db["weather_claims"]
reward_payouts_collection = db["reward_payouts"]
referrals_collection = db["referrals"]

def init_db():
    """Ensure indexes exist for performance and uniqueness"""
    try:
        print("🛠️ Initializing database indexes...")
        users_collection.create_index("email", unique=True)
        users_collection.create_index("referral_code", unique=True, sparse=True)
        referrals_collection.create_index("code", unique=True) # Per user request
        transactions_collection.create_index("user_id") # Per user request
        wallet_transactions_collection.create_index("user_id")
        print("✅ Database indexes initialized.")
    except Exception as e:
        print(f"⚠️ Error initializing indexes: {e}")

# Run initialization
init_db()

