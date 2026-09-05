import { permanentRedirect } from "next/navigation";
import { getEditorialArticleBySlug } from "@/lib/editorial/NewsArticleModel";
import { getMagazineArticleBySlug } from "@/lib/magazine/MagazineArticleResolver";
import { getArticleBySlug } from "@/lib/magazine/magazineIssueData";
import { magazineReaderArticleUrl } from "@/lib/magazine/MagazineReaderRoutes";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article | TMI Magazine" };
  return {
    title: `${article.title} | TMI Magazine`,
    description: article.subtitle,
    alternates: { canonical: magazineReaderArticleUrl(slug) },
  };
}

export async function generateStaticParams() {
  const { MAGAZINE_ISSUE_1 } = await import("@/lib/magazine/magazineIssueData");
  return MAGAZINE_ISSUE_1.map((article) => ({ slug: article.slug }));
}

export default async function LegacyMagazineArticleRedirect({ params }: Props) {
  const { slug } = await params;

  if (getArticleBySlug(slug) || getMagazineArticleBySlug(slug)) {
    permanentRedirect(magazineReaderArticleUrl(slug));
  }

  const editorial = getEditorialArticleBySlug(slug);
  if (editorial) {
    const dest =
      editorial.category === "artist"
        ? `/articles/artist/${slug}`
        : editorial.category === "performer"
          ? `/articles/performer/${slug}`
          : `/articles/news/${slug}`;
    permanentRedirect(dest);
  }

  permanentRedirect(magazineReaderArticleUrl("wavetek-rise-billboard"));
}
