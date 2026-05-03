import { ARTIST_SEED } from "@/lib/artists/artistSeed";
import MagazineArticleSurface from "@/components/magazine/MagazineArticleSurface";
import { getArticleBySlug } from "@/lib/magazine/magazineIssueData";
import { redirect } from "next/navigation";

type MagazineArticlePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ from?: string }>;
};

export default async function MagazineArticlePage({ params, searchParams }: MagazineArticlePageProps) {
  const { slug } = await params;
  const magazineArticle = getArticleBySlug(slug);
  if (magazineArticle) {
    redirect(`/magazine/article/${slug}`);
  }

  const resolvedSearch = searchParams ? await searchParams : undefined;
  const artist = ARTIST_SEED.find((entry) => entry.id === slug);
  const backFallback = resolvedSearch?.from ? decodeURIComponent(resolvedSearch.from) : "/home/2";

  return (
    <MagazineArticleSurface
      title={`${artist?.name ?? slug} Editorial Cover Story`}
      deck="Magazine article route hub for artist/performer editorial surfaces routed from homepage artifacts."
      authorLabel={artist?.name ?? "TMI Magazine"}
      fallbackRoute={backFallback}
      profileRoute={`/artists/${slug}`}
      articleHubRoute="/home/2"
      category="magazine"
    />
  );
}
