
import os
import time
import requests
from dotenv import load_dotenv

# Load the variables from the .env file
load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# Prevent spam: Only send 1 message every 60 seconds
COOLDOWN_SECONDS = 60
last_sent_time = 0

def send_telegram_alert(message: str, image_path: str = None) -> bool:
    """
    Sends a message and optional photo to the farmer's Telegram.
    Returns True if successful, False if blocked by cooldown or error.
    """
    global last_sent_time
    
    current_time = time.time()
    
    # 1. Check Cooldown
    if current_time - last_sent_time < COOLDOWN_SECONDS:
        print("Telegram alert on cooldown. Skipping to prevent spam.")
        return False

    # 2. Check Credentials
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("Warning: Telegram credentials missing in .env")
        return False

    # 3. Dispatch the Alert
    try:
        if image_path and os.path.exists(image_path):
            # Send Photo + Text
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto"
            with open(image_path, "rb") as photo:
                payload = {"chat_id": TELEGRAM_CHAT_ID, "caption": message}
                response = requests.post(url, data=payload, files={"photo": photo})
        else:
            # Send Text Only
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message}
            response = requests.post(url, json=payload)
        
        # 4. Handle Response
        if response.status_code == 200:
            last_sent_time = current_time
            print("Telegram alert sent successfully!")
            return True
        else:
            print(f"Telegram API Error: {response.text}")
            return False

    except Exception as e:
        print(f"Failed to reach Telegram: {e}")
        return False

if __name__ == "__main__":
    print("Testing Telegram Bot...")
    success = send_telegram_alert("🚨 Hackathon Test: Stray cow detected at North Boundary!")
    print(f"Was message sent? {success}")