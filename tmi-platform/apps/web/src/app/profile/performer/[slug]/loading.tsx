export default function PerformerProfileLoading() {
  const ACCENT = "#FF2DAA";
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #06070d 0%, #040516 55%, #07030f 100%)",
        color: "#e4e4f0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Nav skeleton */}
      <div style={{ borderBottom: `1px solid ${ACCENT}22`, padding: "10px 24px", height: 44, background: `${ACCENT}07` }} />

      {/* Hero skeleton */}
      <div style={{ padding: "32px 28px 0", maxWidth: 1200, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,45,170,0.12)", border: `1px solid ${ACCENT}33`, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ height: 22, width: 200, borderRadius: 6, background: "rgba(255,255,255,0.06)", marginBottom: 10 }} />
            <div style={{ height: 13, width: 280, borderRadius: 4, background: "rgba(255,255,255,0.04)" }} />
          </div>
        </div>

        {/* Rail skeletons */}
        <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 300px", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[140, 100, 120].map((h, i) => (
              <div key={i} style={{ height: h, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", animation: "tmi-shimmer 1.5s infinite" }} />
            ))}
          </div>
          <div style={{ height: 260, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
        </div>
      </div>
    </div>
  );
}
