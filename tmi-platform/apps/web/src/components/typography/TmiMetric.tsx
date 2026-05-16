import type { CSSProperties, ReactNode } from "react";

type TmiMetricProps = {
  value: ReactNode;
  label?: string;
  color?: string;
  style?: CSSProperties;
};

export default function TmiMetric({ value, label, color = "#ffd700", style }: TmiMetricProps) {
  return (
    <div style={{ display: "grid", gap: 2, ...style }}>
      <span
        style={{
          fontFamily: "var(--font-tmi-orbitron), 'Orbitron', sans-serif",
          fontWeight: 700,
          fontSize: 16,
          color,
          letterSpacing: "0.04em",
          textShadow: `0 0 14px ${color}66`,
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      {label ? (
        <span
          style={{
            fontFamily: "var(--font-tmi-rajdhani), 'Rajdhani', sans-serif",
            fontSize: 11,
            color: "rgba(255,255,255,0.72)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
