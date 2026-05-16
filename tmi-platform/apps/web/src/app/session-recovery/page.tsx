"use client";

import Link from "next/link";
import { useState } from "react";
import { setSession } from "@/lib/auth/session";

export default function SessionRecoveryPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const recover = () => {
    if (!email) return;
    setSession(`recovered:${Date.now()}`, "MEMBER");
    setDone(true);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#AA2DFF", letterSpacing: "0.18em", fontWeight: 800, marginBottom: 8 }}>AUTH LOOP</div>
        <h1 style={{ margin: 0, fontSize: 28 }}>Session Recovery</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Recover access and restore your chain back into profile/magazine/lobby.</p>

        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Account email" style={{ width: "100%", marginTop: 10, marginBottom: 12, background: "#0e1023", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", padding: "11px 12px" }} />
        <button onClick={recover} style={{ width: "100%", border: "none", background: "#AA2DFF", color: "#fff", borderRadius: 8, padding: "10px 12px", fontWeight: 800, cursor: "pointer" }}>
          Recover Session
        </button>

        {done && (
          <div style={{ marginTop: 12, border: "1px solid rgba(0,255,136,0.35)", background: "rgba(0,255,136,0.08)", borderRadius: 8, padding: "10px 12px", color: "#00FF88", fontSize: 12 }}>
            Session restored.
          </div>
        )}

        <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/hub/fan" style={{ color: "#00FF88", textDecoration: "none", fontSize: 12 }}>Go to profile</Link>
          <Link href="/magazine" style={{ color: "#FFD700", textDecoration: "none", fontSize: 12 }}>Open magazine</Link>
          <Link href="/login" style={{ color: "#FF2DAA", textDecoration: "none", fontSize: 12 }}>Back to login</Link>
        </div>
      </div>
    </main>
  );
}
