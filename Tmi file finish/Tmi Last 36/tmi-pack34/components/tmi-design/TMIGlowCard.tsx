// apps/web/src/components/tmi-design/TMIGlowCard.tsx
import { CSSProperties, ReactNode } from "react";

interface Props {
  children: ReactNode;
  accent?: "cyan" | "gold" | "pink" | "purple";
  padding?: number;
  style?: CSSProperties;
  onClick?: () => void;
}

const accents = {
  cyan:   { border: "rgba(0,229,255,0.3)",   glow: "rgba(0,229,255,0.15)" },
  gold:   { border: "rgba(255,184,0,0.45)",  glow: "rgba(255,184,0,0.15)" },
  pink:   { border: "rgba(255,45,120,0.45)", glow: "rgba(255,45,120,0.15)" },
  purple: { border: "rgba(123,47,190,0.45)", glow: "rgba(123,47,190,0.15)" },
};

export function TMIGlowCard({ children, accent = "cyan", padding = 20, style, onClick }: Props) {
  const a = accents[accent];
  return (
    <div
      onClick={onClick}
      style={{
        background: "#1E0D3E",
        border: `1px solid ${a.border}`,
        boxShadow: `0 0 16px ${a.glow}`,
        borderRadius: 12,
        padding,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
