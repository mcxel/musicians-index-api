import { listMagazineArticles, type MagazineArticle } from "./MagazineArticleResolver";
import { rotateMagazineArticles } from "./MagazineRotationEngine";

export interface MagazineIssuePayload {
  issueId: string;
  issueLabel: string;
  publishedAt: string;
  cover: MagazineArticle;
  articles: MagazineArticle[];
}

function issueIdFromDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `issue-${year}-${month}`;
}

export function buildMagazineIssue(nowMs = Date.now()): MagazineIssuePayload {
  const now = new Date(nowMs);
  const allArticles = listMagazineArticles();
  const rotated = rotateMagazineArticles(allArticles, nowMs);
  const cover = rotated[0] ?? allArticles[0];

  if (!cover) {
    throw new Error("No articles available to build issue");
  }

  return {
    issueId: issueIdFromDate(now),
    issueLabel: `Issue ${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
    publishedAt: now.toISOString(),
    cover,
    articles: rotated.slice(0, 12),
  };
}
