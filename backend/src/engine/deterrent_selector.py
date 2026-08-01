from typing import Dict, Any

class DeterrentSelector:
    """
    Maps threat assessment outcomes to automated physical deterrents 
    and determines action payloads for the notification backend.
    """
    def __init__(self):
        # Configuration mapping threat level to hardware/deterrent responses
        pass

    def select_action(self, assessment: Any) -> Dict[str, Any]:
        if hasattr(assessment, "model_dump"):
            data = assessment.model_dump()
        elif hasattr(assessment, "dict"):
            data = assessment.dict()
        elif isinstance(assessment, dict):
            data = assessment
        else:
            data = {}

        threat_level = data.get("threat_level", "SAFE")
        threat_score = data.get("threat_score", 0)
        reasoning = data.get("reasoning", "")
        detected_animal = data.get("detected_animal", "unknown")

        action_payload = {
            "trigger_sound": False,
            "trigger_strobe": False,
            "sound_file": None,
            "notification_required": False,
            "message": reasoning
        }

        if threat_level == "CRITICAL":
            action_payload["trigger_sound"] = True
            action_payload["trigger_strobe"] = True
            action_payload["sound_file"] = "distress_alarm.wav" if detected_animal in ["cow", "elephant"] else "sharp_buzzer.wav"
            action_payload["notification_required"] = True

        elif threat_level == "LOW":
            action_payload["trigger_strobe"] = True  # Soft deterrent
            action_payload["notification_required"] = True

        elif "FIELD CLEARED" in reasoning.upper():
            action_payload["trigger_sound"] = False
            action_payload["trigger_strobe"] = False
            action_payload["notification_required"] = True  # Send the "All Clear" text

        return action_payload
