import Link from "next/link";

type NeonRouteTileProps = {
  title: string;
  subtitle: string;
  href: string;
  accent: string;
};

export default function NeonRouteTile({ title, subtitle, href, accent }: NeonRouteTileProps) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <article
        style={{
          borderRadius: 14,
          border: `1px solid ${accent}44`,
          background: "rgba(7,9,15,0.74)",
          padding: 12,
          display: "grid",
          gap: 5,
          boxShadow: `inset 0 0 18px ${accent}22`,
          transition: "transform 160ms ease, box-shadow 160ms ease",
        }}
      >
        <div style={{ fontSize: 12, color: "#fff", fontWeight: 800 }}>{title}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.62)" }}>{subtitle}</div>
        <div style={{ fontSize: 9, color: accent, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>Open</div>
      </article>
    </Link>
  );
}
