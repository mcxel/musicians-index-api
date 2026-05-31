"use client";

import { useState } from "react";
import { BarChart, LineChart, PieChart, HBarChart, StatCard } from "@/components/analytics/TmiChartKit";

const ACCENT = "#22c55e";

const WEEKLY_ATTENDANCE = [
  { label: "Mon", value: 520,  color: "#22c55e" }, { label: "Tue", value: 680,  color: "#22c55e" },
  { label: "Wed", value: 590,  color: "#22c55e" }, { label: "Thu", value: 820,  color: "#22c55e" },
  { label: "Fri", value: 1240, color: "#22c55e" }, { label: "Sat", value: 1480, color: "#22c55e" },
  { label: "Sun", value: 910,  color: "#22c55e" },
];
const WEEKLY_REVENUE = [
  { label: "Mon", value: 3800  }, { label: "Tue", value: 5100  }, { label: "Wed", value: 4400  },
  { label: "Thu", value: 6200  }, { label: "Fri", value: 9800  }, { label: "Sat", value: 11400 }, { label: "Sun", value: 7100 },
];
const ROOM_OCCUPANCY = [
  { label: "Main Stage",    value: 92, color: "#22c55e"  },
  { label: "VIP Lounge",   value: 67, color: "#FFD700"  },
  { label: "Cypher Zone",  value: 84, color: "#00FFFF"  },
  { label: "Watch Party",  value: 71, color: "#FF2DAA"  },
  { label: "Producer Lab", value: 44, color: "#AA2DFF"  },
  { label: "Backstage",    value: 30, color: "#FF6B35"  },
];
const TICKET_SPLIT = [
  { label: "General Admission", value: 48, color: "#22c55e" },
  { label: "VIP",               value: 26, color: "#FFD700" },
  { label: "Diamond",           value: 14, color: "#00FFFF" },
  { label: "Comp / Press",      value: 12, color: "#AA2DFF" },
];
const OCC_TREND = [68, 72, 69, 78, 84, 88, 74];
const SPARK_ATT = [520, 680, 590, 820, 1240, 1480, 910];
const SPARK_REV = [3800, 5100, 4400, 6200, 9800, 11400, 7100];

const TABS = ["Overview", "Rooms", "Tickets", "Revenue"] as const;
type Tab = typeof TABS[number];

export default function VenueAnalyticsRail() {
  const [tab, setTab] = useState<Tab>("Overview");

  const totalAtt = WEEKLY_ATTENDANCE.reduce((s, d) => s + d.value, 0);
  const totalRev = WEEKLY_REVENUE.reduce((s, d) => s + d.value, 0);

  return (
    <section style={{ borderRadius: 16, border: `1px solid ${ACCENT}28`, background: "rgba(5,5,16,0.85)", padding: 20, backdropFilter: "blur(8px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.28em", color: ACCENT, fontWeight: 800, marginBottom: 3 }}>VENUE ANALYTICS</div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#fff" }}>Attendance · Occupancy · Revenue</h2>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 9, fontWeight: 800, cursor: "pointer", border: "none", background: tab === t ? `${ACCENT}20` : "rgba(255,255,255,0.04)", color: tab === t ? ACCENT : "rgba(255,255,255,0.4)", outline: tab === t ? `1px solid ${ACCENT}45` : "1px solid rgba(255,255,255,0.08)", letterSpacing: "0.06em" }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {tab === "Overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 16 }}>
            <StatCard label="WEEKLY ATTENDANCE" value={totalAtt.toLocaleString()} change="+14% vs last week" positive color={ACCENT}    sparkValues={SPARK_ATT} />
            <StatCard label="WEEKLY REVENUE"     value={`$${(totalRev/1000).toFixed(1)}K`}                   change="+22%"              positive color="#FFD700" sparkValues={SPARK_REV} />
            <StatCard label="AVG OCCUPANCY"      value="74%"                                                  change="+6%"               positive color="#00FFFF" sparkValues={OCC_TREND} />
            <StatCard label="TICKET SALES"       value="1,840"                                                change="+18%"              positive color="#FF2DAA" />
          </div>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, marginBottom: 10 }}>
            <BarChart data={WEEKLY_ATTENDANCE} height={150} accentColor={ACCENT} title="WEEKLY ATTENDANCE" />
          </div>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <LineChart data={OCC_TREND.map((v, i) => ({ label: WEEKLY_ATTENDANCE[i]!.label, value: v }))} height={100} accentColor="#00FFFF" title="OCCUPANCY TREND (%)" fill />
          </div>
        </>
      )}
      {tab === "Rooms" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <BarChart data={ROOM_OCCUPANCY} height={200} accentColor={ACCENT} title="ROOM OCCUPANCY (%)" />
          </div>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <HBarChart data={ROOM_OCCUPANCY} title="ROOM STATUS" showPct />
          </div>
        </div>
      )}
      {tab === "Tickets" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, display: "flex", justifyContent: "center" }}>
            <PieChart data={TICKET_SPLIT} size={160} title="TICKET TYPE SPLIT" donut />
          </div>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <HBarChart data={TICKET_SPLIT} title="TICKETS BY TYPE" showPct />
          </div>
        </div>
      )}
      {tab === "Revenue" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <BarChart data={WEEKLY_REVENUE.map(d => ({ ...d, value: Math.round(d.value / 100), color: "#FFD700" }))} height={150} accentColor="#FFD700" title="DAILY REVENUE ($00s)" />
          </div>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <LineChart data={WEEKLY_REVENUE.map(d => ({ ...d, value: Math.round(d.value / 100) }))} height={100} accentColor="#00FF88" title="REVENUE TREND" fill />
          </div>
        </div>
      )}
    </section>
  );
}
