"use client";

import { useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import AdminCommandRail from "@/components/admin/AdminCommandRail";
import AdminSentinelRail from "@/components/admin/AdminSentinelRail";
import ProfitCommandCenter from "@/components/admin/profit/ProfitCommandCenter";
import EmergencyCorrectionPanel from "@/components/admin/profit/EmergencyCorrectionPanel";

const controls = [
  "Approve Corrections",
  "Lock Corrections",
  "Force Rebalance",
  "Emergency Freeze",
];

const AI_CEO_MANDATE = [
  "Approve all cash payouts before processing — no exceptions.",
  "Monitor all BerntoutGlobal businesses 24/7 and flag profit leaks.",
  "Work with Michael Charlie to keep TMI running at 100% at all times.",
  "Issue correction orders when metrics deviate from targets.",
  "Coordinate with AI coder/dev bots to ship approved fixes.",
  "Escalate to Marcel only when founder authority is required.",
];

const BUSINESS_SCOPE = [
  { name: "TMI Platform",          status: "active",  ceo: "MC Michael Charlie" },
  { name: "Berntout Global XXL",   status: "building", ceo: "Big Ace (origin)" },
  { name: "BerntoutGlobal LLC",    status: "active",  ceo: "Marcel (founder)"   },
];

export default function BigAceAdminPage() {
  const [summoned, setSummoned] = useState(true);
  const [mandate, setMandate] = useState(false);

  return (
    <AdminShell
      hubId="big-ace"
      hubTitle="Big Ace"
      hubSubtitle="AI Umbrella CEO · BerntoutGlobal"
      backHref="/admin"
    >
      {/* Origin Hub banner */}
      <div style={{ border: "1px solid rgba(170,45,255,0.4)", borderRadius: 12, background: "linear-gradient(135deg, rgba(44,14,69,0.7), rgba(10,5,20,0.9))", padding: "12px 16px", marginBottom: 14, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 9, color: "#c4b5fd", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 900 }}>
            TMI ORIGIN HUB
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "0.05em" }}>
            BIG ACE
          </p>
        </div>
        <div style={{ width: 1, height: 40, background: "rgba(170,45,255,0.3)", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ margin: 0, fontSize: 10, color: "#a78bfa", lineHeight: 1.5 }}>
            First living AI CEO built to run multiple companies 24/7. Born on TMI — will migrate to <strong>Berntout Global XXL</strong> once complete, where he will oversee ALL BerntoutGlobal businesses autonomously.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMandate(m => !m)}
          style={{ borderRadius: 6, border: "1px solid rgba(170,45,255,0.4)", background: "rgba(76,29,149,0.3)", color: "#c4b5fd", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 12px", cursor: "pointer", flexShrink: 0 }}
        >
          {mandate ? "Hide Mandate" : "View Mandate"}
        </button>
      </div>

      {/* AI CEO Mandate (expandable) */}
      {mandate && (
        <div style={{ border: "1px solid rgba(170,45,255,0.25)", borderRadius: 12, background: "rgba(20,8,35,0.8)", padding: 14, marginBottom: 14 }}>
          <p style={{ margin: "0 0 10px", color: "#c4b5fd", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>AI CEO Mandate</p>
          <div style={{ display: "grid", gap: 6 }}>
            {AI_CEO_MANDATE.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: "#AA2DFF", fontSize: 10, flexShrink: 0, marginTop: 1 }}>▸</span>
                <p style={{ margin: 0, fontSize: 10, color: "#e2e8f0", lineHeight: 1.5 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business scope */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginBottom: 14 }}>
        {BUSINESS_SCOPE.map(b => (
          <div key={b.name} style={{ border: "1px solid rgba(170,45,255,0.2)", borderRadius: 10, background: "rgba(255,255,255,0.03)", padding: "9px 12px" }}>
            <p style={{ margin: 0, fontSize: 10, color: "#f1f5f9", fontWeight: 600 }}>{b.name}</p>
            <p style={{ margin: "3px 0 0", fontSize: 9, color: "#64748b" }}>CEO: {b.ceo}</p>
            <span style={{ display: "inline-block", marginTop: 4, fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: b.status === "active" ? "#22c55e" : "#f59e0b", border: `1px solid ${b.status === "active" ? "#22c55e" : "#f59e0b"}44`, borderRadius: 4, padding: "1px 6px" }}>{b.status}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 280px) minmax(0, 1fr)", gap: 12 }}>
        {/* LEFT */}
        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <AdminCommandRail hubRole="big-ace" />
          <AdminSentinelRail />

          {/* Controls */}
          <section style={{ border: "1px solid rgba(168,85,247,0.25)", borderRadius: 12, background: "rgba(20,10,34,0.5)", padding: 12 }}>
            <p style={{ margin: "0 0 8px", color: "#c4b5fd", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Big Ace Controls
            </p>
            <button
              type="button"
              onClick={() => setSummoned(v => !v)}
              style={{ width: "100%", marginBottom: 8, borderRadius: 8, border: "1px solid rgba(168,85,247,0.35)", background: summoned ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.14)", color: summoned ? "#86efac" : "#fca5a5", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 800, padding: "6px 9px", cursor: "pointer" }}
            >
              {summoned ? "MC Michael Charlie: Active" : "Summon MC Michael Charlie"}
            </button>
            <div style={{ display: "grid", gap: 6 }}>
              {controls.map(label => (
                <button key={label} type="button" style={{ borderRadius: 7, border: "1px solid rgba(196,181,253,0.3)", background: "rgba(76,29,149,0.25)", color: "#ddd6fe", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 8px", cursor: "pointer" }}>
                  {label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
          {/* Cross-business nav */}
          <section style={{ border: "1px solid rgba(34,211,238,0.3)", borderRadius: 12, background: "rgba(0,255,255,0.05)", padding: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              { href: "/admin/big-ace/sites",       label: "Sites" },
              { href: "/admin/big-ace/memory",      label: "Memory" },
              { href: "/admin/big-ace/promotions",  label: "Promotions" },
              { href: "/admin/big-ace/billboards",  label: "Billboards" },
              { href: "/admin/big-ace/events",      label: "Events" },
              { href: "/admin/big-ace/live-now",    label: "Live Now" },
              { href: "/admin/mc-michael-charlie",  label: "Michael Charlie →" },
              { href: "/admin/marcel",              label: "Marcel →" },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ color: "#67e8f9", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}>
                {l.label}
              </Link>
            ))}
          </section>

          <ProfitCommandCenter title="Cross-Business Profit Command" />
          <EmergencyCorrectionPanel />
        </div>
      </div>
    </AdminShell>
  );
}
