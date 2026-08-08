"use client";

/**
 * Dashboard-scoped error recovery — keeps global nav/shell reachable when a
 * workspace chunk throws. Root app/error.tsx (SYSTEM INTERRUPT) is last resort.
 */

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard error boundary]", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#050510",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.35em", color: "#FF2DAA", fontWeight: 800, marginBottom: 12 }}>
          WORKSPACE RECOVERY
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 12px" }}>Dashboard module failed</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 24, lineHeight: 1.5 }}>
          {error?.message?.slice(0, 200) ||
            "A workspace panel crashed. Navigation and account shell remain available."}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            RETRY WORKSPACE
          </button>
          <Link
            href="/"
            style={{
              padding: "10px 20px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              color: "#00FFFF",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: "0.1em",
              textDecoration: "none",
            }}
          >
            HOME
          </Link>
        </div>
      </div>
    </main>
  );
}
