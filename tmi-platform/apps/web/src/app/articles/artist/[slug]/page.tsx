import { getEditorialArticleBySlug } from "@/lib/editorial/NewsArticleModel";
import PerformerCanvasMaster from "@/components/performer/PerformerCanvasMaster";
import type { PerformerCanvasData } from "@/components/performer/PerformerCanvasMaster";
import Link from "next/link";

interface Props {
  params: { slug: string };
}

function ArtistFallback({ slug }: { slug: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎤</div>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#00FFFF", fontWeight: 800, marginBottom: 12 }}>ARTIST PROFILE</div>
      <h1 style={{ fontSize: "clamp(1.2rem,3vw,1.8rem)", fontWeight: 900, marginBottom: 12 }}>Story Loading Into The Magazine</h1>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", maxWidth: 440, lineHeight: 1.7, marginBottom: 28 }}>
        The artist feature for <strong style={{ color: "#00FFFF" }}>{slug}</strong> is being prepared for the current issue.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/articles/artist" style={{ padding: "10px 20px", background: "#00FFFF", color: "#050510", fontWeight: 800, fontSize: 11, borderRadius: 8, textDecoration: "none" }}>ARTIST STORIES</Link>
        <Link href="/magazine" style={{ padding: "10px 20px", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 11, borderRadius: 8, textDecoration: "none" }}>MAGAZINE</Link>
        <Link href="/join" style={{ padding: "10px 20px", background: "#FF2DAA", color: "#fff", fontWeight: 800, fontSize: 11, borderRadius: 8, textDecoration: "none" }}>JOIN TMI</Link>
      </div>
    </div>
  );
}

export default function ArtistArticlePage({ params }: Props) {
  const article = getEditorialArticleBySlug(params.slug);
  if (!article || article.category !== "artist") return <ArtistFallback slug={params.slug} />;

  const slug = article.relatedArtistSlug ?? params.slug;
  const displayName = article.title.replace(/:.+/, "").trim();

  const canvasData: PerformerCanvasData = {
    displayName,
    slug,
    tagline:        article.headline,
    genre:          article.tags.find((t) => !["artist", "spotlight", "crown", "battle", "interview"].includes(t)) ?? "R&B",
    rank:           7,
    xp:             11240,
    crownProgress:  54,
    tippingHeat:    61,
    battleRecord:   { wins: 8, losses: 4 },
    bio:            article.snippet,
    accentColor:    "#00FFFF",
    secondaryColor: "#FF2DAA",
    isLive:         false,
    isVerified:     true,
    category:       "artist",
  };

  return <PerformerCanvasMaster {...canvasData} />;
}
