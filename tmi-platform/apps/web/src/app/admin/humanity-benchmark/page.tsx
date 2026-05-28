"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import WorldStateHeatmap, { type HeatmapCell } from "@/components/admin/WorldStateHeatmap";

interface BenchmarkResult {
  roomId: string;
  avatarCount: number;
  seatedCorrectly: number;
  friendClustersIntact: number;
  avgEnergyLevel: number;
  occupancyRate: number;
  beatSyncConfidence: string;
  passed: boolean;
  notes: string[];
}

type BenchmarkQualityMode = "low" | "med" | "high" | "cinematic";

type BenchmarkApiResponse = {
  ok: boolean;
  roomId: string;
  qualityMode: BenchmarkQualityMode;
  emptyArenaFirst: boolean;
  persistenceTest: boolean;
  avatarCount: number;
  benchmark: BenchmarkResult;
  runtime: {
    heartbeat: {
      beatPhase: number;
      bpm: number;
      vibe: string;
    };
    glitchSentinel: {
      active: boolean;
      alertCount: number;
      criticalCount: number;
    };
    venueHealthMonitor: {
      overallHealth: string;
      avgRttMs: number;
      worstRttMs: number;
      totalRooms: number;
      degradedRooms: number;
      criticalRooms: number;
    };
    appliedRenderCost: number;
  };
  logs: string[];
};

interface AvatarCard {
  userId: string;
  displayName: string;
  role: string;
  seat: string;
  mood: string;
  gesture: string;
  energyLevel: number;
  accentColor: string;
  hasFriendCluster: boolean;
  entryDelayMs: number;
}

const MOOD_COLOR: Record<string, string> = {
  neutral: "rgba(255,255,255,0.4)",
  excited: "#FF2DAA",
  grooving: "#AA2DFF",
  chilling: "#00FFFF",
  focused: "#FFD700",
  hyped: "#FF9500",
  celebrating: "#00FF88",
};

const ROLE_COLOR: Record<string, string> = {
  performer: "#FF2DAA",
  vip: "#FFD700",
  sponsor: "#FF9500",
  fan: "#00FFFF",
  host: "#00FF88",
  bot: "rgba(255,255,255,0.3)",
};

const ROLE_ICON: Record<string, string> = {
  performer: "🎤", vip: "💎", sponsor: "🤝", fan: "🎉", host: "🎙️", bot: "🤖",
};

function generateBenchmarkAvatars(count: number, roomId: string): AvatarCard[] {
  const moods = ["neutral", "grooving", "excited", "chilling", "hyped", "focused", "celebrating"];
  const gestures = ["idle", "dance", "clap", "wave", "cheer", "lean", "sit", "point"];
  const colors = ["#AA2DFF", "#00FFFF", "#FFD700", "#FF2DAA", "#00FF88"];

  return Array.from({ length: count }, (_, i) => ({
    userId: `bench-${roomId}-${i}`,
    displayName: `Avatar ${i + 1}`,
    role: i === 0 ? "performer" : i < 3 ? "vip" : i < 6 ? "sponsor" : "fan",
    seat: `Row ${Math.floor(i / 5) + 1} · Col ${(i % 5) + 1}`,
    mood: moods[i % moods.length]!,
    gesture: gestures[i % gestures.length]!,
    energyLevel: 0.5 + (i % 5) * 0.1,
    accentColor: i < 3 ? colors[i % colors.length]! : "rgba(255,255,255,0.2)",
    hasFriendCluster: i > 0 && i < 5,
    entryDelayMs: Math.floor(i / 5) * 60 + (i % 5) * 15,
  }));
}

export default function HumanityBenchmarkPage() {
  const [running, setRunning]         = useState(false);
  const [result, setResult]           = useState<BenchmarkResult | null>(null);
  const [runtime, setRuntime]         = useState<BenchmarkApiResponse["runtime"] | null>(null);
  const [avatars, setAvatars]         = useState<AvatarCard[]>([]);
  const [phase, setPhase]             = useState(0);
  const [avatarCount, setAvatarCount] = useState(20);
  const [persistenceTest, setPersistenceTest] = useState(false);
  const [emptyArenaFirst, setEmptyArenaFirst] = useState(true);
  const [qualityMode, setQualityMode] = useState<BenchmarkQualityMode>("high");
  const [logs, setLogs]               = useState<string[]>([]);

  const addLog = (msg: string) => setLogs((prev) => [`[${new Date().toLocaleTimeString("en-US", { hour12: false })}] ${msg}`, ...prev].slice(0, 20));

  const runBenchmark = async () => {
    setRunning(true);
    setResult(null);
    setAvatars([]);
    setLogs([]);

    addLog(`Starting humanity benchmark (${avatarCount} avatars, ${qualityMode.toUpperCase()} mode)`);
    addLog(emptyArenaFirst ? "Stage 0: Empty arena lighting validation enabled" : "Stage 0: Empty arena lighting validation skipped");

    try {
      const res = await fetch("/api/admin/humanity-benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarCount, persistenceTest, qualityMode, emptyArenaFirst }),
      });

      if (!res.ok) {
        addLog("✗ API request failed — verify admin session");
        setRunning(false);
        return;
      }

      const data = (await res.json()) as BenchmarkApiResponse;
      setPhase(1);
      setAvatars(generateBenchmarkAvatars(data.avatarCount, data.roomId));
      setResult(data.benchmark);
      setRuntime(data.runtime);

      for (const line of data.logs) {
        addLog(line);
      }

      addLog(data.benchmark.passed ? "✓ BENCHMARK PASSED" : "✗ BENCHMARK FAILED");
    } catch {
      addLog("✗ Benchmark request crashed — runtime unavailable");
    } finally {
      setRunning(false);
    }
  };

  // Build heatmap cells from avatar data
  const heatmapCells = useMemo((): HeatmapCell[][] => {
    const ROWS = 4;
    const COLS = 5;
    const grid: HeatmapCell[][] = Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, (_, c) => ({ row: r, col: c, energy: 0 }))
    );
    for (const av of avatars) {
      const row = Math.floor(avatars.indexOf(av) / COLS);
      const col = avatars.indexOf(av) % COLS;
      if (grid[row]?.[col]) {
        grid[row]![col] = {
          row, col,
          energy: av.energyLevel * (0.8 + Math.sin(Date.now() / 1000 + col) * 0.2),
          avatarId: av.userId,
          displayName: av.displayName,
          role: av.role,
          clusterId: av.hasFriendCluster ? "cluster-a" : undefined,
          sectionId: row === 0 ? "pit" : row === 1 ? "vip" : "floor-c",
          isOnline: true,
        };
      }
    }
    return grid;
  }, [avatars]);

  return (
    <main style={{ minHeight: "100vh", background: "#040410", color: "#fff", fontFamily: "'Inter', sans-serif", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        <div style={{ marginBottom: 28 }}>
          <div style={{ marginBottom: 6 }}>
            <Link href="/admin/world-memory" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← WORLD MEMORY</Link>
            <span style={{ margin: "0 8px", color: "rgba(255,255,255,0.15)", fontSize: 9 }}>·</span>
            <Link href="/admin/humanity-history" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>HUMANITY HISTORY</Link>
          </div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.35em", color: "#AA2DFF", marginBottom: 8 }}>ADMIN — HUMANITY BENCHMARK</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px" }}>20-Avatar Humanity Benchmark</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            The acid test for persistent world status. 20 avatars · correct seats · friend clusters · beat sync · persistence recovery.
          </p>
        </div>

        {/* Config */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 16, textTransform: "uppercase" }}>Benchmark Configuration</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 4, letterSpacing: "0.08em" }}>AVATAR COUNT</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[10, 20, 50].map((n) => (
                  <button key={n} onClick={() => setAvatarCount(n)} style={{ padding: "6px 14px", borderRadius: 6, background: avatarCount === n ? "rgba(170,45,255,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${avatarCount === n ? "rgba(170,45,255,0.5)" : "rgba(255,255,255,0.1)"}`, color: avatarCount === n ? "#AA2DFF" : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 900, cursor: "pointer" }}>{n}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={persistenceTest} onChange={(e) => setPersistenceTest(e.target.checked)} style={{ accentColor: "#AA2DFF" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>Include persistence recovery test</span>
              </label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={emptyArenaFirst} onChange={(e) => setEmptyArenaFirst(e.target.checked)} style={{ accentColor: "#00FFFF" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>Run empty-arena lighting check first</span>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 4, letterSpacing: "0.08em" }}>QUALITY MODE</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {([
                { key: "low", label: "LOW" },
                { key: "med", label: "MED" },
                { key: "high", label: "HIGH" },
                { key: "cinematic", label: "CINEMATIC" },
              ] as const).map((q) => (
                <button key={q.key} onClick={() => setQualityMode(q.key)} style={{ padding: "6px 12px", borderRadius: 6, background: qualityMode === q.key ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${qualityMode === q.key ? "rgba(0,255,255,0.6)" : "rgba(255,255,255,0.1)"}`, color: qualityMode === q.key ? "#00FFFF" : "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", cursor: "pointer" }}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => void runBenchmark()}
            disabled={running}
            style={{ padding: "12px 28px", borderRadius: 8, background: running ? "rgba(170,45,255,0.1)" : "#AA2DFF", color: running ? "#AA2DFF" : "#040410", fontSize: 13, fontWeight: 900, border: "none", cursor: running ? "not-allowed" : "pointer", letterSpacing: "0.1em", opacity: running ? 0.7 : 1 }}
          >
            {running ? `RUNNING... ${Math.round(phase * 100)}%` : `▶ GO · SPAWN ${avatarCount} AVATARS`}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={{ background: result.passed ? "rgba(0,255,136,0.04)" : "rgba(255,45,170,0.04)", border: `1px solid ${result.passed ? "rgba(0,255,136,0.3)" : "rgba(255,45,170,0.3)"}`, borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 22 }}>{result.passed ? "✓" : "✗"}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: result.passed ? "#00FF88" : "#FF2DAA" }}>{result.passed ? "BENCHMARK PASSED" : "BENCHMARK FAILED"}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{result.roomId} · quality {qualityMode.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 8, marginBottom: 14 }}>
              {[
                { label: "Seated Correctly", value: `${result.seatedCorrectly}/${result.avatarCount}`, color: "#00FFFF" },
                { label: "Friend Clusters",  value: result.friendClustersIntact.toString(), color: "#AA2DFF" },
                { label: "Avg Energy",       value: `${Math.round(result.avgEnergyLevel * 100)}%`, color: "#FFD700" },
                { label: "Beat Sync",        value: result.beatSyncConfidence.toUpperCase(), color: "#00FF88" },
              ].map((s) => (
                <div key={s.label} style={{ padding: "10px 12px", background: `${s.color}08`, border: `1px solid ${s.color}22`, borderRadius: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: s.color, marginBottom: 2 }}>{s.value}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {result.notes.map((n, i) => (
                <div key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>· {n}</div>
              ))}
            </div>
          </div>
        )}

        {runtime && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 10, marginBottom: 16 }}>
            <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(0,255,255,0.06)", border: "1px solid rgba(0,255,255,0.2)" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Runtime Glitch Sentinel</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: runtime.glitchSentinel.criticalCount > 0 ? "#FF2DAA" : "#00FF88" }}>
                {runtime.glitchSentinel.active ? "ACTIVE" : "INACTIVE"}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>alerts {runtime.glitchSentinel.alertCount} · critical {runtime.glitchSentinel.criticalCount}</div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.2)" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Venue Health Monitor</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: runtime.venueHealthMonitor.overallHealth === "critical" ? "#FF2DAA" : runtime.venueHealthMonitor.overallHealth === "degraded" ? "#FFD700" : "#00FF88" }}>
                {runtime.venueHealthMonitor.overallHealth.toUpperCase()}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>RTT avg {Math.round(runtime.venueHealthMonitor.avgRttMs)}ms · worst {Math.round(runtime.venueHealthMonitor.worstRttMs)}ms</div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Universal Clock Runtime</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#FFD700" }}>{runtime.heartbeat.bpm} BPM</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>Beat phase {runtime.heartbeat.beatPhase.toFixed(3)} · vibe {runtime.heartbeat.vibe}</div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Budget Governor Application</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#00FF88" }}>{runtime.appliedRenderCost}%</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>Estimated render cost for {qualityMode.toUpperCase()} mode</div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, alignItems: "start" }}>

          {/* Avatar grid */}
          {avatars.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 14, textTransform: "uppercase" }}>Avatar Crowd State</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px,1fr))", gap: 8 }}>
                {avatars.map((a) => {
                  const rc = ROLE_COLOR[a.role] ?? "#00FFFF";
                  const mc = MOOD_COLOR[a.mood] ?? "rgba(255,255,255,0.4)";
                  return (
                    <div key={a.userId} style={{ padding: "10px 12px", background: `${rc}08`, border: `1px solid ${rc}20`, borderRadius: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>{ROLE_ICON[a.role] ?? "🎵"}</span>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{a.displayName}</div>
                          <div style={{ fontSize: 8, color: rc, fontWeight: 700, letterSpacing: "0.08em" }}>{a.role.toUpperCase()}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>{a.seat}</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 8, color: mc, fontWeight: 700 }}>{a.mood}</span>
                        {a.hasFriendCluster && <span style={{ fontSize: 8, color: "#AA2DFF" }}>👥</span>}
                      </div>
                      {/* Energy bar */}
                      <div style={{ marginTop: 5, height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 1 }}>
                        <div style={{ height: "100%", width: `${a.energyLevel * 100}%`, background: mc, borderRadius: 1, transition: "width 0.3s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Heatmap */}
          {avatars.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px", marginTop: 16 }}>
              <WorldStateHeatmap
                cells={heatmapCells}
                rows={4}
                cols={5}
                accentColor="#AA2DFF"
                showLabels={true}
                showClusters={true}
                showSections={true}
                title="Crowd Energy Heatmap"
              />
            </div>
          )}
        </div>

        {/* LOD + Legendary detector status */}
        {result && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase" }}>LOD Governor</div>
              {[
                { label: "Near (full fidelity)",   value: Math.floor(avatarCount * 0.25), color: "#00FF88" },
                { label: "Medium (30fps, 2 layers)", value: Math.floor(avatarCount * 0.30), color: "#FFD700" },
                { label: "Far (silhouette)",        value: Math.floor(avatarCount * 0.30), color: "#FF9500" },
                { label: "Ultra-far (billboard)",   value: Math.floor(avatarCount * 0.15), color: "#FF2DAA" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{s.label}</span>
                  <span style={{ fontSize: 9, fontWeight: 900, color: s.color }}>{s.value}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 9, color: "#00FF88", fontWeight: 900 }}>~{Math.round((1 - (0.25 + 0.30 * 0.4 + 0.30 * 0.15 + 0.15 * 0.04)) * 100)}% render cost savings</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase" }}>Legendary Detector</div>
              {[
                { label: "Energy Peak Threshold",  value: "95% · 3s sustained", color: "#FFD700" },
                { label: "Standing Ovation",       value: "90% · 10s sustained", color: "#FF2DAA" },
                { label: "Donation Surge",         value: "3 tips / 10s", color: "#00FF88" },
                { label: "Chat Velocity",          value: "5 msg/s", color: "#00FFFF" },
                { label: "Detection Cooldown",     value: "30s / trigger type", color: "#AA2DFF" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{s.label}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, marginTop: 16, alignItems: "start" }}>
          {/* Spacer for the left column now that heatmap is above */}
          <div />

          {/* Log */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase" }}>Benchmark Log</div>
            {logs.length === 0 ? (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "24px 0" }}>Run benchmark to see logs</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {logs.map((l, i) => (
                  <div key={i} style={{ fontSize: 9, color: l.includes("✓") ? "#00FF88" : l.includes("✗") ? "#FF2DAA" : "rgba(255,255,255,0.45)", lineHeight: 1.4, fontFamily: "monospace" }}>{l}</div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
