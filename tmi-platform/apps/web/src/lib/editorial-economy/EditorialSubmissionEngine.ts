import { contributorTrustGateEngine } from "@/lib/editorial-economy/ContributorTrustGateEngine";
import type { EditorialSubmission } from "@/lib/editorial-economy/types";

class EditorialSubmissionEngine {
  private readonly submissions = new Map<string, EditorialSubmission>();

  submit(input: {
    contributorId: string;
    title: string;
    body: string;
    category: EditorialSubmission["category"];
    sourceUrls: string[];
    artistSlug?: string;
    sponsorSlug?: string;
  }) {
    const gate = contributorTrustGateEngine.canSubmit(input.contributorId);
    if (!gate.allowed) {
      return { ok: false as const, reason: gate.reason ?? "blocked" };
    }

    const submissionId = `sub-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();

    const submission: EditorialSubmission = {
      submissionId,
      contributorId: input.contributorId,
      title: input.title,
      body: input.body,
      category: input.category,
      sourceUrls: input.sourceUrls,
      artistSlug: input.artistSlug,
      sponsorSlug: input.sponsorSlug,
      status: "submitted",
      createdAt: now,
      updatedAt: now,
    };

    this.submissions.set(submissionId, submission);
    return { ok: true as const, submission };
  }

  get(submissionId: string): EditorialSubmission | undefined {
    return this.submissions.get(submissionId);
  }

  list(): EditorialSubmission[] {
    return Array.from(this.submissions.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  update(submission: EditorialSubmission): EditorialSubmission {
    const next: EditorialSubmission = {
      ...submission,
      updatedAt: new Date().toISOString(),
    };
    this.submissions.set(submission.submissionId, next);
    return next;
  }

  /**
   * Magazine composition authority calls this once it actually selects an
   * approved submission into a built issue — the writer/editor never calls
   * this directly (approval only clears review; placement is a separate,
   * later decision owned by MagazineRotationEngine). Idempotent: re-selecting
   * an already-published submission into a later issue build is a no-op.
   */
  markPublished(submissionId: string, articleSlug: string): EditorialSubmission | null {
    const current = this.submissions.get(submissionId);
    if (!current || current.status !== "approved") return current?.status === "published" ? current : null;

    const next: EditorialSubmission = {
      ...current,
      status: "published",
      publishedArticleSlug: articleSlug,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.submissions.set(submissionId, next);
    return next;
  }
}

export const editorialSubmissionEngine = new EditorialSubmissionEngine();
