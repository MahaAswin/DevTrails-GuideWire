import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)

for db_name in client.list_database_names():
    if db_name in ['admin', 'config', 'local']: continue
    print(f"--- DB: {db_name} ---")
    db = client[db_name]
    for coll_name in db.list_collection_names():
        if coll_name == "users":
            users = list(db[coll_name].find({}, {"email": 1}))
            for u in users:
                print(f"  User: {u.get('email')}")

client.close()
