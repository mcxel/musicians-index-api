// apps/web/src/components/tmi-design/TMILogo.tsx
import Link from "next/link";

interface Props {
  size?: "sm" | "md" | "lg";
  linked?: boolean;
}

const sizes = {
  sm: { top: 8, main: 18 },
  md: { top: 9, main: 22 },
  lg: { top: 11, main: 28 },
};

export function TMILogo({ size = "md", linked = true }: Props) {
  const s = sizes[size];
  const content = (
    <div style={{ lineHeight: 1, cursor: linked ? "pointer" : "default" }}>
      <div style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: s.top, color: "#00E5FF", letterSpacing: 3 }}>THE</div>
      <div style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: s.main, color: "#FFB800", letterSpacing: 2, lineHeight: 1 }}>MUSICIAN&apos;S INDEX</div>
    </div>
  );
  return linked ? <Link href="/" style={{ textDecoration: "none" }}>{content}</Link> : content;
}
