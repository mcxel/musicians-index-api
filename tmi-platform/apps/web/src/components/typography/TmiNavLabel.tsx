import type { CSSProperties, ReactNode } from "react";

type TmiNavLabelProps = {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
};

export default function TmiNavLabel({ children, color = "#00ffff", style }: TmiNavLabelProps) {
  return (
    <span
      style={{
        fontFamily: "var(--font-tmi-orbitron), 'Orbitron', sans-serif",
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}