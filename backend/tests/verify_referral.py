import requests
import json

BASE_URL = "http://localhost:8000"

def test_referral_flow():
    # 1. Register User A
    user_a_data = {
        "name": "User A",
        "email": "usera@example.com",
        "phone": "+919999999991",
        "password": "password123",
        "platform": "Zomato",
        "city": "Bangalore"
    }
    print("Registering User A...")
    resp_a = requests.post(f"{BASE_URL}/auth/register", json=user_a_data)
    if resp_a.status_code != 201:
        print(f"Failed to register User A: {resp_a.text}")
        return
    
    user_a = resp_a.json()
    ref_code_a = user_a["referral_code"]
    print(f"User A registered. Referral Code: {ref_code_a}")

    # 2. Register User B using User A's referral code
    user_b_data = {
        "name": "User B",
        "email": "userb@example.com",
        "phone": "+919999999992",
        "password": "password123",
        "platform": "Zomato",
        "city": "Bangalore",
        "referred_by": ref_code_a
    }
    print(f"Registering User B with referral {ref_code_a}...")
    resp_b = requests.post(f"{BASE_URL}/auth/register", json=user_b_data)
    if resp_b.status_code != 201:
        print(f"Failed to register User B: {resp_b.text}")
        return
    
    user_b = resp_b.json()
    print(f"User B registered. Referral Points: {user_b['referral_points']}")

    # 3. Check User A's points
    print("Checking User A's points...")
    resp_a_profile = requests.get(f"{BASE_URL}/user/profile/{user_a['id']}")
    user_a_updated = resp_a_profile.json()
    print(f"User A Referral Points: {user_a_updated['referral_points']}")

    if user_a_updated['referral_points'] == 100 and user_b['referral_points'] == 100:
        print("SUCCESS: Referral points credited to both users.")
    else:
        print("FAILURE: Referral points not credited correctly.")

def test_points_conversion():
    # Register a user and manually give them points (if we had a mock DB, but here we'll just refer 10 times or use an existing user if possible)
    # For simulation, we'll try to convert even if the user has 0 points and expect a 400
    print("Testing conversion with 0 points...")
    user_data = {
        "name": "Test User",
        "email": "testconv@example.com",
        "phone": "+919999999993",
        "password": "password123",
        "platform": "Zomato",
        "city": "Bangalore"
    }
    resp = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    user = resp.json()
    
    conv_resp = requests.post(f"{BASE_URL}/wallet/convert-points", json={"user_id": user["id"]})
    print(f"Conversion status (expected 400): {conv_resp.status_code}, Detail: {conv_resp.text}")

if __name__ == "__main__":
    # Note: This assumes the FastAPI server is running at localhost:8000
    try:
        test_referral_flow()
        test_points_conversion()
    except Exception as e:
        print(f"Error connecting to server: {e}. Make sure the backend is running.")
