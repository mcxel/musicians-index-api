import { ARTIST_SEED } from "@/lib/artists/artistSeed";
import MagazineArticleSurface from "@/components/magazine/MagazineArticleSurface";

type ArtistArticlePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ from?: string }>;
};

export default async function ArtistArticlePage({ params, searchParams }: ArtistArticlePageProps) {
  const { slug } = await params;
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const artist = ARTIST_SEED.find((entry) => entry.id === slug);
  const backFallback = resolvedSearch?.from ? decodeURIComponent(resolvedSearch.from) : "/home/1";

  return (
    <MagazineArticleSurface
      title={`${artist?.name ?? slug} Feature Story`}
      deck="Direct article route from homepage artifacts. This surface stays in the magazine visual language and preserves source-aware return behavior."
      authorLabel={artist?.name ?? "TMI Editorial"}
      fallbackRoute={backFallback}
      profileRoute={`/artists/${slug}`}
      articleHubRoute={`/magazine/articles/${slug}`}
      category="artist"
    />
  );
}
