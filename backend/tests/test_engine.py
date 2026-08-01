import time
import sys
import os

# Ensure the backend directory is in sys.path so 'engine' can be imported as a package
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from engine.analyzer import ThreatAnalyzer
from engine.deterrent_selector import DeterrentSelector


def run_tests():
    print("==============================================")
    print("   RUNNING DECISION ENGINE UNIT TESTS         ")
    print("==============================================\n")

    analyzer = ThreatAnalyzer(cooldown_seconds=2) # Shortened to 2s for quick testing
    selector = DeterrentSelector()

    # Test Case 1: Safe / Empty Field
    print("--- Test Case 1: Empty Field (SAFE) ---")
    empty_frame = {"detections": []}
    assessment = analyzer.analyze(empty_frame)
    action = selector.select_action(assessment)
    print(f"Assessment: {assessment}")
    print(f"Action Payload: {action}\n")

    # Test Case 2: Single Close Cow (CRITICAL Threat)
    print("--- Test Case 2: Single Close Cow (CRITICAL) ---")
    single_cow = {
        "detections": [
            {"label": "cow", "confidence": 0.92, "bbox": [100, 100, 900, 900]} # Large area ratio
        ]
    }
    assessment = analyzer.analyze(single_cow)
    action = selector.select_action(assessment)
    print(f"Assessment: {assessment}")
    print(f"Action Payload: {action}\n")

    # Test Case 3: Cooldown Verification (Should suppress immediate re-alert)
    print("--- Test Case 3: Cooldown Check (Should be on Cooldown) ---")
    assessment = analyzer.analyze(single_cow)
    print(f"Assessment: {assessment}\n")

    # Test Case 4: Herd of Animals (Group Multiplier Test)
    print("--- Test Case 4: Herd of 4 Animals (CRITICAL Density) ---")
    # Wait past cooldown first
    time.sleep(2.1)
    herd_frame = {
        "detections": [
            {"label": "cow", "confidence": 0.85, "bbox": [100, 100, 400, 400]},
            {"label": "cow", "confidence": 0.88, "bbox": [500, 100, 800, 400]},
            {"label": "dog", "confidence": 0.75, "bbox": [200, 500, 400, 700]},
            {"label": "cow", "confidence": 0.90, "bbox": [450, 500, 750, 800]}
        ]
    }
    assessment = analyzer.analyze(herd_frame)
    action = selector.select_action(assessment)
    print(f"Assessment: {assessment}")
    print(f"Action Payload: {action}\n")

    # Test Case 5: Field Clearance State Tracking
    print("--- Test Case 5: Field Clearing (Simulating exit delay) ---")
    # Send empty frames. Note: code waits 15 continuous seconds before declaring "FIELD CLEARED", 
    # but we can verify it returns SAFE right away.
    for i in range(3):
        assessment = analyzer.analyze({"detections": []})
        print(f"Tick {i+1} - Assessment: {assessment}")
    
    print("\n==============================================")
    print("   ALL TEST CASES EXECUTED SUCCESSFULLY       ")
    print("==============================================\n")

if __name__ == "__main__":
    run_tests()