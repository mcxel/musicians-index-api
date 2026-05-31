"use client";

import { useState } from "react";
import { BarChart, LineChart, PieChart, HBarChart, StatCard } from "@/components/analytics/TmiChartKit";

const ACCENT = "#FFD700";

const WEEKLY_IMPRESSIONS = [
  { label: "Mon", value: 18400, color: "#FFD700" }, { label: "Tue", value: 22100, color: "#FFD700" },
  { label: "Wed", value: 19800, color: "#FFD700" }, { label: "Thu", value: 26300, color: "#FFD700" },
  { label: "Fri", value: 31200, color: "#FFD700" }, { label: "Sat", value: 28700, color: "#FFD700" },
  { label: "Sun", value: 24900, color: "#FFD700" },
];
const WEEKLY_CLICKS = [
  { label: "Mon", value: 1380 }, { label: "Tue", value: 1720 }, { label: "Wed", value: 1510 },
  { label: "Thu", value: 2040 }, { label: "Fri", value: 2480 }, { label: "Sat", value: 2200 }, { label: "Sun", value: 1890 },
];
const PLACEMENT_SPLIT = [
  { label: "Home Pages",   value: 42, color: "#FFD700" }, { label: "Artist Pages", value: 28, color: "#00FFFF" },
  { label: "Battle Shows", value: 18, color: "#FF2DAA" }, { label: "Magazine",     value: 12, color: "#AA2DFF" },
];
const ARTIST_PERF = [
  { label: "Nova Cipher", value: 94, color: "#FFD700" }, { label: "Astra Nova",  value: 81, color: "#FF2DAA" },
  { label: "Zion Freq",   value: 78, color: "#00FFFF" }, { label: "DJ Lumi",     value: 72, color: "#AA2DFF" },
  { label: "Veron Koi",   value: 65, color: "#00FF88" },
];
const ROI_TREND = [2.8, 3.1, 2.9, 3.4, 3.7, 3.6, 3.5];
const SPARK_IMP  = [18400, 22100, 19800, 26300, 31200, 28700, 24900];
const SPARK_CLICK= [1380,  1720,  1510,  2040,  2480,  2200,  1890 ];

const TABS = ["Overview", "Placements", "Artists", "Trends"] as const;
type Tab = typeof TABS[number];

export default function SponsorAnalyticsRail() {
  const [tab, setTab] = useState<Tab>("Overview");

  const totalImp   = WEEKLY_IMPRESSIONS.reduce((s, d) => s + d.value, 0);
  const totalClick = WEEKLY_CLICKS.reduce((s, d) => s + d.value, 0);
  const ctr        = ((totalClick / totalImp) * 100).toFixed(2);

  return (
    <section style={{ borderRadius: 16, border: `1px solid ${ACCENT}28`, background: "rgba(5,5,16,0.85)", padding: 20, backdropFilter: "blur(8px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.28em", color: ACCENT, fontWeight: 800, marginBottom: 3 }}>SPONSOR ANALYTICS</div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#fff" }}>Impressions · Clicks · ROI</h2>
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
            <StatCard label="IMPRESSIONS (7D)" value={`${(totalImp/1000).toFixed(0)}K`}      change="+12% vs last week" positive color="#FFD700" sparkValues={SPARK_IMP}   />
            <StatCard label="CLICKS (7D)"       value={totalClick.toLocaleString()}            change="+18% vs last week" positive color="#00FFFF" sparkValues={SPARK_CLICK} />
            <StatCard label="AVG CTR"            value={`${ctr}%`}                             change="+0.4%"              positive color="#00FF88" />
            <StatCard label="AVG ROI"            value="3.7×"                                  change="+0.3×"              positive color="#FF2DAA" sparkValues={ROI_TREND}  />
          </div>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, marginBottom: 10 }}>
            <BarChart data={WEEKLY_IMPRESSIONS} height={150} accentColor={ACCENT} title="WEEKLY IMPRESSIONS" />
          </div>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <LineChart data={WEEKLY_CLICKS} height={110} accentColor="#00FFFF" title="CLICKS TREND (7D)" />
          </div>
        </>
      )}
      {tab === "Placements" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, display: "flex", justifyContent: "center" }}>
            <PieChart data={PLACEMENT_SPLIT} size={160} title="PLACEMENT SPLIT" donut />
          </div>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <HBarChart data={PLACEMENT_SPLIT.map(d => ({ ...d, value: d.value * 2100 }))} title="IMPRESSIONS BY SURFACE" />
          </div>
        </div>
      )}
      {tab === "Artists" && (
        <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
          <HBarChart data={ARTIST_PERF} title="ENGAGEMENT SCORE BY ARTIST" showPct />
        </div>
      )}
      {tab === "Trends" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <LineChart data={WEEKLY_IMPRESSIONS} height={110} accentColor={ACCENT} title="IMPRESSIONS TREND" fill />
          </div>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <LineChart data={ROI_TREND.map((v, i) => ({ label: WEEKLY_IMPRESSIONS[i]!.label, value: v }))} height={100} accentColor="#00FF88" title="ROI TREND" fill />
          </div>
        </div>
      )}
    </section>
  );
}
