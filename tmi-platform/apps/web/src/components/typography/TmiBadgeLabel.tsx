import type { CSSProperties, ReactNode } from "react";

type TmiBadgeLabelProps = {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
};

export default function TmiBadgeLabel({ children, color = "#ff2daa", style }: TmiBadgeLabelProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 22,
        padding: "3px 10px",
        borderRadius: 999,
        border: `1px solid ${color}77`,
        background: `${color}20`,
        color,
        fontFamily: "var(--font-tmi-anton), 'Anton', sans-serif",
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        boxShadow: `0 0 14px ${color}33 inset`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
