"use client";

import { useState } from "react";

export default function EmergencyCorrectionPanel() {
  const [locked, setLocked] = useState(false);
  const [freeze, setFreeze] = useState(false);

  return (
    <section style={{ border: "1px solid rgba(239,68,68,0.35)", borderRadius: 12, background: "rgba(69,10,10,0.42)", padding: 12 }}>
      <p style={{ margin: "0 0 8px", color: "#fca5a5", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
        Emergency Correction Panel
      </p>
      <p style={{ margin: "0 0 10px", color: "#fecaca", fontSize: 11 }}>
        LOSS above threshold, identify source, apply correction, monitor 24h, re-evaluate, escalate.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={() => setLocked((v) => !v)} style={{ borderRadius: 6, border: "1px solid rgba(239,68,68,0.4)", background: "rgba(127,29,29,0.35)", color: locked ? "#86efac" : "#fca5a5", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 8px", cursor: "pointer", fontWeight: 800 }}>{locked ? "Corrections Locked" : "Lock Corrections"}</button>
        <button type="button" onClick={() => setFreeze((v) => !v)} style={{ borderRadius: 6, border: "1px solid rgba(239,68,68,0.4)", background: "rgba(127,29,29,0.35)", color: freeze ? "#fde68a" : "#fca5a5", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 8px", cursor: "pointer", fontWeight: 800 }}>{freeze ? "Emergency Freeze Active" : "Emergency Freeze"}</button>
      </div>
    </section>
  );
}
