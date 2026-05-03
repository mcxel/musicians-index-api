"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type BackstageAlert = {
  id: string;
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: number;
  acknowledged: boolean;
};

type BackstageState = {
  venueSlug: string;
  crew: { id: string; name: string; role: string; onDuty: boolean; stationId: string }[];
  alerts: BackstageAlert[];
  productionActive: boolean;
  countdown: number | null;
  checklistComplete: boolean;
};

const SEVERITY_COLOR = { info: "#00BFFF", warning: "#FFD700", critical: "#ff4444" };

export default function BackstagePage() {
  const [state, setState] = useState<BackstageState | null>(null);
  const [venueSlug, setVenueSlug] = useState("main-stage");
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => { loadBackstage(); }, [venueSlug]);

  async function loadBackstage() {
    setLoading(true);
    try {
      // Backstage is derived from stage + queue state — synthesize from stage API
      const res = await fetch(`/api/live/stage?venue=${venueSlug}`);
      const stageData = await res.json();
      setState({
        venueSlug,
        crew: [
          { id: "crew-1", name: "Marcus (Producer)", role: "producer", onDuty: true, stationId: "control-room" },
          { id: "crew-2", name: "Jess (Audio)", role: "audio", onDuty: true, stationId: "audio-booth" },
          { id: "crew-3", name: "Tay (Camera)", role: "camera", onDuty: stageData.active ?? false, stationId: "stage-right" },
        ],
        alerts: stageData.active ? [] : [{ id: "a1", severity: "info", message: "Stage inactive — waiting for activation.", timestamp: Date.now(), acknowledged: false }],
        productionActive: stageData.active ?? false,
        countdown: null,
        checklistComplete: stageData.active ?? false,
      });
    } catch {
      setActionMsg("Failed to load backstage state");
    } finally {
      setLoading(false);
    }
  }

  async function activateProduction() {
    setActionMsg(null);
    try {
      const res = await fetch("/api/live/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate", venueSlug }),
      });
      if (!res.ok) throw new Error("Failed");
      setActionMsg("Production activated. Stage is now live.");
      await loadBackstage();
    } catch {
      setActionMsg("Failed to activate production.");
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "56px 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ marginBottom: 8 }}>
          <Link href="/live" style={{ color: "#666", textDecoration: "none", fontSize: 13 }}>{"<- Live Hub"}</Link>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, marginBottom: 8 }}>Backstage Operations</h1>
        <p style={{ color: "#999", fontSize: 14 }}>Crew management, production state, alerts, and show control.</p>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
          <select value={venueSlug} onChange={(e) => setVenueSlug(e.target.value)}
            style={{ background: "#0d0d1f", border: "1px solid #333", borderRadius: 8, color: "#fff", padding: "8px 14px", fontSize: 14 }}>
            {["main-stage","cypher-room","battle-zone","concert-hall"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          {state && (
            <span style={{ fontSize: 13, color: state.productionActive ? "#00FF88" : "#aaa" }}>
              Production: {state.productionActive ? "ACTIVE" : "OFFLINE"}
            </span>
          )}
          <button onClick={activateProduction}
            style={{ marginLeft: "auto", background: "#AA2DFF", color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            Activate Production
          </button>
        </div>

        {actionMsg && <p style={{ color: "#00FF88", fontSize: 13, marginBottom: 16 }}>{actionMsg}</p>}
        {loading && <p style={{ color: "#666" }}>Loading backstage...</p>}

        {state && !loading && (
          <>
            {state.alerts.filter((a) => !a.acknowledged).length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", color: "#ff4444", marginBottom: 12 }}>ACTIVE ALERTS</h2>
                {state.alerts.filter((a) => !a.acknowledged).map((alert) => (
                  <div key={alert.id} style={{ background: `${SEVERITY_COLOR[alert.severity]}11`, border: `1px solid ${SEVERITY_COLOR[alert.severity]}44`, borderRadius: 8, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: SEVERITY_COLOR[alert.severity], fontWeight: 800, fontSize: 11 }}>{alert.severity.toUpperCase()}</span>
                    <span style={{ flex: 1, fontSize: 13 }}>{alert.message}</span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <h2 style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", color: "#aaa", marginBottom: 14 }}>CREW ON DUTY</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
                {state.crew.map((crew) => (
                  <div key={crew.id} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${crew.onDuty ? "#00FF8833" : "#33333399"}`, borderRadius: 10, padding: "16px 20px" }}>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{crew.name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{crew.role} — {crew.stationId}</div>
                    <div style={{ marginTop: 8, fontSize: 11, color: crew.onDuty ? "#00FF88" : "#555" }}>{crew.onDuty ? "ON DUTY" : "OFF"}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
