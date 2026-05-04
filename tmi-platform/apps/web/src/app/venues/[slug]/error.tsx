"use client";

import { useEffect } from "react";

export default function VenueError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Venue] route error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "40vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "32px 20px",
        background: "radial-gradient(ellipse at top, #0d0018 0%, #050510 60%)",
        color: "#fff",
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#FF4444", textTransform: "uppercase" }}>
        Venue Error
      </span>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", maxWidth: 400, textAlign: "center" }}>
        {error.message || "This section failed to load. Try again."}
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          borderRadius: 8,
          border: "1px solid #00FF8855",
          background: "#00FF880d",
          color: "#00FF88",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          padding: "8px 20px",
          cursor: "pointer",
        }}
      >
        Retry
      </button>
    </div>
  );
}
