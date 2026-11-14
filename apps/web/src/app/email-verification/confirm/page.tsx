"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ConfirmInner() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? null;
  const email = searchParams?.get("email")?.trim().toLowerCase() ?? "";

  type ConfirmState = "VERIFYING" | "SUCCESS" | "INVALID";
  const [state, setState] = useState<ConfirmState>("VERIFYING");

  useEffect(() => {
    if (!token || !email) { setState("INVALID"); return; }

    let cancelled = false;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email }),
    })
      .then(async (response) => {
        const result = await response.json() as { ok?: boolean };
        if (!cancelled) setState(response.ok && result.ok ? "SUCCESS" : "INVALID");
      })
      .catch(() => {
        if (!cancelled) setState("INVALID");
      });

    return () => { cancelled = true; };
  }, [token, email]);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "36px 28px", textAlign: "center" }}>
        {state === "VERIFYING" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16, animation: "spin 1s linear infinite" }}>⏳</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Verifying Email</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Validating your verification link...</p>
          </>
        )}
        {state === "SUCCESS" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#00FF88", marginBottom: 8 }}>Email Verified!</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 20 }}>
              Your email has been verified by TMI. You can now continue to your account.
            </p>
            <Link href="/auth" style={{ display: "inline-block", padding: "12px 28px", background: "linear-gradient(135deg,#00FF88,#00AA88)", color: "#050510", fontWeight: 800, fontSize: 12, borderRadius: 10, textDecoration: "none", letterSpacing: "0.12em" }}>
              CONTINUE TO SIGN IN
            </Link>
          </>
        )}
        {state === "INVALID" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#FF4444", marginBottom: 8 }}>Invalid Link</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 20 }}>
              This verification link is invalid or has expired.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Link href="/email-verification" style={{ padding: "11px 22px", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 9, color: "#FFD700", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
                RESEND EMAIL
              </Link>
              <Link href="/login" style={{ padding: "11px 22px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
                BACK TO LOGIN
              </Link>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

export default function EmailVerificationConfirmPage() {
  return (
    <Suspense>
      <ConfirmInner />
    </Suspense>
  );
}
