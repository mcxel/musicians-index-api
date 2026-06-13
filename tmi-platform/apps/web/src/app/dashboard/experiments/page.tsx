"use client";
import { useState } from "react";
import Link from "next/link";

const ACCENT = "#FB923C";

interface Experiment { id: string; name: string; status: "running" | "paused" | "concluded"; variantA: string; variantB: string; convA: number; convB: number; traffic: number; winner?: "A" | "B"; }

const EXPERIMENTS: Experiment[] = [
  { id: "e1", name: "Homepage Hero CTA Text",       status: "concluded", variantA: "JOIN THE PLATFORM", variantB: "GO LIVE FREE",        convA: 4.2, convB: 7.8, traffic: 50, winner: "B"  },
  { id: "e2", name: "Subscribe Page Layout",         status: "running",   variantA: "Grid (current)",    variantB: "Tabbed view",         convA: 8.1, convB: 9.4, traffic: 50 },
  { id: "e3", name: "Fan Tier Pricing Display",      status: "running",   variantA: "Monthly only",      variantB: "Monthly + Annual",    convA: 6.3, convB: 7.1, traffic: 30 },
  { id: "e4", name: "Signup Flow: Role Selection",   status: "paused",    variantA: "Grid icons",        variantB: "List with desc",       convA: 12.4, convB: 11.8, traffic: 20 },
  { id: "e5", name: "Beat Upload CTA Position",      status: "concluded", variantA: "Header button",     variantB: "Sidebar card",        convA: 3.1, convB: 5.9, traffic: 50, winner: "B"  },
];

const STATUS_COLOR: Record<string, string> = { running: "#34D399", paused: "#FFD700", concluded: "#94A3B8" };

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState(EXPERIMENTS);
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }
  function toggleStatus(id: string) {
    setExperiments(prev => prev.map(e => {
      if (e.id !== id || e.status === "concluded") return e;
      const next = e.status === "running" ? "paused" : "running";
      showToast(`Experiment ${next}`);
      return { ...e, status: next };
    }));
  }

  const running = experiments.filter(e => e.status === "running").length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(251,146,60,0.25)", padding: "11px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>ADMIN — A/B TESTING</div>
          <div style={{ fontSize: 14, fontWeight: 900 }}>🧪 Experiments · {running} running</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => showToast("New experiment wizard")} style={{ fontSize: 10, fontWeight: 800, color: "#000", background: ACCENT, border: "none", padding: "6px 16px", borderRadius: 6, cursor: "pointer" }}>+ NEW TEST</button>
          <Link href="/dashboard/admin" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>← Admin</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px" }}>
        {toast && <div style={{ marginBottom: 14, padding: "10px 16px", background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", borderRadius: 8, fontSize: 12, color: ACCENT }}>{toast}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {experiments.map(e => {
            const sc = STATUS_COLOR[e.status]!;
            const leading = e.convA > e.convB ? "A" : "B";
            const diff = Math.abs(e.convA - e.convB).toFixed(1);
            return (
              <div key={e.id} style={{ background: e.status === "running" ? "rgba(52,211,153,0.03)" : "rgba(255,255,255,0.02)", border: `1px solid ${e.status === "running" ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 14, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{e.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{e.traffic}% traffic split</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 900, padding: "3px 10px", borderRadius: 10, background: `${sc}18`, color: sc }}>{e.status.toUpperCase()}</span>
                    {e.status !== "concluded" && (
                      <button onClick={() => toggleStatus(e.id)} style={{ padding: "5px 12px", fontSize: 9, fontWeight: 800, background: "transparent", border: `1px solid ${sc}40`, color: sc, borderRadius: 6, cursor: "pointer" }}>
                        {e.status === "running" ? "PAUSE" : "RESUME"}
                      </button>
                    )}
                    {e.status === "concluded" && e.winner && (
                      <span style={{ fontSize: 9, fontWeight: 900, color: "#FFD700" }}>✓ VARIANT {e.winner} WON</span>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[{ label: "A", name: e.variantA, conv: e.convA }, { label: "B", name: e.variantB, conv: e.convB }].map(v => {
                    const isWinner = e.winner === v.label || (e.status !== "concluded" && leading === v.label);
                    const barW = (v.conv / Math.max(e.convA, e.convB)) * 100;
                    return (
                      <div key={v.label} style={{ background: isWinner ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${isWinner ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: isWinner ? "#34D399" : "rgba(255,255,255,0.5)", fontWeight: 800 }}>Variant {v.label}</span>
                          <span style={{ fontSize: 16, fontWeight: 900, color: isWinner ? "#34D399" : "rgba(255,255,255,0.6)" }}>{v.conv}%</span>
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>{v.name}</div>
                        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 4 }}>
                          <div style={{ height: 4, borderRadius: 4, background: isWinner ? "#34D399" : "#555", width: `${barW}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {e.status !== "concluded" && (
                  <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                    Variant {leading} leading by <strong style={{ color: "#34D399" }}>+{diff}%</strong> conversion
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
