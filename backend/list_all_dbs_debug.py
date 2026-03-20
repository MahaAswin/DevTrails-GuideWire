import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = MongoClient(MONGO_URI)
dbs = client.list_database_names()

print("Available Databases:")
for db_name in dbs:
    print(f"\n- {db_name}")
    db = client[db_name]
    try:
        collections = db.list_collection_names()
        for coll in collections:
            count = db[coll].count_documents({})
            print(f"  * {coll}: {count} docs")
            if coll == "users" and count > 0:
                user = db[coll].find_one({"email": "mahaaswin@gmail.com"})
                if user:
                    print(f"    !!! User mahaaswin@gmail.com FOUND in {db_name}.users !!!")
                    print(f"    Password: {user.get('password')}")
    except:
        print("  (Could not list collections)")
