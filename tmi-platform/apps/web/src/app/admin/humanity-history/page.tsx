"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type RunRecord = {
  id: string;
  runIndex: number;
  timestamp: number;
  result: "pass" | "fail" | "degraded";
  avatarCount: number;
  seatedCorrectly: number;
  occupancyPercent: number;
  friendClusters: number;
  reconstructionLatencyMs: number;
  avgRttMs: number;
  worstRttMs: number;
  pulseGapCount: number;
  sentinelAlerts: number;
  avgCrowdEnergy: number;
  activeLODLevel: "near" | "medium" | "far" | "mixed";
  failoverEvents: number;
  benchmarkRoomId: string;
};

type HistoryResponse = {
  ok: boolean;
  stats: {
    totalRuns: number;
    passRate: number;
    avgOccupancy: number;
    bestOccupancy: number;
    worstOccupancy: number;
    avgReconstructionMs: number;
    avgCrowdEnergy: number;
    totalLegendaryMoments: number;
    totalMythsGenerated: number;
  };
  health: {
    trajectory: string;
    passRate: number;
    criticalRegressions: string[];
    summary: string;
  };
  latestDiff: {
    trajectory: string;
    summaryProse: string;
    regressions: Array<{ metric: string; changePct: number; severity: string }>;
  } | null;
  runs: RunRecord[];
};

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function HumanityHistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/humanity-history?limit=30&window=8", { cache: "no-store" });
      if (!res.ok) {
        setError("Failed to load humanity history");
        setLoading(false);
        return;
      }
      const json = (await res.json()) as HistoryResponse;
      setData(json);
    } catch {
      setError("History endpoint unreachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const resultColor = (result: RunRecord["result"]): string => {
    if (result === "pass") return "#00FF88";
    if (result === "degraded") return "#FFD700";
    return "#FF2DAA";
  };

  const topRuns = useMemo(() => (data?.runs ?? []).slice(0, 10), [data]);

  return (
    <main style={{ minHeight: "100vh", background: "#040410", color: "#fff", fontFamily: "'Inter', sans-serif", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 6 }}>
            <Link href="/admin/humanity-benchmark" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HUMANITY BENCHMARK</Link>
          </div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.35em", color: "#FFD700", marginBottom: 8 }}>ADMIN — HUMANITY HISTORY</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px" }}>Civilization Diagnostics Lab</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            Historical benchmark telemetry, regression detection, and run-for-run comparison.
          </p>
        </div>

        <div style={{ marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => void load()} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(0,255,255,0.4)", background: "rgba(0,255,255,0.1)", color: "#00FFFF", fontWeight: 900, fontSize: 10, letterSpacing: "0.1em", cursor: "pointer" }}>REFRESH</button>
          <Link href="/admin/world-memory" style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,215,0,0.35)", background: "rgba(255,215,0,0.08)", color: "#FFD700", fontWeight: 900, fontSize: 10, letterSpacing: "0.1em", textDecoration: "none" }}>WORLD MEMORY</Link>
        </div>

        {loading && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Loading history...</div>}
        {error && <div style={{ fontSize: 12, color: "#FF2DAA" }}>{error}</div>}

        {data && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: 16 }}>
              {[
                { label: "TOTAL RUNS", value: String(data.stats.totalRuns), color: "#00FFFF" },
                { label: "PASS RATE", value: `${data.stats.passRate}%`, color: "#00FF88" },
                { label: "AVG OCCUPANCY", value: `${data.stats.avgOccupancy}%`, color: "#FFD700" },
                { label: "AVG RECON", value: `${data.stats.avgReconstructionMs}ms`, color: "#AA2DFF" },
                { label: "MYTHS GENERATED", value: String(data.stats.totalMythsGenerated), color: "#FF2DAA" },
              ].map((s) => (
                <div key={s.label} style={{ background: `${s.color}0C`, border: `1px solid ${s.color}33`, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>SYSTEM TRAJECTORY</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: data.health.trajectory === "degrading" ? "#FF2DAA" : data.health.trajectory === "volatile" ? "#FFD700" : "#00FF88", marginBottom: 6 }}>
                {data.health.trajectory.toUpperCase()}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{data.health.summary}</div>
              {data.latestDiff?.summaryProse && (
                <div style={{ marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{data.latestDiff.summaryProse}</div>
              )}
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 0" }}>
              <div style={{ padding: "0 14px 8px", fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)" }}>RUN TIMELINE</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
                  <thead>
                    <tr>
                      {[
                        "RUN", "TIME", "RESULT", "SEATS", "OCC", "RECON", "AVG RTT", "WORST RTT", "SENTINEL", "LOD", "ROOM",
                      ].map((h) => (
                        <th key={h} style={{ textAlign: "left", fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: "0.08em", padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topRuns.map((run) => (
                      <tr key={run.id}>
                        <td style={{ fontSize: 11, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#fff", fontWeight: 800 }}>#{run.runIndex}</td>
                        <td style={{ fontSize: 10, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)" }}>{fmtTime(run.timestamp)}</td>
                        <td style={{ fontSize: 10, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: resultColor(run.result), fontWeight: 900 }}>{run.result.toUpperCase()}</td>
                        <td style={{ fontSize: 10, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)" }}>{run.seatedCorrectly}/{run.avatarCount}</td>
                        <td style={{ fontSize: 10, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)" }}>{Math.round(run.occupancyPercent)}%</td>
                        <td style={{ fontSize: 10, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)" }}>{run.reconstructionLatencyMs}ms</td>
                        <td style={{ fontSize: 10, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)" }}>{Math.round(run.avgRttMs)}ms</td>
                        <td style={{ fontSize: 10, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)" }}>{Math.round(run.worstRttMs)}ms</td>
                        <td style={{ fontSize: 10, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: run.sentinelAlerts > 0 ? "#FF2DAA" : "#00FF88", fontWeight: 900 }}>{run.sentinelAlerts}</td>
                        <td style={{ fontSize: 10, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)" }}>{run.activeLODLevel.toUpperCase()}</td>
                        <td style={{ fontSize: 9, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}>{run.benchmarkRoomId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
