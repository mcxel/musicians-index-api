// apps/web/src/components/monetization/SponsorCoachingSticky.tsx
// Coaching note sticky card — shown on artist dashboard and profile owner view.
import Link from "next/link";

interface Props {
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  priority?: number;  // 1 = urgent (pink border), 2+ = normal (gold border)
  onDismiss?: () => void;
}

export function SponsorCoachingSticky({ headline, body, ctaLabel, ctaHref, priority = 2, onDismiss }: Props) {
  const urgent = priority === 1;
  return (
    <div style={{
      background: "#1E0D3E",
      border: `1px solid ${urgent ? "#FF2D78" : "rgba(255,184,0,0.4)"}`,
      borderLeft: `3px solid ${urgent ? "#FF2D78" : "#FFB800"}`,
      borderRadius: 8,
      padding: "12px 14px",
      marginBottom: 10,
      position: "relative",
    }}>
      {onDismiss && (
        <button onClick={onDismiss} style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: "#7A5F9A", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
      )}
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, fontWeight: 700, color: urgent ? "#FF2D78" : "#FFB800", letterSpacing: 0.5, marginBottom: 4 }}>
        {headline}
      </div>
      <div style={{ fontSize: 12, color: "#C8A8E8", lineHeight: 1.5, marginBottom: ctaLabel ? 10 : 0 }}>
        {body}
      </div>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} style={{ display: "inline-block", padding: "4px 12px", background: urgent ? "#FF2D78" : "rgba(255,184,0,0.15)", border: `1px solid ${urgent ? "#FF2D78" : "rgba(255,184,0,0.4)"}`, borderRadius: 4, fontSize: 10, fontFamily: "'Oswald', sans-serif", color: urgent ? "#fff" : "#FFB800", textDecoration: "none", letterSpacing: 1 }}>
          {ctaLabel} →
        </Link>
      )}
    </div>
  );
}
