import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = MongoClient(MONGO_URI)
dbs = client.list_database_names()

for db_name in dbs:
    if db_name in ["admin", "local", "config"]: continue
    db = client[db_name]
    colls = db.list_collection_names()
    print(f"DB: {db_name} -> Collections: {colls}")
    if "users" in colls:
        count = db["users"].count_documents({})
        user = db["users"].find_one({"email": "mahaaswin@gmail.com"})
        print(f"  - users: {count} docs")
        if user:
            print(f"    !!! User FOUND in {db_name} !!!")
            print(f"    Password: {user.get('password')}")
