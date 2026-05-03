import { notFound } from "next/navigation";
import { getArticleBySlug, MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";
import MagazineSpreadRenderer from "@/components/editorial/MagazineSpreadRenderer";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return MAGAZINE_ISSUE_1.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found | TMI" };
  return {
    title: `${article.title} | TMI Magazine`,
    description: article.subtitle,
    openGraph: { title: article.title, description: article.subtitle, type: "article" },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return notFound();

  const relatedArticles = MAGAZINE_ISSUE_1.filter((a) => a.slug !== slug);

  return <MagazineSpreadRenderer article={article} issueNumber={1} related={relatedArticles} />;
}
