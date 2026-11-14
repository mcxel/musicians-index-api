import { randomUUID } from "crypto";
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

    // Collision-safe under real concurrency — Date.now()+small-random was fine
    // for an in-memory Map but not for a unique DB column under real load.
    const submissionId = `sub-${randomUUID()}`;

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
    // Atomic conditional transition (UPDATE ... WHERE submissionId = ? AND
    // status = 'APPROVED') rather than read-then-write — two concurrent
    // publish attempts (e.g. two issue builds racing) can't both succeed,
    // and a publish racing an approve/reject can't land on a half-checked state.
    const result = await prisma.editorialSubmission.updateMany({
      where: { submissionId, status: "APPROVED" },
      data: {
        status: "PUBLISHED",
        publishedArticleSlug: articleSlug,
        publishedAt: new Date(),
      },
    });

    if (result.count === 1) {
      return (await this.get(submissionId)) ?? null;
    }

    // The conditional update matched nothing — either already published
    // (idempotent no-op, return current state) or not in a publishable
    // state (not found / draft / submitted / rejected).
    const current = await this.get(submissionId);
    return current?.status === "published" ? current : null;
  }
}

export const editorialSubmissionEngine = new EditorialSubmissionEngine();
