import Link from "next/link";
import { listArtistBillboards } from "@/lib/billboards/BillboardRegistry";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ArtistBillboardsPage({ params }: Props) {
  const { slug } = await params;
  const billboards = listArtistBillboards(slug);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 16px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <p style={{ color: "#00FFFF", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 11 }}>Artist Billboard Gallery</p>
        <h1 style={{ fontSize: 42, margin: "10px 0 14px" }}>{slug.replace(/-/g, " ")} billboards</h1>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
          {billboards.map((item) => (
            <Link key={item.billboardId} href={`/billboards/${item.slug}`} style={{ textDecoration: "none", color: "inherit", border: "1px solid rgba(0,255,255,0.28)", borderRadius: 12, background: "rgba(0,255,255,0.04)", padding: 12 }}>
              <p style={{ margin: 0, color: "#00FFFF", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.campaignType}</p>
              <h2 style={{ margin: "6px 0 8px", fontSize: 18 }}>{item.title}</h2>
              <p style={{ margin: 0, color: "#bbb", fontSize: 13 }}>{item.country} · {item.genre}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
