"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin/error]", error);
  }, [error]);

  return (
    <main style={{ minHeight: "100vh", background: "#07070f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🛑</div>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 12 }}>ADMIN PANEL ERROR</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Admin page failed to load</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 28 }}>
          An error occurred in the admin panel. No data was modified.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{ padding: "11px 26px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "linear-gradient(135deg,#FFD700,#FF9500)", borderRadius: 8, border: "none", cursor: "pointer" }}>
            RETRY
          </button>
          <Link href="/admin" style={{ padding: "11px 22px", fontSize: 10, fontWeight: 700, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>
            ADMIN HOME
          </Link>
        </div>
        {error.digest && (
          <div style={{ marginTop: 20, fontSize: 9, color: "rgba(255,255,255,0.15)", fontFamily: "monospace" }}>ref: {error.digest}</div>
        )}
        {process.env.NODE_ENV !== "production" && (
          <details style={{ marginTop: 14, textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.72)" }}>
            <summary style={{ cursor: "pointer", color: "#8CF9FF" }}>debug details</summary>
            <pre
              style={{
                marginTop: 8,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background: "rgba(0,0,0,0.32)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: 10,
                fontSize: 10,
                lineHeight: 1.5,
              }}
            >
              {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}
