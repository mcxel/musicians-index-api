"use client";

// BroadcastHeroStatusBar — the "program output" status strip over the hero monitor.
// Rule 20: viewerCount renders only when a real number is supplied — never a
// fabricated default.
export function BroadcastHeroStatusBar({
  live,
  title,
  subtitle,
  qualityBadge,
  viewerCount,
}: {
  live: boolean;
  title: string;
  subtitle?: string;
  qualityBadge?: { label: string; sublabel?: string };
  viewerCount?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        left: 14,
        right: 14,
        zIndex: 10,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4, pointerEvents: "auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "3px 8px", width: "fit-content" }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: live ? "#ff2d2d" : "rgba(255,255,255,0.4)",
              boxShadow: live ? "0 0 10px #ff2d2daa" : "none",
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 900, color: live ? "#ff6b6b" : "rgba(255,255,255,0.6)", letterSpacing: "0.08em" }}>
            {live ? "LIVE NOW" : "STANDBY"}
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>▾</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: "rgba(245,239,255,0.7)" }}>{subtitle}</div>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto" }}>
        {qualityBadge && (
          <div style={{ borderRadius: 8, border: "1px solid rgba(255,215,0,0.6)", background: "rgba(0,0,0,0.55)", color: "#FFD700", fontSize: 11, fontWeight: 900, padding: "5px 8px", textAlign: "center", lineHeight: 1.1 }}>
            {qualityBadge.label}
            {qualityBadge.sublabel && <div style={{ fontSize: 8, letterSpacing: "0.1em" }}>{qualityBadge.sublabel}</div>}
          </div>
        )}
        {typeof viewerCount === "number" && (
          <div style={{ borderRadius: 999, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 12px" }}>
            👁 {viewerCount.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default BroadcastHeroStatusBar;
