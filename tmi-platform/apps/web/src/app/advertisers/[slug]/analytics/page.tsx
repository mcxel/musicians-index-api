import Link from "next/link";
import ROIRail from "@/components/advertisers/ROIRail";

export default function AdvertiserAnalyticsPage({ params }: { params: { slug: string } }) {
  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: "0 0 40px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(2,6,23,0.96)", borderBottom: "1px solid rgba(168,85,247,0.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href={`/advertisers/${params.slug}`} style={{ color: "#c4b5fd", fontSize: 10, textDecoration: "none", border: "1px solid rgba(168,85,247,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← HUB</Link>
        <strong style={{ color: "#c4b5fd", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>ANALYTICS</strong>
        <span style={{ color: "#64748b", fontSize: 10 }}>{params.slug}</span>
      </header>
      <div style={{ padding: "14px 20px", maxWidth: 700 }}>
        <ROIRail />
      </div>
    </main>
  );
}
