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
  Globe,
} from "lucide-react";
import { useLanguage } from "./LanguageContext.jsx";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const MOCK_ALERTS = [
  {
    alert_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    timestamp: "2026-08-01T15:50:00.000Z",
    threat_level: "CRITICAL",
    reasoning: "Large cow detected moving close to the center crop boundary.",
    image_path: "https://via.placeholder.com/640x480.png?text=Cow+Detected+Center+Boundary",
    node_id: "Node 01",
    zone_name: "Center Crop Boundary",
  },
  {
    alert_id: "8c0cea3c-2a6c-3abc-8acc-1a0c6a2cba5c",
    timestamp: "2026-08-01T15:45:00.000Z",
    threat_level: "LOW",
    reasoning: "Small dog detected near outer edge fence line.",
    image_path: "https://via.placeholder.com/640x480.png?text=Dog+Detected+Outer+Fence",
    node_id: "Node 02",
    zone_name: "Outer Edge Fence",
  },
];

const redIcon = new L.Icon({
  iconUrl: "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41"><circle cx="12.5" cy="12.5" r="12.5" fill="#E53E3E" stroke="white" stroke-width="2"/><circle cx="12.5" cy="12.5" r="6" fill="white"/></svg>`),
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
  popupAnchor: [0, -41],
});

const amberIcon = new L.Icon({
  iconUrl: "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41"><circle cx="12.5" cy="12.5" r="12.5" fill="#F0B429" stroke="white" stroke-width="2"/><circle cx="12.5" cy="12.5" r="6" fill="white"/></svg>`),
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
  popupAnchor: [0, -41],
});

const greenIcon = new L.Icon({
  iconUrl: "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41"><circle cx="12.5" cy="12.5" r="12.5" fill="#55A659" stroke="white" stroke-width="2"/><circle cx="12.5" cy="12.5" r="6" fill="white"/></svg>`),
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
  popupAnchor: [0, -41],
});

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("farm-guard-lang");
    if (saved && saved !== language) {
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    localStorage.setItem("farm-guard-lang", newLang);
    setLanguage(newLang);
  };

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
    if (threatLevel === "CRITICAL") return t("statusAlert");
    if (threatLevel === "LOW") return t("statusAlert");
    return t("statusSafe");
  };

  const getStatusColor = () => {
    if (threatLevel === "CRITICAL") return "bg-[#E53E3E]/25 text-[#FF6B6B] border border-[#E53E3E]/60";
    if (threatLevel === "LOW") return "bg-[#F0B429]/20 text-[#F6C000] border border-[#F0B429]/50";
    return "bg-[#9bf09d]/20 text-[#5DB85D] border border-[#9bf09d]/50";
  };

  const getAlertBadge = (level) => {
    if (level === "CRITICAL") return "bg-[#E53E3E]/25 text-[#FF6B6B] border border-[#E53E3E]/60";
    if (level === "LOW") return "bg-[#F0B429]/20 text-[#F6C000] border border-[#F0B429]/50";
    return "bg-[#9bf09d]/20 text-[#5DB85D] border border-[#9bf09d]/50";
  };

  const getThreatScore = () => {
    if (threatLevel === "CRITICAL") return { score: 85, label: t("critical"), color: "text-[#FF6B6B]" };
    if (threatLevel === "LOW") return { score: 35, label: t("low"), color: "text-[#F6C000]" };
    return { score: 10, label: t("minimal"), color: "text-[#5DB85D]" };
  };

  const getRecommendedAction = () => {
    if (threatLevel === "CRITICAL") return t("actionCritical");
    if (threatLevel === "LOW") return t("actionLow");
    return t("actionSafe");
  };

  const getRecentAlerts = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return alerts.filter((alert) => new Date(alert.timestamp) >= sevenDaysAgo);
  };

  const getAnimalIcon = () => <PawPrint className="w-5 h-5 text-[#F6C000]" />;

  const threat = getThreatScore();

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#2D2A26] font-sans overflow-x-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#C4BDB0] bg-[#EDE8DD]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-bold text-[#1A1815]">🌾 {t("appTitle")}</span>
          </div>
          <span className="text-sm text-[#8A8580] hidden md:inline">{t("subtitle")}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-xl text-sm font-bold ${getStatusColor()}`}>
            {getStatusLabel()}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#9bf09d] animate-pulse" />
            <span className="text-sm text-[#8A8580]">{t("systemActive")} • {lastUpdated}</span>
          </div>
          <div className="relative">
            <select
              className="appearance-none bg-[#F5F0E8] border border-[#C4BDB0] text-[#2D2A26] text-sm font-medium px-3 py-2 pr-8 rounded-xl focus:outline-none focus:border-[#5DB85D] cursor-pointer"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="en">{t("english")}</option>
              <option value="hi">{t("hindi")}</option>
              <option value="gu">{t("gujarati")}</option>
            </select>
            <Globe className="w-4 h-4 text-[#8A8580] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        <section className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-[#9bf09d]" />
            <h2 className="text-xl font-bold text-[#1A1815]">{t("liveSnapshot")}</h2>
          </div>

          <div className="relative bg-[#EDE8DD] border border-[#C4BDB0] rounded-xl overflow-hidden aspect-video">
            {latestAlert && (
              <img
                src={latestAlert.image_path}
                alt="Field Snapshot"
                className="w-full h-full object-cover"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#EDE8DD] via-transparent to-transparent" />

            <div className="absolute top-4 left-4 bg-[#EDE8DD]/90 border border-[#C4BDB0] px-3 py-1.5 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#9bf09d]" />
                <span className="text-sm text-[#2D2A26] font-medium">
                  {t("todayAt")} {latestAlert ? formatTime(latestAlert.timestamp) : "--:--"}
                </span>
              </div>
            </div>

            <div className="absolute top-4 right-4 bg-[#EDE8DD]/90 border border-[#C4BDB0] px-3 py-1.5 rounded-lg">
              <span className="text-sm text-[#2D2A26] font-medium">
                {t("spotted")}: {threatLevel === "CRITICAL" ? t("strayCattle") : threatLevel === "LOW" ? t("smallAnimal") : t("noDetection")}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-[#9bf09d]">
              <MapPin className="w-4 h-4" />
              <span>Field Sector 1 — Boundary Active</span>
            </div>
          </div>

          <div className="bg-[#EDE8DD] border border-[#C4BDB0] p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-[#9bf09d]" />
              <h3 className="text-lg font-bold text-[#1A1815]">{t("systemAnalysis")}</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-base text-[#2D2A26] font-medium">{t("threatLevel")}</span>
                <span className={`px-3 py-1 rounded-lg text-base font-bold ${threat.color} bg-[#EDE8DD] border border-[#C4BDB0]`}>
                  {threat.label} ({threat.score}/100)
                </span>
              </div>

              <div className="flex items-start gap-3">
                {getAnimalIcon()}
                <div>
                  <span className="text-base text-[#2D2A26] font-medium">{t("reason")}</span>
                  <span className="text-base text-[#2D2A26]">
                    {latestAlert
                      ? latestAlert.reasoning.charAt(0).toUpperCase() + latestAlert.reasoning.slice(1)
                      : t("noActiveThreat")}
                  </span>
                </div>
              </div>

              <div className="bg-[#EDE8DD] border border-[#C4BDB0] p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-4 h-4 text-[#F6C000]" />
                  <span className="text-base text-[#2D2A26] font-bold">{t("actionTaken")}</span>
                </div>
                <p className="text-base text-[#2D2A26]">{getRecommendedAction()}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-[#F6C000]" />
              <h2 className="text-xl font-bold text-[#1A1815]">{t("recentAlerts")}</h2>
            </div>
            <button className="text-sm font-medium text-[#5DB85D] hover:text-[#4DA34D] transition-colors" onClick={() => setShowAlertModal(true)}>
              {t("seeAll")}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.alert_id}
                className="bg-[#EDE8DD] border border-[#C4BDB0] p-3 rounded-xl hover:border-[#5DB85D] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide ${getAlertBadge(alert.threat_level)}`}>
                    {alert.threat_level === "CRITICAL" ? t("critical") : t("low")}
                  </span>
                  <span className="text-xs text-[#9bf09d] font-medium">{formatTime(alert.timestamp)}</span>
                </div>

                <p className="text-sm font-medium text-[#2D2A26] mb-2 leading-relaxed">
                  {alert.reasoning.charAt(0).toUpperCase() + alert.reasoning.slice(1)}
                </p>

                <button className="w-full flex items-center justify-center gap-2 bg-[#5DB85D] text-[#ffffff] text-sm font-medium px-3 py-2 rounded-xl hover:bg-[#4DA34D] transition-colors">
                  <Eye className="w-3 h-3" />
                  {t("viewSnapshot")}
                </button>
              </div>
            ))}
          </div>

          {/* Interactive Farm Map */}
          <div className="bg-[#E8E2D5] border border-[#D8D0C0] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D8D0C0]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1C2B17]">🗺️ Interactive Farm Field Map</h3>
                <span className="text-xs text-[#68785E]">Live GPS Telemetry • Click markers for sector info</span>
              </div>
            </div>
            <div className="h-72">
              <MapContainer
                center={[22.296167, 73.170619]}
                zoom={16}
                className="w-full h-full rounded-b-xl"
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                />
                <Marker position={[22.296167, 73.170619]} icon={redIcon}>
                  <Popup>
                    <div className="text-sm font-bold text-[#1C2B17]">Node 01: Center Crop Boundary</div>
                    <div className="text-xs text-[#E53E3E] mt-1">ALERT: Cow Detected</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#E53E3E]/25 text-[#FF6B6B] border border-[#E53E3E]/60">
                      {t("critical")}
                    </span>
                  </Popup>
                </Marker>
                <Marker position={[22.296906, 73.171726]} icon={amberIcon}>
                  <Popup>
                    <div className="text-sm font-bold text-[#1C2B17]">Node 02: Outer Edge Fence</div>
                    <div className="text-xs text-[#F0B429] mt-1">Status: Dog Detected</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0B429]/20 text-[#F6C000] border border-[#F0B429]/50">
                      {t("low")}
                    </span>
                  </Popup>
                </Marker>
                <Marker position={[22.296333, 73.169499]} icon={greenIcon}>
                  <Popup>
                    <div className="text-sm font-bold text-[#1C2B17]">Node 03: Barn Gate</div>
                    <div className="text-xs text-[#55A659] mt-1">Status: Normal</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#9bf09d]/20 text-[#5DB85D] border border-[#9bf09d]/50">
                      Clear
                    </span>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="px-4 py-2 border-t border-[#D8D0C0] flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E53E3E]" />
                <span className="text-[10px] font-medium text-[#1C2B17]">Node 01 (Intrusion)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F0B429]" />
                <span className="text-[10px] font-medium text-[#1C2B17]">Node 02 (Low)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#55A659]" />
                <span className="text-[10px] font-medium text-[#1C2B17]">Node 03 (Clear)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#EDE8DD] border border-[#C4BDB0] p-5 rounded-xl">
            <h3 className="text-base font-bold text-[#1A1815] mb-3">{t("systemHealth")}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#9bf09d]" />
                <span className="text-base text-[#2D2A26]">{t("cameraConnected")}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#9bf09d]" />
                <span className="text-base text-[#2D2A26]">{t("aiOnline")}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#9bf09d]" />
                <span className="text-base text-[#2D2A26]">{t("alertHornReady")}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showAlertModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAlertModal(false)}>
          <div className="bg-[#EDE8DD] border border-[#C4BDB0] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#C4BDB0]">
              <h3 className="text-lg font-bold text-[#1A1815]">{t("recentAlerts")}</h3>
              <button className="text-[#8A8580] hover:text-[#2D2A26] transition-colors text-xl leading-none" onClick={() => setShowAlertModal(false)}>
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-60px)]">
              {getRecentAlerts().length === 0 ? (
                <p className="text-[#2D2A26] text-center py-8">{t("noRecentAlerts")}</p>
              ) : (
                <div className="space-y-4">
                  {getRecentAlerts().map((alert) => (
                    <div
                      key={alert.alert_id}
                      className="bg-[#F5F0E8] border border-[#C4BDB0] p-4 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide ${getAlertBadge(alert.threat_level)}`}>
                          {alert.threat_level === "CRITICAL" ? t("critical") : t("low")}
                        </span>
                        <span className="text-xs text-[#9bf09d] font-medium">{formatTime(alert.timestamp)}</span>
                      </div>
                      <p className="text-sm font-medium text-[#2D2A26] mb-2 leading-relaxed">
                        {alert.reasoning.charAt(0).toUpperCase() + alert.reasoning.slice(1)}
                      </p>
                      <button className="w-full flex items-center justify-center gap-2 bg-[#5DB85D] text-[#ffffff] text-sm font-medium px-3 py-2 rounded-xl hover:bg-[#4DA34D] transition-colors">
                        <Eye className="w-3 h-3" />
                        {t("viewSnapshot")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}