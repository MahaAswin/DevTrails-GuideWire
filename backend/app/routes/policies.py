from fastapi import APIRouter
from app.database.mongodb import policies_collection
from app.routes.admin import serialize_mongo_doc

router = APIRouter()


def enrich_policy_icon(policy):
    cond = policy.get("trigger_condition", "").lower()
    if "rain" in cond or "temp" in cond:
        policy["icon"] = "CloudRain"
        policy["color"] = "blue"
    elif "traffic" in cond or "delay" in cond:
        policy["icon"] = "Car"
        policy["color"] = "orange"
    elif "aqi" in cond or "pollution" in cond:
        policy["icon"] = "Factory"
        policy["color"] = "slate"
    else:
        policy["icon"] = "ShieldAlert"
        policy["color"] = "red"

    policy["title"] = policy.get("name")
    policy["premium"] = policy.get("weekly_premium")
    policy["coverage"] = policy.get("max_coverage")
    policy["trigger"] = policy.get("trigger_condition")

    if "description" not in policy:
        policy["description"] = "No description provided."
    if "detailed_benefits" not in policy:
        policy["detailed_benefits"] = "Full parametric coverage with automated payout triggers."

    return policy


@router.get("/{platform}", summary="Get policies for a specific platform")
async def get_policies_for_platform(platform: str):
    query = {"$or": [
        {"platform": platform},
        {"platform": platform.capitalize()},
        {"platform": "All"},
        {"platform": "all"}
    ]}

    policies = []
    for policy in policies_collection.find(query):
        serialized = serialize_mongo_doc(policy)
        enriched = enrich_policy_icon(serialized)
        policies.append(enriched)
    return policies


@router.get("/", summary="Get all globally public policies")
async def get_all_public_policies():
    query = {"$or": [{"platform": "All"}, {"platform": "all"}]}
    policies = []
    for policy in policies_collection.find(query):
        serialized = serialize_mongo_doc(policy)
        enriched = enrich_policy_icon(serialized)
        policies.append(enriched)
    return policies
