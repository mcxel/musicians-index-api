import { contributorTrustGateEngine } from "@/lib/editorial-economy/ContributorTrustGateEngine";
import { contentSafetyEngine } from "@/lib/editorial-economy/ContentSafetyEngine";
import { editorialSubmissionEngine } from "@/lib/editorial-economy/EditorialSubmissionEngine";
import { sourceValidationEngine } from "@/lib/editorial-economy/SourceValidationEngine";

class ArticleReviewQueueEngine {
  listQueue() {
    return editorialSubmissionEngine.list().filter((submission) => submission.status === "submitted");
  }

  approve(submissionId: string, reviewerId: string) {
    const reviewerGate = contributorTrustGateEngine.canApprove(reviewerId);
    if (!reviewerGate.allowed) {
      return { ok: false as const, reason: reviewerGate.reason ?? "reviewer-blocked" };
    }

    const submission = editorialSubmissionEngine.get(submissionId);
    if (!submission) {
      return { ok: false as const, reason: "submission-not-found" };
    }

    const sourceValidation = sourceValidationEngine.validate(submission.sourceUrls);
    if (!sourceValidation.valid) {
      return { ok: false as const, reason: sourceValidation.reason ?? "source-validation-failed" };
    }

    const safety = contentSafetyEngine.validate({ title: submission.title, body: submission.body });
    if (!safety.safe) {
      return { ok: false as const, reason: safety.reason ?? "safety-validation-failed" };
    }

    const next = editorialSubmissionEngine.update({
      ...submission,
      status: "approved",
      rejectionReason: undefined,
    });

    return { ok: true as const, submission: next };
  }

  reject(submissionId: string, reviewerId: string, reason: string) {
    const reviewerGate = contributorTrustGateEngine.canApprove(reviewerId);
    if (!reviewerGate.allowed) {
      return { ok: false as const, reason: reviewerGate.reason ?? "reviewer-blocked" };
    }

    const submission = editorialSubmissionEngine.get(submissionId);
    if (!submission) {
      return { ok: false as const, reason: "submission-not-found" };
    }

    const next = editorialSubmissionEngine.update({
      ...submission,
      status: "rejected",
      rejectionReason: reason,
    });

    return { ok: true as const, submission: next };
  }
}

export const articleReviewQueueEngine = new ArticleReviewQueueEngine();
