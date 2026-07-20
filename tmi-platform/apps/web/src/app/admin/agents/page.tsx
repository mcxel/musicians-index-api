"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

/**
 * Real AI Agent Registry — Big Ace, Michael Charlie, department leads, and
 * bots, each with real persisted directives/objectives/achievements/
 * checkpoints (2026-07-20). Not a mockup: seed button hits the real
 * idempotent seed endpoint, everything shown is queried from the database.
 */

interface Directive { id: string; kind: string; text: string; }
interface Objective { id: string; title: string; description: string | null; status: string; }
interface Achievement { id: string; title: string; description: string | null; earnedAt: string; }
interface Checkpoint { id: string; note: string; createdAt: string; }
interface AgentRow {
  id: string; name: string; role: string; department: string | null; reportsToId: string | null;
  directives: Directive[]; objectives: Objective[]; achievements: Achievement[]; checkpoints: Checkpoint[];
}

const ROLE_COLOR: Record<string, string> = {
  "big-ace": "#FF2DAA", mc: "#38bdf8", "department-lead": "#FFD700", bot: "rgba(255,255,255,0.5)",
};

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["big-ace", "mc-michael-charlie"]));

  const load = useCallback(() => {
    fetch("/api/admin/agents", { credentials: "include", cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 403 ? "Admin/staff session required" : `HTTP ${r.status}`);
        return r.json();
      })
      .then((d: { agents: AgentRow[] }) => setAgents(d.agents))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const seed = async () => {
    setSeeding(true);
    try {
      await fetch("/api/admin/agents", { method: "POST", credentials: "include" });
      load();
    } finally {
      setSeeding(false);
    }
  };

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const executives = agents.filter((a) => a.role === "big-ace" || a.role === "mc");
  const leads = agents.filter((a) => a.role === "department-lead");
  const bots = agents.filter((a) => a.role === "bot");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>← Admin</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800 }}>AI AGENT REGISTRY</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: "4px 0 0" }}>Org Chart</h1>
          </div>
          <button onClick={seed} disabled={seeding} style={{ padding: "10px 18px", fontSize: 10, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", cursor: "pointer" }}>
            {seeding ? "SEEDING…" : "SEED / SYNC REGISTRY"}
          </button>
        </div>

        {error && <div style={{ padding: "14px 18px", background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.25)", borderRadius: 10, color: "#FF8A8A", fontSize: 12, marginBottom: 20 }}>{error}</div>}
        {loading && <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Loading…</div>}

        {!loading && !error && agents.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
            Registry is empty. Click "Seed / Sync Registry" to populate Big Ace, Michael Charlie, department leads, and bots.
          </div>
        )}

        {([["EXECUTIVE", executives], ["DEPARTMENT LEADS", leads], ["BOTS", bots]] as const).map(([label, rows]) => {
          if (rows.length === 0) return null;
          return (
            <div key={label} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 10 }}>{label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rows.map((agent) => {
                  const color = ROLE_COLOR[agent.role] ?? "#fff";
                  const isOpen = expanded.has(agent.id);
                  const activeObjectives = agent.objectives.filter((o) => o.status === "active");
                  return (
                    <div key={agent.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${color}25`, borderRadius: 12, padding: "14px 18px" }}>
                      <div onClick={() => toggle(agent.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{agent.name}</div>
                          <div style={{ fontSize: 9, color, marginTop: 2 }}>
                            {agent.role.toUpperCase()} {agent.department ? `· ${agent.department}` : ""} {agent.reportsToId ? `· reports to ${agent.reportsToId}` : ""}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 14, fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                          <span>{agent.directives.length} directives</span>
                          <span>{activeObjectives.length} active goals</span>
                          <span>{agent.achievements.length} achievements</span>
                          <span>{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </div>

                      {isOpen && (
                        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
                          <div>
                            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", marginBottom: 6, fontWeight: 800 }}>DIRECTIVES</div>
                            {agent.directives.map((d) => (
                              <div key={d.id} style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 4, display: "flex", gap: 6 }}>
                                <span style={{ fontSize: 8, fontWeight: 900, color: d.kind === "core" ? "#FF4444" : "#00FF88", flexShrink: 0 }}>{d.kind === "core" ? "CORE" : "OPS"}</span>
                                {d.text}
                              </div>
                            ))}
                          </div>
                          {agent.objectives.length > 0 && (
                            <div>
                              <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", marginBottom: 6, fontWeight: 800 }}>OBJECTIVES / GOALS / TASKS</div>
                              {agent.objectives.map((o) => (
                                <div key={o.id} style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
                                  <span style={{ color: o.status === "completed" ? "#00FF88" : "#FFD700", fontWeight: 800, fontSize: 8, marginRight: 6 }}>{o.status.toUpperCase()}</span>
                                  {o.title}
                                </div>
                              ))}
                            </div>
                          )}
                          {agent.achievements.length > 0 && (
                            <div>
                              <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", marginBottom: 6, fontWeight: 800 }}>ACHIEVEMENTS</div>
                              {agent.achievements.map((a) => (
                                <div key={a.id} style={{ fontSize: 11, color: "#FFD700", marginBottom: 4 }}>🏆 {a.title}</div>
                              ))}
                            </div>
                          )}
                          {agent.checkpoints.length > 0 && (
                            <div>
                              <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", marginBottom: 6, fontWeight: 800 }}>RECENT CHECKPOINTS</div>
                              {agent.checkpoints.map((c) => (
                                <div key={c.id} style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 3 }}>
                                  {new Date(c.createdAt).toLocaleString()} — {c.note}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
