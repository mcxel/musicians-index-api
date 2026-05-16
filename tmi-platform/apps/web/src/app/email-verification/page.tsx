"use client";

import Link from "next/link";
import { useState } from "react";

export default function EmailVerificationPage() {
  const [code, setCode] = useState("");
  const verified = code.trim().length >= 6;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#FFD700", letterSpacing: "0.18em", fontWeight: 800, marginBottom: 8 }}>AUTH LOOP</div>
        <h1 style={{ margin: 0, fontSize: 28 }}>Email Verification</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Enter verification code to unlock trusted device/session recovery.</p>

        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" style={{ width: "100%", marginTop: 10, marginBottom: 12, background: "#0e1023", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", padding: "11px 12px" }} />
        <div style={{ border: "1px solid rgba(255,255,255,0.14)", borderRadius: 8, padding: "10px 12px", color: verified ? "#00FF88" : "#aaa", fontSize: 12 }}>
          {verified ? "Verification complete." : "Waiting for verification code."}
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/device-trust" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>Trust this device</Link>
          <Link href="/session-recovery" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 12 }}>Recover session</Link>
          <Link href="/login" style={{ color: "#FF2DAA", textDecoration: "none", fontSize: 12 }}>Continue to login</Link>
        </div>
      </div>
    </main>
  );
}
