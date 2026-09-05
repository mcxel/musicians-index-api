import { permanentRedirect } from "next/navigation";
import { getMagazineArticleBySlug } from "@/lib/magazine/MagazineArticleResolver";
import { magazineReaderArticleUrl } from "@/lib/magazine/MagazineReaderRoutes";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { listMagazineArticlesByCategory } = await import("@/lib/magazine/MagazineArticleResolver");
  return listMagazineArticlesByCategory("news").map((article) => ({ slug: article.slug }));
}

export default async function LegacyMagazineNewsRedirect({ params }: Props) {
  const { slug } = await params;
  const article = getMagazineArticleBySlug(slug);
  if (!article) {
    permanentRedirect(magazineReaderArticleUrl("stream-win-radio-explained"));
  }
  permanentRedirect(magazineReaderArticleUrl(slug));
}
