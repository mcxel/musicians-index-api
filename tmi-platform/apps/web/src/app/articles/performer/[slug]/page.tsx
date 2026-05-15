import { notFound } from "next/navigation";
import { getEditorialArticleBySlug } from "@/lib/editorial/NewsArticleModel";
import EditorialCanvasShell from "@/components/editorial/canvas/EditorialCanvasShell";
import ModularCanvasRouter from "@/components/editorial/canvas/ModularCanvasRouter";
import type { CanvasPayload } from "@/components/editorial/canvas/ModularCanvasRouter";

interface Props {
  params: { slug: string };
}

export default function PerformerArticlePage({ params }: Props) {
  const article = getEditorialArticleBySlug(params.slug);
  if (!article || article.category !== "performer") notFound();

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
