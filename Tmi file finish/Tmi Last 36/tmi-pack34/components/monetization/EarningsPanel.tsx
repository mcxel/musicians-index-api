// apps/web/src/components/monetization/EarningsPanel.tsx
// Artist earnings sidebar — always visible on dashboard and profile owner view.
"use client";
import Link from "next/link";

interface EarningsData {
  lifetimeTotal: number;
  thisMonth: number;
  thisWeek: number;
  pendingCents: number;
  availableCents: number;
  breakdown: { label: string; cents: number; color: string }[];
}

interface Props { data?: EarningsData; isLoading?: boolean; }

const EMPTY: EarningsData = {
  lifetimeTotal: 0, thisMonth: 0, thisWeek: 0, pendingCents: 0, availableCents: 0,
  breakdown: [
    { label: "Sponsors", cents: 0, color: "#FFB800" },
    { label: "Advertisers", cents: 0, color: "#00E5FF" },
    { label: "Tips", cents: 0, color: "#FF2D78" },
    { label: "Contest Prizes", cents: 0, color: "#7B2FBE" },
  ],
};

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function EarningsPanel({ data = EMPTY, isLoading = false }: Props) {
  const S = {
    panel: { background: "#150830", border: "1px solid rgba(255,184,0,0.3)", borderRadius: 12, padding: 16, width: "100%" },
    title: { fontFamily: "'Oswald', sans-serif", fontSize: 10, color: "#7A5F9A", letterSpacing: 2, marginBottom: 12 },
    bigNum: { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 32, color: "#FFB800", lineHeight: 1, marginBottom: 2 },
    bigLabel: { fontFamily: "'Oswald', sans-serif", fontSize: 9, color: "#7A5F9A", letterSpacing: 1.5, marginBottom: 16 },
    row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" as const },
    rowLabel: { fontFamily: "'Oswald', sans-serif", fontSize: 11, color: "#C8A8E8" },
    rowValue: { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 16, color: "#FFB800" },
    bar: { height: 3, background: "#1E0D3E", borderRadius: 2, marginTop: 10, marginBottom: 14 },
    cta: { display: "block", textAlign: "center" as const, padding: "8px", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 6, fontFamily: "'Oswald', sans-serif", fontSize: 11, color: "#00E5FF", textDecoration: "none", letterSpacing: 1, marginTop: 12 },
  };

  return (
    <div style={S.panel}>
      <div style={S.title}>💰 YOUR EARNINGS</div>

      {isLoading ? (
        <div style={{ ...S.bigNum, color: "#3D1E78" }}>——</div>
      ) : (
        <>
          <div style={S.bigNum}>{fmt(data.lifetimeTotal)}</div>
          <div style={S.bigLabel}>TOTAL WITH TMI</div>
        </>
      )}

      <div style={S.row}>
        <span style={S.rowLabel}>This Week</span>
        <span style={S.rowValue}>{fmt(data.thisWeek)}</span>
      </div>
      <div style={S.row}>
        <span style={S.rowLabel}>This Month</span>
        <span style={S.rowValue}>{fmt(data.thisMonth)}</span>
      </div>
      <div style={S.row}>
        <span style={S.rowLabel}>Pending</span>
        <span style={{ ...S.rowValue, color: "#C8A8E8" }}>{fmt(data.pendingCents)}</span>
      </div>
      <div style={{ ...S.row, borderBottom: "none" }}>
        <span style={S.rowLabel}>Available</span>
        <span style={{ ...S.rowValue, color: "#00C896" }}>{fmt(data.availableCents)}</span>
      </div>

      <div style={S.bar}>
        <div style={{ display: "flex", height: "100%", borderRadius: 2, overflow: "hidden" }}>
          {data.breakdown.map((b, i) => {
            const total = data.breakdown.reduce((s, x) => s + x.cents, 0) || 1;
            return <div key={i} style={{ width: `${(b.cents / total) * 100}%`, background: b.color, transition: "width 0.6s" }} />;
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {data.breakdown.map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: b.color }} />
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, color: "#7A5F9A" }}>{b.label}</span>
          </div>
        ))}
      </div>

      <Link href="/dashboard/artist/earnings" style={S.cta}>VIEW FULL BREAKDOWN →</Link>
    </div>
  );
}
