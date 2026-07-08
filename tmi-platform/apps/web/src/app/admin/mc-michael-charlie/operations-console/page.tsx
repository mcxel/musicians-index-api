"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type QueueItem = {
  id: string;
  lane: "operations" | "moderation" | "support" | "broadcast" | "incident";
  priority: "critical" | "high" | "medium";
  title: string;
  owner: string;
  dueInMinutes: number;
};

type Snapshot = {
  generatedAt: string;
  queue: QueueItem[];
  escalations: number;
  moderatorAssignments: number;
  supportBacklog: number;
  staffWorkloadPct: number;
  slaAtRisk: number;
  incidentsOpen: number;
  broadcast: {
    liveHealthScore: number;
    reconnectRisk: "low" | "medium" | "high";
    nextWindow: string;
  };
  certification: {
    dailyStatus: "GREEN" | "YELLOW" | "RED";
    pass: number;
    fail: number;
    pending: number;
  };
};

function priorityColor(priority: QueueItem["priority"]) {
  if (priority === "critical") return "#FF2DAA";
  if (priority === "high") return "#FFD700";
  return "#00C8FF";
}

export default function MCOperationsConsolePage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/admin/mc/operations-console", { cache: "no-store" });
        if (!res.ok) return;
        const body = (await res.json()) as { snapshot?: Snapshot };
        if (!cancelled && body.snapshot) setSnapshot(body.snapshot);
      } catch {
        // Keep dashboard stable during transient failures.
      }
    };

    void load();
    const id = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "24px clamp(16px,4vw,40px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 9, color: "#FFD700", letterSpacing: "0.2em", fontWeight: 900 }}>MC OPERATIONS CONSOLE</div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>COO Runtime Dashboard</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            {snapshot?.generatedAt ? `Updated ${new Date(snapshot.generatedAt).toLocaleString()}` : "Loading operations state..."}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin/mc-michael-charlie" style={{ color: "#67e8f9", textDecoration: "none", fontSize: 10, letterSpacing: "0.12em" }}>
            MC HUB
          </Link>
          <Link href="/admin/big-ace/operations-center" style={{ color: "#c4b5fd", textDecoration: "none", fontSize: 10, letterSpacing: "0.12em" }}>
            BIG ACE VIEW
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Escalations", value: snapshot?.escalations ?? 0, color: "#FF2DAA" },
          { label: "Moderator Assignments", value: snapshot?.moderatorAssignments ?? 0, color: "#00C8FF" },
          { label: "Support Backlog", value: snapshot?.supportBacklog ?? 0, color: "#FFD700" },
          { label: "Staff Workload", value: `${snapshot?.staffWorkloadPct ?? 0}%`, color: "#00FF88" },
          { label: "SLA At Risk", value: snapshot?.slaAtRisk ?? 0, color: "#FF6B00" },
          { label: "Incidents Open", value: snapshot?.incidentsOpen ?? 0, color: "#FF2DAA" },
          { label: "Certification", value: snapshot?.certification.dailyStatus ?? "YELLOW", color: snapshot?.certification.dailyStatus === "GREEN" ? "#00FF88" : snapshot?.certification.dailyStatus === "YELLOW" ? "#FFD700" : "#FF2DAA" },
        ].map((kpi) => (
          <div key={kpi.label} style={{ border: `1px solid ${kpi.color}33`, borderRadius: 10, background: "rgba(255,255,255,0.03)", padding: "10px 12px" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em" }}>{kpi.label.toUpperCase()}</div>
            <div style={{ marginTop: 4, fontSize: 20, fontWeight: 900, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div style={{ border: "1px solid rgba(0,255,255,0.2)", borderRadius: 10, padding: 12, marginBottom: 14, background: "rgba(0,255,255,0.04)" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.16em", color: "#00FFFF", marginBottom: 8 }}>BROADCAST SCHEDULING + HEALTH</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8, fontSize: 11 }}>
          <div>Live Health Score: <strong>{snapshot?.broadcast.liveHealthScore.toFixed(1) ?? "0.0"}%</strong></div>
          <div>Reconnect Risk: <strong>{snapshot?.broadcast.reconnectRisk ?? "unknown"}</strong></div>
          <div>Next Window: <strong>{snapshot?.broadcast.nextWindow ? new Date(snapshot.broadcast.nextWindow).toLocaleString() : "N/A"}</strong></div>
          <div>Daily Cert: <strong>{snapshot?.certification.pass ?? 0} pass / {snapshot?.certification.fail ?? 0} fail / {snapshot?.certification.pending ?? 0} pending</strong></div>
        </div>
      </div>

      <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 12, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.16em", color: "#FFD700", marginBottom: 8 }}>OPERATIONS QUEUE</div>
        <div style={{ display: "grid", gap: 8 }}>
          {(snapshot?.queue ?? []).map((item) => (
            <div key={item.id} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 12px", background: "rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{item.title}</div>
                <div style={{ fontSize: 9, color: priorityColor(item.priority), textTransform: "uppercase", fontWeight: 800 }}>{item.priority}</div>
              </div>
              <div style={{ marginTop: 5, fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
                Lane: {item.lane} · Owner: {item.owner} · Due in {item.dueInMinutes}m
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
