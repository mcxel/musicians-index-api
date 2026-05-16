"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function HomeError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[home/error]", error);
  }, [error]);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>⚡</div>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 12 }}>HOMEPAGE ERROR</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Something went wrong</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 28 }}>
          The homepage failed to load. Your session and progress are safe.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{ padding: "11px 26px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 8, border: "none", cursor: "pointer" }}>
            TRY AGAIN
          </button>
          <Link href="/" style={{ padding: "11px 22px", fontSize: 10, fontWeight: 700, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, textDecoration: "none" }}>
            BACK TO HOME
          </Link>
        </div>
        {error.digest && (
          <div style={{ marginTop: 20, fontSize: 9, color: "rgba(255,255,255,0.15)", fontFamily: "monospace" }}>ref: {error.digest}</div>
        )}
      </div>
    </main>
  );
}
