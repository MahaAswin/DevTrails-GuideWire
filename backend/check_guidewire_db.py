import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)

db = client["GuideWire"]
print("--- Users in GuideWire DB ---")
if "users" in db.list_collection_names():
    users = list(db["users"].find({}, {"email": 1, "name": 1}))
    for u in users:
        print(u)
else:
    print("No users collection in GuideWire DB")

client.close()
