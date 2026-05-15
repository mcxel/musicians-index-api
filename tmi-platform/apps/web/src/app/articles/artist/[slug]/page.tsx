import { notFound } from "next/navigation";
import { getEditorialArticleBySlug } from "@/lib/editorial/NewsArticleModel";
import PerformerCanvasMaster from "@/components/performer/PerformerCanvasMaster";
import type { PerformerCanvasData } from "@/components/performer/PerformerCanvasMaster";

interface Props {
  params: { slug: string };
}

export default function ArtistArticlePage({ params }: Props) {
  const article = getEditorialArticleBySlug(params.slug);
  if (!article || article.category !== "artist") notFound();

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
