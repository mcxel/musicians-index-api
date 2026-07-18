"use client";

import { useEffect, useState } from "react";
import { BarChart } from "@/components/analytics/TmiChartKit";
import { MetricCard } from "./overseer/AdminDesignSystem";
import type { AdminSectionId } from "@/lib/adminRouteMap";

type AdminRevenuePanelProps = {
  selectedId: AdminSectionId;
  onSelect: (id: AdminSectionId) => void;
};
type RevenueApiResponse = {
  mode: "live" | "test" | "not_configured" | "error";
  totals: {
    today: string;
    month: string;
    todayCents: number;
    monthCents: number;
  };
  subscriptions: {
    active: number | string;
  };
};

export default function AdminRevenuePanel({ selectedId, onSelect }: AdminRevenuePanelProps) {
  const active = selectedId === "billing" || selectedId === "artist-analytics";
  const [rev, setRev] = useState<RevenueApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    function poll() {
      fetch("/api/admin/revenue", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: RevenueApiResponse | null) => {
          if (mounted && d) setRev(d);
        })
        .catch(() => undefined)
        .finally(() => { if (mounted) setLoading(false); });
    }

    poll();
    const t = setInterval(poll, 30_000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  const today = loading ? "…" : (rev?.totals?.today ?? "$0");
  const month = loading ? "…" : (rev?.totals?.month ?? "$0");
  const subs  = loading ? "…" : String(rev?.subscriptions?.active ?? "0");
  const chartBars = [today, month, subs, rev?.mode === "live" ? "100" : rev?.mode === "test" ? "72" : "24"].map((value, index) => ({
    id: index,
    label: index === 0 ? "Today" : index === 1 ? "Month" : index === 2 ? "Subs" : "Signal",
    height: Math.max(24, Math.min(100, Number(String(value).replace(/[^0-9.]/g, "")) || 24)),
  }));
  const modeLabel =
    rev?.mode === "live"            ? "● LIVE"
    : rev?.mode === "test"          ? "◎ TEST"
    : rev?.mode === "not_configured"? "○ NOT SET"
    : loading ? "…" : "○";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "'Inter', sans-serif" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, borderBottom: "1px solid rgba(255,215,0,0.15)", paddingBottom: 6 }}>
        {["Month", "Web", "Wave", "Citrine", "NFT"].map((tab, idx) => (
          <button key={idx} style={{
            background: idx === 0 ? "rgba(255,215,0,0.15)" : "transparent",
            border: idx === 0 ? "1.5px solid #D4AF37" : "none",
            borderRadius: 6,
            color: idx === 0 ? "#FFD700" : "rgba(255,255,255,0.6)",
            fontSize: 9,
            fontWeight: 900,
            textTransform: "uppercase",
            padding: "3px 8px",
            cursor: "pointer"
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Billboard Chart Container */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 9, fontWeight: 900, color: "#ffe9bb", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Artist Revenue Trends (Billboard #)
        </div>
        
        {/* SVG Spline Graph */}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          {/* Y-axis Labels */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 110, fontSize: 7, color: "rgba(255,255,255,0.4)", textAlign: "right", minWidth: 28 }}>
            <span>$70M</span>
            <span>$60M</span>
            <span>$50M</span>
            <span>$40M</span>
            <span>$30M</span>
            <span>$20M</span>
            <span>$10M</span>
            <span>0</span>
          </div>

          {/* Graph Grid */}
          <div style={{ flex: 1, height: 110, position: "relative", background: "rgba(0,0,0,0.2)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
            {/* Grid Lines */}
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", width: "100%", height: 0 }} />
              ))}
            </div>
            
            {/* SVG Lines */}
            <svg width="100%" height="100%" viewBox="0 0 300 110" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#AA2DFF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#AA2DFF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Gold Spline area & line */}
              <path d="M 0 100 Q 30 80, 65 95 T 120 70 T 180 85 T 240 50 T 300 75 L 300 110 L 0 110 Z" fill="url(#goldArea)" />
              <path d="M 0 100 Q 30 80, 65 95 T 120 70 T 180 85 T 240 50 T 300 75" fill="none" stroke="#FFD700" strokeWidth="2" />
              
              {/* Purple Spline area & line */}
              <path d="M 0 90 Q 35 60, 70 85 T 140 45 T 210 65 T 280 20 T 300 35 L 300 110 L 0 110 Z" fill="url(#purpleArea)" />
              <path d="M 0 90 Q 35 60, 70 85 T 140 45 T 210 65 T 280 20 T 300 35" fill="none" stroke="#AA2DFF" strokeWidth="2.5" />
            </svg>
          </div>
        </div>

        {/* X-axis Labels */}
        <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: 38, fontSize: 7, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
          <span>0</span>
          <span>10</span>
          <span>20</span>
          <span>30</span>
          <span>40</span>
          <span>50</span>
          <span>60</span>
          <span>70</span>
          <span>80</span>
          <span>90</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid rgba(251,191,36,0.35)", borderRadius: 8, background: "rgba(255,255,255,0.04)", padding: "6px 7px" }}>
      <div style={{ fontSize: 9, color: "#fcd34d", letterSpacing: "0.1em" }}>{label}</div>
      <div style={{ fontSize: 12, color: "#fef3c7", fontWeight: 800 }}>{value}</div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  borderRadius: 999,
  border: "1px solid rgba(251,191,36,0.55)",
  background: "rgba(251,191,36,0.15)",
  color: "#fde68a",
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  padding: "5px 8px",
  cursor: "pointer",
};
