import { NextResponse } from "next/server";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";
import { listMagazineArticles, listMagazineArticlesByCategory } from "@/lib/magazine/MagazineArticleResolver";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit = Number(searchParams.get("limit") ?? "20");

  const articles = category
    ? listMagazineArticlesByCategory(category)
    : listMagazineArticles();

  return NextResponse.json({
    issue: {
      id: "issue-1",
      title: "The Musician's Index — Issue 1",
      publishedAt: MAGAZINE_ISSUE_1[0]?.publishedAt ?? new Date().toISOString(),
      articleCount: articles.length,
    },
    articles: articles.slice(0, limit).map(a => ({
      slug: a.slug,
      title: a.title,
      summary: a.summary,
      author: a.author,
      category: a.category,
      tags: a.tags,
      rewardPoints: a.rewardPoints,
      publishedAt: a.publishedAt,
    })),
  });
}
