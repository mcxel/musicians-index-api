"use client";

export default function ArtistRevenueRail() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255,215,0,0.04) 0%, rgba(0,0,0,0) 100%)",
        border: "1px solid rgba(255,215,0,0.12)",
        borderLeft: "3px solid #FFD700",
        borderRadius: 10,
        padding: "20px 24px",
        marginBottom: 20,
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#FFD700", marginBottom: 10 }}>
        Earnings
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.72)" }}>
        Earnings data is not available.
      </div>
    </div>
  );
}
