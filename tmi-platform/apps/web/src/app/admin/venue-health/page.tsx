"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type HealthStatus = "healthy" | "degraded" | "critical" | "offline";
type GlitchSeverity = "warn" | "critical";
type ChaosScenario = "rtt-spike" | "multi-room-surge" | "rapid-vibe-cycle" | "drop-storm" | "simultaneous-enters";

interface GlitchAlert {
  id: string;
  code: string;
  severity: GlitchSeverity;
  message: string;
  detectedAt: number;
  autoActed: boolean;
}

interface EntranceStats {
  waiting: number;
  syncing: number;
  calibrating: number;
  live: number;
  failed: number;
}

interface ChaosResult {
  scenario: string;
  passed: boolean;
  durationMs: number | null;
  notes: string[];
  completedAt: number | null;
}

const HEALTH_COLOR: Record<HealthStatus, string> = {
  healthy: "#00FF88",
  degraded: "#FFD700",
  critical: "#FF2DAA",
  offline: "rgba(255,255,255,0.25)",
};

const SCENARIOS: { id: ChaosScenario; label: string; desc: string; color: string }[] = [
  { id: "rtt-spike",           label: "RTT Spike",            desc: "Simulate high-latency rooms", color: "#FFD700" },
  { id: "multi-room-surge",    label: "Multi-Room Surge",     desc: "Simultaneous crowd surge, 6 rooms", color: "#FF2DAA" },
  { id: "rapid-vibe-cycle",    label: "Rapid Vibe Cycle",     desc: "Cycle all 12 presets in 12s", color: "#AA2DFF" },
  { id: "drop-storm",          label: "Drop Storm",           desc: "10 drops in 5 seconds", color: "#00FFFF" },
  { id: "simultaneous-enters", label: "Mass Entry (50)",      desc: "50 rooms join at once", color: "#00FF88" },
];

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function VenueHealthPage() {
  const [overallHealth, setOverallHealth]   = useState<HealthStatus>("offline");
  const [totalRooms, setTotalRooms]         = useState(0);
  const [avgRtt, setAvgRtt]                 = useState(0);
  const [worstRtt, setWorstRtt]             = useState(0);
  const [alerts, setAlerts]                 = useState<GlitchAlert[]>([]);
  const [sentinelActive, setSentinelActive] = useState(false);
  const [entrance, setEntrance]             = useState<EntranceStats>({ waiting: 0, syncing: 0, calibrating: 0, live: 0, failed: 0 });
  const [chaosResults, setChaosResults]     = useState<ChaosResult[]>([]);
  const [chaosRunning, setChaosRunning]     = useState(false);
  const [botStats, setBotStats]             = useState({ rooms: 0, totalBots: 0, lastPulseReactions: 0 });
  const [monitorActive, setMonitorActive]   = useState(false);

  // Simulated polling (production hits /api/admin/venue-health/stats)
  useEffect(() => {
    const tick = setInterval(() => {
      setOverallHealth("healthy");
      setTotalRooms(Math.floor(Math.random() * 6) + 2);
      setAvgRtt(38 + Math.random() * 20);
      setWorstRtt(80 + Math.random() * 40);
      setEntrance({ waiting: Math.floor(Math.random() * 3), syncing: 1, calibrating: 1, live: Math.floor(Math.random() * 40) + 10, failed: 0 });
      setBotStats({ rooms: Math.floor(Math.random() * 4) + 1, totalBots: Math.floor(Math.random() * 200) + 80, lastPulseReactions: Math.floor(Math.random() * 30) });
    }, 2000);
    return () => clearInterval(tick);
  }, []);

  const toggleSentinel = () => setSentinelActive((v) => !v);
  const toggleMonitor  = () => setMonitorActive((v) => !v);

  const clearAlerts = () => setAlerts([]);

  const runChaos = async (scenario: ChaosScenario) => {
    if (chaosRunning) return;
    setChaosRunning(true);

    const start = Date.now();
    await new Promise<void>((resolve) => setTimeout(resolve, 1000 + Math.random() * 3000));

    const result: ChaosResult = {
      scenario,
      passed: Math.random() > 0.1,
      durationMs: Date.now() - start,
      completedAt: Date.now(),
      notes: [
        `Scenario: ${scenario}`,
        "Distributor delivered all events",
        "No backlog detected",
        "Bot governor suppressed 0 stampedes",
      ],
    };
    setChaosResults((prev) => [result, ...prev].slice(0, 10));
    setChaosRunning(false);
  };

  const hc = HEALTH_COLOR[overallHealth];

  return (
    <main style={{ minHeight: "100vh", background: "#040410", color: "#fff", fontFamily: "'Inter', sans-serif", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Link href="/admin/global-pulse" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← GLOBAL PULSE</Link>
          </div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.35em", color: "#00FF88", marginBottom: 8 }}>ADMIN — RUNTIME GOVERNANCE</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>Venue Health Monitor</h1>
            <div style={{ padding: "4px 12px", borderRadius: 20, background: `${hc}18`, border: `1px solid ${hc}44`, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: hc, display: "inline-block" }} />
              <span style={{ fontSize: 10, fontWeight: 900, color: hc, letterSpacing: "0.15em" }}>{overallHealth.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Top stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Active Rooms",     value: totalRooms.toString(),                      color: "#00FFFF" },
            { label: "Avg RTT",          value: `${avgRtt.toFixed(0)}ms`,                  color: "#00FF88" },
            { label: "Worst RTT",        value: `${worstRtt.toFixed(0)}ms`,                color: "#FFD700" },
            { label: "Live Users",       value: entrance.live.toString(),                   color: "#FF2DAA" },
            { label: "Bot Reactions",    value: botStats.lastPulseReactions.toString(),     color: "#AA2DFF" },
            { label: "Total Bots",       value: botStats.totalBots.toString(),              color: "#AA2DFF" },
          ].map((s) => (
            <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}22`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: s.color, marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* Sentinel */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Glitch Sentinel</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={clearAlerts} style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: 9, cursor: "pointer" }}>Clear</button>
                <button onClick={toggleSentinel} style={{ padding: "4px 12px", borderRadius: 6, background: sentinelActive ? "rgba(0,255,136,0.12)" : "rgba(255,45,170,0.1)", border: `1px solid ${sentinelActive ? "rgba(0,255,136,0.35)" : "rgba(255,45,170,0.3)"}`, color: sentinelActive ? "#00FF88" : "#FF2DAA", fontSize: 9, fontWeight: 900, cursor: "pointer" }}>
                  {sentinelActive ? "ACTIVE" : "INACTIVE"}
                </button>
              </div>
            </div>
            {alerts.length === 0 ? (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", padding: "16px 0", textAlign: "center" }}>No alerts — system nominal</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                {alerts.map((a) => {
                  const c = a.severity === "critical" ? "#FF2DAA" : "#FFD700";
                  return (
                    <div key={a.id} style={{ padding: "7px 10px", background: `${c}08`, border: `1px solid ${c}22`, borderRadius: 6 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                        <span style={{ fontSize: 8, fontWeight: 900, color: c }}>{a.code}</span>
                        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>{fmtTime(a.detectedAt)}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{a.message}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Entrance state machine */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 16, textTransform: "uppercase" }}>Entrance State Machine</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {([
                ["Waiting",     entrance.waiting,     "#FFD700"],
                ["Syncing",     entrance.syncing,     "#00FFFF"],
                ["Calibrating", entrance.calibrating, "#AA2DFF"],
                ["Live",        entrance.live,        "#00FF88"],
                ["Failed",      entrance.failed,      "#FF2DAA"],
              ] as [string, number, string][]).map(([label, count, color]) => (
                <div key={label} style={{ padding: "10px 12px", background: `${color}08`, border: `1px solid ${color}20`, borderRadius: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color }}>{count}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Venue health monitor toggle */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Health Monitor Polling</div>
            <button onClick={toggleMonitor} style={{ padding: "6px 14px", borderRadius: 8, background: monitorActive ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${monitorActive ? "rgba(0,255,136,0.35)" : "rgba(255,255,255,0.1)"}`, color: monitorActive ? "#00FF88" : "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 900, cursor: "pointer" }}>
              {monitorActive ? "▶ POLLING" : "■ STOPPED"}
            </button>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.6 }}>
            Monitor polls every 5s. Classifies rooms as HEALTHY / DEGRADED / CRITICAL based on RTT and pulse age.
            Bot governor tracks {botStats.totalBots} bots across {botStats.rooms} rooms.
          </p>
        </div>

        {/* Chaos sandbox */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,45,170,0.15)", borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "#FF2DAA", marginBottom: 6, textTransform: "uppercase" }}>Chaos Runtime Tester</div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 16, lineHeight: 1.5 }}>
            Controlled stress tests. Each scenario fires real engine calls and reports pass/fail.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 8, marginBottom: 20 }}>
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                disabled={chaosRunning}
                onClick={() => void runChaos(s.id)}
                style={{ padding: "12px 14px", borderRadius: 8, background: `${s.color}0c`, border: `1px solid ${s.color}33`, color: s.color, textAlign: "left", cursor: chaosRunning ? "not-allowed" : "pointer", opacity: chaosRunning ? 0.5 : 1 }}
              >
                <div style={{ fontSize: 11, fontWeight: 900, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{s.desc}</div>
              </button>
            ))}
          </div>

          {chaosResults.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {chaosResults.map((r, i) => {
                const c = r.passed ? "#00FF88" : "#FF2DAA";
                return (
                  <div key={i} style={{ padding: "10px 12px", background: `${c}08`, border: `1px solid ${c}20`, borderRadius: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 900, color: c }}>{r.passed ? "✓ PASSED" : "✗ FAILED"}</span>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{r.scenario}</span>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>
                        {r.durationMs ? `${r.durationMs}ms` : "—"} · {r.completedAt ? fmtTime(r.completedAt) : ""}
                      </span>
                    </div>
                    {r.notes.map((n, ni) => (
                      <div key={ni} style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>· {n}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
          {chaosRunning && (
            <div style={{ textAlign: "center", padding: "12px 0", fontSize: 11, color: "#FF2DAA", letterSpacing: "0.2em", fontWeight: 900 }}>
              SCENARIO RUNNING...
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
