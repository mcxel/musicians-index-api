"use client";

import { useState } from "react";

export interface BroadcastDestination {
  id: string;
  name: string;
  enabled: boolean;
  status: "CONNECTED" | "NEEDS_AUTH" | "DISCONNECTED";
  icon: string;
}

interface PerformerBroadcastControlCenterProps {
  accentColor?: string;
  onGoLive?: (destinations: string[]) => void;
}

export function PerformerBroadcastControlCenter({
  accentColor = "#FF0055",
  onGoLive,
}: PerformerBroadcastControlCenterProps) {
  const [isLive, setIsLive] = useState(false);
  const [streamMode, setStreamMode] = useState<"PUBLIC" | "PRIVATE" | "PRACTICE" | "FAN_CLUB">("PUBLIC");
  const [destinations, setDestinations] = useState<BroadcastDestination[]>([
    { id: "tmi", name: "TMI Live", enabled: true, status: "CONNECTED", icon: "🌐" },
    { id: "youtube", name: "YouTube Live", enabled: true, status: "CONNECTED", icon: "▶️" },
    { id: "twitch", name: "Twitch", enabled: true, status: "CONNECTED", icon: "👾" },
    { id: "kick", name: "Kick", enabled: false, status: "CONNECTED", icon: "🟢" },
    { id: "tiktok", name: "TikTok Live", enabled: false, status: "NEEDS_AUTH", icon: "🎵" },
    { id: "facebook", name: "Facebook Live", enabled: false, status: "DISCONNECTED", icon: "📘" },
    { id: "instagram", name: "Instagram Live", enabled: false, status: "NEEDS_AUTH", icon: "📸" },
    { id: "x", name: "X Live", enabled: false, status: "DISCONNECTED", icon: "𝕏" },
    { id: "custom_rtmp", name: "Custom RTMP", enabled: false, status: "CONNECTED", icon: "📡" },
  ]);

  const toggleDestination = (id: string) => {
    setDestinations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d))
    );
  };

  const handleToggleLive = () => {
    const nextState = !isLive;
    setIsLive(nextState);
    if (nextState && onGoLive) {
      const activeIds = destinations.filter((d) => d.enabled).map((d) => d.id);
      onGoLive(activeIds);
    }
  };

  return (
    <div
      style={{
        background: "rgba(10,10,25,0.85)",
        border: `1px solid ${accentColor}33`,
        borderRadius: 14,
        padding: "16px 20px",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>📡</span>
          <span style={{ fontSize: 10, letterSpacing: "0.25em", color: accentColor, fontWeight: 900 }}>
            BROADCAST CONTROL CENTER
          </span>
        </div>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: isLive ? "#00FF88" : "rgba(255,255,255,0.4)",
            background: isLive ? "rgba(0,255,136,0.15)" : "rgba(255,255,255,0.05)",
            border: isLive ? "1px solid #00FF88" : "1px solid rgba(255,255,255,0.1)",
            padding: "2px 8px",
            borderRadius: 4,
          }}
        >
          {isLive ? "● LIVE ON AIR" : "OFFLINE"}
        </span>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={handleToggleLive}
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 10,
          border: "none",
          background: isLive ? "#FF4444" : accentColor,
          color: "#fff",
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: "0.15em",
          cursor: "pointer",
          boxShadow: isLive ? "0 0 25px rgba(255,68,68,0.5)" : `0 0 25px ${accentColor}66`,
          transition: "all 0.2s",
        }}
      >
        {isLive ? "⬛ END BROADCAST" : "🔴 GO LIVE EVERYWHERE"}
      </button>

      {/* Mode Selector */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
        {(["PUBLIC", "FAN_CLUB", "PRIVATE", "PRACTICE"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setStreamMode(mode)}
            style={{
              fontSize: 8,
              fontWeight: 800,
              padding: "4px 8px",
              borderRadius: 6,
              border: streamMode === mode ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.1)",
              background: streamMode === mode ? `${accentColor}25` : "transparent",
              color: streamMode === mode ? accentColor : "rgba(255,255,255,0.5)",
              cursor: "pointer",
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Multi-Platform Destination Toggles */}
      <div>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 8 }}>
          MULTI-STREAM DESTINATIONS
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {destinations.map((d) => (
            <div
              key={d.id}
              onClick={() => toggleDestination(d.id)}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                background: d.enabled ? `${accentColor}15` : "rgba(255,255,255,0.02)",
                border: d.enabled ? `1px solid ${accentColor}66` : "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11 }}>{d.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: d.enabled ? "#fff" : "rgba(255,255,255,0.4)" }}>
                  {d.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 900,
                  color: d.status === "CONNECTED" ? "#00FF88" : d.status === "NEEDS_AUTH" ? "#FFD700" : "#FF4444",
                }}
              >
                {d.status === "CONNECTED" ? "🟢" : d.status === "NEEDS_AUTH" ? "🟡" : "🔴"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stream Telemetry */}
      {isLive && (
        <div
          style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: "8px 12px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 9,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <div>Bitrate: <strong style={{ color: "#00FF88" }}>6,000 Kbps</strong></div>
          <div>FPS: <strong style={{ color: "#00FF88" }}>60 FPS</strong></div>
          <div>Res: <strong style={{ color: "#00FF88" }}>1080p60</strong></div>
          <div>Health: <strong style={{ color: "#00FF88" }}>EXCELLENT</strong></div>
        </div>
      )}
    </div>
  );
}

export default PerformerBroadcastControlCenter;
