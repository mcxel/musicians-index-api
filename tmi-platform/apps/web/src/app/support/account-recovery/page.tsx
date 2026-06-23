'use client';
import { FormEvent, useState } from "react";
import Link from "next/link";

export default function AccountRecoverySupportPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      // Always show success to avoid email enumeration
      setSubmitted(true);
    } catch {
      setError("Could not send recovery email. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#04050c,#090b18)", color: "#fff", padding: "40px 20px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", display: "grid", gap: 20 }}>
        <div>
          <Link href="/auth/forgot-password" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            ← Back to Forgot Password
          </Link>
        </div>

        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900 }}>Account Recovery</h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.6 }}>
          Enter the email address on your account. If an account exists, we will send you recovery instructions immediately.
        </p>

        {submitted ? (
          <div style={{ padding: "20px 22px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#00FF88", marginBottom: 6 }}>Recovery email sent</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
              If an account with that email exists, we have sent recovery instructions. Check your inbox and spam folder.
            </div>
            <div style={{ marginTop: 16 }}>
              <Link href="/auth/signin" style={{ fontSize: 13, color: "#93c5fd" }}>
                Return to sign in →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Account email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={busy}
                style={{
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(0,0,0,0.45)",
                  color: "#fff",
                  padding: "11px 14px",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </label>

            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.3)", borderRadius: 8, fontSize: 13, color: "#ff8888" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !email.trim()}
              style={{
                borderRadius: 10,
                border: "1px solid rgba(0,255,255,0.45)",
                background: busy || !email.trim() ? "rgba(0,0,0,0.2)" : "rgba(0,255,255,0.12)",
                color: "#bafcff",
                padding: "11px 14px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: busy || !email.trim() ? "not-allowed" : "pointer",
                opacity: busy || !email.trim() ? 0.55 : 1,
                fontSize: 13,
              }}
            >
              {busy ? "Sending…" : "Send recovery email"}
            </button>
          </form>
        )}

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, display: "flex", gap: 18, flexWrap: "wrap" }}>
          <Link href="/auth/signin" style={{ color: "#93c5fd", fontSize: 12 }}>
            Sign in
          </Link>
          <Link href="/auth/forgot-password" style={{ color: "#93c5fd", fontSize: 12 }}>
            Request password reset
          </Link>
          <Link href="/auth/session-recovery" style={{ color: "#93c5fd", fontSize: 12 }}>
            Session recovery
          </Link>
          <Link href="/support" style={{ color: "#93c5fd", fontSize: 12 }}>
            Contact support
          </Link>
        </div>
      </div>
    </main>
  );
}
