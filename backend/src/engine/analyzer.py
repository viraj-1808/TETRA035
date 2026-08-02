import time
from collections import deque
from typing import Dict, Any, Optional

try:
    from schemas import ThreatAssessment
except ImportError:
    from src.schemas import ThreatAssessment


class ThreatAnalyzer:
    """
    Evaluates YOLO detection results, applies herd density multipliers, 
    smooths frame-level variance using a rolling memory buffer, and manages cooldown states.
    """
    def __init__(self, frame_width: int = 1920, frame_height: int = 1080, cooldown_seconds: int = 60):
        self.frame_area = frame_width * frame_height
        self.cooldown_seconds = cooldown_seconds
        self.last_alert_time = 0.0
        
        # Rolling buffer to remember the last 10 frames (~3 to 5 seconds) to handle varying animal speeds/occlusions
        self.count_history = deque(maxlen=10)
        self.last_seen_time = time.time()
        self.current_state = "SAFE"

        # Animal risk weights (Cows and Elephants pose high crop destruction risk)
        self.animal_weights = {
            "cow": 1.0,
            "elephant": 1.0,
            "dog": 0.4,
            "person": 0.2,
        }

    def evaluate(self, detection_result: Any) -> ThreatAssessment:
        """
        Wrapper returning a validated ThreatAssessment Pydantic object.
        """
        return ThreatAssessment(**self.analyze(detection_result))

    def reset(self):
        """Resets rolling buffer and cooldown state."""
        self.count_history.clear()
        self.current_state = "SAFE"
        self.last_alert_time = 0.0
        self.last_seen_time = time.time()

    def analyze(self, detection_result: Any) -> Dict[str, Any]:
        """
        Evaluates detection results dictionary or Pydantic model.
        """
        if hasattr(detection_result, "model_dump"):
            detection_data = detection_result.model_dump()
        elif hasattr(detection_result, "dict"):
            detection_data = detection_result.dict()
        elif isinstance(detection_result, dict):
            detection_data = detection_result
        else:
            detection_data = {}

        detections = detection_data.get("detections", [])
        current_time = time.time()
        
        current_count = len(detections)
        self.count_history.append(current_count)
        
        # 1. Rolling Max Count over the buffer window to eliminate frame-flicker
        buffered_count = max(self.count_history) if self.count_history else 0

        # Handle Complete Absence / Clearing Logic (Waits 15 continuous seconds before resetting)
        if current_count == 0 and (current_time - self.last_seen_time > 15):
            self.count_history.clear()
            self.current_state = "SAFE"
            return {
                "threat_level": "SAFE",
                "threat_score": 0,
                "reasoning": "FIELD CLEARED: All animals have exited the monitored area.",
                "detected_animal": None
            }
        if buffered_count == 0:
            return {
                "threat_level": "SAFE",
                "threat_score": 0,
                "reasoning": "All clear. No active threats.",
                "detected_animal": None
            }

        # Update active timestamp when animals are visible in frame
        self.last_seen_time = current_time

        max_individual_score = 0
        primary_animal = None
        high_risk_count = 0

        # 2. Evaluate individual base scores and categorize herd severity
        for det in detections:
            if isinstance(det, dict):
                label = det.get("label", "animal").lower()
                bbox = det.get("bbox", [0, 0, 0, 0])
                confidence = det.get("confidence", 0.0)
            else:
                label = getattr(det, "label", "animal").lower()
                bbox = getattr(det, "bbox", [0, 0, 0, 0])
                confidence = getattr(det, "confidence", 0.0)

            box_w = max(0, bbox[2] - bbox[0])
            box_h = max(0, bbox[3] - bbox[1])
            area_ratio = (box_w * box_h) / self.frame_area

            weight = self.animal_weights.get(label, 0.3)
            score = int(min(100, (area_ratio * 300) * weight * confidence * 100))

            if primary_animal is None or score >= max_individual_score:
                max_individual_score = score
                primary_animal = label

            if label in ["cow", "elephant", "horse", "sheep"]:
                high_risk_count += 1

        primary_animal = primary_animal or "animal"

        # Fallback if high_risk_count wasn't incremented explicitly
        if high_risk_count == 0:
            high_risk_count = buffered_count

        # 3. Apply Weighted Group Multiplier (scaling based on herd density)
        group_multiplier = 1.0 + (0.15 * (high_risk_count - 1))
        final_score = int(min(100, max_individual_score * group_multiplier))

        # Map Threat Level thresholds
        if final_score >= 60:
            raw_threat = "CRITICAL"
        elif final_score >= 25:
            raw_threat = "LOW"
        else:
            raw_threat = "SAFE"

        # Update persistent state tracker
        self.current_state = raw_threat

        # 4. Debounce / Cooldown Logic to prevent alerting the farmer every few seconds
        if raw_threat in ["LOW", "CRITICAL"]:
            if (current_time - self.last_alert_time) < self.cooldown_seconds:
                return {
                    "threat_level": raw_threat,
                    "threat_score": final_score,
                    "reasoning": f"Threat active ({buffered_count} {primary_animal}s nearby). Alert on cooldown.",
                    "detected_animal": primary_animal
                }
            else:
                self.last_alert_time = current_time

        return {
            "threat_level": raw_threat,
            "threat_score": final_score,
            "reasoning": f"ALERT: Herd of {buffered_count} {primary_animal}(s) active near perimeter.",
            "detected_animal": primary_animal
        }


# Alias for backward compatibility & pipeline integration
ThreatEngine = ThreatAnalyzer
