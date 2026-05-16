"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params?.get("session_id");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 72, marginBottom: 24 }}>✅</div>

        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
          Payment Confirmed
        </h1>

        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: "0 0 8px", lineHeight: 1.7 }}>
          Your subscription is now active. Check your email for a receipt and access details.
        </p>

        {sessionId && (
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", margin: "0 0 36px", wordBreak: "break-all" }}>
            Session: {sessionId}
          </p>
        )}
        {!sessionId && <div style={{ marginBottom: 36 }} />}

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/hub"
            style={{ padding: "13px 28px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 10, textDecoration: "none" }}
          >
            GO TO MY HUB
          </Link>
          <Link
            href="/shop"
            style={{ padding: "13px 28px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 10, textDecoration: "none" }}
          >
            KEEP SHOPPING
          </Link>
        </div>

        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 40 }}>
          Questions? <Link href="/support" style={{ color: "rgba(0,255,255,0.5)", textDecoration: "none" }}>Contact support</Link>
        </p>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh", background: "#050510" }} />}>
      <SuccessContent />
    </Suspense>
  );
}
