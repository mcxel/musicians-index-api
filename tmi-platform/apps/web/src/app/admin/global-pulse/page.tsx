"use client";

import { useEffect, useState, useCallback } from "react";

const VIBE_PRESETS = [
  { id: "neon-arena",          label: "Neon Arena",          color: "#00FFFF", bpm: 140, emoji: "🏟️" },
  { id: "midnight-afterparty", label: "Midnight Afterparty", color: "#AA2DFF", bpm: 128, emoji: "🌙" },
  { id: "world-premiere",      label: "World Premiere",      color: "#FFD700", bpm: 120, emoji: "🎬" },
  { id: "golden-hour-chill",   label: "Golden Hour Chill",   color: "#FF9500", bpm: 90,  emoji: "🌅" },
  { id: "cyber-battle",        label: "Cyber Battle",        color: "#00FFFF", bpm: 150, emoji: "⚔️" },
  { id: "retro-mtv",           label: "Retro MTV",           color: "#FF2DAA", bpm: 110, emoji: "📺" },
  { id: "underground-cypher",  label: "Underground Cypher",  color: "#AA2DFF", bpm: 95,  emoji: "🎤" },
  { id: "festival-sunrise",    label: "Festival Sunrise",    color: "#00FF88", bpm: 126, emoji: "🌄" },
  { id: "luxury-vip",          label: "Luxury VIP",          color: "#FFD700", bpm: 85,  emoji: "💎" },
  { id: "horror-event",        label: "Horror Event",        color: "#FF2DAA", bpm: 100, emoji: "👻" },
  { id: "xmas-concert",        label: "Xmas Concert",        color: "#00FF88", bpm: 112, emoji: "🎄" },
  { id: "halloween-takeover",  label: "Halloween Takeover",  color: "#FF9500", bpm: 130, emoji: "🎃" },
] as const;

type VibeId = typeof VIBE_PRESETS[number]["id"];

interface PulseLog {
  id: string;
  type: string;
  vibe?: string;
  ts: number;
  rooms: number;
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function fmtUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export default function GlobalPulsePage() {
  const [status, setStatus]           = useState<"stopped" | "running" | "paused">("stopped");
  const [activeVibe, setActiveVibe]   = useState<VibeId>("neon-arena");
  const [rooms, setRooms]             = useState(0);
  const [pulseCount, setPulseCount]   = useState(0);
  const [avgRtt, setAvgRtt]           = useState(0);
  const [uptimeMs, setUptimeMs]       = useState(0);
  const [log, setLog]                 = useState<PulseLog[]>([]);
  const [busy, setBusy]               = useState(false);
  const [crowdEnergy, setCrowdEnergy] = useState(80);

  const addLog = useCallback((type: string, vibe?: string) => {
    const entry: PulseLog = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      vibe,
      ts: Date.now(),
      rooms,
    };
    setLog((prev) => [entry, ...prev].slice(0, 30));
  }, [rooms]);

  // Simulated stats polling (in production this hits /api/admin/heartbeat/stats)
  useEffect(() => {
    const tick = setInterval(() => {
      if (status === "running") {
        setRooms((r) => r + Math.floor(Math.random() * 3 - 1));
        setAvgRtt(42 + Math.random() * 30);
        setUptimeMs((u) => u + 1000);
        setPulseCount((p) => p + 1);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [status]);

  const handleStart = () => {
    setBusy(true);
    setTimeout(() => {
      setStatus("running");
      setUptimeMs(0);
      setPulseCount(0);
      setRooms(Math.floor(Math.random() * 80) + 20);
      addLog("START", activeVibe);
      setBusy(false);
    }, 600);
  };

  const handleStop = () => {
    setStatus("stopped");
    setUptimeMs(0);
    addLog("STOP");
  };

  const handlePause = () => {
    setStatus("paused");
    addLog("PAUSE");
  };

  const handleResume = () => {
    setStatus("running");
    addLog("RESUME");
  };

  const handleDrop = () => {
    setBusy(true);
    setTimeout(() => {
      setPulseCount((p) => p + 1);
      addLog("DROP", activeVibe);
      setBusy(false);
    }, 200);
  };

  const handleVibeChange = (id: VibeId) => {
    setActiveVibe(id);
    if (status === "running") {
      addLog("VIBE-CHANGE", id);
      setPulseCount((p) => p + 1);
    }
  };

  const handleSurge = () => {
    addLog("CROWD-SURGE");
    setPulseCount((p) => p + 1);
  };

  const currentVibe = VIBE_PRESETS.find((v) => v.id === activeVibe)!;
  const accent = currentVibe.color;

  const statusColor = status === "running" ? "#00FF88" : status === "paused" ? "#FFD700" : "#FF2DAA";
  const statusLabel = status === "running" ? "LIVE" : status === "paused" ? "PAUSED" : "OFFLINE";

  return (
    <main style={{ minHeight: "100vh", background: "#040410", color: "#fff", fontFamily: "'Inter', sans-serif", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.35em", color: accent, marginBottom: 8 }}>ADMIN — GLOBAL EVENT SYNC</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Global Pulse Control</h1>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 20,
              background: `${statusColor}18`, border: `1px solid ${statusColor}44`,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor, display: "inline-block", boxShadow: status === "running" ? `0 0 8px ${statusColor}` : "none" }} />
              <span style={{ fontSize: 10, fontWeight: 900, color: statusColor, letterSpacing: "0.15em" }}>{statusLabel}</span>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, marginBottom: 0 }}>
            Synchronize events across every live room on the platform simultaneously.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[
                { label: "Connected Rooms", value: rooms.toString(), color: "#00FFFF" },
                { label: "Total Pulses", value: pulseCount.toLocaleString(), color: accent },
                { label: "Avg RTT", value: status === "running" ? `${avgRtt.toFixed(0)}ms` : "—", color: "#00FF88" },
                { label: "Uptime", value: status !== "stopped" ? fmtUptime(uptimeMs) : "—", color: "#FFD700" },
              ].map((s) => (
                <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}22`, borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: s.color, marginBottom: 3 }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Master controls */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 16, textTransform: "uppercase" }}>Heartbeat Controls</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {status === "stopped" && (
                  <button onClick={handleStart} disabled={busy} style={{ padding: "10px 22px", borderRadius: 8, background: "#00FF88", color: "#040410", fontSize: 12, fontWeight: 900, border: "none", cursor: "pointer", letterSpacing: "0.1em", opacity: busy ? 0.6 : 1 }}>
                    ▶ START HEARTBEAT
                  </button>
                )}
                {status === "running" && (
                  <>
                    <button onClick={handlePause} style={{ padding: "10px 22px", borderRadius: 8, background: "#FFD700", color: "#040410", fontSize: 12, fontWeight: 900, border: "none", cursor: "pointer", letterSpacing: "0.1em" }}>
                      ⏸ PAUSE
                    </button>
                    <button onClick={handleStop} style={{ padding: "10px 22px", borderRadius: 8, background: "rgba(255,45,170,0.15)", border: "1px solid rgba(255,45,170,0.4)", color: "#FF2DAA", fontSize: 12, fontWeight: 900, cursor: "pointer", letterSpacing: "0.1em" }}>
                      ■ STOP
                    </button>
                  </>
                )}
                {status === "paused" && (
                  <>
                    <button onClick={handleResume} style={{ padding: "10px 22px", borderRadius: 8, background: "#00FF88", color: "#040410", fontSize: 12, fontWeight: 900, border: "none", cursor: "pointer", letterSpacing: "0.1em" }}>
                      ▶ RESUME
                    </button>
                    <button onClick={handleStop} style={{ padding: "10px 22px", borderRadius: 8, background: "rgba(255,45,170,0.15)", border: "1px solid rgba(255,45,170,0.4)", color: "#FF2DAA", fontSize: 12, fontWeight: 900, cursor: "pointer", letterSpacing: "0.1em" }}>
                      ■ STOP
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Event triggers */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 16, textTransform: "uppercase" }}>Manual Triggers</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                <button
                  onClick={handleDrop}
                  disabled={busy}
                  style={{ padding: "10px 22px", borderRadius: 8, background: `${accent}20`, border: `1px solid ${accent}55`, color: accent, fontSize: 12, fontWeight: 900, cursor: "pointer", letterSpacing: "0.08em", opacity: busy ? 0.5 : 1 }}
                >
                  💥 FIRE DROP
                </button>
                <button
                  onClick={handleSurge}
                  style={{ padding: "10px 22px", borderRadius: 8, background: "rgba(255,45,170,0.12)", border: "1px solid rgba(255,45,170,0.35)", color: "#FF2DAA", fontSize: 12, fontWeight: 900, cursor: "pointer", letterSpacing: "0.08em" }}
                >
                  🔥 CROWD SURGE
                </button>
              </div>

              {/* Crowd energy slider */}
              <div style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>Crowd Energy Override</span>
                  <span style={{ fontSize: 10, fontWeight: 900, color: accent }}>{crowdEnergy}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={crowdEnergy}
                  onChange={(e) => setCrowdEnergy(Number(e.target.value))}
                  style={{ width: "100%", accentColor: accent }}
                />
              </div>
            </div>

            {/* Vibe presets */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 16, textTransform: "uppercase" }}>Vibe Presets</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(145px,1fr))", gap: 8 }}>
                {VIBE_PRESETS.map((v) => {
                  const isActive = v.id === activeVibe;
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleVibeChange(v.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                        background: isActive ? `${v.color}22` : "rgba(255,255,255,0.03)",
                        border: isActive ? `1px solid ${v.color}66` : "1px solid rgba(255,255,255,0.07)",
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{v.emoji}</span>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: isActive ? v.color : "rgba(255,255,255,0.7)" }}>{v.label}</div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>{v.bpm} BPM</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right column — event log */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 16, textTransform: "uppercase" }}>Event Log</div>
            {log.length === 0 ? (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "32px 0" }}>No events yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 600, overflowY: "auto" }}>
                {log.map((entry) => {
                  const typeColor: Record<string, string> = {
                    START: "#00FF88", STOP: "#FF2DAA", PAUSE: "#FFD700", RESUME: "#00FF88",
                    DROP: accent, "VIBE-CHANGE": "#AA2DFF", "CROWD-SURGE": "#FF2DAA",
                  };
                  const c = typeColor[entry.type] ?? "#00FFFF";
                  return (
                    <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: `${c}08`, border: `1px solid ${c}18`, borderRadius: 6 }}>
                      <span style={{ fontSize: 8, fontWeight: 900, color: c, letterSpacing: "0.08em", minWidth: 80 }}>{entry.type}</span>
                      <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", flex: 1 }}>{entry.vibe ?? `${entry.rooms} rooms`}</span>
                      <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontVariantNumeric: "tabular-nums" }}>{fmtTime(entry.ts)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
