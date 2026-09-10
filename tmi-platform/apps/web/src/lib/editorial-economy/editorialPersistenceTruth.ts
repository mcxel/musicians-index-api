/**
 * P0-A — Editorial-economy persistence truth ledger (code authority, not a new markdown doc).
 *
 * Status vocabulary:
 *   IN_MEMORY         — module-scoped Map / pure compute; lost on process restart
 *   PRISMA_PERSISTED  — live DB rows via applied Prisma models
 *   HYBRID            — schema drafted OR partial DB + runtime Map still authoritative
 *   MISSING           — no model and no durable store
 *
 * UPDATE (same day, post-ea6d428f): the engines were rewritten to call Prisma
 * directly (ContributorAccountEngine / EditorialSubmissionEngine /
 * EditorialPerformanceEngine + every dependent — ContributorTrustGateEngine,
 * ArticleReviewQueueEngine, ContributorPayoutEngine — are now async), and the
 * getArticleBySlug()-family async ripple was completed across all real
 * consumers (magazineIssueData.ts, MagazineRotationEngine.ts,
 * MagazineReaderRoutes.ts, buildMagazineIssuePages.tsx, and every route that
 * calls them). There is no in-memory Map fallback left in the code.
 *
 * BUT: no `prisma migrate` has been run against any database (this
 * environment has no DATABASE_URL configured at all — not even a local/test
 * one — so it could not be run from here regardless). The tables described
 * by the schema draft do not exist in any real database yet. Until a real
 * migration is applied, every call in this module will throw a Postgres
 * "relation does not exist" error at runtime. Status below reflects that:
 * code-complete + schema-drafted is HYBRID, not PRISMA_PERSISTED, until the
 * migration actually lands.
 *
 * Closest existing Prisma models checked before drafting (do not converge blindly):
 *   Article  — staff-authored only; no review workflow / contributorId / sourceUrls
 *   Payout   — wallet/Stripe payouts; not editorial engagement payout calculation
 *   No Consent* model for contributor editorial rights
 */

export type PersistenceTruth =
  | "IN_MEMORY"
  | "PRISMA_PERSISTED"
  | "HYBRID"
  | "MISSING";

export type EditorialPersistenceDomain =
  | "ContributorAccount"
  | "EditorialSubmission"
  | "ArticleReviewQueue"
  | "ContributorTrustGate"
  | "EditorialPerformance"
  | "ContributorPayout"
  | "ContributorConsent"
  | "PublicationCommit"
  | "LegacyWriterPitchQueue"
  | "WriterRankEngine"
  | "WriterBadgeSystem";

export interface EditorialPersistenceTruthRow {
  domain: EditorialPersistenceDomain;
  status: PersistenceTruth;
  runtimeOwner: string;
  prismaModel: string | null;
  notes: string;
}

export const EDITORIAL_PERSISTENCE_TRUTH: readonly EditorialPersistenceTruthRow[] = [
  {
    domain: "ContributorAccount",
    status: "HYBRID",
    runtimeOwner: "ContributorAccountEngine (Prisma calls, unmigrated schema)",
    prismaModel: "ContributorAccount (drafted, code-wired, migration not applied)",
    notes: "Engine is fully async/Prisma now — no Map fallback remains. Will throw until `prisma migrate` runs against a real database. AuditLog grant trail is separately PRISMA_PERSISTED (existing AuditLog model).",
  },
  {
    domain: "EditorialSubmission",
    status: "HYBRID",
    runtimeOwner: "EditorialSubmissionEngine (Prisma calls, unmigrated schema)",
    prismaModel: "EditorialSubmission (drafted, code-wired, migration not applied)",
    notes: "Submit/approve/publish call Prisma directly; Article model is staff-only — not a fit. getArticleBySlug() read-path is also Prisma-backed now (async ripple completed across all real consumers).",
  },
  {
    domain: "ArticleReviewQueue",
    status: "HYBRID",
    runtimeOwner: "ArticleReviewQueueEngine → EditorialSubmissionEngine (Prisma)",
    prismaModel: null,
    notes: "Pure async filtered view over EditorialSubmission rows — same HYBRID status as that domain, no independent store of its own.",
  },
  {
    domain: "ContributorTrustGate",
    status: "HYBRID",
    runtimeOwner: "ContributorTrustGateEngine → ContributorAccountEngine (Prisma)",
    prismaModel: null,
    notes: "Async, reads account.level / trustScore from Prisma; no separate store — inherits ContributorAccount's status.",
  },
  {
    domain: "EditorialPerformance",
    status: "HYBRID",
    runtimeOwner: "EditorialPerformanceEngine (Prisma calls, unmigrated schema)",
    prismaModel: "EditorialPerformance (drafted, code-wired, migration not applied)",
    notes: "upsert/get/list are Prisma calls now; verifiedEngagementScore is async pure compute over the fetched row.",
  },
  {
    domain: "ContributorPayout",
    status: "IN_MEMORY",
    runtimeOwner: "ContributorPayoutEngine.calculate (async, pure)",
    prismaModel: "Payout (wallet/Stripe — different domain; do not merge)",
    notes: "Still no durable editorial payout ledger — calculate() is a pure function over other engines' data, nothing to migrate here directly. Launch Mode is XP/reputation (WRITER_CASH_PAYOUT).",
  },
  {
    domain: "ContributorConsent",
    status: "MISSING",
    runtimeOwner: "(none)",
    prismaModel: null,
    notes: "No contributor rights/consent record in schema or runtime.",
  },
  {
    domain: "PublicationCommit",
    status: "HYBRID",
    runtimeOwner: "publishIssueComposition → EditorialSubmissionEngine.markPublished (Prisma)",
    prismaModel: null,
    notes: "Commit boundary is POST /api/editorial/publish-issue, decoupled from the reader GET path (buildCanonicalMagazineIssueSlots is pure). AuditLog write is separately PRISMA_PERSISTED.",
  },
  {
    domain: "LegacyWriterPitchQueue",
    status: "IN_MEMORY",
    runtimeOwner: "lib/writer/EditorialQueueEngine (Map)",
    prismaModel: null,
    notes: "/hub/writer LEGACY harvest-only; editorNotes harvested into draft EditorialSubmission schema.",
  },
  {
    domain: "WriterRankEngine",
    status: "IN_MEMORY",
    runtimeOwner: "lib/writer/WriterRankEngine (Map)",
    prismaModel: null,
    notes: "Harvested read-path into /contributors dashboard; not a second progression economy.",
  },
  {
    domain: "WriterBadgeSystem",
    status: "IN_MEMORY",
    runtimeOwner: "lib/writer/WriterBadgeSystem (Map)",
    prismaModel: null,
    notes: "Displayed on /contributors; milestones still Map-backed.",
  },
] as const;

export function getEditorialPersistenceTruth(
  domain: EditorialPersistenceDomain,
): EditorialPersistenceTruthRow {
  const row = EDITORIAL_PERSISTENCE_TRUTH.find((entry) => entry.domain === domain);
  if (!row) {
    throw new Error(`Unknown editorial persistence domain: ${domain}`);
  }
  return row;
}

/** True when any core editorial domain is still non-durable at runtime. */
export function editorialEconomyHasInMemoryAuthority(): boolean {
  return EDITORIAL_PERSISTENCE_TRUTH.some(
    (row) =>
      row.status === "IN_MEMORY" ||
      row.status === "HYBRID" ||
      row.status === "MISSING",
  );
}
