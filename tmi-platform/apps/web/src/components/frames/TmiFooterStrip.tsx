import type { CSSProperties, ReactNode } from "react";

type TmiFooterStripProps = {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
};

export default function TmiFooterStrip({ children, color = "#ffd700", style }: TmiFooterStripProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 26,
        padding: "5px 10px",
        borderTop: `1px solid ${color}66`,
        background: "rgba(5,5,16,0.9)",
        color,
        fontFamily: "var(--font-tmi-orbitron), 'Orbitron', sans-serif",
        fontSize: 10,
        letterSpacing: "0.04em",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
