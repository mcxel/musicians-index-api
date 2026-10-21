import "server-only";

import {
  MAGAZINE_ISSUE_1,
  type MagazineArticle,
} from "@/lib/magazine/magazineIssueData";

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
    const { contributorAccountEngine } = await import(
      "@/lib/editorial-economy/ContributorAccountEngine"
    );
    const submission = await editorialSubmissionEngine.get(slug);
    if (submission && (submission.status === "approved" || submission.status === "published")) {
      const contributor = await contributorAccountEngine.get(submission.contributorId);
      const paragraphs = submission.body
        .split(/\n+/)
        .map((text: string) => text.trim())
        .filter(Boolean);

      return {
        slug: submission.submissionId,
        title: submission.title,
        subtitle: paragraphs[0]?.slice(0, 140) ?? submission.title,
        author: contributor?.displayName ?? "TMI Contributor",
        writerSlug: submission.contributorId,
        performerSlug: submission.artistSlug,
        publishedAt: submission.publishedAt ?? submission.updatedAt,
        category: submission.category === "interview" ? "interview" : "news",
        tags: [submission.category],
        heroColor: "#00FFFF",
        icon: "📝",
        blocks:
          paragraphs.length > 0
            ? paragraphs.map((text: string) => ({ type: "paragraph" as const, text }))
            : [{ type: "paragraph", text: submission.title }],
      };
    }
  } catch {
    /* engines unavailable */
  }
  return undefined;
}
