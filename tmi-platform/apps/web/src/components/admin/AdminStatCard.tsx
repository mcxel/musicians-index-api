import Link from "next/link";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  subvalue?: string;
  icon?: string;
  color?: string;
  href?: string;
  status?: "ok" | "warn" | "error";
  compact?: boolean;
}

const STATUS_COLOR = { ok: "#00FF88", warn: "#FFD700", error: "#FF5555" };

export default function AdminStatCard({ label, value, subvalue, icon = "📊", color = "#00FFFF", href, status, compact = false }: AdminStatCardProps) {
  const dotColor = status ? STATUS_COLOR[status] : undefined;

  const inner = (
    <div
      role="region"
      aria-label={`${label}: ${value}`}
      style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}18`, borderRadius: compact ? 8 : 10, padding: compact ? "12px 14px" : "18px 20px", display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{ fontSize: compact ? 18 : 24, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: 4, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
          {label}
          {dotColor && <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor, display: "inline-block" }} />}
        </div>
        <div style={{ fontSize: compact ? 18 : 24, fontWeight: 900, color, lineHeight: 1 }}>
          {value}
        </div>
        {subvalue && (
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{subvalue}</div>
        )}
      </div>
      {href && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14, flexShrink: 0, alignSelf: "center" }}>→</span>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "block" }} aria-label={`View ${label}`}>
        {inner}
      </Link>
    );
  }
  return inner;
}
