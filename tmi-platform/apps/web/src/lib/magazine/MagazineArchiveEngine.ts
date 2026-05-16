// ─── Types ────────────────────────────────────────────────────────────────────

export type MagazineIssueStatus = "draft" | "live" | "archived";

export type MagazineArticle = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  authorId: string;
  authorName: string;
  coverImageUrl?: string;
  category: "feature" | "interview" | "review" | "editorial" | "sponsored";
  bodyHtml: string;
  tags: string[];
  publishedAtMs: number;
  readTimeMin: number;
  sponsorId?: string;
};

export type MagazineIssue = {
  id: string;
  slug: string;
  issueNumber: number;
  title: string;
  coverImageUrl?: string;
  theme: string;
  status: MagazineIssueStatus;
  articles: MagazineArticle[];
  publishedAtMs: number;
  archivedAtMs?: number;
};

// ─── Registry ─────────────────────────────────────────────────────────────────

const issueRegistry = new Map<string, MagazineIssue>();
const articleIndex  = new Map<string, MagazineArticle>();
let _issueCounter = 0;
let _articleCounter = 0;

// ─── Public API ───────────────────────────────────────────────────────────────

export function createIssue(
  issueNumber: number,
  slug: string,
  title: string,
  theme: string,
  coverImageUrl?: string,
): MagazineIssue {
  const issue: MagazineIssue = {
    id: `issue-${++_issueCounter}`,
    slug,
    issueNumber,
    title,
    coverImageUrl,
    theme,
    status: "draft",
    articles: [],
    publishedAtMs: 0,
  };
  issueRegistry.set(slug, issue);
  return issue;
}

export function publishIssue(slug: string): boolean {
  const issue = issueRegistry.get(slug);
  if (!issue) return false;
  issue.status = "live";
  issue.publishedAtMs = Date.now();
  return true;
}

export function archiveIssue(slug: string): boolean {
  const issue = issueRegistry.get(slug);
  if (!issue) return false;
  issue.status = "archived";
  issue.archivedAtMs = Date.now();
  return true;
}

export function addArticleToIssue(
  issueSlug: string,
  article: Omit<MagazineArticle, "id">,
): MagazineArticle | null {
  const issue = issueRegistry.get(issueSlug);
  if (!issue) return null;
  const full: MagazineArticle = { id: `art-${++_articleCounter}`, ...article };
  issue.articles.push(full);
  articleIndex.set(full.slug, full);
  return full;
}

export function getIssueBySlug(slug: string): MagazineIssue | undefined {
  return issueRegistry.get(slug);
}

export function getArticleBySlug(slug: string): MagazineArticle | undefined {
  return articleIndex.get(slug);
}

export function getLiveIssues(): MagazineIssue[] {
  return Array.from(issueRegistry.values())
    .filter(i => i.status === "live")
    .sort((a, b) => b.issueNumber - a.issueNumber);
}

export function getArchive(): MagazineIssue[] {
  return Array.from(issueRegistry.values())
    .filter(i => i.status === "archived")
    .sort((a, b) => b.issueNumber - a.issueNumber);
}

export function getAllIssues(): MagazineIssue[] {
  return Array.from(issueRegistry.values())
    .sort((a, b) => b.issueNumber - a.issueNumber);
}

export function searchArticles(query: string): MagazineArticle[] {
  const lower = query.toLowerCase();
  return Array.from(articleIndex.values()).filter(a =>
    a.title.toLowerCase().includes(lower) ||
    a.tags.some(t => t.toLowerCase().includes(lower)) ||
    a.authorName.toLowerCase().includes(lower),
  );
}
