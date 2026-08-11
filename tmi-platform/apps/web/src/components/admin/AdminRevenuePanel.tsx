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
  streams?: Record<string, { todayCents: number; monthCents: number; countToday: number; countMonth: number }>;
};

const STREAM_LABELS: Record<string, string> = {
  subscriptions: "Subs",
  founding_packs: "Founding",
  sponsors: "Sponsors",
  beats: "Beats",
  tips: "Tips",
  one_time: "One-Time",
  payments: "Payments",
  charges: "Charges",
  other: "Other",
};

export default function AdminRevenuePanel({ selectedId, onSelect }: AdminRevenuePanelProps) {
  const active = selectedId === "billing" || selectedId === "artist-analytics";
  const [rev, setRev] = useState<RevenueApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let delayMs = 30_000;
    let timer: NodeJS.Timeout | number | null = null;

    const schedule = (ms: number) => {
      if (timer) clearTimeout(timer as NodeJS.Timeout);
      timer = setTimeout(() => {
        void poll();
      }, ms);
    };

    async function poll() {
      try {
        const controller = new AbortController();
        const timeout: NodeJS.Timeout | number = setTimeout(() => controller.abort(), 12_000);
        const res = await fetch("/api/admin/revenue", { cache: "no-store", signal: controller.signal });
        clearTimeout(timeout as NodeJS.Timeout);
        if (!res.ok) throw new Error(`revenue ${res.status}`);
        const d = (await res.json()) as RevenueApiResponse;
        if (mounted) {
          setRev(d);
          delayMs = 30_000;
        }
      } catch {
        delayMs = Math.min(delayMs * 2, 120_000);
      } finally {
        if (mounted) setLoading(false);
        if (mounted) schedule(delayMs);
      }
    }

    void poll();
    return () => {
      mounted = false;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const today = loading ? "…" : (rev?.totals?.today ?? "$0");
  const month = loading ? "…" : (rev?.totals?.month ?? "$0");
  const subs  = loading ? "…" : String(rev?.subscriptions?.active ?? "0");
  const streamBars = Object.entries(rev?.streams ?? {})
    .filter(([, s]) => s.monthCents > 0)
    .map(([key, s]) => ({ label: STREAM_LABELS[key] ?? key, value: Math.round(s.monthCents / 100) }))
    .sort((a, b) => b.value - a.value);
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

      {/* Real fetched totals */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(88px,1fr))", gap: 6 }}>
        <MetricCard title="Today" value={today} tone="green" />
        <MetricCard title="This Month" value={month} tone="amber" />
        <MetricCard title="Active Subs" value={subs} tone="cyan" />
      </div>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: rev?.mode === "live" ? "#22c55e" : "rgba(255,255,255,0.4)" }}>
        {modeLabel}
      </div>

      {/* Revenue by Stream — real data or an honest empty state (Rule 20) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 9, fontWeight: 900, color: "#ffe9bb", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Revenue by Stream (This Month)
        </div>
        {loading ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", padding: "24px 0", textAlign: "center" }}>
            Loading revenue…
          </div>
        ) : streamBars.length > 0 ? (
          <BarChart data={streamBars} accentColor="#FFD700" unit="$" height={160} />
        ) : (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", padding: "24px 0", textAlign: "center" }}>
            No revenue recorded yet this month.
          </div>
        )}
      </div>
    </div>
  );
}
