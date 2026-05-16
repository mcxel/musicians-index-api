"use client";

import Link from "next/link";
import { useState } from "react";

export default function DeviceTrustPage() {
  const [trusted, setTrusted] = useState(false);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#00FFFF", letterSpacing: "0.18em", fontWeight: 800, marginBottom: 8 }}>AUTH LOOP</div>
        <h1 style={{ margin: 0, fontSize: 28 }}>Device Trust</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Mark this device as trusted for fast re-entry and recovery.</p>

        <button onClick={() => setTrusted(true)} style={{ width: "100%", border: "none", background: "#00FFFF", color: "#050510", borderRadius: 8, padding: "10px 12px", fontWeight: 800, cursor: "pointer", marginTop: 10 }}>
          Trust This Device
        </button>

        <div style={{ marginTop: 12, border: "1px solid rgba(255,255,255,0.14)", borderRadius: 8, padding: "10px 12px", color: trusted ? "#00FF88" : "#aaa", fontSize: 12 }}>
          {trusted ? "Trusted device token issued." : "Device not trusted yet."}
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/session-recovery" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 12 }}>Session recovery</Link>
          <Link href="/login" style={{ color: "#FF2DAA", textDecoration: "none", fontSize: 12 }}>Return to login</Link>
        </div>
      </div>
    </main>
  );
}
