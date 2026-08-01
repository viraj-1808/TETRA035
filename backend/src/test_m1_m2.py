import cv2
import time
import os
import sys

# Ensure backend and backend/src are in sys.path for seamless package execution
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, ".."))

for p in [current_dir, backend_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Import contract schemas
try:
    from schemas import DetectionResult, ThreatAssessment
except ImportError:
    from src.schemas import DetectionResult, ThreatAssessment

# Import M1 Modules
try:
    from detection.motion import MotionDetector
    from detection.yolo_detector import AnimalDetector
except ImportError:
    from src.detection.motion import MotionDetector
    from src.detection.yolo_detector import AnimalDetector

# Import M2 Module
try:
    from engine.analyzer import ThreatEngine
except ImportError:
    from src.engine.analyzer import ThreatEngine


def run_integration_pipeline(video_path: str):
    print("[SYSTEM] Initializing AI Pipeline...")
    
    # Initialize our pipeline blocks
    motion_gate = MotionDetector(delta_thresh=25, min_area=500)
    ai_detector = AnimalDetector(confidence_thresh=0.45)
    decision_engine = ThreatEngine() 
    
    # Resolve video path robustly relative to current directory or backend directory
    candidate_paths = [
        video_path,
        os.path.join(current_dir, video_path),
        os.path.join(backend_dir, "tests/test_video.mp4"),
        os.path.join(current_dir, "tests/test_video.mp4")
    ]
    resolved_video_path = None
    for cand in candidate_paths:
        if os.path.exists(cand):
            resolved_video_path = cand
            break
            
    if not resolved_video_path:
        resolved_video_path = video_path

    print(f"[SYSTEM] Opening video stream from: {resolved_video_path}")
    cap = cv2.VideoCapture(resolved_video_path)
    
    fps_video = cap.get(cv2.CAP_PROP_FPS)
    if not fps_video or fps_video <= 0:
        fps_video = 30.0
    frame_count = 0
    last_log_time = -10.0
    
    print("[SYSTEM] Pipeline Ready. Starting stream...")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("[SYSTEM] Video stream ended.")
            break
        frame_count += 1
            
        # STEP 1: Motion Gatekeeper (Saves CPU)
        if not motion_gate.has_motion(frame):
            # No movement. Skip YOLO. Skip Engine. Loop again.
            cv2.imshow("Farm Guard - Live Feed", frame)
            if cv2.waitKey(30) & 0xFF == ord('q'):
                break
            continue
            
        # STEP 2: YOLO Detection (M1)
        # We only reach here if motion was detected!
        start_time = time.time()
        detection_result: DetectionResult = ai_detector.detect(frame)
        
        # If motion was just wind and YOLO found no animals, skip the engine.
        if not detection_result.detections:
            continue
            
        # STEP 3: Decision Engine (M2)
        # Pass the Pydantic contract directly to M2
        assessment: ThreatAssessment = decision_engine.evaluate(detection_result)
        
        # STEP 4: Visual Feedback for Testing
        elapsed = time.time() - start_time
        fps = 1.0 / elapsed if elapsed > 0 else 30.0
        
        # Draw bounding boxes and threat level
        for det in detection_result.detections:
            x1, y1, x2, y2 = det.bbox
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 165, 255), 2)
            
        # Display the Threat Level on the screen
        color = (0, 0, 255) if assessment.threat_level == "CRITICAL" else (0, 255, 255)
        cv2.putText(frame, f"THREAT: {assessment.threat_level}", (20, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, color, 3)
        cv2.putText(frame, f"FPS: {fps:.1f}", (20, 90), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        if assessment.detected_animal:
            cv2.putText(frame, f"ANIMAL: {assessment.detected_animal.upper()}", (20, 130), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Log to terminal for debugging (throttled to 1 log per 1.0 sec of video)
        video_time = frame_count / fps_video
        if video_time - last_log_time >= 1.0:
            last_log_time = video_time
            animal_str = assessment.detected_animal or "None"
            print(f"\n[ALERT] Level: {assessment.threat_level} | Score: {assessment.threat_score} | Animal: {animal_str}")
            print(f"Reason: {assessment.reasoning}")
        
        cv2.imshow("Farm Guard - Live Feed", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    # Point this to your test video!
    run_integration_pipeline("../tests/test_video.mp4")
