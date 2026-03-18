import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "shieldgig_db")

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
users = list(db["users"].find({}, {"email": 1, "name": 1}))
print(f"Users in {DATABASE_NAME}:")
for u in users:
    print(u)
client.close()
