🌾🛡️ Agri-Shield: Smart Farm Boundary Guard
An AI-powered edge surveillance system that detects stray animals, evaluates threat levels, and alerts farmers in real-time.

Built during a 36-hour hackathon, Agri-Shield is designed for extreme practicality: it runs on cheap edge hardware, utilizes an old Android phone as an IP camera, and minimizes compute power using mathematical motion-gating before running neural networks.

🚜 The Problem
Farmers suffer immense crop losses because stray animals (cows, wild boars, dogs) enter fields unnoticed, especially during the night or early morning. Traditional fencing is expensive, and staring at security cameras 24/7 is impossible.

💡 The Solution
Agri-Shield acts as an untiring digital guard dog.

Watches: Continuously streams video from an Android phone placed at the farm boundary.

Filters: Uses a highly efficient OpenCV background-subtraction filter to detect motion, saving 90% of CPU power by ignoring static/empty frames.

Analyzes: Runs YOLOv8 Nano only on frames with motion to identify the specific animal.

Decides: A custom Decision Engine calculates bounding box mass and proximity to determine the threat level (e.g., a small dog is LOW, a large cow is CRITICAL).

Alerts: Flashes a real-time React dashboard and sends a snapshot directly to the farmer's Telegram.

🧠 Engineering Highlights (For the Judges)
Threaded Frame Buffer: Standard OpenCV HTTP streams buffer frames, causing massive AI lag over time. We implemented a custom daemon thread to flush the buffer, guaranteeing 0ms latency for the AI loop.

Motion-Gated Inference: We do not run YOLOv8 on every frame. A lightweight cv2.absdiff motion filter acts as a gatekeeper.

Strict Unidirectional Architecture: Sub-systems communicate exclusively via predefined Pydantic JSON contracts (schemas.py), ensuring zero circular dependencies and allowing parallel team development.

🏗️ Folder Structure
We enforce a strict Workspace Pattern to cleanly separate the AI/Backend from the UI.

Plaintext
Agri-Shield/
├── docs/
│   ├── ARCHITECTURE.md          # End-to-end data flow & AI pipeline breakdown
│   └── DEPENDENCY_FLOW.md       # Layer hierarchy & import rules
│
├── backend/                     # Python AI & API Workspace
│   ├── requirements.txt
│   ├── main.py                  # Main orchestrator & background thread loop
│   ├── config.py                # Global settings (Camera URL, thresholds)
│   ├── schemas.py               # Shared Pydantic data contracts (The Core API)
│   ├── data/                    # SQLite DB and local snapshot storage (Git-ignored)
│   ├── camera/                  # Threaded IP webcam ingest stream
│   ├── detection/               # OpenCV motion filter + YOLOv8 Nano inference
│   ├── engine/                  # Bounding box math & threat scoring logic
│   ├── api/                     # FastAPI REST routes for the dashboard
│   └── notifications/           # Telegram bot dispatcher with anti-spam cooldowns
│
└── frontend/                    # React + Vite UI Workspace
    ├── package.json
    └── src/                     # Tailwind-styled components & API fetch services
🚀 Getting Started (Run it locally)
1. Hardware Setup
Connect an Android phone and this laptop to the same Wi-Fi network.

Download IP Webcam on Android, set resolution to 640x480, and start the server.

Note the IP address (e.g., [http://192.168.1.5:8080](http://192.168.1.5:8080)).

2. Backend (FastAPI + YOLO)
Bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up your environment variables
export CAMERA_URL="http://192.168.1.5:8080/video"
export TELEGRAM_BOT_TOKEN="your_token_here"
export TELEGRAM_CHAT_ID="your_chat_id_here"

# Run the AI pipeline and server
python main.py
3. Frontend (React Dashboard)
Open a new terminal tab.

Bash
cd frontend
npm install
npm run dev
Visit http://localhost:5173 to view the live dashboard.

👥 The Team
Member 1 (Computer Vision): Handled stream ingestion, buffer management, motion detection, and YOLOv8 deployment.

Member 2 (Decision Engine): Developed the bounding box mathematics, movement vectors, and threat scoring logic.

Member 3 (Backend & Cloud): Built the FastAPI orchestrator, SQLite event logger, and Telegram API integration.

Member 4 (Frontend UI): Designed and built the real-time React/Tailwind dashboard for the end-user.
