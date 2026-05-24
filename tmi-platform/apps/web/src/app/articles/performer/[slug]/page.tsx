import { getEditorialArticleBySlug } from "@/lib/editorial/NewsArticleModel";
import EditorialCanvasShell from "@/components/editorial/canvas/EditorialCanvasShell";
import ModularCanvasRouter from "@/components/editorial/canvas/ModularCanvasRouter";
import type { CanvasPayload } from "@/components/editorial/canvas/ModularCanvasRouter";
import Link from "next/link";

interface Props {
  params: { slug: string };
}

function PerformerFallback({ slug }: { slug: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎭</div>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#FF2DAA", fontWeight: 800, marginBottom: 12 }}>PERFORMER FEATURE</div>
      <h1 style={{ fontSize: "clamp(1.2rem,3vw,1.8rem)", fontWeight: 900, marginBottom: 12 }}>Story Loading Into The Magazine</h1>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", maxWidth: 440, lineHeight: 1.7, marginBottom: 28 }}>
        The performer feature for <strong style={{ color: "#FF2DAA" }}>{slug}</strong> is being prepared for the current issue.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/articles/performer" style={{ padding: "10px 20px", background: "#FF2DAA", color: "#fff", fontWeight: 800, fontSize: 11, borderRadius: 8, textDecoration: "none" }}>PERFORMER STORIES</Link>
        <Link href="/magazine" style={{ padding: "10px 20px", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 11, borderRadius: 8, textDecoration: "none" }}>MAGAZINE</Link>
        <Link href="/join" style={{ padding: "10px 20px", background: "#00FFFF", color: "#050510", fontWeight: 800, fontSize: 11, borderRadius: 8, textDecoration: "none" }}>JOIN TMI</Link>
      </div>
    </div>
  );
}

export default function PerformerArticlePage({ params }: Props) {
  const article = getEditorialArticleBySlug(params.slug);
  if (!article || article.category !== "performer") return <PerformerFallback slug={params.slug} />;

  const slug        = article.relatedPerformerSlug ?? params.slug;
  const displayName = article.title.replace(/:.+/, "").trim();
  const genre       = article.tags.find(
    (t) => !["performer", "spotlight", "crown", "battle", "interview"].includes(t)
  ) ?? "Hip-Hop";

  const payload: CanvasPayload = {
    displayName,
    slug,
    headline:      article.headline,
    genre,
    rank:          3,
    isLive:        false,
    isVerified:    true,
    accentColor:   "#FF2DAA",
    body:          article.body,
    sponsorBrand:  article.sponsorPlacementIds.length > 0 ? "SoundWave" : undefined,
    sponsorTagline: "The platform built for artists who compete at the highest level.",
    eventName:     `${displayName} — Live Performance`,
    eventVenue:    "TMI Main Stage",
    eventDate:     "Upcoming",
    ticketSeats:   18,
    ticketPrice:   "$12",
  };

  return (
    <EditorialCanvasShell
      displayName={displayName}
      accentColor="#FF2DAA"
      isLive={false}
      backHref="/performers"
      backLabel="← Performers"
      rankBadge="#3 Ranked"
    >
      <ModularCanvasRouter {...payload} />
    </EditorialCanvasShell>
  );
}
