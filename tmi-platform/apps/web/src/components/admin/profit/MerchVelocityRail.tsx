"use client";

import { useState } from "react";

export default function MerchVelocityRail() {
  const [priceShift, setPriceShift] = useState(4);

  return (
    <section style={{ border: "1px solid rgba(34,197,94,0.25)", borderRadius: 12, background: "rgba(10,39,22,0.35)", padding: 12 }}>
      <p style={{ margin: "0 0 8px", color: "#86efac", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
        Merch Velocity Rail
      </p>
      <p style={{ margin: "0 0 8px", color: "#cbd5e1", fontSize: 11 }}>Conversion 2.1% | Refund 9.4% | Overstock 17%</p>
      <label style={{ display: "grid", gap: 4 }}>
        <span style={{ color: "#bbf7d0", fontSize: 11 }}>Auto price correction {priceShift > 0 ? `+${priceShift}` : priceShift}%</span>
        <input type="range" min={-15} max={15} value={priceShift} onChange={(event) => setPriceShift(Number(event.target.value))} style={{ accentColor: "#22c55e" }} />
      </label>
    </section>
  );
}
