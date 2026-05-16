"use client";

import Link from "next/link";

export default function PerformerProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const ACCENT = "#FF2DAA";
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #06070d 0%, #040516 55%, #07030f 100%)",
        color: "#e4e4f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          background: "rgba(255,45,170,0.06)",
          border: `1px solid ${ACCENT}33`,
          borderRadius: 16,
          padding: "32px 28px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: ACCENT,
            marginBottom: 10,
          }}
        >
          Performer Profile Error
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", marginBottom: 8 }}>
          Could not load performer
        </h1>
        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
          {error.message ?? "Something went wrong loading this performer profile."}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              background: ACCENT,
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.08em",
            }}
          >
            Retry
          </button>
          <Link
            href="/performers"
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              color: "#94a3b8",
              fontSize: 11,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Browse Performers
          </Link>
        </div>
      </div>
    </div>
  );
}
