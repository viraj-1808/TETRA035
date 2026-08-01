
from sqlalchemy import Column, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# SQLite local database file
DATABASE_URL = "sqlite:///./data/farm_guard.db"

# connect_args={"check_same_thread": False} is a requirement for FastAPI + SQLite
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class DBAlert(Base):
    __tablename__ = "alerts"

    alert_id = Column(String, primary_key=True, index=True)
    timestamp = Column(String, index=True)
    threat_level = Column(String)
    reasoning = Column(String)
    image_path = Column(String)

# Automatically create the table on startup if it doesn't exist
Base.metadata.create_all(bind=engine)