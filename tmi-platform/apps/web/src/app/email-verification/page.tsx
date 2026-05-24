"use client";

import Link from "next/link";
import { useState } from "react";

export default function EmailVerificationPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const verified = code.trim().length >= 6;

  async function handleResend() {
    setResending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        setResent(true);
        setTimeout(() => setResent(false), 10000);
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Failed to resend. Try again shortly.");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "36px 28px" }}>
        <div style={{ fontSize: 10, color: "#FFD700", letterSpacing: "0.18em", fontWeight: 800, marginBottom: 10 }}>AUTH LOOP</div>
        <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 900 }}>Verify Your Email</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
          We sent a verification link to your email address. Check your inbox (and spam folder) to confirm your account.
        </p>

        {/* Check Your Email notice */}
        <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12, padding: "16px 18px", marginBottom: 24, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ fontSize: 24, flexShrink: 0 }}>📧</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#FFD700", marginBottom: 4 }}>Check Your Email</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
              Click the link in the email we sent you. The link expires in 24 hours.
            </div>
          </div>
        </div>

        {/* Code entry (6-digit backup flow) */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 8 }}>OR ENTER CODE MANUALLY</div>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            maxLength={6}
            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${verified ? "rgba(0,255,136,0.4)" : "rgba(255,255,255,0.12)"}`, borderRadius: 8, color: "#fff", padding: "12px 14px", fontSize: 18, letterSpacing: "0.3em", textAlign: "center", boxSizing: "border-box" }}
          />
          {verified && (
            <Link href={`/email-verification/confirm?token=${code}`} style={{ display: "block", marginTop: 10, padding: "12px", textAlign: "center", background: "linear-gradient(135deg,#00FF88,#00AA88)", color: "#050510", fontWeight: 800, fontSize: 12, borderRadius: 9, textDecoration: "none", letterSpacing: "0.12em" }}>
              VERIFY CODE
            </Link>
          )}
        </div>

        {/* Resend section */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 20 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
            Didn&apos;t receive it?
          </div>
          {resent ? (
            <div style={{ padding: "10px 14px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 8, fontSize: 12, color: "#00FF88" }}>
              ✅ Verification email resent! Check your inbox.
            </div>
          ) : (
            <button
              onClick={() => void handleResend()}
              disabled={resending}
              style={{ width: "100%", padding: "12px", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 9, color: resending ? "rgba(255,255,255,0.3)" : "#FFD700", fontSize: 11, fontWeight: 800, cursor: resending ? "not-allowed" : "pointer", letterSpacing: "0.1em" }}
            >
              {resending ? "SENDING..." : "RESEND VERIFICATION EMAIL"}
            </button>
          )}
          {error && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(255,68,68,0.06)", border: "1px solid rgba(255,68,68,0.25)", borderRadius: 8, fontSize: 11, color: "#FF4444" }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11 }}>
          <Link href="/device-trust" style={{ color: "#00FFFF", textDecoration: "none" }}>Trust this device</Link>
          <Link href="/session-recovery" style={{ color: "#AA2DFF", textDecoration: "none" }}>Recover session</Link>
          <Link href="/login" style={{ color: "#FF2DAA", textDecoration: "none" }}>Back to login</Link>
        </div>
      </div>
    </main>
  );
}
