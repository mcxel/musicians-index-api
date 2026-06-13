"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useGamificationEngine } from "@/hooks/useGamificationEngine";
import type { UserTier } from "@/lib/showmanship/AssetLockerPolicy";
import LiveSessionHeartbeat from "@/components/live/LiveSessionHeartbeat";
import LiveVideoShell from "@/components/live/LiveVideoShell";
import TMICurtainSystem from "@/components/stage/TMICurtainSystem";

const ShowmanshipCommandCenter = dynamic(
  () => import("@/components/showmanship/ShowmanshipCommandCenter"),
  { ssr: false }
);
const ClosureOverlay = dynamic(
  () => import("@/components/showmanship/ClosureOverlay"),
  { ssr: false }
);

type Step = "setup" | "configure" | "preview" | "live";
type CamState = "idle" | "requesting" | "live" | "denied" | "unsupported";
type StreamSource = "CAMERA" | "SCREEN" | "OBS";

const ROOM_OPTIONS = [
  { id: "cypher-arena",  label: "Cypher Arena",  icon: "⚔️",  color: "#00FFFF", path: "/cypher" },
  { id: "monday-stage",  label: "Monday Stage",  icon: "🎭",  color: "#FF2DAA", path: "/rooms" },
  { id: "beat-lab-live", label: "Beat Lab Live", icon: "🎹",  color: "#AA2DFF", path: "/beat-lab" },
  { id: "backstage",     label: "Backstage",     icon: "🎙️", color: "#FFD700", path: "/backstage" },
  { id: "monthly-idol",  label: "Monthly Idol",  icon: "👑",  color: "#00FF88", path: "/rooms" },
];

export default function GoLivePage() {
  const router = useRouter();
  const { currentLevel } = useGamificationEngine();

  function xpLevelToTier(level: number): UserTier {
    if (level >= 30) return "platinum";
    if (level >= 20) return "diamond";
    if (level >= 15) return "gold";
    if (level >= 10) return "silver";
    if (level >= 6)  return "RUBY";
    if (level >= 3)  return "pro";
    return "free";
  }
  const performerTier = xpLevelToTier(currentLevel.level);

  const [step, setStep] = useState<Step>("setup");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"CONCERT" | "CYPHER" | "BATTLE" | "SESSION">("CONCERT");
  const [ticketed, setTicketed] = useState(false);
  const [price, setPrice] = useState("0");
  const [selectedRoom, setSelectedRoom] = useState(ROOM_OPTIONS[0].id);
  const [streamSource, setStreamSource] = useState<StreamSource>("CAMERA");
  const [liveSeconds, setLiveSeconds] = useState(0);
  const liveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [camState, setCamState] = useState<CamState>("idle");
  const [micOk, setMicOk] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, []);

  const startPreview = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setCamState("unsupported"); return; }
    setCamState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360, facingMode: "user" }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; void videoRef.current.play(); }
      setCamState("live");
      // Mic level meter
      try {
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser(); analyser.fftSize = 256;
        src.connect(analyser); analyserRef.current = analyser;
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(buf);
          const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          setMicOk(avg > 2);
          animRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch { setMicOk(true); }
    } catch { setCamState("denied"); }
  }, []);

  // Auto-start preview on entering preview step
  useEffect(() => {
    if (step === "preview") { void startPreview(); }
    if (step !== "preview") { stopStream(); setCamState("idle"); }
    return () => { if (step === "preview") stopStream(); };
  }, [step, startPreview, stopStream]);

  const TYPE_COLOR: Record<string, string> = {
    CONCERT: "#FF2DAA", CYPHER: "#00FFFF", BATTLE: "#FFD700", SESSION: "#00FF88",
  };
  const steps: Step[] = ["setup", "configure", "preview", "live"];
  const selectedRoomData = ROOM_OPTIONS.find((r) => r.id === selectedRoom) ?? ROOM_OPTIONS[0];

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
        <Link href="/hub" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← HUB
        </Link>

        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 4 }}>Go Live</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>
          Start a room, concert, battle, or session. Your audience is waiting.
        </p>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 900, background: step === s ? "#00FF88" : steps.indexOf(step) > i ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.06)", color: step === s ? "#050510" : "rgba(255,255,255,0.4)" }}>
                {i + 1}
              </div>
              {i < 3 && <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.08)" }} />}
            </div>
          ))}
          <div style={{ marginLeft: 16, fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            {step}
          </div>
        </div>

        {step === "setup" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 10 }}>STREAM TYPE</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["CONCERT", "CYPHER", "BATTLE", "SESSION"] as const).map(t => (
                  <button key={t} onClick={() => setType(t)} style={{ padding: "8px 18px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: type === t ? "#050510" : TYPE_COLOR[t], background: type === t ? TYPE_COLOR[t] : "transparent", border: `1px solid ${TYPE_COLOR[t]}50`, borderRadius: 6, cursor: "pointer" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>STREAM TITLE</div>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Friday Night Session" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 10 }}>DESTINATION ROOM</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ROOM_OPTIONS.map((room) => (
                  <button key={room.id} onClick={() => setSelectedRoom(room.id)} style={{ padding: "10px 14px", textAlign: "left", background: selectedRoom === room.id ? `${room.color}12` : "rgba(255,255,255,0.02)", border: `1px solid ${selectedRoom === room.id ? room.color + "44" : "rgba(255,255,255,0.07)"}`, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 15 }}>{room.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: selectedRoom === room.id ? room.color : "rgba(255,255,255,0.7)" }}>{room.label}</span>
                    {selectedRoom === room.id && <span style={{ marginLeft: "auto", color: room.color, fontSize: 11 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => title && setStep("configure")} disabled={!title} style={{ padding: "13px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: !title ? "rgba(0,255,136,0.2)" : "linear-gradient(135deg,#00FF88,#00AA88)", borderRadius: 10, border: "none", cursor: !title ? "not-allowed" : "pointer" }}>
              CONTINUE →
            </button>
          </div>
        )}

        {step === "configure" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: 4 }}>{type} · {selectedRoomData.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
            </div>

            {/* Stream source */}
            <div>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 10 }}>STREAM SOURCE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {([
                  { id: "CAMERA" as StreamSource, label: "Webcam / Phone Camera", icon: "📹", desc: "Built-in or USB camera" },
                  { id: "SCREEN" as StreamSource, label: "Screen Share",           icon: "🖥️", desc: "Browser tab, window, or full screen" },
                  { id: "OBS"    as StreamSource, label: "OBS / Virtual Camera",  icon: "🎬", desc: "OBS Studio virtual camera output" },
                ]).map((src) => (
                  <button key={src.id} onClick={() => setStreamSource(src.id)} style={{ padding: "10px 14px", textAlign: "left", background: streamSource === src.id ? "rgba(0,255,136,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${streamSource === src.id ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 18 }}>{src.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: streamSource === src.id ? "#00FF88" : "rgba(255,255,255,0.7)", marginBottom: 1 }}>{src.label}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{src.desc}</div>
                    </div>
                    {streamSource === src.id && <span style={{ marginLeft: "auto", color: "#00FF88" }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 10 }}>ACCESS</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setTicketed(false)} style={{ flex: 1, padding: "10px 0", fontSize: 10, fontWeight: 800, color: !ticketed ? "#050510" : "rgba(255,255,255,0.4)", background: !ticketed ? "#00FF88" : "transparent", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8, cursor: "pointer" }}>FREE</button>
                <button onClick={() => setTicketed(true)} style={{ flex: 1, padding: "10px 0", fontSize: 10, fontWeight: 800, color: ticketed ? "#050510" : "rgba(255,215,0,0.7)", background: ticketed ? "#FFD700" : "transparent", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, cursor: "pointer" }}>TICKETED</button>
              </div>
            </div>
            {ticketed && (
              <div>
                <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>TICKET PRICE ($)</div>
                <input type="number" min="1" value={price} onChange={e => setPrice(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep("setup")} style={{ flex: 1, padding: "12px 0", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, cursor: "pointer" }}>← BACK</button>
              <button onClick={() => setStep("preview")} style={{ flex: 2, padding: "12px 0", fontSize: 10, fontWeight: 800, color: "#050510", background: "linear-gradient(135deg,#00FF88,#00AA88)", borderRadius: 10, border: "none", cursor: "pointer" }}>PREVIEW →</button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Session info */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: 3 }}>{type}</div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{ticketed ? `Ticketed · $${price}` : "Free to Watch"}</div>
            </div>

            {/* Real camera preview */}
            <div style={{ borderRadius: 14, overflow: "hidden", background: "#000", position: "relative", aspectRatio: "16/9" }}>
              {camState === "live" && (
                <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              {camState === "requesting" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 32, animation: "spin 1s linear infinite" }}>📹</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Requesting camera access…</div>
                </div>
              )}
              {camState === "denied" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 28 }}>🚫</div>
                  <div style={{ fontSize: 12, color: "#FF4444", textAlign: "center", padding: "0 24px" }}>Camera access denied. Check your browser permissions, then reload.</div>
                  <button onClick={() => void startPreview()} style={{ padding: "8px 18px", background: "rgba(255,68,68,0.15)", border: "1px solid rgba(255,68,68,0.4)", borderRadius: 7, color: "#FF4444", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Try Again</button>
                </div>
              )}
              {camState === "unsupported" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Camera not supported in this browser</div>
                </div>
              )}
              {/* Live indicator */}
              {camState === "live" && (
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,0.7)", borderRadius: 20, padding: "4px 10px" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 6px #00FF88" }} />
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#00FF88", letterSpacing: "0.1em" }}>PREVIEW</span>
                </div>
              )}
            </div>

            {/* Device status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: camState === "live" ? "rgba(0,255,136,0.07)" : "rgba(255,255,255,0.04)", border: `1px solid ${camState === "live" ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.12em", color: camState === "live" ? "#00FF88" : "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 4 }}>📹 CAMERA</div>
                <div style={{ fontSize: 12, color: camState === "live" ? "#fff" : "rgba(255,255,255,0.4)" }}>
                  {camState === "live" ? "Active" : camState === "requesting" ? "Starting…" : camState === "denied" ? "Blocked" : "Off"}
                </div>
              </div>
              <div style={{ background: micOk ? "rgba(0,255,136,0.07)" : "rgba(255,255,255,0.04)", border: `1px solid ${micOk ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.12em", color: micOk ? "#00FF88" : "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 4 }}>🎙️ MIC</div>
                {/* Audio level bar */}
                <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${audioLevel}%`, height: "100%", background: audioLevel > 60 ? "#00FF88" : audioLevel > 20 ? "#FFD700" : "#444", borderRadius: 3, transition: "width 0.1s" }} />
                </div>
              </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep("configure")} style={{ flex: 1, padding: "12px 0", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, cursor: "pointer" }}>← EDIT</button>
              <button
                onClick={async () => {
                  stopStream();
                  setStep("live");
                  liveTimerRef.current = setInterval(() => setLiveSeconds((s) => s + 1), 1000);

                  // Register the live session globally — propagates to homepage, lobby, observatory
                  const categoryMap: Record<string, string> = {
                    CONCERT: "concert", CYPHER: "cypher", BATTLE: "battle", SESSION: "session",
                  };
                  await fetch("/api/live/go", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                      displayName:   title || "Live Performer",
                      title:         title ? `${title} — Live` : "Live Session",
                      category:      categoryMap[type] ?? "live",
                      roomId:        selectedRoom,
                      privacy:       ticketed ? "PAID_ENTRY" : "PUBLIC",
                      entryPriceUsd: ticketed ? parseFloat(price) || 0 : undefined,
                      performerTier: performerTier,
                      stageState:    "live",
                    }),
                  }).catch(() => {});

                  const room = ROOM_OPTIONS.find((r) => r.id === selectedRoom);
                  setTimeout(() => {
                    if (liveTimerRef.current) clearInterval(liveTimerRef.current);
                    const performerSlug = (title || "performer")
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "") || "performer";
                    const sid = `live-${Date.now().toString(36)}`;
                    router.push(`/live/rooms/${encodeURIComponent(room?.id ?? selectedRoom)}?performer=${encodeURIComponent(performerSlug)}&sid=${encodeURIComponent(sid)}`);
                  }, 3000);
                }}
                disabled={camState === "denied" || camState === "unsupported"}
                style={{ flex: 2, padding: "12px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: (camState === "denied" || camState === "unsupported") ? "rgba(0,255,136,0.25)" : "linear-gradient(135deg,#00FF88,#00AA88)", borderRadius: 10, border: "none", cursor: (camState === "denied" || camState === "unsupported") ? "not-allowed" : "pointer" }}
              >
                🔴 GO LIVE NOW
              </button>
            </div>
          </div>
        )}

        {step === "live" && (
          <>
          <TMICurtainSystem isOpen={true} venueTitle={title || "TMI STAGE"} />
          <LiveSessionHeartbeat enabled={true} intervalMs={20_000} stageState="live" />
          <div style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "16/9", marginBottom: 16 }}>
            <LiveVideoShell performerId={title || "performer"} isLive={true} />
          </div>
          <ClosureOverlay />
          <ShowmanshipCommandCenter
            performerName={title}
            performerTier={performerTier}
            isLive
            viewerCount={Math.min(liveSeconds, 99)}
            onEndShow={() => {
              if (liveTimerRef.current) clearInterval(liveTimerRef.current);
              setStep("setup");
            }}
          />
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔴</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#FF2DAA", marginBottom: 10 }}>You&apos;re Live!</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
              <strong style={{ color: "#fff" }}>{title}</strong> is streaming to{" "}
              <strong style={{ color: selectedRoomData.color }}>{selectedRoomData.label}</strong>
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 20px", minWidth: 100 }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", marginBottom: 4 }}>VIEWERS</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#00FFFF" }}>0</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 20px", minWidth: 100 }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", marginBottom: 4 }}>LIVE FOR</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#00FF88" }}>{formatTime(liveSeconds)}</div>
              </div>
            </div>
            <Link href="/live/conductor" style={{ display: "inline-block", marginBottom: 16, padding: "8px 18px", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, color: "#00FFFF", fontSize: 10, fontWeight: 700, textDecoration: "none", letterSpacing: "0.12em" }}>
              STAGE CONTROL PANEL →
            </Link>

            {/* Live audience count panel */}
            <div style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 20, textAlign: "left" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00FF88", fontWeight: 800, marginBottom: 8 }}>AUDIENCE IN ROOM</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {Array.from({ length: Math.min(Math.floor(liveSeconds / 3) + 1, 12) }, (_, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: `hsl(${(i * 37) % 360},70%,55%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                    {["🎤","👑","🔥","⭐","🎧","💎","🎵","🥊","🌟","💯","🎶","🏆"][i % 12]}
                  </div>
                ))}
                {Math.floor(liveSeconds / 3) + 1 > 12 && (
                  <div style={{ fontSize: 10, color: "#00FF88", fontWeight: 700, alignSelf: "center" }}>+{Math.floor(liveSeconds / 3) - 11} more</div>
                )}
              </div>
            </div>

            {/* Share live link */}
            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 10 }}>SHARE YOUR LIVE SESSION</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    const room = ROOM_OPTIONS.find((r) => r.id === selectedRoom);
                    const slug = (title || "performer").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "performer";
                    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/live/rooms/${encodeURIComponent(room?.id ?? selectedRoom)}?performer=${encodeURIComponent(slug)}&from=lobby-wall`;
                    if (navigator.clipboard) void navigator.clipboard.writeText(url);
                  }}
                  style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.3)", color: "#00FFFF", fontSize: 10, fontWeight: 700, cursor: "pointer" }}
                >
                  🔗 Copy Link
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🔴 I'm LIVE on @MusiciansIndex — "${title}" — Watch now:`)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "https://themusiciansindex.com")}/live/rooms/${encodeURIComponent(selectedRoom)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(29,161,242,0.1)", border: "1px solid rgba(29,161,242,0.3)", color: "#1DA1F2", fontSize: 10, fontWeight: 700, textDecoration: "none" }}
                >
                  𝕏 Post
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`🔴 Watch me LIVE on TMI: "${title}" → ${typeof window !== "undefined" ? window.location.origin : "https://themusiciansindex.com"}/live/rooms/${encodeURIComponent(selectedRoom)}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", color: "#25D366", fontSize: 10, fontWeight: 700, textDecoration: "none" }}
                >
                  WhatsApp
                </a>
              </div>
            </div>

            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Redirecting to your room…</p>
          </div>
          </>
        )}
      </div>
    </main>
  );
}
