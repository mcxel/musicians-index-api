import Link from "next/link";
import DealsRail from "@/components/sponsors/DealsRail";

export default function SponsorDealsPage({ params }: { params: { slug: string } }) {
  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: "0 0 40px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(2,6,23,0.96)", borderBottom: "1px solid rgba(0,255,255,0.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href={`/sponsors/${params.slug}`} style={{ color: "#00FFFF", fontSize: 10, textDecoration: "none", border: "1px solid rgba(0,255,255,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← HUB</Link>
        <strong style={{ color: "#00FFFF", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>DEALS</strong>
        <span style={{ color: "#64748b", fontSize: 10 }}>{params.slug}</span>
      </header>
      <div style={{ padding: "14px 20px", maxWidth: 700 }}>
        <DealsRail sponsorSlug={params.slug} />
      </div>
    </main>
  );
}
