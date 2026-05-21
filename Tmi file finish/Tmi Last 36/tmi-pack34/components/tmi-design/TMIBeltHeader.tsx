// apps/web/src/components/tmi-design/TMIBeltHeader.tsx
interface Props {
  label: string;
  sub?: string;
  action?: { label: string; href: string };
}

export function TMIBeltHeader({ label, sub, action }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <span style={{ color: "#FFB800", fontSize: 14 }}>⚡</span>
      <span style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 20, color: "#FFB800", letterSpacing: 2 }}>{label}</span>
      {sub && <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, color: "#7A5F9A", letterSpacing: 1 }}>{sub}</span>}
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(255,184,0,0.4), transparent)" }} />
      {action && <a href={action.href} style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, color: "#00E5FF", textDecoration: "none", letterSpacing: 1 }}>{action.label} →</a>}
    </div>
  );
}
