import { permanentRedirect } from "next/navigation";
import { getMagazineArticleBySlug } from "@/lib/magazine/MagazineArticleResolver";
import { magazineReaderArticleUrl } from "@/lib/magazine/MagazineReaderRoutes";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { listMagazineArticlesByCategory } = await import("@/lib/magazine/MagazineArticleResolver");
  return listMagazineArticlesByCategory("artist").map((article) => ({ slug: article.slug }));
}

export default async function LegacyMagazineArtistRedirect({ params }: Props) {
  const { slug } = await params;
  const article = getMagazineArticleBySlug(slug);
  if (!article) {
    permanentRedirect(magazineReaderArticleUrl("wavetek-rise-billboard"));
  }
  permanentRedirect(magazineReaderArticleUrl(slug));
}
