from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import requests  # <-- NEW: Needed to send the Telegram message
import os
from dotenv import load_dotenv

from schemas import Alert, APIResponse
from database.models import SessionLocal, DBAlert


# 👇 NEW: Load the variables from the .env file into the system
load_dotenv()

# 👇 NEW: Fetch the secrets securely
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

app = FastAPI(title="Farm Guard API")

# Fixes the CORS block so M4's React app can fetch data
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get a database session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 👇 NEW: Helper function to trigger the Telegram message
def send_telegram_message(alert: Alert):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    
    # Formatting the message with emojis for readability
    text = (
        f"🚨 *FARM GUARD ALERT* 🚨\n\n"
        f"⚠️ *Threat Level:* {alert.threat_level}\n"
        f"📝 *Details:* {alert.reasoning}\n"
        f"🕒 *Time:* {alert.timestamp}"
    )
    
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "Markdown"
    }
    
    try:
        response = requests.post(url, json=payload)

        if response.status_code != 200:
            print(response.text)
    except Exception as e:
        print(f"Failed to send Telegram notification: {e}")

@app.get("/api/status", tags=["Health"])
def health_check():
    return {"status": "success", "message": "Farm Guard Backend is Live"}

@app.get("/api/events", response_model=APIResponse, tags=["Alerts"])
def get_recent_events(limit: int = 10, db: Session = Depends(get_db)):
    alerts = db.query(DBAlert).order_by(DBAlert.timestamp.desc()).limit(limit).all()
    
    safe_alerts = [
        {
            "alert_id": alert.alert_id,
            "timestamp": alert.timestamp,
            "threat_level": alert.threat_level,
            "reasoning": alert.reasoning,
            "image_path": alert.image_path
        } 
        for alert in alerts
    ]
    
    return {"status": "success", "data": safe_alerts}

@app.post("/api/test-alert", response_model=APIResponse, tags=["Testing"])
def create_test_alert(alert: Alert, db: Session = Depends(get_db)):
    """Used to inject fake data so M4 can test the UI before the AI is ready."""
    
    # 1. Save to the database
    db_alert = DBAlert(**alert.model_dump())
    db.add(db_alert)
    db.commit()
    
    # 2. Trigger the Telegram Notification (NEW)
    send_telegram_message(alert)
    
    return {"status": "success", "message": "Mock alert saved and notification sent"}