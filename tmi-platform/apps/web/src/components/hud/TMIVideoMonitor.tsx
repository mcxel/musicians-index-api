"use client";
import { useEffect, useRef, useState } from "react";

type MonitorState = "idle" | "requesting" | "live" | "denied" | "unsupported";

interface Props {
  label?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export default function TMIVideoMonitor({ label = "CAM", position = "bottom-right" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<MonitorState>("idle");
  const [minimized, setMinimized] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const posStyles: Record<string, React.CSSProperties> = {
    "bottom-right": { bottom: 24, right: 24 },
    "bottom-left":  { bottom: 24, left: 24 },
    "top-right":    { top: 80,    right: 24 },
    "top-left":     { top: 80,    left: 24 },
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      return;
    }
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setState("live");
    } catch {
      setState("denied");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setState("idle");
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9000,
    fontFamily: "'Inter', sans-serif",
    ...posStyles[position],
  };

  const monitorW = minimized ? 56 : 200;
  const monitorH = minimized ? 56 : 162;

  return (
    <div style={containerStyle}>
      <div style={{
        width: monitorW,
        height: monitorH,
        background: "#000",
        border: `1px solid ${state === "live" ? "rgba(0,255,0,0.5)" : "rgba(255,255,255,0.15)"}`,
        borderRadius: minimized ? "50%" : 10,
        overflow: "hidden",
        boxShadow: state === "live" ? "0 0 12px rgba(0,255,0,0.2)" : "0 4px 20px rgba(0,0,0,0.6)",
        position: "relative",
        transition: "all 0.25s ease",
        cursor: "pointer",
      }} onClick={() => { if (minimized) setMinimized(false); }}>

        {/* Video element — always mounted, only active when live */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            display: state === "live" ? "block" : "none",
            transform: "scaleX(-1)",
          }}
        />

        {/* Idle / denied / unsupported overlay */}
        {state !== "live" && !minimized && (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#030507" }}>
            {/* Scanline animation */}
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,0,0.03) 3px, rgba(0,255,0,0.03) 4px)", pointerEvents: "none" }} />
            <div style={{ fontSize: 22, marginBottom: 6, filter: state === "denied" ? "grayscale(1) opacity(0.4)" : undefined }}>📷</div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: state === "denied" ? "rgba(255,68,68,0.6)" : state === "unsupported" ? "rgba(255,200,0,0.6)" : "rgba(0,255,0,0.5)", textTransform: "uppercase", marginBottom: 8 }}>
              {state === "denied" ? "BLOCKED" : state === "unsupported" ? "N/A" : state === "requesting" ? "…" : label}
            </div>
            {(state === "idle" || state === "denied") && (
              <button onClick={(e) => { e.stopPropagation(); startCamera(); }} style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#000", background: "rgba(0,255,0,0.7)", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", textTransform: "uppercase" }}>
                {state === "denied" ? "RETRY" : "GO LIVE"}
              </button>
            )}
          </div>
        )}

        {/* Minimized circle content */}
        {minimized && (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: state === "live" ? "transparent" : "#030507" }}>
            {state !== "live" && <div style={{ fontSize: 18 }}>📷</div>}
          </div>
        )}

        {/* HUD overlay when live */}
        {state === "live" && !minimized && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "6px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF00", boxShadow: "0 0 4px #00FF00", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.9)" }}>LIVE</span>
            </div>
            <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>{label}</span>
          </div>
        )}
      </div>

      {/* Controls bar */}
      {!minimized && (
        <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "flex-end" }}>
          <button onClick={() => setMinimized(true)} style={{ fontSize: 9, padding: "3px 8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>–</button>
          {state === "live" ? (
            <button onClick={stopCamera} style={{ fontSize: 9, padding: "3px 8px", background: "rgba(255,50,50,0.15)", border: "1px solid rgba(255,50,50,0.3)", borderRadius: 4, color: "#FF6666", cursor: "pointer" }}>■ STOP</button>
          ) : (
            state === "idle" && (
              <button onClick={startCamera} style={{ fontSize: 9, padding: "3px 8px", background: "rgba(0,255,0,0.1)", border: "1px solid rgba(0,255,0,0.2)", borderRadius: 4, color: "rgba(0,255,0,0.7)", cursor: "pointer" }}>▶ LIVE</button>
            )
          )}
        </div>
      )}
    </div>
  );
}
