import { ARTIST_SEED } from "@/lib/artists/artistSeed";
import MagazineArticleSurface from "@/components/magazine/MagazineArticleSurface";

type PerformerArticlePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ from?: string }>;
};

export default async function PerformerArticlePage({ params, searchParams }: PerformerArticlePageProps) {
  const { slug } = await params;
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const performer = ARTIST_SEED.find((entry) => entry.id === slug);
  const backFallback = resolvedSearch?.from ? decodeURIComponent(resolvedSearch.from) : "/home/3";

  return (
    <MagazineArticleSurface
      title={`${performer?.name ?? slug} Performer Spotlight`}
      deck="Performer-focused magazine spread opened directly from homepage artifact ARTICLE buttons."
      authorLabel={performer?.name ?? "TMI Performer Desk"}
      fallbackRoute={backFallback}
      profileRoute={`/performers/${slug}`}
      articleHubRoute={`/magazine/articles/${slug}`}
      category="performer"
    />
  );
}
