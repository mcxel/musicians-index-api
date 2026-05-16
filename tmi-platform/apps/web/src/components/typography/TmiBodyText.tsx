import type { CSSProperties, ReactNode } from "react";

type TmiBodyTextProps = {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
};

export default function TmiBodyText({ children, color = "rgba(255,255,255,0.82)", style }: TmiBodyTextProps) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: "var(--font-tmi-rajdhani), 'Rajdhani', sans-serif",
        fontSize: 14,
        letterSpacing: "0.03em",
        lineHeight: 1.45,
        color,
        ...style,
      }}
    >
      {children}
    </p>
  );
}