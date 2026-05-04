"use client";

import { useEffect } from "react";

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Booking] route error:", error);
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
        background: "radial-gradient(ellipse at top, #0a1a0a 0%, #050510 60%)",
        color: "#fff",
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.28em",
          color: "#FF4444",
          textTransform: "uppercase",
        }}
      >
        Booking Error
      </span>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", maxWidth: 400, textAlign: "center" }}>
        {error.message || "The booking module failed to load. Try refreshing."}
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          borderRadius: 8,
          border: "1px solid rgba(0,255,136,0.35)",
          background: "rgba(0,255,136,0.06)",
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
