import { listMagazineArticles, type MagazineArticle } from "./MagazineArticleResolver";
import { rotateMagazineArticles } from "./MagazineRotationEngine";

export interface MagazineIssuePayload {
  issueId: string;
  issueLabel: string;
  publishedAt: string;
  cover: MagazineArticle;
  articles: MagazineArticle[];
}

// Issue 1 launched April 2026 (Q2 2026). Issues are quarterly — 3 months each.
const LAUNCH_YEAR = 2026;
const LAUNCH_QUARTER_INDEX = 1; // 0=Q1, 1=Q2(Apr), 2=Q3(Jul), 3=Q4(Oct)

const SEASON_NAMES = ["Winter", "Spring", "Summer", "Fall"];

function getQuarterIndex(month: number): number {
  return Math.floor(month / 3); // Jan-Mar=0, Apr-Jun=1, Jul-Sep=2, Oct-Dec=3
}

function issueNumberFromDate(date: Date): number {
  const year = date.getUTCFullYear();
  const quarter = getQuarterIndex(date.getUTCMonth());
  const quartersFromLaunch = (year - LAUNCH_YEAR) * 4 + (quarter - LAUNCH_QUARTER_INDEX);
  return Math.max(1, quartersFromLaunch + 1);
}

function issueLabelFromDate(date: Date): string {
  const year = date.getUTCFullYear();
  const quarter = getQuarterIndex(date.getUTCMonth());
  const season = SEASON_NAMES[quarter] ?? "Seasonal";
  const num = issueNumberFromDate(date);
  return `TMI Magazine — Issue ${num} · ${season} ${year}`;
}

function issueIdFromDate(date: Date): string {
  const num = issueNumberFromDate(date);
  return `issue-${num}`;
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
    issueLabel: issueLabelFromDate(now),
    publishedAt: now.toISOString(),
    cover,
    articles: rotated.slice(0, 12),
  };
}
