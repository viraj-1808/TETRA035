# backend/src/detection/yolo_detector.py
import os
import sys
from datetime import datetime, timezone
from typing import Optional, Set
import cv2
import numpy as np
from ultralytics import YOLO

# Add parent directories to sys.path for seamless imports
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_src_dir = os.path.abspath(os.path.join(current_dir, ".."))
backend_dir = os.path.abspath(os.path.join(current_dir, "../.."))

for p in [backend_src_dir, backend_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from schemas import DetectionResult, Detection
except ImportError:
    from src.schemas import DetectionResult, Detection


class AnimalDetector:
    def __init__(self, model_path: str = "yolov8n.pt", confidence_thresh: float = 0.45, target_classes: Optional[Set[int]] = None):
        """
        Initializes the YOLOv8 model. 
        Will auto-download yolov8n.pt (nano) on the first run.
        """
        self.model = YOLO(model_path)
        self.confidence_thresh = confidence_thresh
        
        # COCO dataset class IDs for farm threats:
        # 0: person, 15: cat, 16: dog, 17: horse, 18: sheep, 19: cow, 21: bear
        # We explicitly filter out cars, birds, airplanes, etc.
        self.target_classes = target_classes if target_classes is not None else {0, 15, 16, 17, 18, 19, 21}

    def detect(self, frame: Optional[np.ndarray]) -> DetectionResult:
        """
        Runs inference on a single frame and returns a structured DetectionResult.
        """
        if frame is None or not isinstance(frame, np.ndarray) or frame.size == 0:
            return DetectionResult(
                timestamp=datetime.now(timezone.utc).isoformat(),
                detections=[]
            )

        # Run YOLO inference. verbose=False stops it from spamming the terminal.
        results = self.model(frame, verbose=False)[0]
        
        detections = []
        for box in results.boxes:
            class_id = int(box.cls[0])
            conf = float(box.conf[0])
            
            # Filter by confidence and target animal/human classes
            if class_id in self.target_classes and conf >= self.confidence_thresh:
                label = self.model.names[class_id]
                
                # Convert bounding box tensor to a standard integer tuple (x1, y1, x2, y2)
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                
                detections.append(
                    Detection(
                        label=label,
                        confidence=conf,
                        bbox=(x1, y1, x2, y2)
                    )
                )
        
        return DetectionResult(
            timestamp=datetime.now(timezone.utc).isoformat(),
            detections=detections
        )


if __name__ == "__main__":
    # Locate test_video.mp4 robustly relative to script path or working directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidate_paths = [
        os.path.join(base_dir, "../tests/test_video.mp4"),
        os.path.join(base_dir, "../../tests/test_video.mp4"),
        os.path.join(base_dir, "tests/test_video.mp4"),
        "../tests/test_video.mp4",
        "tests/test_video.mp4"
    ]
    
    video_path = None
    for candidate in candidate_paths:
        if os.path.exists(candidate):
            video_path = candidate
            break
            
    if not video_path:
        video_path = "../tests/test_video.mp4"

    # Integration test for M1
    print(f"Loading test video from: {video_path}")
    detector = AnimalDetector()
    cap = cv2.VideoCapture(video_path)
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # 1. Run inference
        result = detector.detect(frame)
        
        # 2. Draw the results on the frame to verify it visually
        for det in result.detections:
            x1, y1, x2, y2 = det.bbox
            label_text = f"{det.label} {det.confidence:.2f}"
            
            # Draw green bounding box and label
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, label_text, (x1, y1 - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # 3. Print the Pydantic JSON to console to verify the contract
        print(result.model_dump_json(indent=2))
        
        cv2.imshow("YOLO Test", frame)
        if cv2.waitKey(30) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()
