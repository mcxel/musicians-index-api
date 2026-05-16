import type { CSSProperties, ReactNode } from "react";

type TmiHeaderStripProps = {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
};

export default function TmiHeaderStrip({ children, color = "#00ffff", style }: TmiHeaderStripProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 28,
        padding: "6px 10px",
        borderBottom: `1px solid ${color}66`,
        background: `linear-gradient(90deg, ${color}33 0%, rgba(8,8,20,0.88) 100%)`,
        fontFamily: "var(--font-tmi-anton), 'Anton', sans-serif",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontSize: 11,
        color,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
