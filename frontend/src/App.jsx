import React, { useState, useEffect } from "react";
import {
  Activity,
  Clock,
  Radio,
  Wifi,
  Cpu,
  MapPin,
  Zap,
  Crosshair,
  ChevronRight,
  AlertTriangle,
  Target,
  Signal,
  Battery,
  Scan,
} from "lucide-react";

const MOCK_ALERTS = [
  {
    alert_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    timestamp: "2026-08-01T10:20:14.000Z",
    threat_level: "CRITICAL",
    reasoning: "Large cow detected moving close to the center boundary.",
    image_path: "https://via.placeholder.com/640x480.png?text=TACTICAL+TARGET+LOCK:+COW",
  },
  {
    alert_id: "8c0cea3c-2a6c-3abc-8acc-1a0c6a2cba5c",
    timestamp: "2026-08-01T10:15:00.000Z",
    threat_level: "LOW",
    reasoning: "Small dog detected near edge fence line.",
    image_path: "https://via.placeholder.com/640x480.png?text=TACTICAL+TARGET+LOCK:+DOG",
  },
];

export default function App() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fps, setFps] = useState(28);
  const [ramUsage, setRamUsage] = useState(14);
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    const fpsInterval = setInterval(() => {
      setFps(24 + Math.floor(Math.random() * 12));
    }, 1500);
    const ramInterval = setInterval(() => {
      setRamUsage(12 + Math.floor(Math.random() * 8));
    }, 3000);
    const latencyInterval = setInterval(() => {
      setLatency(8 + Math.floor(Math.random() * 10));
    }, 2000);
    return () => {
      clearInterval(clockInterval);
      clearInterval(fpsInterval);
      clearInterval(ramInterval);
      clearInterval(latencyInterval);
    };
  }, []);

  const getThreatLevel = () => {
    if (alerts.length === 0) return "SAFE";
    if (alerts.some((a) => a.threat_level === "CRITICAL")) return "CRITICAL";
    if (alerts.some((a) => a.threat_level === "LOW")) return "LOW";
    return "SAFE";
  };

  const threatLevel = getThreatLevel();
  const latestAlert = alerts[0];

  const formatTimestamp = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-GB", { hour12: false });
  };

  const formatUtcClock = () => {
    return currentTime.toUTCString().split(" ")[4];
  };

  const formatLocalClock = () => {
    return currentTime.toLocaleTimeString("en-GB", { hour12: false });
  };

  const threatBlockCount = () => {
    if (threatLevel === "SAFE") return 1;
    if (threatLevel === "LOW") return 3;
    return 5;
  };

  const getBlockColor = (index) => {
    if (threatLevel === "CRITICAL") return "bg-[#ff2a2a]";
    if (index < threatBlockCount()) {
      if (threatLevel === "SAFE") return "bg-[#00ff66]";
      return "bg-[#ff9900]";
    }
    return "bg-[#1a2018]";
  };

  const getBlockGlow = (index) => {
    if (threatLevel === "CRITICAL" && index < 5) return "shadow-[0_0_10px_#ff2a2a]";
    if (index < threatBlockCount()) {
      if (threatLevel === "SAFE") return "shadow-[0_0_6px_#00ff66]";
      return "shadow-[0_0_6px_#ff9900]";
    }
    return "";
  };

  const getBracketColor = () => {
    if (threatLevel === "CRITICAL") return "border-[#ff2a2a]";
    if (threatLevel === "LOW") return "border-[#ff9900]";
    return "border-[#00ff66]";
  };

  const getScoreColor = () => {
    if (threatLevel === "CRITICAL") return "text-[#ff2a2a]";
    if (threatLevel === "LOW") return "text-[#ff9900]";
    return "text-[#00ff66]";
  };

  const getSeverityLabel = () => {
    if (threatLevel === "CRITICAL") return "SEVERITY_HIGH";
    if (threatLevel === "LOW") return "SEVERITY_LOW";
    return "SEVERITY_NONE";
  };

  const getScoreValue = () => {
    if (threatLevel === "CRITICAL") return "85";
    if (threatLevel === "LOW") return "35";
    return "10";
  };

  return (
    <div className="min-h-screen bg-[#0b0f0c] text-[#c8d4cc] font-sans overflow-hidden select-none">
      <header className="flex items-center justify-between px-3 py-1.5 border-b border-[#1e2922] bg-[#121814]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-[#00ff66]" />
            <span className="font-mono text-[#00ff66] text-[11px] font-black tracking-widest">
              [ NODE-01 // NORTH BOUNDARY SECTOR ]
            </span>
          </div>
          <span className="text-[#5a7365] text-[9px] font-mono tracking-widest hidden xl:inline">
            EDGE INFRASTRUCTURE • HARDWARE ENCRYPTION ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-5 ${getBlockColor(i)} ${getBlockGlow(i)} border border-[#1e2922] transition-all duration-150 ${threatLevel === "CRITICAL" && i < 5 ? "animate-pulse" : ""}`}
            />
          ))}
          {threatLevel === "CRITICAL" && (
            <span className="text-[#ff2a2a] font-mono text-[9px] font-black tracking-widest ml-2 animate-pulse">
              INTRUSION IN PROGRESS
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[#00ff66]" />
            <span className="font-mono text-[#5a7365] text-[10px]">{fps} FPS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Battery className="w-3 h-3 text-[#ff9900]" />
            <span className="font-mono text-[#5a7365] text-[10px]">RAM: {ramUsage}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-[#00ff66]" />
            <span className="font-mono text-[#5a7365] text-[10px]">{latency}ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#5a7365]" />
            <span className="font-mono text-[#5a7365] text-[10px]">{formatUtcClock()} UTC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[#5a7365] text-[10px]">{formatLocalClock()} LOCAL</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-[calc(100vh-36px)]">
        <section className="lg:col-span-2 flex flex-col">
          <div className="relative bg-[#070a08] border border-[#1e2922] m-2 mb-0 overflow-hidden aspect-video">
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,255,102,0.15) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,255,102,0.15) 1px, transparent 1px)
                `,
                backgroundSize: "32px 32px",
              }}
            />

            {latestAlert && (
              <img
                src={latestAlert.image_path}
                alt="Tactical Target Lock"
                className="w-full h-full object-cover opacity-70"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f0c] via-transparent to-transparent opacity-60" />

            <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${getBracketColor()} transition-colors duration-300`} />
            <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 ${getBracketColor()} transition-colors duration-300`} />
            <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 ${getBracketColor()} transition-colors duration-300`} />
            <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${getBracketColor()} transition-colors duration-300`} />

            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#121814]/90 border border-[#1e2922] px-3 py-1 font-mono text-[10px] text-[#00ff66] tracking-wider">
              [ TARGET: LIVESTOCK // CONFIDENCE: {threatLevel === "CRITICAL" ? "88" : threatLevel === "LOW" ? "72" : "45"}% ]
            </div>

            <div className="absolute bottom-3 left-3 font-mono text-[10px] text-[#5a7365]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                <span>LAT: 22.3071° N</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                <span>LON: 73.1812° E</span>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Crosshair className="w-10 h-10 text-[#00ff66]/30" />
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[#00ff66]/50" />
          </div>

          <div className="bg-[#070a08] border border-[#1e2922] border-t-0 m-2 mt-0 p-3 font-mono text-[11px]">
            <div className="text-[#00ff66] text-[9px] tracking-widest mb-3 flex items-center gap-2">
              <Scan className="w-3 h-3" />
              {"> AI DECISION ENGINE DIAGNOSTICS"}
            </div>
            <div className="space-y-1.5">
              <div className={`${getScoreColor()} font-bold`}>
                THREAT_SCORE: {getScoreValue()}/100 [{getSeverityLabel()}]
              </div>
              <div className="text-[#5a7365]">
                REASONING: {latestAlert ? latestAlert.reasoning : "No active threat detected."}
              </div>
              <div className="text-[#ff2a2a] flex items-center gap-1.5">
                <Zap className="w-3 h-3" />
                RECOMMENDED_ACTION: [AUTO TRIGGER] SOUND ALARM + TELEGRAM DISPATCH
              </div>
            </div>
          </div>
        </section>

        <section className="border-l border-[#1e2922] flex flex-col bg-[#121814]">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2922]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-[#ff9900]" />
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#c8d4cc] font-black">
                INTRUSION EVENT LOG
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff2a2a] animate-pulse" />
              <span className="font-mono text-[8px] text-[#ff2a2a] tracking-widest font-black">
                LIVE STREAM
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {alerts.map((alert) => (
              <div key={alert.alert_id} className="border-b border-[#1e2922] p-3 hover:bg-[#161e18] transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-[#5a7365] text-[10px]">
                    [{formatTimestamp(alert.timestamp)}]
                  </span>
                  <span
                    className={`font-mono text-[8px] font-black px-1.5 py-0.5 tracking-wider ${alert.threat_level === "CRITICAL" ? "bg-[#ff2a2a] text-black" : "bg-[#ff9900] text-black"}`}
                  >
                    {alert.threat_level}
                  </span>
                </div>
                <p className="text-[11px] text-[#c8d4cc] mb-2 leading-relaxed font-mono">{alert.reasoning}</p>
                <button className="font-mono text-[9px] text-[#00ff66] border border-[#1e2922] px-2 py-0.5 hover:bg-[#00ff66]/10 hover:border-[#00ff66]/30 transition-colors tracking-wider flex items-center gap-1">
                  <ChevronRight className="w-2.5 h-2.5" />
                  [ VIEW FRAME ]
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-[#1e2922] p-3 bg-[#0b0f0c]">
            <div className="font-mono text-[8px] tracking-widest text-[#5a7365] mb-2 font-black">
              SYSTEM TELEMETRY
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Wifi className="w-3 h-3 text-[#00ff66]" />
                <span className="font-mono text-[10px] text-[#c8d4cc]">CAMERA_FEED: CONNECTED (RTSP/IP)</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-3 h-3 text-[#00ff66]" />
                <span className="font-mono text-[10px] text-[#c8d4cc]">YOLO_ENGINE: ONLINE (YOLOv8n)</span>
              </div>
              <div className="flex items-center gap-2">
                <Radio className="w-3 h-3 text-[#ff9900]" />
                <span className="font-mono text-[10px] text-[#c8d4cc]">TELEGRAM_BOT: DISPATCH READY</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}