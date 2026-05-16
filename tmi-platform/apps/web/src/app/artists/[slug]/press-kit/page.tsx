import type { Metadata } from "next";
import Link from "next/link";
import { ARTIST_SEED } from "@/lib/artists/artistSeed";
import { ArtistKnowledgePanelEngine } from "@/lib/seo/ArtistKnowledgePanelEngine";
import { ArtistExposureEngine } from "@/lib/promotion/ArtistExposureEngine";

type ArtistPressKitPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ArtistPressKitPageProps): Promise<Metadata> {
  const { slug } = await params;
  const knowledge = ArtistKnowledgePanelEngine.build(slug.toLowerCase());

  return {
    title: `${knowledge.metadata.title} | Press Kit`,
    description: `Press kit and media package for ${knowledge.slug}.`,
    alternates: { canonical: `${knowledge.canonical}/press-kit` },
    keywords: [...knowledge.metadata.keywords, "artist press kit", "artist media package"],
  };
}

export default async function ArtistPressKitPage({ params }: ArtistPressKitPageProps) {
  const { slug } = await params;
  const normalized = slug.toLowerCase();
  const seed = ARTIST_SEED.find((artist) => artist.id === normalized);
  const knowledge = ArtistKnowledgePanelEngine.build(normalized);
  const exposure = ArtistExposureEngine.buildGraph(normalized);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 16px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(knowledge.schema) }} />
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 42 }}>Press Kit</h1>
        <p style={{ color: "#bdbdd3", marginTop: 8 }}>{seed?.name ?? knowledge.slug} media package, booking links, and promotional assets.</p>

        <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href={`/artists/${normalized}`} style={{ color: "#00FFFF", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Artist Profile</Link>
          <Link href={`/artists/${normalized}/campaigns`} style={{ color: "#FF2DAA", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Campaigns</Link>
          <Link href="/artists" style={{ color: "#FFD700", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Artists Index</Link>
        </div>

        <section style={{ marginTop: 18, display: "grid", gap: 10 }}>
          <div style={{ border: "1px solid rgba(0,255,255,0.34)", borderRadius: 10, padding: 12, background: "rgba(0,255,255,0.06)" }}>
            <strong>Biography</strong>
            <div style={{ color: "#c9c9de", marginTop: 4 }}>Genre: {seed?.genre ?? "Music"} · Country Hub: {exposure.countryHub}</div>
          </div>
          <div style={{ border: "1px solid rgba(255,45,170,0.34)", borderRadius: 10, padding: 12, background: "rgba(255,45,170,0.08)" }}>
            <strong>Media Assets</strong>
            <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
              {exposure.billboards.map((item) => (
                <Link key={item} href={item} style={{ color: "#ffb4e4", textDecoration: "none" }}>{item}</Link>
              ))}
            </div>
          </div>
          <div style={{ border: "1px solid rgba(255,215,0,0.34)", borderRadius: 10, padding: 12, background: "rgba(255,215,0,0.08)" }}>
            <strong>Booking and Tickets</strong>
            <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
              <Link href={`/booking/artists/${normalized}`} style={{ color: "#ffe6a0", textDecoration: "none" }}>Book this Artist</Link>
              {exposure.tickets.map((item) => (
                <Link key={item} href={item} style={{ color: "#ffe6a0", textDecoration: "none" }}>{item}</Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
