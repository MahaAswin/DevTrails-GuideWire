import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = MongoClient(MONGO_URI)
dbs = client.list_database_names()
print("Databases Found:", dbs)

for db_name in dbs:
    if db_name in ['admin', 'local', 'config']: continue
    print(f"\n--- Users in {db_name} ---")
    db = client[db_name]
    if "users" in db.list_collection_names():
        users = list(db["users"].find({}, {"email": 1, "name": 1}))
        for u in users:
            print(u)
    else:
        print("No users collection")

client.close()
