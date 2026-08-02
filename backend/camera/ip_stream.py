import cv2
import threading
import time

class IPWebcamStream:
    def __init__(self, stream_url: str):
        """
        Initializes the video stream in a background thread to prevent buffer lag.
        """
        print(f"[CAMERA] Connecting to {stream_url}...")
        self.stream_url = stream_url
        self.cap = cv2.VideoCapture(self.stream_url)
        
        if not self.cap.isOpened():
            raise ConnectionError(f"Cannot connect to camera at {stream_url}")
            
        # Read the first frame
        self.ret, self.frame = self.cap.read()
        
        # Thread control flag
        self.running = True
        
        # Start the background thread
        self.thread = threading.Thread(target=self._update, args=())
        self.thread.daemon = True  # Daemon means thread dies when main program exits
        self.thread.start()
        print("[CAMERA] Stream connected and background thread started.")

    def _update(self):
        """
        Infinite loop running in the background thread.
        Constantly grabs the newest frame and throws away the old ones.
        """
        while self.running:
            ret, frame = self.cap.read()
            if ret:
                self.ret = ret
                self.frame = frame
            else:
                # If network drops, wait a tiny bit before trying again
                time.sleep(0.1)

    def read(self):
        """
        Returns the absolute latest frame available.
        """
        return self.ret, self.frame

    def release(self):
        """
        Safely stops the thread and releases the camera.
        """
        self.running = False
        self.thread.join(timeout=1.0)
        self.cap.release()
        print("[CAMERA] Stream released.")
