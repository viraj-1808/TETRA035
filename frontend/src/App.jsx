import React, { useState, useEffect } from "react";
import {
  Activity,
  Clock,
  AlertTriangle,
  Camera,
  ShieldCheck,
  Bell,
  Eye,
  MapPin,
  Wifi,
  CheckCircle,
  PawPrint,
  AlertCircle,
} from "lucide-react";

const MOCK_ALERTS = [
  {
    alert_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    timestamp: "2026-08-01T10:20:14.000Z",
    threat_level: "CRITICAL",
    reasoning: "Large cow detected moving close to the center crop boundary.",
    image_path: "https://via.placeholder.com/640x480.png?text=Smart+Farm+Guard:+Cow+Spotted",
  },
  {
    alert_id: "8c0cea3c-2a6c-3abc-8acc-1a0c6a2cba5c",
    timestamp: "2026-08-01T10:15:00.000Z",
    threat_level: "LOW",
    reasoning: "Small dog detected near outer edge fence line.",
    image_path: "https://via.placeholder.com/640x480.png?text=Smart+Farm+Guard:+Dog+Spotted",
  },
];

export default function App() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState("Just now");

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const getThreatLevel = () => {
    if (alerts.length === 0) return "SAFE";
    if (alerts.some((a) => a.threat_level === "CRITICAL")) return "CRITICAL";
    if (alerts.some((a) => a.threat_level === "LOW")) return "LOW";
    return "SAFE";
  };

  const threatLevel = getThreatLevel();
  const latestAlert = alerts[0];

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusLabel = () => {
    if (threatLevel === "CRITICAL") return "ALERT: ANIMAL DETECTED";
    if (threatLevel === "LOW") return "ALERT: ANIMAL DETECTED";
    return "STATUS: FARM SAFE";
  };

  const getStatusColor = () => {
    if (threatLevel === "CRITICAL") return "bg-[#E53E3E]/25 text-[#FF6B6B] border border-[#E53E3E]/60";
    if (threatLevel === "LOW") return "bg-[#F0B429]/20 text-[#F6C000] border border-[#F0B429]/50";
    return "bg-[#A4B17B]/20 text-[#C3CA92] border border-[#A4B17B]/50";
  };

  const getAlertBadge = (level) => {
    if (level === "CRITICAL") return "bg-[#E53E3E]/25 text-[#FF6B6B] border border-[#E53E3E]/60";
    if (level === "LOW") return "bg-[#F0B429]/20 text-[#F6C000] border border-[#F0B429]/50";
    return "bg-[#A4B17B]/20 text-[#C3CA92] border border-[#A4B17B]/50";
  };

  const getThreatScore = () => {
    if (threatLevel === "CRITICAL") return { score: 85, label: "High", color: "text-[#FF6B6B]" };
    if (threatLevel === "LOW") return { score: 35, label: "Low", color: "text-[#F6C000]" };
    return { score: 10, label: "Minimal", color: "text-[#C3CA92]" };
  };

  const getRecommendedAction = () => {
    if (threatLevel === "CRITICAL") return "Sounded Deterrent Alarm & Sent Telegram Alert";
    if (threatLevel === "LOW") return "Logged Sighting & Monitoring Area";
    return "No Action Needed";
  };

  const getAnimalIcon = () => <PawPrint className="w-5 h-5 text-[#F6C000]" />;

  const threat = getThreatScore();

  return (
    <div className="min-h-screen bg-[#20331B] text-[#F3F6E6] font-sans overflow-x-hidden">
      {/* Section 1: Header Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#4E6530] bg-[#354C2B]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-bold text-[#C3CA92]">🌾 Smart Farm Guard</span>
          </div>
          <span className="text-sm text-[#A4B17B] hidden md:inline">Live Edge Surveillance • Field Sector 1</span>
        </div>

        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-xl text-sm font-bold ${getStatusColor()}`}>
            {getStatusLabel()}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#A4B17B] animate-pulse" />
            <span className="text-sm text-[#A4B17B]">System Active • {lastUpdated}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Section 2: Live Field Camera View (Left 2/3) */}
        <section className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-[#C3CA92]" />
            <h2 className="text-xl font-bold text-[#C3CA92]">Live Field Snapshot</h2>
          </div>

          {/* Video Container */}
          <div className="relative bg-[#354C2B] border border-[#4E6530] rounded-xl overflow-hidden aspect-video">
            {latestAlert && (
              <img
                src={latestAlert.image_path}
                alt="Field Snapshot"
                className="w-full h-full object-cover"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#20331B] via-transparent to-transparent" />

            {/* Top-Left Badge: Detection Time */}
            <div className="absolute top-4 left-4 bg-[#20331B]/90 border border-[#4E6530] px-3 py-1.5 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#A4B17B]" />
                <span className="text-sm text-[#F3F6E6] font-medium">
                  Today at {latestAlert ? formatTime(latestAlert.timestamp) : "--:--"}
                </span>
              </div>
            </div>

            {/* Top-Right Badge: Detection Label */}
            <div className="absolute top-4 right-4 bg-[#354C2B]/90 border border-[#4E6530] px-3 py-1.5 rounded-lg">
              <span className="text-sm text-[#C3CA92] font-medium">
                Spotted: {threatLevel === "CRITICAL" ? "Stray Cattle" : threatLevel === "LOW" ? "Small Animal" : "No Detection"}
              </span>
            </div>

            {/* Bottom-Left: Coordinates */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-[#A4B17B]">
              <MapPin className="w-4 h-4" />
              <span>Field Sector 1 — Boundary Active</span>
            </div>
          </div>

          {/* AI Decision & Action Box */}
          <div className="bg-[#20331B] border border-[#4E6530] p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-[#C3CA92]" />
              <h3 className="text-lg font-bold text-[#C3CA92]">System Analysis & Recommended Action</h3>
            </div>

            <div className="space-y-4">
              {/* Threat Level */}
              <div className="flex items-center gap-3">
                <span className="text-base text-[#F3F6E6] font-medium">Threat Level:</span>
                <span className={`px-3 py-1 rounded-lg text-base font-bold ${threat.color} bg-[#354C2B] border border-[#4E6530]`}>
                  {threat.label} ({threat.score}/100)
                </span>
              </div>

              {/* Reason */}
              <div className="flex items-start gap-3">
                {getAnimalIcon()}
                <div>
                  <span className="text-base text-[#F3F6E6] font-medium">Reason: </span>
                  <span className="text-base text-[#F3F6E6]">
                    {latestAlert
                      ? latestAlert.reasoning.charAt(0).toUpperCase() + latestAlert.reasoning.slice(1)
                      : "No active threat detected."}
                  </span>
                </div>
              </div>

              {/* Action Taken */}
              <div className="bg-[#354C2B] border border-[#4E6530] p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-4 h-4 text-[#F6C000]" />
                  <span className="text-base text-[#F3F6E6] font-bold">Action Taken:</span>
                </div>
                <p className="text-base text-[#F3F6E6]">{getRecommendedAction()}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Recent Farm Alerts Feed (Right Sidebar) */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-[#F6C000]" />
            <h2 className="text-xl font-bold text-[#C3CA92]">Recent Farm Alerts</h2>
          </div>

          {/* Alert Feed */}
          <div className="flex-1 overflow-y-auto max-h-[550px] space-y-4 pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.alert_id}
                className="bg-[#20331B] border border-[#4E6530] p-4 rounded-xl hover:border-[#839864] transition-colors"
              >
                {/* Top Row: Badge + Time */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${getAlertBadge(alert.threat_level)}`}>
                    {alert.threat_level === "CRITICAL" ? "Critical" : "Low"}
                  </span>
                  <span className="text-sm text-[#A4B17B] font-medium">{formatTime(alert.timestamp)}</span>
                </div>

                {/* Middle Row: Description */}
                <p className="text-base font-medium text-[#F3F6E6] mb-3 leading-relaxed">
                  {alert.reasoning.charAt(0).toUpperCase() + alert.reasoning.slice(1)}
                </p>

                {/* Bottom Row: View Snapshot Button */}
                <button className="w-full flex items-center justify-center gap-2 bg-[#4E6530] text-[#F3F6E6] text-base font-medium px-4 py-3 rounded-xl hover:bg-[#5A7A3A] transition-colors">
                  <Eye className="w-4 h-4" />
                  View Snapshot
                </button>
              </div>
            ))}
          </div>

          {/* Footer System Health Card */}
          <div className="bg-[#20331B] border border-[#4E6530] p-5 rounded-xl">
            <h3 className="text-base font-bold text-[#C3CA92] mb-3">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#A4B17B]" />
                <span className="text-base text-[#F3F6E6]">Camera Feed Connected</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#A4B17B]" />
                <span className="text-base text-[#F3F6E6]">AI Detector Online</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#A4B17B]" />
                <span className="text-base text-[#F3F6E6]">Alert Horn Ready</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}