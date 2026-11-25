/**
 * §20982 — the SYSTEM_SOURCE / NEWSROOM_SOURCE principal.
 *
 * Design decision (2026-11-03, per owner direction): do NOT create a fake
 * human Writer/contributor to carry automated newsroom submissions through
 * EditorialSubmissionEngine. `EditorialSubmission.contributorId` and
 * `ContributorAccount.contributorId` (schema-checked: no @relation/FK, both
 * plain indexed String columns) never enforce "this id must be a real User
 * row" — so a reserved, permanently non-human sentinel ID is schema-safe
 * with ZERO migration, and ContributorAccountEngine (which models
 * payoutCapUsd — a human-payable-contributor concept) is never touched or
 * impersonated.
 *
 * The origin stays visible by construction: the sentinel ID format itself
 * (`system:newsroom:<connectorId>`) IS the origin marker — no new "origin"
 * column was needed. Real source provenance travels through the EXISTING
 * `sourceUrls` field (evidence URLs) and `editorNotes` (structured JSON
 * provenance), both real columns already on EditorialSubmission.
 */

import type { NewsEvent } from "./NewsEventContract";
import type { EditorialSubmission } from "@/lib/editorial-economy/types";
import { canReuse } from "./NewsRightsPolicy";

export const SYSTEM_SOURCE_PREFIX = "system:newsroom:";

export function systemSourceContributorId(connectorId: string): string {
  return `${SYSTEM_SOURCE_PREFIX}${connectorId}`;
}

export function isSystemSourceContributorId(contributorId: string): boolean {
  return contributorId.startsWith(SYSTEM_SOURCE_PREFIX);
}

export function connectorIdFromSystemSource(contributorId: string): string | null {
  if (!isSystemSourceContributorId(contributorId)) return null;
  return contributorId.slice(SYSTEM_SOURCE_PREFIX.length);
}

export interface SystemNewsroomProvenance {
  origin: "SYSTEM_NEWSROOM";
  eventId: string;
  connectorId: string;
  verificationStatus: NewsEvent["verificationStatus"];
  confidence: NewsEvent["confidence"];
  evidenceSourceIds: string[];
}

export type SystemNewsroomSubmissionInput = {
  contributorId: string;
  title: string;
  body: string;
  category: EditorialSubmission["category"];
  sourceUrls: string[];
  editorNotes: string;
};

/**
 * Maps a verified NewsEvent to the exact input shape
 * EditorialSubmissionEngine.submit() already accepts — no new engine, no new
 * queue. The submission's title/body are built from the event's own real,
 * source-attributed claims only; never an invented sentence.
 *
 * §20982 Step 9 — NewsRightsPolicy.canReuse() is a REAL publication gate
 * here, not just a modeled/tested helper: a submission can only be
 * constructed at all when every one of the event's evidence sources permits
 * FULL_TEXT reuse. A DISCOVERY_ONLY source (e.g. GDELT alone, with no
 * corroborating official/licensed evidence) can never produce a full-text
 * submission through this function — the return type makes that
 * unrepresentable, not just discouraged by convention.
 */
export function buildSystemNewsroomSubmissionInput(
  event: NewsEvent,
  connectorId: string,
): { ok: true; submission: SystemNewsroomSubmissionInput } | { ok: false; reason: string } {
  const insufficientRights = event.evidence.find((e) => !canReuse(e.rightsMode, "FULL_TEXT"));
  if (insufficientRights) {
    return {
      ok: false,
      reason: `rights-blocked: source ${insufficientRights.sourceId} is ${insufficientRights.rightsMode}, which does not permit FULL_TEXT reuse`,
    };
  }

  const provenance: SystemNewsroomProvenance = {
    origin: "SYSTEM_NEWSROOM",
    eventId: event.eventId,
    connectorId,
    verificationStatus: event.verificationStatus,
    confidence: event.confidence,
    evidenceSourceIds: event.evidence.map((e) => e.sourceId),
  };

  const body = event.claims.map((c) => c.text).join("\n\n");
  const sourceUrls = event.evidence.map((e) => e.sourceUrl);

  return {
    ok: true,
    submission: {
      contributorId: systemSourceContributorId(connectorId),
      title: event.headlineFact,
      body,
      category: "news",
      sourceUrls,
      editorNotes: `SYSTEM_NEWSROOM_PROVENANCE:${JSON.stringify(provenance)}`,
    },
  };
}
