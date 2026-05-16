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
}

export const editorialSubmissionEngine = new EditorialSubmissionEngine();
