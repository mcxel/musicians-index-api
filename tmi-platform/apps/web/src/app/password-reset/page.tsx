"use client";

import Link from "next/link";
import { useState } from "react";

export default function PasswordResetPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      await res.json();
      setSent(true);
    } catch {
      setError("Unable to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#00FFFF", letterSpacing: "0.18em", fontWeight: 800, marginBottom: 8 }}>TMI</div>
        <h1 style={{ margin: 0, fontSize: 28 }}>Password Reset</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 4 }}>Enter your account email and we&apos;ll send a reset link.</p>

        {!sent ? (
          <>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="you@example.com"
              type="email"
              style={{ width: "100%", marginTop: 10, marginBottom: 12, background: "#0e1023", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", padding: "11px 12px", boxSizing: "border-box" }}
            />
            {error && <div style={{ color: "#FF2DAA", fontSize: 12, marginBottom: 8 }}>{error}</div>}
            <button
              onClick={handleSend}
              disabled={!email.trim() || loading}
              style={{ width: "100%", border: "none", background: email.trim() ? "#00FFFF" : "rgba(0,255,255,0.3)", color: "#050510", borderRadius: 8, padding: "10px 12px", fontWeight: 800, cursor: email.trim() ? "pointer" : "not-allowed" }}
            >
              {loading ? "SENDING…" : "Send Reset Link"}
            </button>
          </>
        ) : (
          <div style={{ marginTop: 14, border: "1px solid rgba(0,255,136,0.35)", background: "rgba(0,255,136,0.08)", borderRadius: 8, padding: "14px 16px", color: "#00FF88", fontSize: 13, lineHeight: 1.6 }}>
            <strong>Check your email.</strong> If <em>{email}</em> is registered, a reset link has been sent. It expires in 20 minutes.
          </div>
        )}

        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/login" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>Back to login</Link>
          <Link href="/support" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: 12 }}>Contact support</Link>
        </div>
      </div>
    </main>
  );
}
