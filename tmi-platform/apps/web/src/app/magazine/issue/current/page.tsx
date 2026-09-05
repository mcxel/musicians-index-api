import type { Metadata } from "next";
import MagazineIssueReader from "@/components/magazine/MagazineIssueReader";
import MagazineReaderCrawlBlock from "@/components/magazine/MagazineReaderCrawlBlock";
import { buildMagazineIssuePages } from "@/components/magazine/buildMagazineIssuePages";
import {
  getMagazineArticleCrawlText,
  MAGAZINE_CANONICAL_READER,
  magazineReaderArticleUrl,
  resolveMagazineReaderPageIndex,
} from "@/lib/magazine/MagazineReaderRoutes";
import { getArticleBySlug } from "@/lib/magazine/magazineIssueData";

type CurrentIssuePageProps = {
  searchParams?: Promise<{ article?: string; page?: string; from?: string }>;
};

export async function generateMetadata({ searchParams }: CurrentIssuePageProps): Promise<Metadata> {
  const resolved = searchParams ? await searchParams : undefined;
  const articleSlug = resolved?.article;
  const article = articleSlug ? getArticleBySlug(articleSlug) : undefined;

  if (article) {
    return {
      title: `${article.title} | TMI Magazine`,
      description: article.subtitle,
      alternates: { canonical: magazineReaderArticleUrl(article.slug) },
      openGraph: {
        title: article.title,
        description: article.subtitle,
        type: "article",
      },
    };
  }

  return {
    title: "TMI Magazine | Current Issue",
    description: "Read the current issue with mixed article, image, sponsor, poll, and video collage spreads.",
    alternates: { canonical: MAGAZINE_CANONICAL_READER },
  };
}

export default async function CurrentMagazineIssuePage({ searchParams }: CurrentIssuePageProps) {
  const resolved = searchParams ? await searchParams : undefined;
  const articleSlug = resolved?.article;
  const explicitPage = resolved?.page ? Number.parseInt(resolved.page, 10) : undefined;
  const from = resolved?.from;
  const initialPageIndex = resolveMagazineReaderPageIndex(articleSlug, explicitPage, "current");
  const pages = buildMagazineIssuePages("current");
  const crawl = articleSlug ? getMagazineArticleCrawlText(articleSlug) : null;

  return (
    <>
      {crawl ? (
        <MagazineReaderCrawlBlock
          title={crawl.title}
          deck={crawl.deck}
          author={crawl.author}
          publishedAt={crawl.publishedAt}
          body={crawl.body}
        />
      ) : null}
      <MagazineIssueReader
        issue="current"
        displayIssue="1"
        issueTitle="The Musician's Index"
        pages={pages}
        initialArticleSlug={articleSlug}
        initialPageIndex={initialPageIndex}
        returnTo={from}
      />
    </>
  );
}
