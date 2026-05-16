"use client";

// Canon source: Adminisratation Hub.jpg — Revenue counter strip
// Structure: $44.1M live counter + stream breakdown bars + time toggle + link to revenue page
// Motion: counter ticks up, bar fills animate

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface RevenueStream {
  id: string;
  label: string;
  amount: number;
  color: string;
  pct: number;
}

const STREAMS: RevenueStream[] = [
  { id: "platform", label: "PLATFORM FEES", amount: 18_400_000, color: "#00FFFF", pct: 42 },
  { id: "artist",   label: "ARTIST SPLITS", amount: 14_100_000, color: "#FF2DAA", pct: 32 },
  { id: "sponsor",  label: "SPONSORSHIPS",  amount: 7_200_000,  color: "#FFD700", pct: 16 },
  { id: "venue",    label: "VENUE YIELDS",  amount: 4_400_000,  color: "#AA2DFF", pct: 10 },
];

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function RevenueStrip() {
  const [total, setTotal] = useState(44_100_000);
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("month");

  // Live counter tick
  useEffect(() => {
    const id = setInterval(() => {
      setTotal((t) => t + Math.floor(Math.random() * 120 + 40));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      data-revenue-strip
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Total counter */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em" }}>PLATFORM REVENUE</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: "#00FF88", letterSpacing: "-0.02em" }}>
              {formatMoney(total)}
            </span>
            <span style={{ fontSize: 7, color: "rgba(0,255,136,0.6)", letterSpacing: "0.15em" }}>TOTAL</span>
          </div>
        </div>
        <Link href="/admin/revenue" style={{ fontSize: 7, color: "#00FFFF", textDecoration: "none", letterSpacing: "0.1em" }}>
          FULL REPORT →
        </Link>
      </div>

      {/* Time toggle */}
      <div style={{ display: "flex", gap: 4 }}>
        {(["day", "week", "month"] as const).map((t) => (
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
            {t}
          </button>
        ))}
      </div>

      {/* Stream breakdown bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {STREAMS.map((s) => (
          <div key={s.id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>{s.label}</span>
              <span style={{ fontSize: 8, fontWeight: 900, color: s.color }}>{formatMoney(s.amount)}</span>
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
                  width: `${s.pct}%`,
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
    </div>
  );
}
