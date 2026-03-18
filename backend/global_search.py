import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)

search_email = "mahaaswinsb@gmail.com"
found = False

for db_name in client.list_database_names():
    if db_name in ['admin', 'config', 'local']: continue
    db = client[db_name]
    for coll_name in db.list_collection_names():
        coll = db[coll_name]
        # Search in any collection for a field that might be email
        res = coll.find_one({"email": {"$regex": search_email, "$options": "i"}})
        if res:
            print(f"FOUND in DB: {db_name}, Collection: {coll_name}")
            print(res)
            found = True

if not found:
    print("User not found anywhere in any database.")

client.close()
