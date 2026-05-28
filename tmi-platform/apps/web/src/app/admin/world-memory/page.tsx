"use client";

import { useState } from "react";
import Link from "next/link";

type SnapshotTrigger = "legendary-moment" | "vibe-change" | "drop" | "crowd-peak" | "period-checkpoint" | "admin-manual" | "failover";

interface MockSnapshot {
  id: string;
  trigger: SnapshotTrigger;
  label: string;
  capturedAt: number;
  vibe: string;
  crowdEnergy: number;
  accentColor: string;
  bpm: number;
  activeRooms: number;
  isLegendary: boolean;
  roomId: string | null;
}

const MOCK_SNAPSHOTS: MockSnapshot[] = [
  { id: "snap-001", trigger: "legendary-moment", label: "Season Zero Finals — Drop Moment", capturedAt: Date.now() - 3600000, vibe: "cyber-battle", crowdEnergy: 1.0, accentColor: "#00FFFF", bpm: 150, activeRooms: 12, isLegendary: true, roomId: "cypher-arena" },
  { id: "snap-002", trigger: "drop", label: "Neon Arena — First Synchronized Drop", capturedAt: Date.now() - 2400000, vibe: "neon-arena", crowdEnergy: 0.95, accentColor: "#00FFFF", bpm: 140, activeRooms: 8, isLegendary: false, roomId: "neon-arena-main" },
  { id: "snap-003", trigger: "vibe-change", label: "World Premiere Vibe Switch", capturedAt: Date.now() - 1800000, vibe: "world-premiere", crowdEnergy: 0.88, accentColor: "#FFD700", bpm: 120, activeRooms: 15, isLegendary: true, roomId: null },
  { id: "snap-004", trigger: "crowd-peak", label: "Midnight Afterparty — Peak Energy", capturedAt: Date.now() - 900000, vibe: "midnight-afterparty", crowdEnergy: 1.0, accentColor: "#AA2DFF", bpm: 128, activeRooms: 6, isLegendary: false, roomId: "midnight-main" },
  { id: "snap-005", trigger: "period-checkpoint", label: "Auto checkpoint — 2026-05-27T03:00:00", capturedAt: Date.now() - 300000, vibe: "neon-arena", crowdEnergy: 0.72, accentColor: "#00FFFF", bpm: 140, activeRooms: 4, isLegendary: false, roomId: null },
  { id: "snap-006", trigger: "admin-manual", label: "Marcel Manual Save — Pre-Launch State", capturedAt: Date.now() - 60000, vibe: "neon-arena", crowdEnergy: 0.85, accentColor: "#00FFFF", bpm: 140, activeRooms: 7, isLegendary: true, roomId: null },
];

const TRIGGER_COLOR: Record<SnapshotTrigger, string> = {
  "legendary-moment":   "#FFD700",
  "vibe-change":        "#AA2DFF",
  "drop":               "#FF2DAA",
  "crowd-peak":         "#00FF88",
  "period-checkpoint":  "rgba(255,255,255,0.3)",
  "admin-manual":       "#00FFFF",
  "failover":           "#FF9500",
};

const TRIGGER_LABEL: Record<SnapshotTrigger, string> = {
  "legendary-moment":   "LEGENDARY",
  "vibe-change":        "VIBE CHANGE",
  "drop":               "DROP",
  "crowd-peak":         "CROWD PEAK",
  "period-checkpoint":  "CHECKPOINT",
  "admin-manual":       "MANUAL SAVE",
  "failover":           "FAILOVER",
};

function fmtAge(ts: number): string {
  const ms = Date.now() - ts;
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ago`;
  return `${m}m ago`;
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

type ReplayStatus = "idle" | "loading" | "replaying" | "complete";

export default function WorldMemoryPage() {
  const [filter, setFilter]           = useState<SnapshotTrigger | "all" | "legendary">("all");
  const [replayId, setReplayId]       = useState<string | null>(null);
  const [replayStatus, setReplayStatus] = useState<ReplayStatus>("idle");
  const [replayFrame, setReplayFrame] = useState(0);
  const [captureLabel, setCaptureLabel] = useState("");
  const [capturing, setCapturing]     = useState(false);

  const filtered = MOCK_SNAPSHOTS.filter((s) => {
    if (filter === "all") return true;
    if (filter === "legendary") return s.isLegendary;
    return s.trigger === filter;
  });

  const legendary = MOCK_SNAPSHOTS.filter((s) => s.isLegendary);

  const startReplay = (id: string) => {
    setReplayId(id);
    setReplayStatus("loading");
    setReplayFrame(0);
    setTimeout(() => {
      setReplayStatus("replaying");
      const interval = setInterval(() => {
        setReplayFrame((f) => {
          if (f >= 5) { clearInterval(interval); setReplayStatus("complete"); return f; }
          return f + 1;
        });
      }, 600);
    }, 800);
  };

  const captureManual = () => {
    if (!captureLabel.trim()) return;
    setCapturing(true);
    setTimeout(() => {
      setCapturing(false);
      setCaptureLabel("");
    }, 1000);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#040410", color: "#fff", fontFamily: "'Inter', sans-serif", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ marginBottom: 6 }}>
            <Link href="/admin/venue-health" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← VENUE HEALTH</Link>
          </div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.35em", color: "#FFD700", marginBottom: 8 }}>ADMIN — CULTURAL MEMORY</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px" }}>World Memory Timeline</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Every legendary moment, snapshot, and checkpoint — the mythology of TMI.
          </p>
        </div>

        {/* Legendary moments pinned */}
        {legendary.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "#FFD700", marginBottom: 12, textTransform: "uppercase" }}>
              ★ Pinned Legendary Moments
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {legendary.map((s) => (
                <div key={s.id} style={{ padding: "12px 16px", background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 10, minWidth: 180 }}>
                  <div style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.1em", marginBottom: 4 }}>★ {TRIGGER_LABEL[s.trigger]}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 3, lineHeight: 1.3 }}>{s.label}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{fmtAge(s.capturedAt)} · {s.bpm} BPM · {s.activeRooms} rooms</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, alignItems: "start" }}>

          {/* Snapshot timeline */}
          <div>
            {/* Filter bar */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {(["all", "legendary", "legendary-moment", "drop", "vibe-change", "crowd-peak", "admin-manual", "period-checkpoint"] as const).map((f) => {
                const isActive = filter === f;
                const color = f === "all" || f === "legendary" ? "#00FFFF" : TRIGGER_COLOR[f as SnapshotTrigger];
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${isActive ? color : "rgba(255,255,255,0.1)"}`, background: isActive ? `${color}18` : "transparent", color: isActive ? color : "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 900, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}
                  >
                    {f === "all" ? "All" : f === "legendary" ? "★ Legendary" : TRIGGER_LABEL[f as SnapshotTrigger]}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((s) => {
                const tc = TRIGGER_COLOR[s.trigger];
                const isReplaying = replayId === s.id;
                return (
                  <div key={s.id} style={{ padding: "16px 18px", background: isReplaying ? "rgba(0,255,136,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${isReplaying ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: 12 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", color: tc, background: `${tc}12`, border: `1px solid ${tc}28`, borderRadius: 4, padding: "2px 7px" }}>
                            {TRIGGER_LABEL[s.trigger]}
                          </span>
                          {s.isLegendary && (
                            <span style={{ fontSize: 8, fontWeight: 900, color: "#FFD700" }}>★ LEGENDARY</span>
                          )}
                          {s.roomId && (
                            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>{s.roomId}</span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{s.label}</div>
                        <div style={{ display: "flex", gap: 12, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
                          <span>{fmtAge(s.capturedAt)}</span>
                          <span>{fmtTime(s.capturedAt)}</span>
                          <span style={{ color: s.accentColor }}>{s.vibe}</span>
                          <span>{s.bpm} BPM</span>
                          <span>{Math.round(s.crowdEnergy * 100)}% energy</span>
                          <span>{s.activeRooms} rooms</span>
                        </div>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        {isReplaying ? (
                          <div style={{ padding: "6px 14px", borderRadius: 6, background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.3)", color: "#00FF88", fontSize: 10, fontWeight: 900 }}>
                            {replayStatus === "loading" ? "LOADING..." : replayStatus === "complete" ? "COMPLETE ✓" : `FRAME ${replayFrame}/5`}
                          </div>
                        ) : (
                          <button
                            onClick={() => startReplay(s.id)}
                            disabled={replayStatus === "replaying" || replayStatus === "loading"}
                            style={{ padding: "6px 14px", borderRadius: 6, background: `${tc}10`, border: `1px solid ${tc}30`, color: tc, fontSize: 10, fontWeight: 900, cursor: "pointer", opacity: (replayStatus === "replaying" || replayStatus === "loading") ? 0.4 : 1 }}
                          >
                            ▶ Replay
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — manual capture + checkpoint stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Manual capture */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 14, textTransform: "uppercase" }}>Capture Snapshot</div>
              <input
                value={captureLabel}
                onChange={(e) => setCaptureLabel(e.target.value)}
                placeholder="Label (e.g. 'Pre-Launch State')"
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 12, marginBottom: 10, boxSizing: "border-box", outline: "none" }}
              />
              <button
                onClick={captureManual}
                disabled={capturing || !captureLabel.trim()}
                style={{ width: "100%", padding: "10px", borderRadius: 8, background: capturing ? "rgba(0,255,136,0.1)" : "#FFD700", color: capturing ? "#00FF88" : "#040410", fontSize: 12, fontWeight: 900, border: "none", cursor: "pointer", opacity: !captureLabel.trim() ? 0.4 : 1 }}
              >
                {capturing ? "SAVING..." : "📸 Save Now"}
              </button>
            </div>

            {/* Checkpoint stats */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 14, textTransform: "uppercase" }}>Checkpoint System</div>
              {[
                { label: "Total Snapshots", value: MOCK_SNAPSHOTS.length.toString(), color: "#00FFFF" },
                { label: "Legendary Moments", value: legendary.length.toString(), color: "#FFD700" },
                { label: "Pub/Sub Transport", value: "Memory", color: "#AA2DFF" },
                { label: "Redis", value: "Add REDIS_URL to .env.local", color: "rgba(255,255,255,0.3)" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{s.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 900, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Failover status */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase" }}>Failover Coordinator</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00FF88", display: "inline-block" }} />
                <span style={{ fontSize: 10, fontWeight: 900, color: "#00FF88", letterSpacing: "0.1em" }}>MONITORING</span>
              </div>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: 0, lineHeight: 1.5 }}>
                Threshold: 10s heartbeat gap. Restores from checkpoint, falls back to snapshot replay.
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
