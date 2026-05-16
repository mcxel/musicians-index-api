interface DashboardMetricCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  delta?: number;
  accentColor?: string;
  icon?: string;
}

export default function DashboardMetricCard({
  label,
  value,
  subLabel,
  delta,
  accentColor = "#00FFFF",
  icon,
}: DashboardMetricCardProps) {
  const isPositive = delta !== undefined && delta >= 0;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${accentColor}28`,
        borderRadius: 12,
        padding: "18px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
        <span style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>
          {label.toUpperCase()}
        </span>
      </div>

      <div style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, letterSpacing: "-0.02em", color: "#fff" }}>
        {value}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
        {subLabel && (
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{subLabel}</span>
        )}
        {delta !== undefined && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: isPositive ? "#00FF88" : "#FF2DAA",
            }}
          >
            {isPositive ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        )}
      </div>
    </div>
  );
}
