"use client";

/**
 * Rule 20: no mock SEC-OPS lines. Honest empty until a real trust/security log API feeds this rail.
 */

export default function TrustKillerFeed() {
  return (
    <div
      style={{
        background: "rgba(5,5,16,0.95)",
        border: "1px solid rgba(255,45,170,0.3)",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxShadow: "0 0 30px rgba(255,45,170,0.1)",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,45,170,0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.15em" }}>
          TRUST KILLER FEED
        </span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>NO EVENTS</span>
      </div>
      <div
        style={{
          padding: 16,
          flex: 1,
          display: "grid",
          placeItems: "center",
          fontFamily: "monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.4)",
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        No trust/security events in the live feed yet.
        <br />
        Real telemetry only — nothing fabricated.
      </div>
    </div>
  );
}
