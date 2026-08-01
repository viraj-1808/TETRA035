
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from schemas import Alert, APIResponse
from .database.models import SessionLocal, DBAlert

app = FastAPI(title="Farm Guard API")

# Fixes the CORS block so M4's React app can fetch data
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all ports for hackathon speed
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

@app.get("/api/status", tags=["Health"])
def health_check():
    return {"status": "success", "message": "Farm Guard Backend is Live"}

@app.get("/api/events", response_model=APIResponse, tags=["Alerts"])
def get_recent_events(limit: int = 10, db: Session = Depends(get_db)):
    """M4 (Frontend) will call this to populate the dashboard."""
    alerts = db.query(DBAlert).order_by(DBAlert.timestamp.desc()).limit(limit).all()
    return {"status": "success", "data": alerts}

@app.post("/api/test-alert", response_model=APIResponse, tags=["Testing"])
def create_test_alert(alert: Alert, db: Session = Depends(get_db)):
    """Used to inject fake data so M4 can test the UI before the AI is ready."""
    db_alert = DBAlert(**alert.model_dump())
    db.add(db_alert)
    db.commit()
    return {"status": "success", "message": "Mock alert saved"}