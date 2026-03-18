import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)

email = "mahaaswinsb@gmail.com"
new_phone = "9344179922"
found = False

for db_name in client.list_database_names():
    if db_name in ['admin', 'config', 'local']: continue
    db = client[db_name]
    for coll_name in db.list_collection_names():
        if coll_name == "users":
            coll = db[coll_name]
            user = coll.find_one({"email": email})
            if not user:
                user = coll.find_one({"email": email.lower()})
            
            if user:
                coll.update_one({"_id": user["_id"]}, {"$set": {"phone": new_phone}})
                print(f"UPDATED in DB: {db_name}, User: {user.get('email')}")
                found = True

if not found:
    print(f"User {email} not found in any database.")

client.close()
