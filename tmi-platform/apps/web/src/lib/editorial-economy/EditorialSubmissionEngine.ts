import prisma from "@/lib/prisma";
import type { EditorialSubmission as DbEditorialSubmission } from "@prisma/client";
import { contributorTrustGateEngine } from "@/lib/editorial-economy/ContributorTrustGateEngine";
import type { EditorialSubmission } from "@/lib/editorial-economy/types";

const TO_DB_CATEGORY: Record<EditorialSubmission["category"], DbEditorialSubmission["category"]> = {
  news: "NEWS",
  artist: "ARTIST",
  performer: "PERFORMER",
  sponsor: "SPONSOR",
  advertiser: "ADVERTISER",
  interview: "INTERVIEW",
};
const FROM_DB_CATEGORY: Record<DbEditorialSubmission["category"], EditorialSubmission["category"]> = {
  NEWS: "news",
  ARTIST: "artist",
  PERFORMER: "performer",
  SPONSOR: "sponsor",
  ADVERTISER: "advertiser",
  INTERVIEW: "interview",
};

const TO_DB_STATUS: Record<EditorialSubmission["status"], DbEditorialSubmission["status"]> = {
  draft: "DRAFT",
  submitted: "SUBMITTED",
  approved: "APPROVED",
  published: "PUBLISHED",
  rejected: "REJECTED",
};
const FROM_DB_STATUS: Record<DbEditorialSubmission["status"], EditorialSubmission["status"]> = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  PUBLISHED: "published",
  REJECTED: "rejected",
};

function fromDb(row: DbEditorialSubmission): EditorialSubmission {
  return {
    submissionId: row.submissionId,
    contributorId: row.contributorId,
    title: row.title,
    body: row.body,
    category: FROM_DB_CATEGORY[row.category],
    sourceUrls: row.sourceUrls,
    artistSlug: row.artistSlug ?? undefined,
    sponsorSlug: row.sponsorSlug ?? undefined,
    status: FROM_DB_STATUS[row.status],
    rejectionReason: row.rejectionReason ?? undefined,
    publishedArticleSlug: row.publishedArticleSlug ?? undefined,
    publishedAt: row.publishedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

class EditorialSubmissionEngine {
  async submit(input: {
    contributorId: string;
    title: string;
    body: string;
    category: EditorialSubmission["category"];
    sourceUrls: string[];
    artistSlug?: string;
    sponsorSlug?: string;
  }) {
    const gate = await contributorTrustGateEngine.canSubmit(input.contributorId);
    if (!gate.allowed) {
      return { ok: false as const, reason: gate.reason ?? "blocked" };
    }

    const submissionId = `sub-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const row = await prisma.editorialSubmission.create({
      data: {
        submissionId,
        contributorId: input.contributorId,
        title: input.title,
        body: input.body,
        category: TO_DB_CATEGORY[input.category],
        sourceUrls: input.sourceUrls,
        artistSlug: input.artistSlug,
        sponsorSlug: input.sponsorSlug,
        status: "SUBMITTED",
      },
    });

    return { ok: true as const, submission: fromDb(row) };
  }

  async get(submissionId: string): Promise<EditorialSubmission | undefined> {
    const row = await prisma.editorialSubmission.findUnique({ where: { submissionId } });
    return row ? fromDb(row) : undefined;
  }

  async list(): Promise<EditorialSubmission[]> {
    const rows = await prisma.editorialSubmission.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(fromDb);
  }

  async update(submission: EditorialSubmission): Promise<EditorialSubmission> {
    const row = await prisma.editorialSubmission.update({
      where: { submissionId: submission.submissionId },
      data: {
        title: submission.title,
        body: submission.body,
        category: TO_DB_CATEGORY[submission.category],
        sourceUrls: submission.sourceUrls,
        artistSlug: submission.artistSlug,
        sponsorSlug: submission.sponsorSlug,
        status: TO_DB_STATUS[submission.status],
        rejectionReason: submission.rejectionReason,
      },
    });
    return fromDb(row);
  }

  /**
   * Magazine composition authority calls this once it actually selects an
   * approved submission into a built issue — the writer/editor never calls
   * this directly (approval only clears review; placement is a separate,
   * later decision owned by MagazineRotationEngine). Idempotent: re-selecting
   * an already-published submission into a later issue build is a no-op.
   */
  async markPublished(submissionId: string, articleSlug: string): Promise<EditorialSubmission | null> {
    const current = await this.get(submissionId);
    if (!current) return null;
    if (current.status === "published") return current;
    if (current.status !== "approved") return null;

    const row = await prisma.editorialSubmission.update({
      where: { submissionId },
      data: {
        status: "PUBLISHED",
        publishedArticleSlug: articleSlug,
        publishedAt: new Date(),
      },
    });
    return fromDb(row);
  }
}

export const editorialSubmissionEngine = new EditorialSubmissionEngine();
