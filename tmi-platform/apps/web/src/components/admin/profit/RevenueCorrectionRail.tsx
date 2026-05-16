"use client";

import { useState } from "react";

type Correction = {
  id: string;
  label: string;
  impact: string;
  approved: boolean;
};

const INITIAL: Correction[] = [
  { id: "cr-01", label: "Rebalance artist split in weak venues", impact: "+4.2% margin", approved: true },
  { id: "cr-02", label: "Rotate low CTR sponsor slots", impact: "+2.8% sponsor ROI", approved: false },
  { id: "cr-03", label: "Apply dynamic pricing to low-fill events", impact: "+6.1% ticket yield", approved: true },
  { id: "cr-04", label: "Discount dead-stock merch bundles", impact: "+3.5% cash recovery", approved: false },
];

export default function RevenueCorrectionRail() {
  const [corrections, setCorrections] = useState(INITIAL);

  const toggleApproval = (id: string) => {
    setCorrections((items) =>
      items.map((item) => (item.id === id ? { ...item, approved: !item.approved } : item)),
    );
  };

  return (
    <section style={{ border: "1px solid rgba(168,85,247,0.26)", borderRadius: 12, background: "rgba(35,14,58,0.45)", padding: 12 }}>
      <p style={{ margin: "0 0 10px", color: "#c4b5fd", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 800 }}>
        Revenue Correction Rail
      </p>
      <div style={{ display: "grid", gap: 8 }}>
        {corrections.map((item) => (
          <article key={item.id} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, background: "rgba(0,0,0,0.28)", padding: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
              <p style={{ margin: 0, color: "#e2e8f0", fontSize: 12, fontWeight: 700 }}>{item.label}</p>
              <button
                type="button"
                onClick={() => toggleApproval(item.id)}
                style={{ borderRadius: 6, border: "1px solid rgba(196,181,253,0.4)", background: item.approved ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.14)", color: item.approved ? "#86efac" : "#fda4af", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 8px", cursor: "pointer", fontWeight: 800 }}
              >
                {item.approved ? "Approved" : "Pending"}
              </button>
            </div>
            <p style={{ margin: "5px 0 0", color: "#fcd34d", fontSize: 11, fontWeight: 700 }}>{item.impact}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
