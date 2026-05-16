"use client";
import { useState } from "react";

interface DashboardVideoMonitorProps {
  roomId?: string;
  performerId?: string;
  isLive?: boolean;
  viewerCount?: number;
  accentColor?: string;
  onGoLive?: () => void;
  onEndStream?: () => void;
}

export default function DashboardVideoMonitor({
  roomId,
  isLive = false,
  viewerCount = 0,
  accentColor = "#FF2DAA",
  onGoLive,
  onEndStream,
}: DashboardVideoMonitorProps) {
  const [localLive, setLocalLive] = useState(isLive);

  function handleGoLive() {
    setLocalLive(true);
    onGoLive?.();
  }

  function handleEnd() {
    setLocalLive(false);
    onEndStream?.();
  }

  return (
    <div
      style={{
        background: "#000",
        border: `1px solid ${accentColor}33`,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          aspectRatio: "16/9",
          background: "linear-gradient(135deg, #050510, #0a0a25)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {localLive ? (
          <>
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                background: "#FF0000",
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.2em",
                padding: "3px 8px",
                borderRadius: 4,
              }}
            >
              ● LIVE
            </div>
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                fontSize: 10,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {viewerCount.toLocaleString()} watching
            </div>
            <div style={{ fontSize: 40 }}>🎤</div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
              Room: {roomId ?? "studio"}
            </span>
          </>
        ) : (
          <>
            <div style={{ fontSize: 40, opacity: 0.3 }}>📺</div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
              Stream offline
            </span>
          </>
        )}
      </div>

      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          gap: 10,
          alignItems: "center",
          borderTop: `1px solid ${accentColor}22`,
        }}
      >
        {localLive ? (
          <button
            onClick={handleEnd}
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "7px 16px",
              borderRadius: 8,
              border: "1px solid #FF2DAA44",
              background: "transparent",
              color: "#FF2DAA",
              cursor: "pointer",
            }}
          >
            End Stream
          </button>
        ) : (
          <button
            onClick={handleGoLive}
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "7px 16px",
              borderRadius: 8,
              border: "none",
              background: accentColor,
              color: "#000",
              cursor: "pointer",
            }}
          >
            Go Live
          </button>
        )}
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
          {localLive ? `${viewerCount} viewers` : "Ready to stream"}
        </span>
      </div>
    </div>
  );
}
