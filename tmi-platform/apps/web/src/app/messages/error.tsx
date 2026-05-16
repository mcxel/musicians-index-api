"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function MessagesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[messages/error]", error);
  }, [error]);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>💬</div>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 12 }}>MESSAGES ERROR</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Inbox failed to load</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 28 }}>
          There was a problem loading your messages. Your conversations are safe and no messages were lost.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{ padding: "11px 26px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", borderRadius: 8, border: "none", cursor: "pointer" }}>
            RETRY
          </button>
          <Link href="/hub" style={{ padding: "11px 22px", fontSize: 10, fontWeight: 700, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>
            GO TO HUB
          </Link>
        </div>
        {error.digest && (
          <div style={{ marginTop: 20, fontSize: 9, color: "rgba(255,255,255,0.15)", fontFamily: "monospace" }}>ref: {error.digest}</div>
        )}
      </div>
    </main>
  );
}
