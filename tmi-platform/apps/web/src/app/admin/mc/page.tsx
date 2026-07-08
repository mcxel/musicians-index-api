"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── style constants ──────────────────────────────────────────────────────

const BG = "#050510";
const GOLD = "#FFD700";
const CYAN = "#00C8FF";
const FUCHSIA = "#FF2DAA";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const RED = "#ef4444";
const BLUE = "#3b82f6";

const panel: React.CSSProperties = {
  background: "rgba(8,3,22,0.97)",
  border: "1px solid rgba(0,180,255,0.2)",
  borderRadius: 8,
  overflow: "hidden",
};

const panelHead = (color = CYAN): React.CSSProperties => ({
  background: `linear-gradient(90deg,rgba(0,30,50,0.95) 0%,rgba(5,5,20,0.8) 100%)`,
  borderBottom: `1px solid ${color}22`,
  padding: "6px 12px",
  display: "flex",
  alignItems: "center",
  gap: 8,
});

const pTitle = (color = CYAN): React.CSSProperties => ({
  margin: 0,
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: "0.18em",
  color,
  textTransform: "uppercase",
});

const btn = (color: string, bg = "transparent"): React.CSSProperties => ({
  border: `1px solid ${color}55`,
  borderRadius: 6,
  background: bg || `${color}12`,
  color,
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  padding: "5px 10px",
  cursor: "pointer",
  whiteSpace: "nowrap",
});

// ─── types ────────────────────────────────────────────────────────────────

type Escalation = {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved";
  assignee: string;
  openedAt: string;
};

type Incident = {
  id: string;
  title: string;
  status: "open" | "mitigating" | "resolved";
  systems: string[];
  openedAt: string;
};

type StaffMember = {
  name: string;
  role: string;
  status: "active" | "break" | "offline";
  queue: number;
};

type SLARow = {
  category: string;
  target: string;
  current: string;
  status: "green" | "amber" | "red";
};

// ─── mock honest state (no fake data — empty states when no real data) ────

const STAFF_ROSTER: StaffMember[] = []; // Real data from DB — empty until populated

const SLA_TARGETS: SLARow[] = [
  { category: "Support Response",    target: "< 24h",  current: "–",  status: "amber" },
  { category: "Abuse Report Action", target: "< 4h",   current: "–",  status: "amber" },
  { category: "Deploy Certification",target: "< 48h",  current: "–",  status: "amber" },
  { category: "Incident Resolution", target: "< 2h",   current: "–",  status: "amber" },
  { category: "Payout Approval",     target: "< 8h",   current: "–",  status: "amber" },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: RED,
  high:     FUCHSIA,
  medium:   AMBER,
  low:      CYAN,
};

function SeverityChip({ severity }: { severity: string }) {
  const color = SEVERITY_COLOR[severity] ?? CYAN;
  return (
    <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", color, border: `1px solid ${color}44`, borderRadius: 3, padding: "1px 5px", textTransform: "uppercase" }}>
      {severity}
    </span>
  );
}

function StatusDot({ status }: { status: "active" | "break" | "offline" | "open" | "in_progress" | "resolved" | "mitigating" | string }) {
  const color = status === "active" || status === "resolved" ? GREEN
    : status === "in_progress" || status === "mitigating" || status === "break" ? AMBER
    : RED;
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />;
}

// ─── component ────────────────────────────────────────────────────────────

export default function MCOperationsHQ() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [actionLog, setActionLog] = useState<{ ts: string; text: string }[]>([]);
  const [newEsc, setNewEsc] = useState("");
  const [newInc, setNewInc] = useState("");

  const refresh = useCallback(async () => {
    try {
      const obsRes = await fetch("/api/admin/observatory-summary").then(r => r.json()).catch(() => null);
      if (obsRes?.liveSessionCount !== undefined) setLiveCount(obsRes.liveSessionCount);
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 20_000);
    return () => clearInterval(id);
  }, [refresh]);

  function log(text: string) {
    setActionLog(prev => [{ ts: new Date().toLocaleTimeString(), text }, ...prev.slice(0, 29)]);
  }

  function createEscalation() {
    if (!newEsc.trim()) return;
    const esc: Escalation = {
      id:       `ESC-${Date.now()}`,
      title:    newEsc.trim(),
      severity: "medium",
      status:   "open",
      assignee: "MC",
      openedAt: new Date().toISOString(),
    };
    setEscalations(prev => [esc, ...prev]);
    log(`Escalation created: ${esc.id} — ${esc.title}`);
    setNewEsc("");
  }

  function resolveEscalation(id: string) {
    setEscalations(prev => prev.map(e => e.id === id ? { ...e, status: "resolved" as const } : e));
    log(`Escalation resolved: ${id}`);
  }

  function createIncident() {
    if (!newInc.trim()) return;
    const inc: Incident = {
      id:       `INC-${Date.now()}`,
      title:    newInc.trim(),
      status:   "open",
      systems:  ["TMI Platform"],
      openedAt: new Date().toISOString(),
    };
    setIncidents(prev => [inc, ...prev]);
    log(`Incident opened: ${inc.id} — ${inc.title}`);
    setNewInc("");
  }

  function mitigateIncident(id: string) {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: "mitigating" as const } : i));
    log(`Incident mitigating: ${id}`);
  }

  function closeIncident(id: string) {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: "resolved" as const } : i));
    log(`Incident closed: ${id}`);
  }

  const openEscalations = escalations.filter(e => e.status !== "resolved").length;
  const openIncidents   = incidents.filter(i => i.status !== "resolved").length;

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "system-ui, sans-serif" }}>

      {/* ── TOP BAR ── */}
      <div style={{ background: "rgba(0,20,40,0.95)", borderBottom: `1px solid ${CYAN}22`, padding: "8px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/admin/big-ace" style={{ color: GOLD, fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", textDecoration: "none", textTransform: "uppercase" }}>
          ← Big Ace
        </Link>
        <div style={{ width: 1, height: 16, background: `${CYAN}30` }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: CYAN, textTransform: "uppercase" }}>MC  OPERATIONS HQ</span>
          <span style={{ marginLeft: 10, fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>Michael Charlie · Operations Director</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
          {liveCount !== null && (
            <span style={{ color: FUCHSIA, fontWeight: 700 }}>
              <span style={{ fontSize: 8, marginRight: 4 }}>🔴</span>{liveCount} LIVE
            </span>
          )}
          {openEscalations > 0 && <span style={{ color: RED, fontWeight: 700 }}>{openEscalations} OPEN ESC</span>}
          {openIncidents   > 0 && <span style={{ color: RED, fontWeight: 700 }}>{openIncidents} OPEN INC</span>}
        </div>
        <button type="button" onClick={() => { setBroadcastActive(v => !v); log(broadcastActive ? "Broadcast stopped" : "Broadcast started"); }} style={btn(broadcastActive ? GREEN : AMBER, broadcastActive ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)")}>
          {broadcastActive ? "🎙 BROADCASTING" : "Start Broadcast"}
        </button>
        <Link href="/admin/observatory" style={{ ...btn(CYAN), textDecoration: "none" }}>Observatory ↗</Link>
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "minmax(200px,220px) 1fr minmax(200px,230px)", gap: 10, alignItems: "start" }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "grid", gap: 10 }}>

          {/* Broadcast Control */}
          <div style={panel}>
            <div style={panelHead(FUCHSIA)}><p style={pTitle(FUCHSIA)}>Broadcast Control</p></div>
            <div style={{ padding: 10, display: "grid", gap: 6 }}>
              {[
                { label: "Start Session",    active: broadcastActive },
                { label: "Switch Camera",    active: false },
                { label: "Mute All",         active: false },
                { label: "Lower Graphics",   active: false },
                { label: "Roll Intro Reel",  active: false },
                { label: "End Broadcast",    active: false },
              ].map(c => (
                <button key={c.label} type="button"
                  onClick={() => log(`Broadcast: ${c.label}`)}
                  style={{ ...btn(c.active ? GREEN : CYAN), textAlign: "left", width: "100%" }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Staff Roster */}
          <div style={panel}>
            <div style={panelHead()}><p style={pTitle()}>Staff Roster</p></div>
            <div style={{ padding: "6px 10px" }}>
              {STAFF_ROSTER.length === 0
                ? <p style={{ margin: "6px 0", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>No staff seeded yet. Run seed:qa and assign staff roles.</p>
                : STAFF_ROSTER.map(s => (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <StatusDot status={s.status} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: "#f1f5f9" }}>{s.name}</div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.38)" }}>{s.role} · Queue: {s.queue}</div>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* MC Navigation */}
          <div style={panel}>
            <div style={panelHead()}><p style={pTitle()}>MC Navigation</p></div>
            <div style={{ padding: "8px 10px", display: "grid", gap: 4 }}>
              {[
                { href: "/admin/mc/authority",    label: "Authority Decisions" },
                { href: "/admin/conductor",       label: "Conductor" },
                { href: "/admin/conductor/tasks", label: "Task Queue" },
                { href: "/admin/conductor/escalations", label: "Escalations" },
                { href: "/admin/bots/governance", label: "Bot Governance" },
                { href: "/admin/moderation-queue",label: "Moderation Queue" },
                { href: "/admin/errors",          label: "Error Console" },
                { href: "/admin/live-feed",       label: "Live Feed" },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ color: CYAN, fontSize: 10, textDecoration: "none", padding: "3px 0", borderBottom: "1px solid rgba(0,200,255,0.08)", display: "block" }}>
                  {l.label} ↗
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── CENTER COLUMN ── */}
        <div style={{ display: "grid", gap: 10 }}>

          {/* SLA Tracker */}
          <div style={panel}>
            <div style={panelHead(GOLD)}><p style={pTitle(GOLD)}>SLA Tracker</p></div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${GOLD}22` }}>
                    {["Category", "Target", "Current", "Status"].map(h => (
                      <th key={h} style={{ padding: "6px 12px", textAlign: "left", color: "rgba(255,255,255,0.4)", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SLA_TARGETS.map(r => (
                    <tr key={r.category} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "7px 12px", color: "#f1f5f9" }}>{r.category}</td>
                      <td style={{ padding: "7px 12px", color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>{r.target}</td>
                      <td style={{ padding: "7px 12px", color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>{r.current}</td>
                      <td style={{ padding: "7px 12px" }}>
                        <span style={{ fontSize: 8, fontWeight: 900, color: r.status === "green" ? GREEN : r.status === "amber" ? AMBER : RED }}>
                          {r.status === "green" ? "✓ OK" : r.status === "amber" ? "⚠ NO DATA" : "✗ BREACH"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Escalation Queue */}
          <div style={panel}>
            <div style={panelHead(FUCHSIA)}>
              <p style={pTitle(FUCHSIA)}>Escalation Queue</p>
              <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 900, color: openEscalations > 0 ? RED : GREEN }}>
                {openEscalations} open
              </span>
            </div>
            <div style={{ padding: 10 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <input
                  value={newEsc}
                  onChange={e => setNewEsc(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createEscalation()}
                  placeholder="New escalation title…"
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 5, color: "#fff", fontSize: 10, padding: "5px 8px", outline: "none" }}
                />
                <button type="button" onClick={createEscalation} style={btn(FUCHSIA)}>+ Add</button>
              </div>
              {escalations.length === 0
                ? <p style={{ margin: "8px 0", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>No escalations. Add one above when an issue needs tracking.</p>
                : escalations.map(e => (
                    <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", opacity: e.status === "resolved" ? 0.45 : 1 }}>
                      <StatusDot status={e.status} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: "#f1f5f9" }}>{e.title}</div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
                          {e.id} · {e.assignee} · {new Date(e.openedAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <SeverityChip severity={e.severity} />
                      {e.status !== "resolved" && (
                        <button type="button" onClick={() => resolveEscalation(e.id)} style={btn(GREEN)}>Resolve</button>
                      )}
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Incident Feed */}
          <div style={panel}>
            <div style={panelHead(RED)}>
              <p style={pTitle(RED)}>Incident Feed</p>
              <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 900, color: openIncidents > 0 ? RED : GREEN }}>
                {openIncidents} open
              </span>
            </div>
            <div style={{ padding: 10 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <input
                  value={newInc}
                  onChange={e => setNewInc(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createIncident()}
                  placeholder="New incident title…"
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 5, color: "#fff", fontSize: 10, padding: "5px 8px", outline: "none" }}
                />
                <button type="button" onClick={createIncident} style={btn(RED)}>+ Open</button>
              </div>
              {incidents.length === 0
                ? <p style={{ margin: "8px 0", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>No incidents. Open one above when a production issue is detected.</p>
                : incidents.map(i => (
                    <div key={i.id} style={{ padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", opacity: i.status === "resolved" ? 0.45 : 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <StatusDot status={i.status} />
                        <span style={{ flex: 1, fontSize: 10, color: "#f1f5f9" }}>{i.title}</span>
                        <span style={{ fontSize: 8, fontWeight: 900, color: i.status === "resolved" ? GREEN : i.status === "mitigating" ? AMBER : RED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          {i.status}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 5, paddingLeft: 15 }}>
                        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>{i.id} · {new Date(i.openedAt).toLocaleTimeString()}</span>
                        {i.status === "open" && (
                          <button type="button" onClick={() => mitigateIncident(i.id)} style={btn(AMBER)}>Mitigate</button>
                        )}
                        {i.status !== "resolved" && (
                          <button type="button" onClick={() => closeIncident(i.id)} style={btn(GREEN)}>Close</button>
                        )}
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: "grid", gap: 10 }}>

          {/* Certification Sign-Off */}
          <div style={panel}>
            <div style={panelHead(GOLD)}><p style={pTitle(GOLD)}>Certification Sign-Off</p></div>
            <div style={{ padding: 10, display: "grid", gap: 6 }}>
              <p style={{ margin: "0 0 6px", fontSize: 9, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                MC must verify each gate before Big Ace can approve deployment.
              </p>
              {[
                { label: "P0 Runtime",       done: false },
                { label: "P0 Media",         done: false },
                { label: "P0 User Flows",    done: false },
                { label: "P0 Monetization",  done: false },
                { label: "P0 Discovery",     done: false },
                { label: "P0 Performance",   done: false },
              ].map(g => (
                <div key={g.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 9, color: g.done ? GREEN : AMBER }}>
                    {g.done ? "✓" : "○"}
                  </span>
                  <span style={{ fontSize: 10, color: g.done ? GREEN : "rgba(255,255,255,0.6)" }}>{g.label}</span>
                  {g.done
                    ? <span style={{ marginLeft: "auto", fontSize: 8, color: GREEN }}>PASS</span>
                    : <span style={{ marginLeft: "auto", fontSize: 8, color: AMBER }}>PENDING</span>
                  }
                </div>
              ))}
              <button type="button" onClick={() => log("MC sign-off submitted to Big Ace")}
                style={{ ...btn(GOLD, "rgba(255,215,0,0.1)"), marginTop: 4, width: "100%", textAlign: "center" }}>
                Submit Sign-Off to Big Ace
              </button>
            </div>
          </div>

          {/* Queue Management */}
          <div style={panel}>
            <div style={panelHead()}><p style={pTitle()}>Queue Management</p></div>
            <div style={{ padding: 10, display: "grid", gap: 5 }}>
              {[
                { label: "Support Tickets",   count: 0 },
                { label: "Abuse Reports",     count: 0 },
                { label: "Moderation Queue",  count: 0 },
                { label: "Pending Approvals", count: 0 },
                { label: "Flagged Content",   count: 0 },
                { label: "Bot Directives",    count: 0 },
              ].map(q => (
                <div key={q.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid rgba(0,200,255,0.08)" }}>
                  <span style={{ fontSize: 10, color: "#e2e8f0" }}>{q.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 900, color: q.count > 0 ? RED : GREEN, fontVariantNumeric: "tabular-nums" }}>
                    {q.count === 0 ? "Clear" : q.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Log */}
          <div style={panel}>
            <div style={panelHead(BLUE)}><p style={pTitle(BLUE)}>MC Action Log</p></div>
            <div style={{ padding: "6px 10px", maxHeight: 200, overflowY: "auto" }}>
              {actionLog.length === 0
                ? <p style={{ margin: "6px 0", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>No actions logged this session.</p>
                : actionLog.map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: 8, color: GOLD, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{a.ts}</span>
                      <span style={{ fontSize: 9, color: "#e2e8f0" }}>{a.text}</span>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Escalate to Big Ace */}
          <div style={{ ...panel, borderColor: `${GOLD}33` }}>
            <div style={{ ...panelHead(GOLD), background: "rgba(30,20,0,0.9)", borderBottom: `1px solid ${GOLD}22` }}>
              <p style={pTitle(GOLD)}>Escalate to Big Ace</p>
            </div>
            <div style={{ padding: 10 }}>
              <p style={{ margin: "0 0 8px", fontSize: 9, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                Escalate when an issue exceeds MC authority: revenue disputes, deploy blocks, emergency freeze, legal.
              </p>
              <Link href="/admin/big-ace" style={{ ...btn(GOLD, "rgba(255,215,0,0.1)"), textDecoration: "none", display: "inline-block" }}>
                Contact Big Ace →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
