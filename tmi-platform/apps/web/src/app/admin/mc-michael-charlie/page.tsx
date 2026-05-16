"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import AdminCommandRail from "@/components/admin/AdminCommandRail";
import ProfitCommandCenter from "@/components/admin/profit/ProfitCommandCenter";
import MarginMonitor from "@/components/admin/profit/MarginMonitor";
import ProfitLeakScanner from "@/components/admin/profit/ProfitLeakScanner";
import RevenueCorrectionRail from "@/components/admin/profit/RevenueCorrectionRail";
import AdEfficiencyRail from "@/components/admin/profit/AdEfficiencyRail";
import BookingProfitRail from "@/components/admin/profit/BookingProfitRail";
import MerchVelocityRail from "@/components/admin/profit/MerchVelocityRail";
import PrizeCostRail from "@/components/admin/profit/PrizeCostRail";
import SponsorROITracker from "@/components/admin/profit/SponsorROITracker";
import VenueYieldRail from "@/components/admin/profit/VenueYieldRail";
import EmergencyCorrectionPanel from "@/components/admin/profit/EmergencyCorrectionPanel";

type Recommendation = {
  id: string;
  category: string;
  issue: string;
  fix: string;
  impact: string;
  severity: "critical" | "high" | "medium";
  approved: boolean | null;
};

const SEED_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "r1",
    category: "Tickets",
    issue: "VIP tier underpriced vs demand curve",
    fix: "Raise VIP floor by $15 across 3 active venues",
    impact: "+$9,200 projected monthly",
    severity: "high",
    approved: null,
  },
  {
    id: "r2",
    category: "Ads",
    issue: "Billboard slot CPM 40% below market rate",
    fix: "Reprice 4 billboard slots — apply 1.4× multiplier",
    impact: "+$4,800 projected monthly",
    severity: "high",
    approved: null,
  },
  {
    id: "r3",
    category: "Merch",
    issue: "3 SKUs showing <2% conversion over 30 days",
    fix: "Bundle low-conv SKUs into fan club reward drops",
    impact: "Recover $1,200 dead stock cost",
    severity: "medium",
    approved: null,
  },
  {
    id: "r4",
    category: "Sponsors",
    issue: "2 sponsor contracts expiring with no renewal offer",
    fix: "Auto-send renewal deck to Crown Stage + SoundBridge",
    impact: "$18,000 at risk",
    severity: "critical",
    approved: null,
  },
  {
    id: "r5",
    category: "Booking",
    issue: "7 venue slots unfilled for next 14 days",
    fix: "Open last-minute artist application window",
    impact: "+$6,400 potential fill revenue",
    severity: "medium",
    approved: null,
  },
];

const SEVERITY_STYLE: Record<string, { border: string; bg: string; label: string }> = {
  critical: { border: "rgba(239,68,68,0.55)",  bg: "rgba(69,10,10,0.45)",  label: "#fca5a5" },
  high:     { border: "rgba(251,191,36,0.5)",  bg: "rgba(69,39,5,0.45)",   label: "#fde68a" },
  medium:   { border: "rgba(168,85,247,0.45)", bg: "rgba(44,14,69,0.45)",  label: "#c4b5fd" },
};

export default function MCMichaelCharlieHubPage() {
  const [recs, setRecs] = useState<Recommendation[]>(SEED_RECOMMENDATIONS);
  const [activeOptimizer, setActiveOptimizer] = useState<string | null>(null);

  function decide(id: string, approved: boolean) {
    setRecs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved } : r)),
    );
  }

  const pending  = recs.filter((r) => r.approved === null);
  const approved = recs.filter((r) => r.approved === true);

  const OPTIMIZERS = [
    { key: "revenue",  label: "Revenue Correction",  component: <RevenueCorrectionRail /> },
    { key: "ads",      label: "Ad Efficiency",        component: <AdEfficiencyRail /> },
    { key: "booking",  label: "Booking Profit",       component: <BookingProfitRail /> },
    { key: "merch",    label: "Merch Velocity",       component: <MerchVelocityRail /> },
    { key: "prizes",   label: "Prize Cost",           component: <PrizeCostRail /> },
    { key: "sponsors", label: "Sponsor ROI",          component: <SponsorROITracker /> },
    { key: "venue",    label: "Venue Yield",          component: <VenueYieldRail /> },
    { key: "emergency",label: "Emergency Correction", component: <EmergencyCorrectionPanel /> },
  ];

  return (
    <AdminShell
      hubId="mc"
      hubTitle="MC MICHAEL CHARLIE"
      hubSubtitle="PROFIT CORRECTION ENGINE"
      backHref="/admin"
    >
      {/* Status strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {[
          { label: "Pending Recs",  value: String(pending.length),  color: "#f59e0b" },
          { label: "Approved",      value: String(approved.length), color: "#22c55e" },
          { label: "Revenue At Risk",value: "$18K",                  color: "#ef4444" },
          { label: "Est. Recovery", value: "+$39.6K",               color: "#fcd34d" },
          { label: "Margin Health", value: "71%",                   color: "#c4b5fd" },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              border: `1px solid ${m.color}33`,
              borderRadius: 10,
              background: "rgba(255,255,255,0.03)",
              padding: "8px 10px",
            }}
          >
            <p style={{ margin: 0, fontSize: 9, color: m.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {m.label}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 900, color: "#f1f5f9" }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 220px) minmax(0, 1fr)",
          gap: 12,
          alignItems: "start",
        }}
      >
        {/* LEFT — command + optimizer tabs */}
        <div style={{ display: "grid", gap: 10 }}>
          <AdminCommandRail hubRole="mc" />

          {/* Optimizer selector */}
          <div
            style={{
              border: "1px solid rgba(251,191,36,0.35)",
              borderRadius: 12,
              background: "linear-gradient(180deg, rgba(40,20,5,0.6), rgba(10,6,2,0.9))",
              padding: 10,
            }}
          >
            <p style={{ margin: "0 0 8px", color: "#fde68a", fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Optimizers
            </p>
            <div style={{ display: "grid", gap: 4 }}>
              {OPTIMIZERS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setActiveOptimizer(activeOptimizer === opt.key ? null : opt.key)}
                  style={{
                    borderRadius: 7,
                    border: activeOptimizer === opt.key
                      ? "1px solid rgba(251,191,36,0.75)"
                      : "1px solid rgba(251,191,36,0.2)",
                    background: activeOptimizer === opt.key
                      ? "rgba(120,53,15,0.45)"
                      : "rgba(0,0,0,0.3)",
                    color: activeOptimizer === opt.key ? "#fde68a" : "#94a3b8",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    padding: "6px 10px",
                    cursor: "pointer",
                    textAlign: "left",
                    textTransform: "uppercase",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  {opt.label}
                  <span style={{ opacity: 0.6 }}>{activeOptimizer === opt.key ? "▼" : "›"}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — main content area */}
        <div style={{ display: "grid", gap: 12 }}>
          {/* Profit Command Center */}
          <ProfitCommandCenter />

          {/* Margin + Leak scanner row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <MarginMonitor />
            <ProfitLeakScanner />
          </div>

          {/* Active optimizer panel */}
          {activeOptimizer && (
            <div>
              {OPTIMIZERS.find((o) => o.key === activeOptimizer)?.component}
            </div>
          )}

          {/* Recommendation queue */}
          <div
            style={{
              border: "1px solid rgba(168,85,247,0.4)",
              borderRadius: 12,
              background: "linear-gradient(180deg, rgba(30,10,50,0.6), rgba(8,4,18,0.9))",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid rgba(168,85,247,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <strong style={{ color: "#c4b5fd", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", flex: 1 }}>
                RECOMMENDATION QUEUE
              </strong>
              <span style={{ color: "#64748b", fontSize: 9 }}>
                {pending.length} pending · {approved.length} approved
              </span>
            </div>

            <div style={{ padding: 10, display: "grid", gap: 8 }}>
              {recs.map((rec) => {
                const sty = SEVERITY_STYLE[rec.severity];
                return (
                  <div
                    key={rec.id}
                    style={{
                      border: `1px solid ${rec.approved === true ? "rgba(34,197,94,0.5)" : rec.approved === false ? "rgba(100,116,139,0.3)" : sty.border}`,
                      borderRadius: 10,
                      background: rec.approved !== null ? "rgba(0,0,0,0.3)" : sty.bg,
                      padding: "10px 12px",
                      opacity: rec.approved === false ? 0.45 : 1,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: "0.12em",
                          color: sty.label,
                          textTransform: "uppercase",
                          border: `1px solid ${sty.border}`,
                          borderRadius: 4,
                          padding: "1px 6px",
                        }}
                      >
                        {rec.severity}
                      </span>
                      <span style={{ fontSize: 10, color: "#94a3b8", letterSpacing: "0.08em" }}>
                        {rec.category}
                      </span>
                      {rec.approved === true && (
                        <span style={{ marginLeft: "auto", color: "#86efac", fontSize: 10, fontWeight: 700 }}>
                          ✓ APPROVED
                        </span>
                      )}
                      {rec.approved === false && (
                        <span style={{ marginLeft: "auto", color: "#64748b", fontSize: 10 }}>
                          DISMISSED
                        </span>
                      )}
                    </div>
                    <p style={{ margin: "0 0 3px", fontSize: 11, color: "#f1f5f9", fontWeight: 600 }}>
                      {rec.issue}
                    </p>
                    <p style={{ margin: "0 0 3px", fontSize: 10, color: "#94a3b8" }}>
                      Fix: {rec.fix}
                    </p>
                    <p style={{ margin: "0 0 8px", fontSize: 10, color: "#22c55e", fontWeight: 700 }}>
                      {rec.impact}
                    </p>
                    {rec.approved === null && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => decide(rec.id, true)}
                          style={{
                            borderRadius: 5,
                            border: "1px solid rgba(34,197,94,0.5)",
                            background: "rgba(5,46,22,0.5)",
                            color: "#86efac",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "4px 14px",
                            cursor: "pointer",
                            letterSpacing: "0.08em",
                          }}
                        >
                          APPROVE
                        </button>
                        <button
                          type="button"
                          onClick={() => decide(rec.id, false)}
                          style={{
                            borderRadius: 5,
                            border: "1px solid rgba(100,116,139,0.4)",
                            background: "rgba(15,23,42,0.5)",
                            color: "#64748b",
                            fontSize: 10,
                            padding: "4px 14px",
                            cursor: "pointer",
                          }}
                        >
                          DISMISS
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
