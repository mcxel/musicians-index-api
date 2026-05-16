"use client";

import Link from "next/link";
import { useState } from "react";

export default function PasswordResetPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#00FFFF", letterSpacing: "0.18em", fontWeight: 800, marginBottom: 8 }}>AUTH LOOP</div>
        <h1 style={{ margin: 0, fontSize: 28 }}>Password Reset</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Request a reset link and continue your session recovery chain.</p>

        {!sent ? (
          <>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: "100%", marginTop: 10, marginBottom: 12, background: "#0e1023", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", padding: "11px 12px" }} />
            <button onClick={() => setSent(Boolean(email))} style={{ width: "100%", border: "none", background: "#00FFFF", color: "#050510", borderRadius: 8, padding: "10px 12px", fontWeight: 800, cursor: "pointer" }}>
              Send Reset Link
            </button>
          </>
        ) : (
          <div style={{ marginTop: 14, border: "1px solid rgba(0,255,136,0.35)", background: "rgba(0,255,136,0.08)", borderRadius: 8, padding: "10px 12px", color: "#00FF88", fontSize: 12 }}>
            Reset token issued. Continue to email verification.
          </div>
        )}

        <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/email-verification" style={{ color: "#FFD700", textDecoration: "none", fontSize: 12 }}>Email verification</Link>
          <Link href="/session-recovery" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 12 }}>Session recovery</Link>
          <Link href="/login" style={{ color: "#FF2DAA", textDecoration: "none", fontSize: 12 }}>Back to login</Link>
        </div>
      </div>
    </main>
  );
}
