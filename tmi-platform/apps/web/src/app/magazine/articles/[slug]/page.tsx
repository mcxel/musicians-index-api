import { permanentRedirect } from "next/navigation";
import { magazineReaderArticleUrl } from "@/lib/magazine/MagazineReaderRoutes";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";
import { getArticleBySlug } from "@/lib/magazine/getArticleBySlug";

type MagazineArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return MAGAZINE_ISSUE_1.map((article) => ({ slug: article.slug }));
}

export default async function LegacyMagazineArticlesRedirect({ params }: MagazineArticlePageProps) {
  const { slug } = await params;
  if (await getArticleBySlug(slug)) {
    permanentRedirect(magazineReaderArticleUrl(slug));
  }
  permanentRedirect(magazineReaderArticleUrl("wavetek-rise-billboard"));
}
