"use client";

import Link from "next/link";

export default function ArenaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <div style={{ maxWidth: 600, margin: "0 auto", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, padding: 24, background: "rgba(127,29,29,0.15)" }}>
        <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3em", color: "#fca5a5", marginBottom: 4 }}>Arena Error</p>
        <h1 style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", marginTop: 0 }}>Route Recovery Required</h1>
        <p style={{ fontSize: 12, color: "#cbd5e1" }}>A recoverable error occurred while loading this arena.</p>
        {error?.message && (
          <p style={{ fontSize: 11, color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "8px 12px", marginTop: 8, background: "rgba(0,0,0,0.3)" }}>
            {error.message}
          </p>
        )}
        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            onClick={reset}
            style={{ border: "1px solid rgba(45,212,191,0.35)", borderRadius: 8, background: "rgba(13,148,136,0.15)", color: "#ccfbf1", padding: "6px 14px", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer" }}
          >
            Retry
          </button>
          <Link href="/home/3" style={{ border: "1px solid rgba(148,163,184,0.3)", borderRadius: 8, background: "rgba(30,41,59,0.4)", color: "#cbd5e1", padding: "6px 14px", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", textDecoration: "none" }}>
            ← Back to Live
          </Link>
        </div>
      </div>
    </main>
  );
}
