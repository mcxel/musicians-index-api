"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SelfViewCamera from "@/components/live/SelfViewCamera";

export type CallType = "voice" | "video";
export type CallState = "idle" | "calling" | "ringing" | "connected" | "ended";

interface VoiceVideoCallWidgetProps {
  currentUserId: string;
  currentUserName: string;
  targetUserId: string;
  targetName: string;
  callType?: CallType;
  onClose?: () => void;
  accent?: string;
}

export default function VoiceVideoCallWidget({
  currentUserId,
  currentUserName,
  targetUserId,
  targetName,
  callType = "video",
  onClose,
  accent = "#00FFFF",
}: VoiceVideoCallWidgetProps) {
  const [state, setState]       = useState<CallState>("calling");
  const [duration, setDuration] = useState(0);
  const [muted, setMuted]       = useState(false);
  const [camOff, setCamOff]     = useState(false);
  const [type, setType]         = useState<CallType>(callType);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate connection (replace with WebRTC signaling in production)
  useEffect(() => {
    const timeout = setTimeout(() => setState("connected"), 3000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (state === "connected") {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  const endCall = useCallback(() => {
    setState("ended");
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => onClose?.(), 1200);
  }, [onClose]);

  const formatDur = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const BG = "#050812";
  const isVideo = type === "video";

  return (
    <div
      style={{
        position: "relative",
        width: 300,
        background: BG,
        border: `1px solid ${accent}33`,
        borderRadius: 16,
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
        boxShadow: `0 12px 48px rgba(0,0,0,0.7), 0 0 0 1px ${accent}22`,
      }}
    >
      {/* Remote (full background when connected in video) */}
      <div style={{ height: isVideo && state === "connected" ? 220 : 140, background: "linear-gradient(180deg, #0a0818 0%, #050812 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, position: "relative" }}>
        {isVideo && state === "connected" ? (
          <div style={{ position: "absolute", inset: 0, background: "#0d0a18", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 48, opacity: 0.15 }}>📹</div>
            <div style={{ position: "absolute", bottom: 8, left: 8, fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>Remote feed (WebRTC)</div>
          </div>
        ) : (
          <>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${accent}18`, border: `2px solid ${accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👤</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{targetName}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              {state === "calling" && "Calling…"}
              {state === "ringing" && "Ringing…"}
              {state === "connected" && formatDur(duration)}
              {state === "ended" && "Call ended"}
            </div>
            {state === "calling" && (
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: accent, opacity: 0.3, animation: `pulse${i} 1.4s ease-in-out infinite ${i * 0.2}s` }} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Self-view pip (video calls) */}
      {isVideo && state === "connected" && (
        <div style={{ position: "absolute", top: 120, right: 10 }}>
          <SelfViewCamera
            size="sm"
            autoStart
            showControls={false}
            showLiveBadge={false}
            accent={accent}
            mirror
          />
        </div>
      )}

      {/* Status bar */}
      <div style={{ padding: "8px 14px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>
            {type === "video" ? "📹 Video Call" : "🎙️ Voice Call"}
          </div>
          {state === "connected" && (
            <div style={{ fontSize: 11, fontWeight: 700, color: "#00FF88", fontVariantNumeric: "tabular-nums" }}>
              {formatDur(duration)}
            </div>
          )}
          <div style={{ fontSize: 10, color: state === "connected" ? "#00FF88" : "rgba(255,255,255,0.3)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: state === "connected" ? "#00FF88" : "#666" }} />
            {state === "connected" ? "Connected" : state === "calling" ? "Connecting…" : state}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: "14px", display: "flex", justifyContent: "center", gap: 14 }}>
        {/* Mute */}
        <CtrlBtn
          icon={muted ? "🔇" : "🎙️"}
          label={muted ? "Unmute" : "Mute"}
          active={!muted}
          accent={accent}
          onClick={() => setMuted((m) => !m)}
        />
        {/* Camera (video only) */}
        {isVideo && (
          <CtrlBtn
            icon={camOff ? "📷" : "📹"}
            label={camOff ? "Cam on" : "Cam off"}
            active={!camOff}
            accent={accent}
            onClick={() => setCamOff((c) => !c)}
          />
        )}
        {/* Switch to voice / video */}
        <CtrlBtn
          icon={type === "video" ? "🎙️" : "📹"}
          label={type === "video" ? "Voice only" : "Add video"}
          active={false}
          accent={accent}
          onClick={() => setType((t) => (t === "video" ? "voice" : "video"))}
        />
        {/* End call */}
        <button
          type="button"
          onClick={endCall}
          style={{ width: 48, height: 48, borderRadius: "50%", background: "#cc0000", border: "2px solid #ff000044", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          📵
        </button>
      </div>
    </div>
  );
}

function CtrlBtn({ icon, label, active, accent, onClick }: { icon: string; label: string; active: boolean; accent: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      style={{
        width: 44, height: 44, borderRadius: "50%", fontSize: 18,
        background: active ? "rgba(255,255,255,0.08)" : "rgba(200,0,0,0.2)",
        border: `1.5px solid ${active ? "rgba(255,255,255,0.15)" : "rgba(200,0,0,0.3)"}`,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {icon}
    </button>
  );
}
