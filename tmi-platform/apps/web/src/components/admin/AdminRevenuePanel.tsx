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
    <section
      style={{
        border: active ? "1px solid rgba(250,204,21,0.75)" : "1px solid rgba(250,204,21,0.4)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(69,39,5,0.75), rgba(21,14,7,0.92))",
        padding: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <h3 style={{ margin: 0, color: "#fde68a", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Money &amp; Billing
        </h3>
        <span style={{ fontSize: 8, fontWeight: 900, color: rev?.mode === "live" ? "#00FF88" : rev?.mode === "test" ? "#FFD700" : "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>
          {modeLabel}
        </span>
      </div>

      <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Metric label="Today" value={today} />
        <Metric label="This Month" value={month} />
        <Metric label="Active Subs" value={subs} />
        <Metric label="Stripe" value={rev?.mode === "live" ? "LIVE" : rev?.mode === "test" ? "TEST" : loading ? "…" : "—"} />
      </div>

      <div style={{ marginTop: 10, border: "1px solid rgba(251,191,36,0.22)", borderRadius: 10, background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.16))", padding: "10px 10px 8px" }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 8, minHeight: 88 }}>
          {chartBars.map((bar) => (
            <div key={bar.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: "100%", display: "flex", alignItems: "end", justifyContent: "center", minHeight: 70 }}>
                <span style={{ width: 18, height: `${bar.height}%`, maxHeight: 70, borderRadius: 999, background: "linear-gradient(180deg, #FCD34D, #B45309)", boxShadow: "0 0 12px rgba(251,191,36,0.18)" }} />
              </div>
              <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,243,199,0.82)" }}>{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button type="button" onClick={() => onSelect("billing")} data-clickable="true" data-section-id="billing" style={btnStyle}>
          Open Billing
        </button>
        <button type="button" onClick={() => onSelect("artist-analytics")} data-clickable="true" data-section-id="artist-analytics" style={btnStyle}>
          Artist Revenue
        </button>
      </div>
    </section>
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
