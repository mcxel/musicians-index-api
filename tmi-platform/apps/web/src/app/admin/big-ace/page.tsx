"use client";

import { useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import AdminCommandRail from "@/components/admin/AdminCommandRail";
import AdminSentinelRail from "@/components/admin/AdminSentinelRail";
import ProfitCommandCenter from "@/components/admin/profit/ProfitCommandCenter";
import EmergencyCorrectionPanel from "@/components/admin/profit/EmergencyCorrectionPanel";

const controls = [
  "Summon MC Michael Charlie",
  "Approve Corrections",
  "Lock Corrections",
  "Force Rebalance",
  "Emergency Freeze",
];

export default function BigAceAdminPage() {
  const [summoned, setSummoned] = useState(true);

  return (
    <AdminShell
      hubId="big-ace"
      hubTitle="Big Ace Hub"
      hubSubtitle="Machine Overseer"
      backHref="/admin"
    >
      <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 280px) minmax(0, 1fr)", gap: 12 }}>
        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <AdminCommandRail hubRole="big-ace" />
          <AdminSentinelRail />
          <section style={{ border: "1px solid rgba(168,85,247,0.25)", borderRadius: 12, background: "rgba(20,10,34,0.5)", padding: 12 }}>
            <p style={{ margin: "0 0 8px", color: "#c4b5fd", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Big Ace Controls
            </p>
            <button
              type="button"
              onClick={() => setSummoned((value) => !value)}
              style={{ width: "100%", marginBottom: 8, borderRadius: 8, border: "1px solid rgba(168,85,247,0.35)", background: summoned ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.14)", color: summoned ? "#86efac" : "#fca5a5", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 800, padding: "6px 9px", cursor: "pointer" }}
            >
              {summoned ? "MC Michael Charlie Summoned" : "Summon MC Michael Charlie"}
            </button>
            <div style={{ display: "grid", gap: 6 }}>
              {controls.slice(1).map((label) => (
                <button key={label} type="button" style={{ borderRadius: 7, border: "1px solid rgba(196,181,253,0.3)", background: "rgba(76,29,149,0.25)", color: "#ddd6fe", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 8px", cursor: "pointer" }}>
                  {label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <section style={{ border: "1px solid rgba(34,211,238,0.3)", borderRadius: 12, background: "rgba(0,255,255,0.05)", padding: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Link href="/admin/big-ace/sites" style={{ color: "#67e8f9", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sites</Link>
            <Link href="/admin/big-ace/memory" style={{ color: "#67e8f9", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Memory</Link>
            <Link href="/admin/big-ace/promotions" style={{ color: "#67e8f9", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Promotions</Link>
            <Link href="/admin/big-ace/billboards" style={{ color: "#67e8f9", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Billboards</Link>
            <Link href="/admin/big-ace/events" style={{ color: "#67e8f9", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Events</Link>
            <Link href="/admin/big-ace/live-now" style={{ color: "#67e8f9", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Live Now</Link>
          </section>
          <ProfitCommandCenter title="MC Michael Charlie Summon Grid" />
          <EmergencyCorrectionPanel />
        </div>
      </div>
    </AdminShell>
  );
}
