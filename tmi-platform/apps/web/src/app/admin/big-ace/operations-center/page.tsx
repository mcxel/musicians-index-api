"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Dept = {
  key: string;
  label: string;
  status: "green" | "yellow" | "red" | "unknown";
  score: number | null;
  source: string;
};

type Company = {
  id: string;
  name: string;
  departments: Dept[];
  overallScore: number | null;
  releaseRecommendation: "AUTO_DEPLOY" | "HUMAN_APPROVAL" | "BLOCK" | "N/A";
  activeIssues: Array<{ severity: "critical" | "warning"; message: string }>;
  warnings: Array<{ severity: "critical" | "warning"; message: string }>;
  kpis: Array<{ key: string; label: string; value: string }>;
  recommendedActions: string[];
};

type LeadershipLane = {
  lane: "executive" | "operations" | "specialized";
  owner: string;
  responsibilities: string[];
};

type Snapshot = {
  generatedAt: string;
  companies: Company[];
  leadership: LeadershipLane[];
};

function statusColor(status: Dept["status"]) {
  if (status === "green") return "#00FF88";
  if (status === "yellow") return "#FFD700";
  if (status === "red") return "#FF2DAA";
  return "rgba(255,255,255,0.35)";
}

export default function BigAceOperationsCenterPage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/admin/big-ace/operations-center", { cache: "no-store" });
        if (!res.ok) return;
        const body = (await res.json()) as { snapshot?: Snapshot };
        if (!cancelled && body.snapshot) setSnapshot(body.snapshot);
      } catch {
        // Keep page stable if endpoint is temporarily unavailable.
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
          <div style={{ fontSize: 9, color: "#00FFFF", letterSpacing: "0.2em", fontWeight: 900 }}>BIG ACE OPERATIONS CENTER</div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>Multi-Company Mission Control</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            {snapshot?.generatedAt ? `Updated ${new Date(snapshot.generatedAt).toLocaleString()}` : "Loading runtime snapshot..."}
          </div>
        </div>
        <Link href="/admin/big-ace" style={{ color: "#00C8FF", textDecoration: "none", fontSize: 10, letterSpacing: "0.12em" }}>
          BACK TO BIG ACE
        </Link>
      </div>

      <div style={{ border: "1px solid rgba(0,255,255,0.2)", borderRadius: 10, padding: 12, background: "rgba(0,255,255,0.04)", marginBottom: 14 }}>
        <div style={{ fontSize: 8, letterSpacing: "0.16em", color: "#00FFFF", marginBottom: 8 }}>LEADERSHIP LANES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 10 }}>
          {(snapshot?.leadership ?? []).map((lane) => (
            <div key={lane.lane} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 10, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{lane.lane}</div>
              <div style={{ fontSize: 13, fontWeight: 800, marginTop: 3 }}>{lane.owner}</div>
              <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
                {lane.responsibilities.join(" • ")}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {(snapshot?.companies ?? []).map((company) => (
          <div key={company.id} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 12, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{company.name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
                Overall: {company.overallScore === null ? "N/A" : `${company.overallScore.toFixed(1)} / 100`} · Gate: {company.releaseRecommendation}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 8 }}>
              {company.departments.map((d) => (
                <div key={`${company.id}-${d.key}`} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10 }}>{d.label}</span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: statusColor(d.status), textTransform: "uppercase" }}>{d.status}</span>
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                    Score: {d.score === null ? "N/A" : `${d.score.toFixed(1)}%`} · Source: {d.source}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, marginTop: 10 }}>
              <div style={{ border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, padding: 8, background: "rgba(0,255,255,0.04)" }}>
                <div style={{ fontSize: 8, letterSpacing: "0.14em", color: "#00FFFF", marginBottom: 6 }}>KPIS</div>
                <div style={{ display: "grid", gap: 4 }}>
                  {(company.kpis ?? []).map((kpi) => (
                    <div key={`${company.id}-${kpi.key}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                      <span style={{ color: "rgba(255,255,255,0.6)" }}>{kpi.label}</span>
                      <strong style={{ color: "#fff" }}>{kpi.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ border: "1px solid rgba(255,45,170,0.25)", borderRadius: 8, padding: 8, background: "rgba(255,45,170,0.06)" }}>
                <div style={{ fontSize: 8, letterSpacing: "0.14em", color: "#FF2DAA", marginBottom: 6 }}>ACTIVE ISSUES</div>
                <div style={{ display: "grid", gap: 4 }}>
                  {(company.activeIssues ?? []).length === 0 && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>No active critical issues</div>}
                  {(company.activeIssues ?? []).map((issue, idx) => (
                    <div key={`${company.id}-issue-${idx}`} style={{ fontSize: 10, color: "#ffd1ea" }}>
                      {issue.message}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, padding: 8, background: "rgba(255,215,0,0.07)" }}>
                <div style={{ fontSize: 8, letterSpacing: "0.14em", color: "#FFD700", marginBottom: 6 }}>WARNINGS</div>
                <div style={{ display: "grid", gap: 4 }}>
                  {(company.warnings ?? []).length === 0 && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>No warning-level issues</div>}
                  {(company.warnings ?? []).map((issue, idx) => (
                    <div key={`${company.id}-warn-${idx}`} style={{ fontSize: 10, color: "#fef3c7" }}>
                      {issue.message}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, padding: 8, background: "rgba(0,255,136,0.05)" }}>
                <div style={{ fontSize: 8, letterSpacing: "0.14em", color: "#00FF88", marginBottom: 6 }}>RECOMMENDED ACTIONS</div>
                <div style={{ display: "grid", gap: 4 }}>
                  {(company.recommendedActions ?? []).length === 0 && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>No actions queued</div>}
                  {(company.recommendedActions ?? []).map((action, idx) => (
                    <div key={`${company.id}-action-${idx}`} style={{ fontSize: 10, color: "#bbf7d0" }}>
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
