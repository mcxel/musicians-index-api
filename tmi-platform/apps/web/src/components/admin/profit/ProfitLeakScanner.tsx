"use client";

import { useMemo, useState } from "react";

type LeakSeverity = "low" | "medium" | "high";

type LeakRecord = {
  id: string;
  source: string;
  severity: LeakSeverity;
  estimatedLossUsd: number;
  note: string;
};

const LEAK_SETS: LeakRecord[][] = [
  [
    { id: "lk-01", source: "Merch Refund Spike", severity: "high", estimatedLossUsd: 12420, note: "Refund rate above 14% in top 5 SKUs" },
    { id: "lk-02", source: "Dead Venue Inventory", severity: "medium", estimatedLossUsd: 6800, note: "42 seats unsold average in weak region" },
    { id: "lk-03", source: "Sponsor Churn Drift", severity: "medium", estimatedLossUsd: 5900, note: "CTR drop on two prime placements" },
  ],
  [
    { id: "lk-04", source: "Over-Rewarded Prize Pool", severity: "high", estimatedLossUsd: 9300, note: "Coverage fell below sponsor floor" },
    { id: "lk-05", source: "Low Conversion Merch", severity: "medium", estimatedLossUsd: 5100, note: "Checkout conversion at 1.8%" },
    { id: "lk-06", source: "Ad Inefficiency", severity: "low", estimatedLossUsd: 2300, note: "CPM elevated in two audience bands" },
  ],
];

const severityColor: Record<LeakSeverity, string> = {
  low: "#86efac",
  medium: "#fcd34d",
  high: "#fca5a5",
};

export default function ProfitLeakScanner() {
  const [scanIndex, setScanIndex] = useState(0);

  const leaks = useMemo(() => LEAK_SETS[scanIndex % LEAK_SETS.length], [scanIndex]);
  const totalLeak = useMemo(
    () => leaks.reduce((sum, record) => sum + record.estimatedLossUsd, 0),
    [leaks],
  );

  return (
    <section style={{ border: "1px solid rgba(251,191,36,0.25)", borderRadius: 12, background: "rgba(25,10,40,0.45)", padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div>
          <p style={{ margin: 0, color: "#fcd34d", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 800 }}>
            Profit Leak Scanner
          </p>
          <p style={{ margin: "4px 0 0", color: "#e2e8f0", fontSize: 12 }}>
            Estimated daily leak: ${totalLeak.toLocaleString()}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setScanIndex((value) => value + 1)}
          style={{ borderRadius: 8, border: "1px solid rgba(251,191,36,0.4)", background: "rgba(120,53,15,0.32)", color: "#fde68a", fontSize: 10, letterSpacing: "0.08em", fontWeight: 800, padding: "6px 10px", cursor: "pointer", textTransform: "uppercase" }}
        >
          Run Scan
        </button>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {leaks.map((record) => (
          <article key={record.id} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, background: "rgba(0,0,0,0.32)", padding: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
              <p style={{ margin: 0, color: "#f8fafc", fontSize: 12, fontWeight: 700 }}>{record.source}</p>
              <span style={{ color: severityColor[record.severity], fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 800 }}>
                {record.severity}
              </span>
            </div>
            <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: 11 }}>{record.note}</p>
            <p style={{ margin: "6px 0 0", color: "#fca5a5", fontSize: 11, fontWeight: 700 }}>Loss: ${record.estimatedLossUsd.toLocaleString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
