"use client";

// Canon source: Adminisratation Hub.jpg — Revenue counter strip
// Wired to real Stripe data via /api/admin/revenue — no fabricated numbers.

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface RevenueApi {
  totals: { todayCents: number; monthCents: number; today: string; month: string };
  streams: Record<string, { todayCents: number; monthCents: number }>;
}

const STREAM_META: Record<string, { label: string; color: string }> = {
  subscriptions: { label: "SUBSCRIPTIONS",  color: "#00FFFF" },
  sponsors:      { label: "SPONSORSHIPS",   color: "#FFD700" },
  payments:      { label: "TIPS & PAYMENTS",color: "#FF2DAA" },
  other:         { label: "OTHER",          color: "#AA2DFF" },
};

function formatMoney(cents: number): string {
  const n = cents / 100;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  if (n > 0) return `$${n.toFixed(2)}`;
  return "$0";
}

export default function RevenueStrip() {
  const [data, setData] = useState<RevenueApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"day" | "month">("month");

  const loadRevenue = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/revenue', { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json() as RevenueApi;
      setData(json);
    } catch {
      // API unavailable — keep null (honest empty state)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRevenue();
    const timer = window.setInterval(loadRevenue, 30_000);
    return () => window.clearInterval(timer);
  }, [loadRevenue]);

  const totalCents = data
    ? (timeframe === "day" ? data.totals.todayCents : data.totals.monthCents)
    : 0;

  const streams = data
    ? Object.entries(STREAM_META).map(([id, meta]) => ({
        id,
        ...meta,
        cents: timeframe === "day"
          ? (data.streams[id]?.todayCents ?? 0)
          : (data.streams[id]?.monthCents ?? 0),
      }))
    : [];

  const maxCents = Math.max(1, ...streams.map((s) => s.cents));

  return (
    <div
      data-revenue-strip
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
    >
      {/* Total counter */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em" }}>PLATFORM REVENUE</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: loading ? "rgba(0,255,136,0.4)" : "#00FF88", letterSpacing: "-0.02em" }}>
              {loading ? "Loading…" : formatMoney(totalCents)}
            </span>
            {!loading && totalCents === 0 && (
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>No transactions yet</span>
            )}
          </div>
        </div>
        <Link href="/admin/revenue" style={{ fontSize: 7, color: "#00FFFF", textDecoration: "none", letterSpacing: "0.1em" }}>
          FULL REPORT →
        </Link>
      </div>

      {/* Time toggle */}
      <div style={{ display: "flex", gap: 4 }}>
        {(["day", "month"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            style={{
              padding: "2px 10px",
              borderRadius: 20,
              background: timeframe === t ? "rgba(0,255,136,0.15)" : "transparent",
              border: `1px solid ${timeframe === t ? "rgba(0,255,136,0.4)" : "rgba(255,255,255,0.1)"}`,
              color: timeframe === t ? "#00FF88" : "rgba(255,255,255,0.4)",
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.12em",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {t === "day" ? "TODAY" : "THIS MONTH"}
          </button>
        ))}
      </div>

      {/* Stream breakdown bars */}
      {streams.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {streams.map((s) => (
            <div key={s.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>{s.label}</span>
                <span style={{ fontSize: 8, fontWeight: 900, color: s.color }}>{formatMoney(s.cents)}</span>
              </div>
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${s.cents > 0 ? Math.max(4, (s.cents / maxCents) * 100) : 0}%`,
                    height: "100%",
                    background: `linear-gradient(to right, ${s.color}80, ${s.color})`,
                    borderRadius: 2,
                    transition: "width 0.8s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && totalCents === 0 && (
        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 4 }}>
          Revenue appears here after the first Stripe payment clears.
        </p>
      )}
    </div>
  );
}
