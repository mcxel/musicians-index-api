import type { CSSProperties, ReactNode } from "react";

type TmiCardTitleProps = {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
};

export default function TmiCardTitle({ children, color = "#ffffff", style }: TmiCardTitleProps) {
  return (
    <h3
      style={{
        margin: 0,
        fontFamily: "var(--font-tmi-bebas), 'Bebas Neue', sans-serif",
        fontSize: 24,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color,
        lineHeight: 0.95,
        ...style,
      }}
    >
      {children}
    </h3>
  );
}
