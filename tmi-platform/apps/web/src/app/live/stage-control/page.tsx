"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type StreamStatus = "LIVE" | "OFFLINE" | "STARTING" | "ENDING";

interface ViewerStats {
  count: number;
  peak: number;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  ts: string;
  flagged: boolean;
}

const DEMO_CHAT: ChatMessage[] = [
  { id: "c1", user: "Nova_K", text: "LET'S GOOO 🔥", ts: "0:04", flagged: false },
  { id: "c2", user: "TrapFan99", text: "Wavetek is BUILT for this stage", ts: "0:12", flagged: false },
  { id: "c3", user: "Spammer01", text: "BUY FOLLOWERS CHEAP link.xyz", ts: "0:15", flagged: true },
  { id: "c4", user: "HoodRhymes", text: "Bro hit that note clean 🎤", ts: "0:21", flagged: false },
  { id: "c5", user: "FanLyric", text: "Can you do the verse from Vol 1?", ts: "0:33", flagged: false },
];

export default function StageControlPage() {
  const [status, setStatus] = useState<StreamStatus>("OFFLINE");
  const [micHot, setMicHot] = useState(false);
  const [cameraFront, setCameraFront] = useState(true);
  const [viewers, setViewers] = useState<ViewerStats>({ count: 0, peak: 0 });
  const [chat, setChat] = useState<ChatMessage[]>(DEMO_CHAT);
  const [showEndModal, setShowEndModal] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [startTs, setStartTs] = useState<number | null>(null);

  // Live clock
  useEffect(() => {
    if (status !== "LIVE" || !startTs) return;
    const timer = setInterval(() => setElapsedSec(Math.floor((Date.now() - startTs) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [status, startTs]);

  const startShow = useCallback(() => {
    setStatus("STARTING");
    setTimeout(() => {
      setStatus("LIVE");
      setMicHot(true);
      setViewers({ count: 0, peak: 0 });
      setStartTs(Date.now());
      setElapsedSec(0);
    }, 1500);
  }, []);

  const endShow = useCallback(() => {
    setShowEndModal(false);
    setStatus("ENDING");
    setTimeout(() => {
      setStatus("OFFLINE");
      setMicHot(false);
      setViewers({ count: 0, peak: viewers.peak });
      setStartTs(null);
      setElapsedSec(0);
    }, 1000);
  }, [viewers.peak]);

  function deleteMessage(id: string) {
    setChat((prev) => prev.filter((m) => m.id !== id));
  }

  function formatTime(sec: number): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const isLive = status === "LIVE";
  const statusColor = isLive ? "#FF2DAA" : status === "STARTING" ? "#FFD700" : "#555";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: "rgba(0,0,0,0.8)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/go-live" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← GO LIVE</Link>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00FFFF", fontWeight: 800 }}>STAGE CONTROL</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, boxShadow: isLive ? `0 0 10px ${statusColor}` : "none" }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: statusColor, letterSpacing: "0.1em" }}>{status}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>

          {/* Center: stream + controls */}
          <div>
            {/* Stream preview */}
            <div style={{
              background: "#000",
              borderRadius: 16,
              aspectRatio: "16/9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              border: isLive ? "2px solid #FF2DAA" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: isLive ? "0 0 30px rgba(255,45,170,0.2)" : "none",
              marginBottom: 20,
              overflow: "hidden",
            }}>
              {status === "OFFLINE" && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>📷</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>No stream active</div>
                </div>
              )}
              {(status === "STARTING" || status === "ENDING") && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 10, animation: "pulse 1s infinite" }}>
                    {status === "STARTING" ? "🔴" : "⏹"}
                  </div>
                  <div style={{ fontSize: 12, color: "#FFD700" }}>{status === "STARTING" ? "Going live..." : "Ending stream..."}</div>
                </div>
              )}
              {isLive && (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #0a0014, #050510)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 64 }}>🎤</div>
                </div>
              )}

              {/* Overlays */}
              {isLive && (
                <>
                  <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.7)", borderRadius: 20, padding: "4px 12px" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF2DAA", animation: "pulse 1s infinite" }} />
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#FF2DAA", letterSpacing: "0.1em" }}>LIVE</span>
                  </div>
                  <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.7)", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 800, color: "#00FFFF" }}>
                    {formatTime(elapsedSec)}
                  </div>
                  <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.7)", borderRadius: 8, padding: "4px 12px", fontSize: 11, color: "#fff" }}>
                    👁 {viewers.count}
                  </div>
                  {!micHot && (
                    <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(255,68,68,0.8)", borderRadius: 8, padding: "4px 12px", fontSize: 9, fontWeight: 800, color: "#fff" }}>
                      MIC MUTED
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Primary controls */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: 12, marginBottom: 20 }}>
              {/* Mic */}
              <button
                onClick={() => setMicHot((v) => !v)}
                disabled={!isLive}
                style={{
                  padding: "16px 12px",
                  background: isLive ? (micHot ? "rgba(0,255,136,0.1)" : "rgba(255,68,68,0.1)") : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isLive ? (micHot ? "rgba(0,255,136,0.4)" : "rgba(255,68,68,0.4)") : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 12,
                  cursor: isLive ? "pointer" : "not-allowed",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{micHot ? "🎙️" : "🔇"}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: isLive ? (micHot ? "#00FF88" : "#FF4444") : "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
                  MIC {micHot ? "HOT" : "MUTED"}
                </div>
              </button>

              {/* Camera */}
              <button
                onClick={() => setCameraFront((v) => !v)}
                disabled={!isLive}
                style={{
                  padding: "16px 12px",
                  background: isLive ? "rgba(0,255,255,0.08)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isLive ? "rgba(0,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 12,
                  cursor: isLive ? "pointer" : "not-allowed",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>📹</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: isLive ? "#00FFFF" : "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
                  {cameraFront ? "FRONT CAM" : "REAR CAM"}
                </div>
              </button>

              {/* Start/End show */}
              {!isLive ? (
                <button
                  onClick={startShow}
                  disabled={status === "STARTING" || status === "ENDING"}
                  style={{
                    padding: "16px 12px",
                    background: "rgba(0,255,136,0.1)",
                    border: "1px solid rgba(0,255,136,0.4)",
                    borderRadius: 12,
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🔴</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#00FF88", letterSpacing: "0.1em" }}>START SHOW</div>
                </button>
              ) : (
                <button
                  onClick={() => setShowEndModal(true)}
                  style={{
                    padding: "16px 12px",
                    background: "rgba(255,68,68,0.1)",
                    border: "1px solid rgba(255,68,68,0.4)",
                    borderRadius: 12,
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>⏹</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#FF4444", letterSpacing: "0.1em" }}>END SHOW</div>
                </button>
              )}

              {/* Stage panel link */}
              <Link href="/live/stages" style={{
                padding: "16px 12px",
                background: "rgba(170,45,255,0.08)",
                border: "1px solid rgba(170,45,255,0.3)",
                borderRadius: 12,
                textAlign: "center",
                textDecoration: "none",
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>🎭</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#AA2DFF", letterSpacing: "0.1em" }}>STAGES</div>
              </Link>
            </div>

            {/* Viewer stats */}
            {(isLive || viewers.peak > 0) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "LIVE VIEWERS", value: isLive ? String(viewers.count) : "0", color: "#FF2DAA" },
                  { label: "PEAK VIEWERS", value: String(viewers.peak), color: "#FFD700" },
                  { label: "STREAM TIME", value: formatTime(elapsedSec), color: "#00FFFF" },
                ].map((s) => (
                  <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Chat mod */}
          <div>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, height: "100%", display: "flex", flexDirection: "column", minHeight: 400 }}>
              <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", fontWeight: 800, color: "rgba(255,255,255,0.5)" }}>CHAT MODERATOR</div>
                <span style={{ fontSize: 10, color: "#FF2DAA", fontWeight: 700 }}>{chat.filter((m) => m.flagged).length} flagged</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                {chat.map((msg) => (
                  <div key={msg.id} style={{
                    padding: "10px 12px",
                    background: msg.flagged ? "rgba(255,68,68,0.08)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${msg.flagged ? "rgba(255,68,68,0.3)" : "rgba(255,255,255,0.05)"}`,
                    borderRadius: 8,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: msg.flagged ? "#FF4444" : "#00FFFF" }}>{msg.user}</span>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{msg.ts}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: msg.flagged ? 8 : 0 }}>{msg.text}</div>
                    {msg.flagged && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => deleteMessage(msg.id)} style={{ fontSize: 9, fontWeight: 700, color: "#FF4444", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>
                          DELETE
                        </button>
                        <button onClick={() => setChat((p) => p.map((m) => m.id === msg.id ? { ...m, flagged: false } : m))} style={{ fontSize: 9, fontWeight: 700, color: "#00FF88", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>
                          APPROVE
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* End stream confirmation modal */}
      {showEndModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#0d1117", border: "1px solid rgba(255,68,68,0.4)", borderRadius: 16, padding: "32px 28px", maxWidth: 400, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>⏹</div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#FF4444", marginBottom: 8 }}>End Your Stream?</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 24 }}>
              Your stream will end immediately. {viewers.peak > 0 && `Peak viewers today: ${viewers.peak}.`}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowEndModal(false)} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                KEEP STREAMING
              </button>
              <button onClick={endShow} style={{ flex: 1, padding: "12px", background: "rgba(255,68,68,0.15)", border: "1px solid rgba(255,68,68,0.5)", borderRadius: 9, color: "#FF4444", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                END STREAM
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </main>
  );
}
