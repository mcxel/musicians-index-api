import Link from "next/link";

type SponsorBlockProps = {
  name: string;
  label: string;
  description: string;
  cta: string;
  href: string;
  accent: string;
};

export default function SponsorBlock({ name, label, description, cta, href, accent }: SponsorBlockProps) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "#fff",
        display: "block",
        borderRadius: 16,
        border: `1px solid ${accent}55`,
        background: `linear-gradient(140deg, ${accent}2b, rgba(255,255,255,0.1), ${accent}12)`,
        padding: "16px 16px 14px",
        minHeight: 150,
        position: "relative",
        overflow: "hidden",
      }}
      className="sponsor-shimmer"
    >
      <div
        style={{
          position: "absolute",
          right: -30,
          top: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: `${accent}45`,
          filter: "blur(22px)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 8, letterSpacing: "0.22em", fontWeight: 900, textTransform: "uppercase", color: accent, marginBottom: 8 }}>
          {label}
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.15, marginBottom: 8 }}>{name}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.72)", lineHeight: 1.45, marginBottom: 12 }}>{description}</div>
        <div style={{ fontSize: 9, letterSpacing: "0.14em", fontWeight: 800, color: accent }}>{cta} →</div>
      </div>
    </Link>
  );
}
