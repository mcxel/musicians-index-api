import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  compact?: boolean;
}

export default function EmptyState({ icon = "📭", title, description, ctaLabel, ctaHref, compact = false }: EmptyStateProps) {
  return (
    <div style={{ textAlign:"center", padding: compact ? "24px 16px" : "48px 20px" }}>
      {!compact && <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>}
      <div style={{ fontSize: compact ? 12 : 14, fontWeight:800, color:"rgba(255,255,255,0.55)", letterSpacing:1, marginBottom: compact ? 4 : 8 }}>{title}</div>
      {description && <div style={{ fontSize: compact ? 9 : 11, color:"rgba(255,255,255,0.25)", marginBottom:compact?0:16, maxWidth:300, margin: compact ? "0 auto" : "0 auto 16px" }}>{description}</div>}
      {ctaLabel && ctaHref && !compact && (
        <Link href={ctaHref}
          style={{ display:"inline-block", marginTop:16, padding:"10px 22px", fontSize:10, fontWeight:800, letterSpacing:"0.15em", color:"#050510", background:"linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius:7, textDecoration:"none" }}>
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
