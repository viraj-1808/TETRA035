import cv2
import numpy as np
import os
from typing import Optional, Tuple, List


class MotionDetector:
    """
    Lightweight mathematical motion pre-filter using Gaussian blur and frame differencing (cv2.absdiff).
    
    Serves as Stage 1 of the Agri-Shield CV Pipeline to filter out static frames 
    before invoking heavy AI models (YOLOv8 Nano).
    """

    def __init__(
        self,
        blur_size: Tuple[int, int] = (21, 21),
        delta_thresh: int = 25,
        min_area: int = 500
    ):
        """
        Args:
            blur_size (Tuple[int, int]): Kernel size for Gaussian blur to smooth out wind/camera noise. Must be odd numbers.
            delta_thresh (int): Pixel intensity difference threshold to trigger binary change (0-255).
            min_area (int): Minimum bounding box area (px^2) of changed pixels to be considered 'motion'.
        """
        # Ensure blur_size contains odd numbers for Gaussian kernel
        blur_x = blur_size[0] if blur_size[0] % 2 != 0 else blur_size[0] + 1
        blur_y = blur_size[1] if blur_size[1] % 2 != 0 else blur_size[1] + 1
        
        self.blur_size: Tuple[int, int] = (blur_x, blur_y)
        self.delta_thresh: int = delta_thresh
        self.min_area: int = min_area
        self.previous_frame: Optional[np.ndarray] = None

    def reset(self) -> None:
        """Reset the internal motion detector state (e.g. on stream reconnect or resolution change)."""
        self.previous_frame = None

    def has_motion(self, current_frame: Optional[np.ndarray]) -> bool:
        """
        Compares the current frame to the previous frame. 
        Returns True if significant motion is detected, False otherwise.
        
        Args:
            current_frame (np.ndarray): Input frame from camera feed (BGR format).

        Returns:
            bool: True if significant motion exceeding min_area is detected, False otherwise.
        """
        motion_detected, _, _ = self.detect_motion(current_frame)
        return motion_detected

    def detect_motion(
        self, current_frame: Optional[np.ndarray]
    ) -> Tuple[bool, List[Tuple[int, int, int, int]], Optional[np.ndarray]]:
        """
        Performs detailed motion analysis on the input frame.

        Args:
            current_frame (np.ndarray): Input BGR frame from camera feed.

        Returns:
            Tuple containing:
                - bool: True if motion area >= min_area exists.
                - List[Tuple[int, int, int, int]]: Bounding boxes (x, y, w, h) of detected motion regions.
                - Optional[np.ndarray]: Binary threshold motion mask (255 for motion, 0 for static).
        """
        # Guard clause for invalid, empty, or None frames
        if current_frame is None or not isinstance(current_frame, np.ndarray) or current_frame.size == 0:
            return False, [], None

        # Convert to grayscale (color doesn't matter for motion differencing)
        gray = cv2.cvtColor(current_frame, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to ignore minor artifacts (leaves moving in wind, digital noise)
        gray = cv2.GaussianBlur(gray, self.blur_size, 0)

        # If it's the very first frame or frame shape changed, store it and skip
        if self.previous_frame is None or self.previous_frame.shape != gray.shape:
            self.previous_frame = gray
            return False, [], None

        # Calculate absolute difference between current and previous frame
        frame_delta = cv2.absdiff(self.previous_frame, gray)
        
        # If a pixel difference is > delta_thresh, turn it white (255), else black (0)
        _, thresh = cv2.threshold(frame_delta, self.delta_thresh, 255, cv2.THRESH_BINARY)
        
        # Dilate the threshold image to fill in holes and join close motion regions
        thresh = cv2.dilate(thresh, None, iterations=2)

        # Find the outlines (contours) of the white motion areas
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Update the background reference for the next frame's comparison
        self.previous_frame = gray

        motion_boxes: List[Tuple[int, int, int, int]] = []
        motion_detected = False

        # Check if any contour is large enough to be an animal or threat
        for contour in contours:
            if cv2.contourArea(contour) >= self.min_area:
                motion_detected = True
                x, y, w, h = cv2.boundingRect(contour)
                motion_boxes.append((x, y, w, h))
                
        return motion_detected, motion_boxes, thresh


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
    for p in candidate_paths:
        if os.path.exists(p):
            video_path = p
            break
            
    if not video_path:
        video_path = "../tests/test_video.mp4"

    # Integration test for M1
    print(f"Loading test video from: {video_path}")
    cap = cv2.VideoCapture(video_path)
    detector = MotionDetector()
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        motion_detected = detector.has_motion(frame)
        
        # Add visual feedback
        text = "MOTION: YES" if motion_detected else "MOTION: NO"
        color = (0, 0, 255) if motion_detected else (0, 255, 0)
        cv2.putText(frame, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
        
        cv2.imshow("Motion Test", frame)
        
        # Press 'q' to quit
        if cv2.waitKey(30) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()
