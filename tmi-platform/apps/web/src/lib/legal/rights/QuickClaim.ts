/**
 * QuickClaim — CLAIM MY WORK fast path for performers.
 *
 * Flow: Quick Claim → evidence → fingerprint lookup → ownership evidence → conflict
 * → VERIFIED | REVIEW | DISPUTED
 *
 * Anti-weaponization: claiming MUST NOT instantly transfer ownership or delete content.
 */

import { appendLegalAuditEvent } from "../LegalAuditLedger";
import { getMediaRights } from "./MediaRightsRegistry";
import { putRightsEvidence } from "./RightsEvidenceVault";
import { lookupFingerprints, registerFingerprint } from "./RightsFingerprintRegistry";
import { openDisputeFromClaim } from "./DisputeCenter";
import type { QuickClaimOutcome, QuickClaimRecord, QuickClaimType } from "./types";

type Store = { claims: Map<string, QuickClaimRecord>; seq: number };

function store(): Store {
  const g = globalThis as typeof globalThis & { __tmiQuickClaimStore?: Store };
  if (!g.__tmiQuickClaimStore) g.__tmiQuickClaimStore = { claims: new Map(), seq: 0 };
  return g.__tmiQuickClaimStore;
}

export function generateQuickClaimId(): string {
  const s = store();
  s.seq += 1;
  return `RIGHTS-CLAIM-${String(s.seq).padStart(8, "0")}`;
}

const VALID_TYPES = new Set<QuickClaimType>([
  "CREATED",
  "OWN_MASTER",
  "COMPOSED",
  "PRODUCED_BEAT",
  "REPRESENT_RIGHTS_HOLDER",
  "HAVE_LICENSE",
  "UNAUTHORIZED_UPLOAD",
]);

export function isQuickClaimType(v: string): v is QuickClaimType {
  return VALID_TYPES.has(v as QuickClaimType);
}

export function listQuickClaimTypes(): Array<{ type: QuickClaimType; label: string }> {
  return [
    { type: "CREATED", label: "I created this work" },
    { type: "OWN_MASTER", label: "I own the master" },
    { type: "COMPOSED", label: "I composed this" },
    { type: "PRODUCED_BEAT", label: "I produced this beat" },
    { type: "REPRESENT_RIGHTS_HOLDER", label: "I represent the rights holder" },
    { type: "HAVE_LICENSE", label: "I have a license" },
    { type: "UNAUTHORIZED_UPLOAD", label: "Unauthorized upload of my work" },
  ];
}

/**
 * Submit a Quick Claim. Preserves evidence immediately.
 * Never transfers ownership. Never deletes content.
 */
export function submitQuickClaim(input: {
  assetId: string;
  assetKind?: QuickClaimRecord["assetKind"];
  claimantUserId: string;
  claimType: QuickClaimType;
  statement?: string;
  contentRef?: string | null;
  /** Claimant is also the original uploader on record (low-risk fast path). */
  isOriginalUploader?: boolean;
  /** Platform has prior verified rights evidence for this claimant+asset. */
  hasVerifiedRightsOnFile?: boolean;
}): QuickClaimRecord | { error: string } {
  const assetId = input.assetId.trim();
  const claimantUserId = input.claimantUserId.trim();
  if (!assetId || !claimantUserId) {
    return { error: "assetId and claimantUserId are required" };
  }
  if (!isQuickClaimType(input.claimType)) {
    return { error: "Invalid claim type" };
  }

  const claimId = generateQuickClaimId();
  const now = new Date().toISOString();
  const notes: string[] = [
    "Quick Claim received — ownership not transferred",
    "Content not deleted by claim (anti-weaponization)",
  ];

  // 1) Preserve evidence immediately
  const evidence = putRightsEvidence({
    assetId,
    originalUploadRef: input.contentRef ?? `claim://${claimId}`,
    uploader: claimantUserId,
    ownershipDeclaration: `${input.claimType}: ${input.statement?.trim() || "Quick Claim declaration"}`,
    contractOrLicenseRef: null,
    timestamps: { uploadedAt: now, declaredAt: now },
    isrc: null,
    authorizedUses: ["claim_evidence_preservation"],
  });
  const evidenceId = "error" in evidence ? null : evidence.evidenceId;
  if (evidenceId) notes.push(`Evidence preserved: ${evidenceId}`);
  else notes.push("Evidence preserve failed — claim still logged for review");

  // 2) Fingerprint lookup
  const fp = registerFingerprint({
    assetId,
    contentRef: input.contentRef,
    source: "CLAIM",
  });
  const lookup = lookupFingerprints(assetId, input.contentRef);
  const conflictDetected =
    lookup.matchingAssetIds.length > 0 ||
    input.claimType === "UNAUTHORIZED_UPLOAD" ||
    input.claimType === "REPRESENT_RIGHTS_HOLDER";

  if (lookup.matchingAssetIds.length > 0) {
    notes.push(`Fingerprint matches other assets: ${lookup.matchingAssetIds.join(", ")}`);
  }

  // 3) Ownership evidence / registry check
  const rights = getMediaRights(assetId);
  const registryConflict =
    rights.ownerId !== "UNKNOWN" &&
    rights.ownerId !== claimantUserId &&
    rights.ownerId !== "sys-tmi" &&
    Boolean(rights.hasRightsEvidence);

  if (registryConflict) {
    notes.push(`Registry owner ${rights.ownerId} differs from claimant — conflict`);
  }

  // 4) Outcome — low-risk fast path vs human review
  let outcome: QuickClaimOutcome = "REVIEW";
  const lowRisk =
    Boolean(input.isOriginalUploader) &&
    Boolean(input.hasVerifiedRightsOnFile) &&
    !conflictDetected &&
    !registryConflict &&
    (input.claimType === "CREATED" ||
      input.claimType === "OWN_MASTER" ||
      input.claimType === "PRODUCED_BEAT" ||
      input.claimType === "COMPOSED");

  if (conflictDetected || registryConflict || input.claimType === "UNAUTHORIZED_UPLOAD") {
    outcome = "DISPUTED";
    notes.push("Conflicts require human review — DISPUTED");
  } else if (lowRisk && evidenceId) {
    outcome = "VERIFIED";
    notes.push("Low-risk original uploader + verified rights — VERIFIED (no ownership transfer)");
  } else {
    outcome = "REVIEW";
    notes.push("Insufficient for fast verify — REVIEW queue");
  }

  // "I own it" / claim alone never clears commercial third-party — keep REVIEW if statement alone
  if (
    !input.hasVerifiedRightsOnFile &&
    !input.isOriginalUploader &&
    (input.claimType === "OWN_MASTER" || input.claimType === "CREATED")
  ) {
    outcome = outcome === "DISPUTED" ? "DISPUTED" : "REVIEW";
    notes.push(
      '"I own it" alone never clears UFC/NBC/TV/commercial third-party content — human evidence required',
    );
  }

  const record: QuickClaimRecord = {
    claimId,
    assetId,
    assetKind: input.assetKind ?? "MEDIA",
    claimantUserId,
    claimType: input.claimType,
    statement: input.statement?.trim() || `${input.claimType} claim`,
    outcome,
    ownershipTransferred: false,
    contentDeleted: false,
    evidenceId,
    fingerprintId: fp.fingerprintId,
    conflictDetected: conflictDetected || registryConflict,
    createdAt: now,
    updatedAt: now,
    notes,
  };

  store().claims.set(claimId, record);

  appendLegalAuditEvent({
    caseId: null,
    type: "QUICK_CLAIM_FILED",
    actor: claimantUserId,
    detail: `${claimId} on ${assetId} → ${outcome} (no ownership transfer, no delete)`,
    meta: {
      claimId,
      assetId,
      outcome,
      ownershipTransferred: false,
      contentDeleted: false,
    },
  });

  if (outcome === "DISPUTED") {
    openDisputeFromClaim({
      assetId,
      claimId,
      summary: `Quick Claim ${claimId} disputed — fingerprint/ownership conflict`,
    });
  }

  return {
    ...record,
    notes: [...record.notes],
    ownershipTransferred: false,
    contentDeleted: false,
  };
}

export function getQuickClaim(claimId: string): QuickClaimRecord | null {
  const hit = store().claims.get(claimId);
  return hit
    ? { ...hit, notes: [...hit.notes], ownershipTransferred: false, contentDeleted: false }
    : null;
}

export function listQuickClaims(limit = 100): QuickClaimRecord[] {
  return Array.from(store().claims.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((c) => ({
      ...c,
      notes: [...c.notes],
      ownershipTransferred: false as const,
      contentDeleted: false as const,
    }));
}

export function countQuickClaimsByOutcome(): Record<QuickClaimOutcome, number> {
  const out: Record<QuickClaimOutcome, number> = { VERIFIED: 0, REVIEW: 0, DISPUTED: 0 };
  for (const c of store().claims.values()) out[c.outcome] += 1;
  return out;
}
