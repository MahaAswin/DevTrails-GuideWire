from datetime import datetime, timedelta
from app.database.mongodb import users_collection

def run_reminder_cron():
    print(f"[{datetime.utcnow()}] Running Daily Policy Reminder Cron...")
    
    # 1. Fetch users with reminders enabled
    users = users_collection.find({"reminderEnabled": True})
    
    reminders_sent = 0
    now = datetime.utcnow()
    three_days_from_now = now + timedelta(days=3)
    
    for user in users:
        subscriptions = user.get("policy_subscriptions", [])
        upcoming_expiries = []
        
        for sub in subscriptions:
            expiry = sub.get("expiry_date")
            if expiry and now < expiry <= three_days_from_now:
                upcoming_expiries.append(sub.get("policy_name", "Unknown Policy"))
        
        if upcoming_expiries:
            send_reminder_mock(user, upcoming_expiries)
            reminders_sent += 1
            
    print(f"Cron finished. Sent {reminders_sent} reminders.")
    return reminders_sent

def send_reminder_mock(user, policies):
    """Simulates sending an email via Nodemailer/SMTP and SMS."""
    recipient = user.get("email")
    phone = user.get("phone", "N/A")
    policy_names = ", ".join(policies)
    
    print(f"--- MOCK NOTIFICATION ---")
    print(f"TO: {recipient} ({phone})")
    print(f"SUBJECT: ShieldGig Policy Renewal Reminder")
    print(f"MESSAGE: Hi {user.get('name')}, your insurance coverage for [{policy_names}] is expiring within 3 days. Please ensure your wallet has enough balance for auto-renewal.")
    print(f"--------------------------")

if __name__ == "__main__":
    # Allow running as a standalone script
    run_reminder_cron()
