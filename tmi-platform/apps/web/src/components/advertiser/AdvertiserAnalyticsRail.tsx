"use client";

import { useState } from "react";
import { BarChart, LineChart, PieChart, HBarChart, StatCard } from "@/components/analytics/TmiChartKit";

const ACCENT = "#FF2DAA";

const DAILY_REACH = [
  { label: "Mon", value: 68000,  color: "#FF2DAA" }, { label: "Tue", value: 81000,  color: "#FF2DAA" },
  { label: "Wed", value: 74000,  color: "#FF2DAA" }, { label: "Thu", value: 92000,  color: "#FF2DAA" },
  { label: "Fri", value: 110000, color: "#FF2DAA" }, { label: "Sat", value: 97000,  color: "#FF2DAA" },
  { label: "Sun", value: 83000,  color: "#FF2DAA" },
];
const NETWORK_PERF = [
  { label: "AdSense",     value: 92, color: "#00FF88"  },
  { label: "Media.net",   value: 78, color: "#00FFFF"  },
  { label: "Carbon Ads",  value: 65, color: "#AA2DFF"  },
  { label: "Amazon APS",  value: 0,  color: "#FFD700"  },
  { label: "Propeller",   value: 0,  color: "#FF6B35"  },
];
const AUDIENCE_SPLIT = [
  { label: "18–24", value: 31, color: "#FF2DAA" }, { label: "25–34", value: 28, color: "#00FFFF" },
  { label: "35–44", value: 22, color: "#FFD700" }, { label: "45+",   value: 19, color: "#AA2DFF" },
];
const CTR_TREND = [5.8, 6.1, 5.9, 6.7, 7.1, 6.9, 6.7];
const SPARK_REACH = [68000, 81000, 74000, 92000, 110000, 97000, 83000];

const TABS = ["Overview", "Networks", "Audience", "CTR Trend"] as const;
type Tab = typeof TABS[number];

export default function AdvertiserAnalyticsRail() {
  const [tab, setTab] = useState<Tab>("Overview");

  const totalReach = DAILY_REACH.reduce((s, d) => s + d.value, 0);

  return (
    <section style={{ borderRadius: 16, border: `1px solid ${ACCENT}28`, background: "rgba(5,5,16,0.85)", padding: 20, backdropFilter: "blur(8px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.28em", color: ACCENT, fontWeight: 800, marginBottom: 3 }}>ADVERTISER ANALYTICS</div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#fff" }}>Reach · CTR · Network ROI</h2>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
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
            <StatCard label="WEEKLY REACH"   value={`${(totalReach/1000).toFixed(0)}K`} change="+22% vs last week" positive color={ACCENT}    sparkValues={SPARK_REACH} />
            <StatCard label="AVG CTR"         value="6.7%"                                change="+0.9%"             positive color="#00FFFF" sparkValues={CTR_TREND}   />
            <StatCard label="CPC"             value="$1.92"                               change="-$0.18"            positive color="#00FF88"  />
            <StatCard label="ROAS"            value="4.2×"                                change="+0.5×"             positive color="#FFD700"  />
          </div>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, marginBottom: 10 }}>
            <BarChart data={DAILY_REACH.map(d => ({ ...d, value: Math.round(d.value / 1000) }))} height={150} accentColor={ACCENT} title="DAILY REACH (K)" />
          </div>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <LineChart data={CTR_TREND.map((v, i) => ({ label: DAILY_REACH[i]!.label, value: v }))} height={100} accentColor="#00FFFF" title="CTR TREND (%)" fill />
          </div>
        </>
      )}
      {tab === "Networks" && (
        <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
          <HBarChart data={NETWORK_PERF} title="AD NETWORK PERFORMANCE SCORE" showPct />
        </div>
      )}
      {tab === "Audience" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, display: "flex", justifyContent: "center" }}>
            <PieChart data={AUDIENCE_SPLIT} size={160} title="AUDIENCE AGE SPLIT" donut />
          </div>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <HBarChart data={AUDIENCE_SPLIT} title="AGE GROUP BREAKDOWN" showPct />
          </div>
        </div>
      )}
      {tab === "CTR Trend" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <LineChart data={CTR_TREND.map((v, i) => ({ label: DAILY_REACH[i]!.label, value: v }))} height={120} accentColor={ACCENT} title="CTR TREND 7D (%)" fill />
          </div>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <BarChart data={DAILY_REACH.map(d => ({ ...d, value: Math.round(d.value / 1000) }))} height={120} accentColor="#00FFFF" title="REACH BY DAY (K)" />
          </div>
        </div>
      )}
    </section>
  );
}
