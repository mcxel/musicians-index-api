"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export type SplitMode = "SPLIT" | "AUDIENCE_FOCUS";
export type BroadcastStatus =
  | "IDLE"
  | "INITIALIZING"
  | "BROADCAST_STABLE_HD_1080P"
  | "ERROR";

export interface SplitStreamMatrixProps {
  mode?: SplitMode;
  isBattle?: boolean;
  battleOpponentLabel?: string;
  onModeChange?: (mode: SplitMode) => void;
  onBroadcastStateChange?: (status: BroadcastStatus) => void;
}

const STATUS_LABEL: Record<BroadcastStatus, string> = {
  IDLE: "OFFLINE",
  INITIALIZING: "INITIALIZING…",
  BROADCAST_STABLE_HD_1080P: "LIVE · HD 1080P",
  ERROR: "CAMERA ERROR",
};
const STATUS_COLOR: Record<BroadcastStatus, string> = {
  IDLE: "#444",
  INITIALIZING: "#FFD700",
  BROADCAST_STABLE_HD_1080P: "#00FF88",
  ERROR: "#FF3C3C",
};

export default function SplitStreamMatrix({
  mode = "SPLIT",
  isBattle = false,
  battleOpponentLabel = "Challenger",
  onModeChange,
  onBroadcastStateChange,
}: SplitStreamMatrixProps) {
  const [broadcastStatus, setBroadcastStatus] = useState<BroadcastStatus>("IDLE");
  const [currentMode, setCurrentMode] = useState<SplitMode>(mode);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCapture = useCallback(async () => {
    setBroadcastStatus("INITIALIZING");
    onBroadcastStateChange?.("INITIALIZING");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1920, height: 1080, frameRate: 30 },
        audio: true,
      });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play();
      }
      setCamOn(true);
      setMicOn(true);
      setBroadcastStatus("BROADCAST_STABLE_HD_1080P");
      onBroadcastStateChange?.("BROADCAST_STABLE_HD_1080P");
    } catch {
      setBroadcastStatus("ERROR");
      onBroadcastStateChange?.("ERROR");
    }
  }, [onBroadcastStateChange]);

  const stopCapture = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCamOn(false);
    setMicOn(false);
    setBroadcastStatus("IDLE");
    onBroadcastStateChange?.("IDLE");
  }, [onBroadcastStateChange]);

  const toggleMic = useCallback(() => {
    const audioTracks = streamRef.current?.getAudioTracks() ?? [];
    audioTracks.forEach(t => { t.enabled = !micOn; });
    setMicOn(prev => !prev);
  }, [micOn]);

  const toggleCam = useCallback(() => {
    const videoTracks = streamRef.current?.getVideoTracks() ?? [];
    videoTracks.forEach(t => { t.enabled = !camOn; });
    setCamOn(prev => !prev);
  }, [camOn]);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleModeChange = (m: SplitMode) => {
    setCurrentMode(m);
    onModeChange?.(m);
  };

  const isLive = broadcastStatus === "BROADCAST_STABLE_HD_1080P";
  const statusColor = STATUS_COLOR[broadcastStatus];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Status bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "7px 12px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${statusColor}30`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: statusColor,
              boxShadow: isLive ? `0 0 8px ${statusColor}` : "none",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: statusColor }}>
            {STATUS_LABEL[broadcastStatus]}
          </span>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 4 }}>
          {(["SPLIT", "AUDIENCE_FOCUS"] as SplitMode[]).map(m => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              style={{
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "0.1em",
                padding: "3px 9px",
                borderRadius: 5,
                border: `1px solid ${currentMode === m ? "rgba(0,255,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                background: currentMode === m ? "rgba(0,255,255,0.1)" : "transparent",
                color: currentMode === m ? "#00FFFF" : "rgba(255,255,255,0.3)",
                cursor: "pointer",
              }}
            >
              {m === "SPLIT" ? "SPLIT" : "AUDIENCE"}
            </button>
          ))}
        </div>
      </div>

      {/* Video panels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: currentMode === "SPLIT" ? "1fr 1fr" : "1fr",
          gap: 8,
        }}
      >
        {/* Local feed */}
        <div
          style={{
            position: "relative",
            borderRadius: 12,
            overflow: "hidden",
            background: "#020810",
            border: `1.5px solid ${isLive ? "#00FFFF30" : "rgba(255,255,255,0.06)"}`,
            aspectRatio: "16/9",
          }}
        >
          <video
            ref={localVideoRef}
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", display: isLive && camOn ? "block" : "none" }}
          />
          {(!isLive || !camOn) && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ fontSize: 28 }}>🎤</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>
                {broadcastStatus === "IDLE" ? "CAMERA OFF" : "INITIALIZING"}
              </span>
            </div>
          )}
          <div style={{ position: "absolute", top: 8, left: 8, fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>
            YOU
          </div>
          {isLive && (
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: "#FF3C3C", boxShadow: "0 0 6px #FF3C3C" }}
            />
          )}
        </div>

        {/* Battle / audience panel */}
        {currentMode === "SPLIT" && (
          <div
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              background: "#030a10",
              border: "1.5px solid rgba(255,45,170,0.15)",
              aspectRatio: "16/9",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isBattle ? (
              <>
                <span style={{ fontSize: 24 }}>⚔️</span>
                <span style={{ fontSize: 9, color: "#FF2DAA", fontWeight: 800, letterSpacing: "0.12em" }}>
                  {battleOpponentLabel.toUpperCase()}
                </span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>CONNECTING…</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 24 }}>👥</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>AUDIENCE VIEW</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Control bar */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {!isLive ? (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={startCapture}
            disabled={broadcastStatus === "INITIALIZING"}
            style={{
              flex: 1,
              padding: "10px",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: "#050510",
              background: "linear-gradient(135deg, #00FF88, #00CCAA)",
              border: "none",
              borderRadius: 8,
              cursor: broadcastStatus === "INITIALIZING" ? "default" : "pointer",
              opacity: broadcastStatus === "INITIALIZING" ? 0.6 : 1,
            }}
          >
            {broadcastStatus === "INITIALIZING" ? "STARTING…" : "GO LIVE"}
          </motion.button>
        ) : (
          <>
            <button
              onClick={toggleMic}
              style={{
                padding: "8px 14px",
                borderRadius: 7,
                border: `1px solid ${micOn ? "rgba(0,255,255,0.3)" : "rgba(255,60,60,0.3)"}`,
                background: micOn ? "rgba(0,255,255,0.08)" : "rgba(255,60,60,0.08)",
                color: micOn ? "#00FFFF" : "#FF6060",
                fontSize: 9,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {micOn ? "🎙 MIC" : "🔇 MUTED"}
            </button>
            <button
              onClick={toggleCam}
              style={{
                padding: "8px 14px",
                borderRadius: 7,
                border: `1px solid ${camOn ? "rgba(0,255,255,0.3)" : "rgba(255,60,60,0.3)"}`,
                background: camOn ? "rgba(0,255,255,0.08)" : "rgba(255,60,60,0.08)",
                color: camOn ? "#00FFFF" : "#FF6060",
                fontSize: 9,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {camOn ? "📷 CAM" : "📷 OFF"}
            </button>
            <button
              onClick={stopCapture}
              style={{
                marginLeft: "auto",
                padding: "8px 14px",
                borderRadius: 7,
                border: "1px solid rgba(255,60,60,0.35)",
                background: "rgba(255,60,60,0.08)",
                color: "#FF6060",
                fontSize: 9,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              END STREAM
            </button>
          </>
        )}
      </div>
    </div>
  );
}
