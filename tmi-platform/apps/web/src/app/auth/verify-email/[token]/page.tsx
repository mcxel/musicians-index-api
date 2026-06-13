"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RecoveryStatusCard from "@/components/auth/RecoveryStatusCard";

type Props = {
  params: { token: string };
  searchParams?: { email?: string };
};

export default function VerifyEmailTokenPage({ params, searchParams }: Props) {
  const email = (searchParams?.email ?? "").trim().toLowerCase();
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "warning">("idle");
  const [message, setMessage] = useState("Ready to verify email token.");
  const [busy, setBusy] = useState(false);

  // Auto-verify if email is present in the URL (link clicked from email client)
  useEffect(() => {
    if (email && params.token) {
      handleVerify();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVerify() {
    if (done || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, email }),
      });
      const data = await res.json() as { ok: boolean; reason?: string };
      setDone(true);
      if (data.ok) {
        setStatus("success");
        setMessage("Email verified successfully. You can now log in.");
      } else if (data.reason === "expired") {
        setStatus("warning");
        setMessage("Verification token expired. Request a new one below.");
      } else if (data.reason === "used") {
        setStatus("warning");
        setMessage("This verification link has already been used.");
      } else {
        setStatus("error");
        setMessage("Invalid verification token. Please check the link or request a new one.");
      }
    } catch {
      setDone(true);
      setStatus("error");
      setMessage("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#04050c,#090b18)", color: "#fff", padding: "40px 20px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900 }}>Verify Email</h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.74)" }}>
          Confirm account email ownership with a single-use verification token.
        </p>

        {!done && (
          <button
            onClick={handleVerify}
            disabled={busy}
            style={{
              borderRadius: 10,
              border: "1px solid rgba(0,255,255,0.5)",
              background: busy ? "rgba(0,255,255,0.06)" : "rgba(0,255,255,0.12)",
              color: "#bafcff",
              padding: "10px 12px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? "Verifying…" : "Verify email"}
          </button>
        )}

        {done && status === "success" && (
          <Link
            href="/auth"
            style={{ display: "inline-block", textAlign: "center", padding: "11px 24px", background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.4)", borderRadius: 10, color: "#00FF88", fontWeight: 800, fontSize: 13, textDecoration: "none" }}
          >
            Go to Login →
          </Link>
        )}

        {done && status !== "success" && (
          <Link
            href="/auth/forgot-password"
            style={{ display: "inline-block", textAlign: "center", padding: "11px 24px", background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 10, color: "#00FFFF", fontWeight: 800, fontSize: 13, textDecoration: "none" }}
          >
            Request New Verification Link
          </Link>
        )}

        <RecoveryStatusCard title="Verification Status" status={status} message={message} />

        <Link href="/auth" style={{ color: "#93c5fd", fontSize: 13 }}>
          ← Back to auth
        </Link>
      </div>
    </main>
  );
}
