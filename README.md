# Agri-Shield 🌾🛡️

An AI-powered agricultural perimeter defense and real-time threat detection system using Android IP Webcam, OpenCV, YOLOv8 Nano, FastAPI, SQLite, Telegram API, and React.

---

## 📚 Project Documentation

- **[System Architecture & Data Flow](docs/ARCHITECTURE.md)**: Detailed breakdown of the IP Webcam stream ingestion, two-stage motion/YOLO detection, bounding box math & threat scoring, FastAPI backend orchestrator, and real-time alerting system.
- **[Dependency Flow & Layer Rules](docs/DEPENDENCY_FLOW.md)**: Comprehensive architectural guide on layer separation, downward-only dependency rules, Pydantic schema contracts, and package structure mapping.

---

## 🏗️ Folder Structure Overview

```text
Agri-Shield/
├── docs/
│   ├── ARCHITECTURE.md          # End-to-end data flow & architecture breakdown
│   └── DEPENDENCY_FLOW.md       # Layer hierarchy & import rules
├── backend/                     # Python FastAPI + YOLO Backend
│   ├── requirements.txt
│   ├── main.py                  # Orchestrator & entry point
│   ├── config.py                # Global settings & env vars
│   ├── schemas.py               # Shared Pydantic data contracts
│   ├── camera/                  # Raw stream reader (HTTP/RTSP)
│   ├── detection/               # CV motion filter + YOLOv8 Nano
│   ├── engine/                  # Movement vectors & threat scoring
│   ├── database/                # SQLite async ORM & migrations
│   ├── notifications/           # Telegram bot alert tasks
│   └── api/                     # REST & WebSocket routes
└── frontend/                    # React + Vite Dashboard
    ├── package.json
    └── src/
```
