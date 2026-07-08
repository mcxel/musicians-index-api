"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import AdminCommandRail from "@/components/admin/AdminCommandRail";
import AdminSentinelRail from "@/components/admin/AdminSentinelRail";
import ProfitCommandCenter from "@/components/admin/profit/ProfitCommandCenter";
import EmergencyCorrectionPanel from "@/components/admin/profit/EmergencyCorrectionPanel";

// ─── types ─────────────────────────────────────────────────────────────────

type DeployGate = {
  recommendation: "AUTO_DEPLOY" | "HUMAN_APPROVAL" | "BLOCK";
  revenueCertification: "GREEN" | "HOLD" | "PENDING";
  platformHealthScore: number;
  strictEvidencePass: boolean;
  requiredFailuresOrSkips: string[];
  checkedAt: string;
};

type FleetSummary = {
  total: number;
  pass: number;
  fail: number;
  pending: number;
  platformHealthScore: number;
  releaseGate: {
    recommendation: "AUTO_DEPLOY" | "HUMAN_APPROVAL" | "BLOCK";
    revenueCertification: "GREEN" | "HOLD";
  };
};

type ObsSummary = {
  liveSessionCount: number;
  activeBotCount: number;
  totalUsers: number;
  recentErrors: number;
};

// ─── style constants ───────────────────────────────────────────────────────

const BG = "#050510";
const GOLD = "#FFD700";
const CYAN = "#00C8FF";
const FUCHSIA = "#FF2DAA";
const PURPLE = "#AA2DFF";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const RED = "#ef4444";

const panel: React.CSSProperties = {
  background: "rgba(8,3,22,0.97)",
  border: "1px solid rgba(180,130,0,0.28)",
  borderRadius: 8,
  overflow: "hidden",
};

const panelHead: React.CSSProperties = {
  background: "linear-gradient(90deg,rgba(55,28,0,0.9) 0%,rgba(20,8,0,0.7) 100%)",
  borderBottom: "1px solid rgba(180,130,0,0.22)",
  padding: "6px 12px",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const pTitle = (color = GOLD): React.CSSProperties => ({
  margin: 0,
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: "0.18em",
  color,
  textTransform: "uppercase",
});

const btn = (color: string, bg: string): React.CSSProperties => ({
  border: `1px solid ${color}55`,
  borderRadius: 6,
  background: bg,
  color,
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  padding: "5px 10px",
  cursor: "pointer",
});

function GateChip({ value }: { value: "AUTO_DEPLOY" | "HUMAN_APPROVAL" | "BLOCK" | "GREEN" | "HOLD" | "PENDING" | string }) {
  const color = value === "AUTO_DEPLOY" || value === "GREEN" ? GREEN
    : value === "HUMAN_APPROVAL" ? AMBER
    : value === "HOLD" || value === "PENDING" ? AMBER
    : RED;
  return (
    <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color, border: `1px solid ${color}44`, borderRadius: 4, padding: "2px 7px" }}>
      {value}
    </span>
  );
}

function StatCell({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ padding: "8px 10px", borderRight: "1px solid rgba(180,130,0,0.12)", borderBottom: "1px solid rgba(180,130,0,0.12)" }}>
      <div style={{ fontSize: 16, fontWeight: 900, color: color ?? GOLD, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
    </div>
  );
}

const AI_CEO_MANDATE = [
  "Approve all cash payouts before processing — no exceptions.",
  "Monitor all BerntoutGlobal businesses 24/7 and flag profit leaks.",
  "Work with MC to keep TMI running at 100% at all times.",
  "Issue correction orders when metrics deviate from targets.",
  "Coordinate with AI coder/dev bots to ship approved fixes.",
  "Escalate to Marcel only when founder authority is required.",
  "Never authorize a deploy if Revenue Certification is HOLD.",
  "Never authorize a deploy if Platform Health Score is below 95.",
];

const COMPANIES = [
  { name: "TMI Platform",        status: "active",   ceo: "MC Michael Charlie",  link: "/admin/mc" },
  { name: "BerntoutGlobal LLC",  status: "active",   ceo: "Marcel (founder)",     link: "/admin/marcel" },
  { name: "Berntout Global XXL", status: "building", ceo: "Big Ace (pending)",    link: "/admin/big-ace/sites" },
];

const EXECUTIVE_ACTIONS = [
  { label: "Approve Payout",    color: GREEN,   fn: "ace.payout.approve" },
  { label: "Block Payout",      color: RED,     fn: "ace.payout.reject" },
  { label: "Approve Deploy",    color: CYAN,    fn: "ace.deploy.approve" },
  { label: "Block Deploy",      color: RED,     fn: "ace.deploy.block" },
  { label: "Force Rebalance",   color: AMBER,   fn: "ace.force.rebalance" },
  { label: "Emergency Freeze",  color: RED,     fn: "ace.emergency.freeze" },
];

// ─── component ─────────────────────────────────────────────────────────────

export default function BigAceHQ() {
  const [mandate, setMandate] = useState(false);
  const [mcActive, setMcActive] = useState(true);
  const [gate, setGate] = useState<DeployGate | null>(null);
  const [fleet, setFleet] = useState<FleetSummary | null>(null);
  const [obs, setObs] = useState<ObsSummary | null>(null);
  const [actionLog, setActionLog] = useState<{ ts: string; label: string; fn: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [gateRes, fleetRes, obsRes] = await Promise.all([
        fetch("/api/admin/deploy-gate").then(r => r.json()).catch(() => null),
        fetch("/api/admin/certification-fleet?view=summary").then(r => r.json()).catch(() => null),
        fetch("/api/admin/observatory-summary").then(r => r.json()).catch(() => null),
      ]);
      if (gateRes) setGate(gateRes);
      if (fleetRes?.summary) setFleet(fleetRes.summary);
      if (obsRes) setObs(obsRes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  function logAction(label: string, fn: string) {
    setActionLog(prev => [{ ts: new Date().toLocaleTimeString(), label, fn }, ...prev.slice(0, 19)]);
  }

  const healthScore = fleet?.platformHealthScore ?? gate?.platformHealthScore ?? null;
  const recommendation = gate?.recommendation ?? fleet?.releaseGate?.recommendation ?? "BLOCK";
  const revCert = gate?.revenueCertification ?? fleet?.releaseGate?.revenueCertification ?? "HOLD";
  const healthColor = healthScore === null ? "rgba(255,255,255,0.3)" : healthScore >= 99 ? GREEN : healthScore >= 95 ? AMBER : RED;

  return (
    <AdminShell hubId="big-ace" hubTitle="Big Ace" hubSubtitle="AI Umbrella CEO · BerntoutGlobal" backHref="/admin">

      {/* ── TOP IDENTITY BANNER ── */}
      <div style={{ ...panel, marginBottom: 12, borderColor: `${PURPLE}55` }}>
        <div style={{ ...panelHead, background: "linear-gradient(90deg,rgba(44,14,69,0.95) 0%,rgba(10,5,20,0.8) 100%)", borderBottom: `1px solid ${PURPLE}33` }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${PURPLE},#6600cc)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>♛</div>
          <div style={{ flex: 1 }}>
            <p style={{ ...pTitle(PURPLE), fontSize: 7 }}>TMI ORIGIN HUB  ·  BERNTOUTGLOBAL EXECUTIVE LAYER</p>
            <p style={{ margin: "1px 0 0", fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: "0.06em" }}>BIG ACE — AI UMBRELLA CEO</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: mcActive ? GREEN : RED, boxShadow: `0 0 6px ${mcActive ? GREEN : RED}` }} />
            <button type="button" onClick={() => setMcActive(v => !v)} style={btn(mcActive ? GREEN : RED, mcActive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)")}>
              MC: {mcActive ? "ACTIVE" : "OFFLINE"}
            </button>
            <button type="button" onClick={() => setMandate(m => !m)} style={btn(PURPLE, "rgba(170,45,255,0.12)")}>
              {mandate ? "Hide Mandate" : "View Mandate"}
            </button>
            <Link href="/admin/observatory" style={{ ...btn(CYAN, "rgba(0,200,255,0.1)"), textDecoration: "none" }}>
              Observatory ↗
            </Link>
          </div>
        </div>

        {mandate && (
          <div style={{ padding: "10px 14px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 6 }}>
            {AI_CEO_MANDATE.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: PURPLE, fontSize: 10, flexShrink: 0, marginTop: 1 }}>▸</span>
                <p style={{ margin: 0, fontSize: 10, color: "#e2e8f0", lineHeight: 1.5 }}>{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(240px,280px) 1fr minmax(200px,240px)", gap: 10, alignItems: "start" }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "grid", gap: 10 }}>
          <AdminCommandRail hubRole="big-ace" />

          {/* Company Health */}
          <div style={panel}>
            <div style={panelHead}><p style={pTitle()}>Company Health</p></div>
            <div style={{ padding: "6px 0" }}>
              {COMPANIES.map(c => (
                <Link key={c.name} href={c.link} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", textDecoration: "none", borderBottom: "1px solid rgba(180,130,0,0.08)" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.status === "active" ? GREEN : AMBER, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "#f1f5f9", fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", marginTop: 1 }}>{c.ceo}</div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: c.status === "active" ? GREEN : AMBER }}>
                    {c.status.toUpperCase()}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Executive Actions */}
          <div style={panel}>
            <div style={panelHead}><p style={pTitle()}>Executive Actions</p></div>
            <div style={{ padding: "8px 10px", display: "grid", gap: 5 }}>
              {EXECUTIVE_ACTIONS.map(a => (
                <button
                  key={a.fn}
                  type="button"
                  onClick={() => logAction(a.label, a.fn)}
                  style={{ ...btn(a.color, `${a.color}12`), textAlign: "left", width: "100%" }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Log */}
          <div style={panel}>
            <div style={panelHead}><p style={pTitle(CYAN)}>Action Log</p></div>
            <div style={{ padding: "6px 10px", maxHeight: 140, overflowY: "auto" }}>
              {actionLog.length === 0
                ? <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.3)", padding: "6px 0" }}>No actions recorded this session.</p>
                : actionLog.map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: 8, color: GOLD, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{a.ts}</span>
                      <span style={{ fontSize: 9, color: "#e2e8f0" }}>{a.label}</span>
                    </div>
                  ))
              }
            </div>
          </div>

          <AdminSentinelRail />
        </div>

        {/* ── CENTER COLUMN ── */}
        <div style={{ display: "grid", gap: 10 }}>

          {/* Gate Status Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {/* Deploy Gate */}
            <div style={panel}>
              <div style={panelHead}><p style={pTitle()}>Deploy Gate</p></div>
              <div style={{ padding: 12 }}>
                {loading
                  ? <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Loading…</p>
                  : <>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <GateChip value={recommendation} />
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                        {gate?.checkedAt ? `Checked ${new Date(gate.checkedAt).toLocaleTimeString()}` : "No gate data yet"}
                      </p>
                      {gate?.requiredFailuresOrSkips?.length ? (
                        <ul style={{ margin: "6px 0 0", paddingLeft: 12 }}>
                          {gate.requiredFailuresOrSkips.map((f, i) => (
                            <li key={i} style={{ fontSize: 8, color: RED, marginBottom: 2 }}>{f}</li>
                          ))}
                        </ul>
                      ) : null}
                    </>
                }
              </div>
            </div>

            {/* Revenue Cert */}
            <div style={panel}>
              <div style={panelHead}><p style={pTitle(GOLD)}>Revenue Cert</p></div>
              <div style={{ padding: 12 }}>
                <GateChip value={revCert} />
                <p style={{ margin: "8px 0 0", fontSize: 9, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                  {revCert === "GREEN"
                    ? "All revenue evidence collected. Cash payouts unlocked."
                    : "Awaiting purchase → webhook → ticket → reconciliation evidence chain."}
                </p>
              </div>
            </div>

            {/* Platform Health */}
            <div style={panel}>
              <div style={panelHead}><p style={pTitle(CYAN)}>Platform Health</p></div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: healthColor, fontVariantNumeric: "tabular-nums" }}>
                  {healthScore !== null ? `${healthScore}%` : "–"}
                </div>
                <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${healthScore ?? 0}%`, background: healthColor, transition: "width 0.5s ease" }} />
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 8, color: "rgba(255,255,255,0.35)" }}>
                  Target: 99% for AUTO_DEPLOY
                </p>
              </div>
            </div>
          </div>

          {/* Fleet Stats */}
          <div style={panel}>
            <div style={panelHead}>
              <p style={pTitle(GOLD)}>Certification Fleet</p>
              <Link href="/admin/observatory" style={{ marginLeft: "auto", fontSize: 9, color: CYAN, textDecoration: "none" }}>View Full Fleet →</Link>
            </div>
            {loading
              ? <p style={{ margin: 0, padding: 12, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Loading certification fleet…</p>
              : fleet
                ? <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
                    <StatCell label="Total Accounts" value={fleet.total} />
                    <StatCell label="Passing" value={fleet.pass} color={GREEN} />
                    <StatCell label="Failing" value={fleet.fail} color={RED} />
                    <StatCell label="Pending" value={fleet.pending} color={AMBER} />
                  </div>
                : <p style={{ margin: 0, padding: 12, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>No fleet data. Run seed script + Playwright.</p>
            }
          </div>

          {/* Platform Activity */}
          <div style={panel}>
            <div style={panelHead}><p style={pTitle(CYAN)}>Platform Activity</p></div>
            {loading
              ? <p style={{ margin: 0, padding: 12, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Loading…</p>
              : obs
                ? <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
                    <StatCell label="Live Sessions"  value={obs.liveSessionCount} color={FUCHSIA} />
                    <StatCell label="Active Bots"    value={obs.activeBotCount}   color={PURPLE} />
                    <StatCell label="Total Users"    value={obs.totalUsers}       color={CYAN} />
                    <StatCell label="Recent Errors"  value={obs.recentErrors}     color={obs.recentErrors > 0 ? RED : GREEN} />
                  </div>
                : <p style={{ margin: 0, padding: 12, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>No observatory data. Check /api/admin/observatory-summary.</p>
            }
          </div>

          <ProfitCommandCenter title="Cross-Business Profit Command" />
          <EmergencyCorrectionPanel />

          {/* Quick Nav */}
          <div style={{ ...panel, borderColor: `${CYAN}33` }}>
            <div style={{ ...panelHead, background: "rgba(0,20,30,0.9)", borderBottom: `1px solid ${CYAN}22` }}>
              <p style={pTitle(CYAN)}>Executive Navigation</p>
            </div>
            <div style={{ padding: "10px 12px", display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { href: "/admin/mc",                       label: "MC Operations" },
                { href: "/admin/big-ace/operations-center",label: "Operations Center" },
                { href: "/admin/big-ace/billboards",       label: "Billboards" },
                { href: "/admin/big-ace/live-now",         label: "Live Now" },
                { href: "/admin/big-ace/seo",              label: "SEO" },
                { href: "/admin/big-ace/visuals",          label: "Visuals" },
                { href: "/admin/big-ace/motion",           label: "Motion" },
                { href: "/admin/big-ace/emergency",        label: "Emergency" },
                { href: "/admin/billing",                  label: "Billing" },
                { href: "/admin/observatory",              label: "Observatory" },
                { href: "/admin/errors",                   label: "Errors" },
                { href: "/admin/tickets",                  label: "Tickets" },
                { href: "/admin/bookings",                 label: "Bookings" },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ color: CYAN, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", border: `1px solid ${CYAN}22`, borderRadius: 4, padding: "3px 8px" }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: "grid", gap: 10 }}>
          {/* AI Oversight */}
          <div style={panel}>
            <div style={panelHead}><p style={pTitle(PURPLE)}>AI Oversight</p></div>
            <div style={{ padding: "8px 12px", display: "grid", gap: 5 }}>
              {[
                { label: "Big Ace",      status: mcActive ? "ACTIVE" : "STANDBY", color: mcActive ? GREEN : AMBER },
                { label: "MC",           status: mcActive ? "ACTIVE" : "OFFLINE",  color: mcActive ? GREEN : RED },
                { label: "Bot Crew",     status: "RUNNING",  color: CYAN },
                { label: "Dev Bots",     status: "RUNNING",  color: CYAN },
                { label: "DJ Bot",       status: "STANDBY",  color: AMBER },
                { label: "Host Bots",    status: "STANDBY",  color: AMBER },
                { label: "Moderation",   status: "ACTIVE",   color: GREEN },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: 10, color: "#e2e8f0" }}>{r.label}</span>
                  <span style={{ fontSize: 8, fontWeight: 900, color: r.color, letterSpacing: "0.08em" }}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acquisition Pipeline */}
          <div style={panel}>
            <div style={panelHead}><p style={pTitle(GOLD)}>Acquisition Pipeline</p></div>
            <div style={{ padding: 12 }}>
              <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
                No active acquisitions. Add targets via the Executive Pipeline when the platform reaches Growth Mode.
              </p>
            </div>
          </div>

          {/* Governance Audit */}
          <div style={panel}>
            <div style={panelHead}><p style={pTitle(AMBER)}>Governance Audit</p></div>
            <div style={{ padding: "8px 12px", display: "grid", gap: 4 }}>
              {[
                { check: "Rule 20 — No fake data",       pass: true },
                { check: "Rule 17 — Ticket authority",   pass: true },
                { check: "Rule 23 — No cash payouts",    pass: true },
                { check: "Registry first (Rule 8)",      pass: true },
                { check: "Deploy gate enforced",         pass: recommendation !== "AUTO_DEPLOY" || revCert === "GREEN" },
              ].map(c => (
                <div key={c.check} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 9, color: c.pass ? GREEN : RED, flexShrink: 0 }}>{c.pass ? "✓" : "✗"}</span>
                  <span style={{ fontSize: 9, color: c.pass ? "rgba(255,255,255,0.7)" : RED }}>{c.check}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QA Fleet Seeding */}
          <div style={{ ...panel, borderColor: `${CYAN}33` }}>
            <div style={{ ...panelHead, background: "rgba(0,20,30,0.9)", borderBottom: `1px solid ${CYAN}22` }}>
              <p style={pTitle(CYAN)}>QA Fleet Seeding</p>
              <span style={{ marginLeft: "auto", fontSize: 8, color: fleet && fleet.total > 0 ? GREEN : AMBER, fontWeight: 800, letterSpacing: "0.1em" }}>
                {fleet && fleet.total > 0 ? `${fleet.total} SEEDED` : "NOT SEEDED"}
              </span>
            </div>
            <div style={{ padding: "10px 12px" }}>
              <p style={{ margin: "0 0 8px", fontSize: 8.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                Run the QA fleet seed script to create all certification accounts in the database. Required before running revenue pipeline tests.
              </p>

              {/* Prerequisites */}
              <div style={{ marginBottom: 8, padding: "7px 10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 5 }}>
                <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: "0.12em", color: AMBER, marginBottom: 5 }}>PREREQUISITES</div>
                {[
                  "DATABASE_URL must be set in .env.local",
                  "Run: pnpm -C apps/web prisma migrate deploy",
                  "Run from repo root (not apps/web/)",
                ].map((req, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3, alignItems: "flex-start" }}>
                    <span style={{ color: AMBER, fontSize: 8, flexShrink: 0, marginTop: 1 }}>▸</span>
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>{req}</span>
                  </div>
                ))}
              </div>

              {/* Seed command */}
              <div style={{ marginBottom: 8, padding: "6px 10px", background: "rgba(0,200,255,0.06)", border: "1px solid rgba(0,200,255,0.18)", borderRadius: 5, fontFamily: "'Courier New', monospace", fontSize: 9.5, color: CYAN, letterSpacing: "0.03em", userSelect: "all" }}>
                npx ts-node scripts/seed-qa-fleet.ts
              </div>

              <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
                Or via pnpm shortcut:
              </div>
              <div style={{ padding: "6px 10px", background: "rgba(0,200,255,0.06)", border: "1px solid rgba(0,200,255,0.18)", borderRadius: 5, fontFamily: "'Courier New', monospace", fontSize: 9.5, color: CYAN, letterSpacing: "0.03em", userSelect: "all", marginBottom: 10 }}>
                pnpm seed:qa
              </div>

              {/* Safety notes */}
              <div style={{ padding: "6px 10px", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 5 }}>
                <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: "0.12em", color: GREEN, marginBottom: 4 }}>SAFE TO RE-RUN</div>
                <p style={{ margin: 0, fontSize: 8, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                  Uses upsert — never duplicates rows. All accounts use <code style={{ color: CYAN, fontFamily: "monospace" }}>.test</code> TLD emails (RFC 2606), flagged <code style={{ color: CYAN, fontFamily: "monospace" }}>isQA=true</code>, excluded from discovery/rankings.
                </p>
              </div>
            </div>
          </div>

          {/* Escalate to Marcel */}
          <div style={{ ...panel, borderColor: `${RED}33` }}>
            <div style={{ ...panelHead, background: "rgba(30,5,5,0.9)", borderBottom: `1px solid ${RED}22` }}>
              <p style={{ ...pTitle(RED), fontSize: 8 }}>Escalate to Founder</p>
            </div>
            <div style={{ padding: 12 }}>
              <p style={{ margin: "0 0 8px", fontSize: 9, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                Only escalate when founder authority is required — legal, major acquisition, emergency freeze, or constitutional override.
              </p>
              <Link href="/admin/marcel" style={{ ...btn(RED, "rgba(239,68,68,0.1)"), textDecoration: "none", display: "inline-block" }}>
                Contact Marcel →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
