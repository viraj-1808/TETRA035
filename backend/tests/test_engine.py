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

    # Test Case 6: Pydantic Model Integration (evaluate -> select_action)
    print("\n--- Test Case 6: Pydantic Model Integration (evaluate -> select_action) ---")
    time.sleep(2.1)
    cow_frame = {
        "detections": [
            {"label": "cow", "confidence": 0.95, "bbox": [100, 100, 800, 800]}
        ]
    }
    pydantic_assessment = analyzer.evaluate(cow_frame)
    pydantic_action = selector.select_action(pydantic_assessment)
    print(f"Pydantic Assessment Type: {type(pydantic_assessment)}")
    print(f"Pydantic Assessment:      {pydantic_assessment}")
    print(f"Pydantic Action Payload:  {pydantic_action}\n")

    # Test Case 7: LOW Threat Severity & Soft Deterrent
    print("--- Test Case 7: LOW Threat Severity (Soft Deterrent) ---")
    analyzer.reset()
    dog_frame = {
        "detections": [
            {"label": "dog", "confidence": 0.85, "bbox": [100, 100, 200, 200]}  # Score ~ 49 (LOW)
        ]
    }
    low_assessment = analyzer.analyze(dog_frame)
    low_action = selector.select_action(low_assessment)
    print(f"LOW Assessment:     {low_assessment}")
    print(f"LOW Action Payload: {low_action}\n")

    # Test Case 8: FIELD CLEARED Event After Absence (15s threshold simulation)
    print("--- Test Case 8: FIELD CLEARED Event After Absence ---")
    analyzer.last_seen_time = time.time() - 16.0  # Simulate 16 seconds since last animal seen
    cleared_assessment = analyzer.analyze({"detections": []})
    cleared_action = selector.select_action(cleared_assessment)
    print(f"Cleared Assessment:     {cleared_assessment}")
    print(f"Cleared Action Payload: {cleared_action}")
    
    print("\n==============================================")
    print("   ALL TEST CASES EXECUTED SUCCESSFULLY       ")
    print("==============================================\n")

if __name__ == "__main__":
    run_tests()