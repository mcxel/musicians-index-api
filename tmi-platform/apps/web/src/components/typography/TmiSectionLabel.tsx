import type { CSSProperties, ReactNode } from "react";

type TmiSectionLabelProps = {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
};

export default function TmiSectionLabel({ children, color = "#00ffff", style }: TmiSectionLabelProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 8px",
        borderRadius: 999,
        border: `1px solid ${color}66`,
        background: `${color}1a`,
        color,
        fontFamily: "var(--font-tmi-anton), 'Anton', sans-serif",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        fontSize: 10,
        lineHeight: 1,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
