import cv2
import requests
import time
from datetime import datetime, timezone
import uuid

# 👇 Importing your exact classes
from detection.yolo_detector import AnimalDetector
from engine.analyzer import ThreatAnalyzer

API_URL = "http://127.0.0.1:8000/api/test-alert"

def run_pipeline():
    print("🌾 Starting Farm Guard Orchestrator...")
    
    # Initialize your M1 and M2 classes
    detector = AnimalDetector()
    analyzer = ThreatAnalyzer()
    
    # OLD CODE
    # cap = cv2.VideoCapture("tests/test_video.mp4")

    # NEW CODE
    from camera.ip_stream import IPWebcamStream

    # Use the exact URL shown on your phone app + "/video"
    CAMERA_URL = [
        {"id": "Shiv", "url": "http://192.168.29.97:8080/video"},
        {"id": "Dhruv", "url": "http://100.117.111.60:8080/video"},
        {"id": "Viraj", "url": "http://100.89.133.45:8080/video"}
    ]
    # Defaulting to camera index 0 (Shiv). Change index to switch cameras.
    selected_cam = CAMERA_URL[0]
    print(f"[CAMERA] Using camera ID: {selected_cam['id']}")
    stream = IPWebcamStream(selected_cam["url"])

    try:
        while True:
            ret, frame = stream.read()
            if not ret or frame is None:
                print("[WARNING] Frame dropped or network hiccup. Retrying...")
                time.sleep(0.1)
                continue

            # ---------------------------------------------------------
            # 1. Run M1 (Computer Vision Detection)
            detection_result = detector.detect(frame) 
            
            # 2. Run M2 (Threat Engine Scoring)
            assessment = analyzer.analyze(detection_result)
            threat_level = assessment.get("threat_level", "SAFE")
            reasoning = assessment.get("reasoning", "No active threats.")

            threat_score = assessment.get("threat_score", 0)
            animal_type = assessment.get("detected_animal", "Unknown")
            # ---------------------------------------------------------
            
            is_new_alert = "cooldown" not in reasoning.lower()

            if threat_level == "CRITICAL" and is_new_alert:
                print(f"🚨 CRITICAL THREAT DETECTED: {reasoning}")
                
                image_filename = f"threat_{uuid.uuid4().hex[:8]}.jpg"
                image_filepath = f"static/{image_filename}"
                cv2.imwrite(image_filepath, frame)
                
                alert_payload = {
                    "alert_id": str(uuid.uuid4()),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "threat_level": threat_level,
                    "reasoning": reasoning,
                    "image_path": f"http://127.0.0.1:8000/static/{image_filename}",
                    "threat_score": threat_score,  # <-- NEW
                    "animal_type": animal_type     # <-- NEW
                }

                try:
                    response = requests.post(API_URL, json=alert_payload)
                    print("✅ Successfully routed to M3:", response.json())
                except Exception as e:
                    print("❌ Failed to connect to FastAPI backend:", e)

            # 4. Draw bounding boxes and show the live camera feed
            for det in detection_result.detections:
                x1, y1, x2, y2 = det.bbox
                label_text = f"{det.label} {det.confidence:.2f}"
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, label_text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            cv2.imshow('Farm Guard AI', frame)
            
            # Press 'q' to quit the stream
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    except KeyboardInterrupt:
        print("[SYSTEM] Shutting down...")
    finally:
        stream.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    run_pipeline()