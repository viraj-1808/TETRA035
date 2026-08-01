# backend/schemas.py
from pydantic import BaseModel, Field
from typing import List, Tuple, Optional, Any
from datetime import datetime, timezone


class Detection(BaseModel):
    label: str
    confidence: float
    bbox: Tuple[int, int, int, int]  # x_min, y_min, x_max, y_max


class DetectionResult(BaseModel):
    timestamp: str
    detections: List[Detection]


# BoundingBox & aliases for complete architecture compatibility
class BoundingBox(BaseModel):
    x_min: float = Field(..., description="Minimum X coordinate (left boundary)")
    y_min: float = Field(..., description="Minimum Y coordinate (top boundary)")
    x_max: float = Field(..., description="Maximum X coordinate (right boundary)")
    y_max: float = Field(..., description="Maximum Y coordinate (bottom boundary)")
    confidence: float = Field(..., description="Detection confidence score (0.0 to 1.0)")
    class_name: str = Field(..., description="Name of the detected target class (e.g. 'cow', 'person')")
    class_id: int = Field(..., description="YOLO class ID integer")


DetectionData = DetectionResult


class ThreatEvent(BaseModel):
    event_id: str = Field(..., description="Unique UUID or event identifier")
    timestamp: float = Field(..., description="Unix timestamp of threat evaluation")
    threat_level: str = Field(..., description="Threat severity: NONE, LOW, MEDIUM, HIGH, CRITICAL")
    target_class: str = Field(..., description="Primary detected class causing threat")
    confidence: float = Field(..., description="Confidence score of detection")
    vector: Tuple[float, float] = Field(default=(0.0, 0.0), description="Movement direction vector (dx, dy)")
    snapshot_path: Optional[str] = Field(default=None, description="File path to saved snapshot frame")
    requires_alert: bool = Field(default=False, description="Whether notification alert should be triggered")

# ---------------------------------------------------------
# API Endpoints & Database Schemas (Backend Module)
# ---------------------------------------------------------

class Alert(BaseModel):
    alert_id: str
    timestamp: str
    threat_level: str
    reasoning: str
    image_path: Optional[str] = None

class APIResponse(BaseModel):
    status: str
    message: Optional[str] = None
    data: Optional[Any] = None