import "server-only";

import {
  MAGAZINE_ISSUE_1,
  type MagazineArticle,
} from "@/lib/magazine/magazineIssueData";
import type { EditorialSubmission } from "@/lib/editorial-economy/types";

/**
 * Shared real-submission → canonical MagazineArticle mapping. Used by both
 * the single-slug resolver and the real approved-news pool builder — one
 * mapping, not duplicated logic that could drift apart.
 */
async function mapSubmissionToArticle(submission: EditorialSubmission): Promise<MagazineArticle> {
  const { contributorAccountEngine } = await import(
    "@/lib/editorial-economy/ContributorAccountEngine"
  );
  const { isSystemSourceContributorId, connectorIdFromSystemSource } = await import(
    "@/lib/newsroom/NewsroomSystemSource"
  );

  // §20982 Step 3 — a SYSTEM_NEWSROOM submission must never display with a
  // human-sounding byline like the generic "TMI Contributor" fallback; that
  // would blur the non-human-origin requirement. The sentinel contributorId
  // is the real, visible origin marker.
  const isSystemSource = isSystemSourceContributorId(submission.contributorId);
  const author = isSystemSource
    ? `TMI Newsroom (Automated · ${connectorIdFromSystemSource(submission.contributorId)})`
    : (await contributorAccountEngine.get(submission.contributorId))?.displayName ?? "TMI Contributor";
  const paragraphs = submission.body
    .split(/\n+/)
    .map((text: string) => text.trim())
    .filter(Boolean);

  return {
    slug: submission.submissionId,
    title: submission.title,
    subtitle: paragraphs[0]?.slice(0, 140) ?? submission.title,
    author,
    writerSlug: isSystemSource ? undefined : submission.contributorId,
    performerSlug: submission.artistSlug,
    publishedAt: submission.publishedAt ?? submission.updatedAt,
    category: submission.category === "interview" ? "interview" : "news",
    tags: [submission.category],
    heroColor: "#00FFFF",
    icon: "📝",
    sourceUrls: submission.sourceUrls?.length ? submission.sourceUrls : undefined,
    isSystemSource: isSystemSource || undefined,
    blocks:
      paragraphs.length > 0
        ? paragraphs.map((text: string) => ({ type: "paragraph" as const, text }))
        : [{ type: "paragraph", text: submission.title }],
  };
}

/**
 * Server-only article resolver: staff registry first, then approved
 * editorial submissions via Prisma-backed engines.
 * Never import this from client components (DiscoveryRail, MagazineShell, etc.).
 */
export async function getArticleBySlug(slug: string): Promise<MagazineArticle | undefined> {
  const staffArticle = MAGAZINE_ISSUE_1.find((a) => a.slug === slug);
  if (staffArticle) return staffArticle;

  try {
    const { editorialSubmissionEngine } = await import(
      "@/lib/editorial-economy/EditorialSubmissionEngine"
    );
    const submission = await editorialSubmissionEngine.get(slug);
    if (submission && (submission.status === "approved" || submission.status === "published")) {
      return mapSubmissionToArticle(submission);
    }
  } catch {
    /* engines unavailable */
  }
  return undefined;
}
