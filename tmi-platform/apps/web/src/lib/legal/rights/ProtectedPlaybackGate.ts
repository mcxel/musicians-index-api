/**
 * ProtectedPlaybackGate — classify before public rebroadcast of user-supplied A/V.
 *
 * Classes: CLEARED | TMI_OWNED | CREATOR_VERIFIED | LICENSE_VERIFIED |
 * CLAIM_PENDING | DISPUTED | UNKNOWN | RESTRICTED | TAKEDOWN
 *
 * "I own it" alone never clears UFC/NBC/TV/commercial third-party content.
 * UNKNOWN → stricter for public rebroadcast / monetize / recorded distribution.
 */

import { getMediaRights } from "./MediaRightsRegistry";
import { listQuickClaims } from "./QuickClaim";
import type { ProtectedPlaybackClass, ProtectedPlaybackDecision } from "./types";

export function classifyProtectedPlayback(assetId: string): ProtectedPlaybackDecision {
  const rights = getMediaRights(assetId);
  const claims = listQuickClaims(200).filter((c) => c.assetId === assetId);
  const pendingClaim = claims.find((c) => c.outcome === "REVIEW");
  const disputedClaim = claims.find((c) => c.outcome === "DISPUTED");
  const verifiedClaim = claims.find((c) => c.outcome === "VERIFIED");

  const reasons: string[] = [];

  if (rights.contentIdStatus === "TAKEDOWN" || rights.disputeEvidenceId) {
    return decide(assetId, "TAKEDOWN", reasons.concat("Asset under takedown/restriction"), true);
  }
  if (rights.contentIdStatus === "DISPUTED" || disputedClaim) {
    return decide(assetId, "DISPUTED", reasons.concat("Active dispute — public rebroadcast blocked"), true);
  }
  if (pendingClaim) {
    return decide(
      assetId,
      "CLAIM_PENDING",
      reasons.concat(`Claim ${pendingClaim.claimId} pending human review`),
      true,
    );
  }

  if (rights.licenseSource === "TMI_OWNED" && rights.hasRightsEvidence) {
    return decide(assetId, "TMI_OWNED", reasons.concat("TMI-owned with evidence"), false, true, true, true);
  }

  if (
    rights.licenseSource === "EXTERNAL_LICENSE" &&
    rights.hasRightsEvidence &&
    rights.licenseDocumentId &&
    rights.contentIdStatus === "CLEARED"
  ) {
    return decide(
      assetId,
      "LICENSE_VERIFIED",
      reasons.concat("External license document on file + CLEARED"),
      false,
      true,
      rights.monetizedVideoAllowed,
      rights.externalRebroadcastAllowed,
    );
  }

  if (
    verifiedClaim &&
    rights.hasRightsEvidence &&
    (rights.licenseSource === "UPLOADER_DECLARED" || rights.ownerId === verifiedClaim.claimantUserId)
  ) {
    // Creator verified for platform use — still not a blank check for commercial third-party
    return decide(
      assetId,
      "CREATOR_VERIFIED",
      reasons.concat(
        "Creator Quick Claim VERIFIED with evidence — still not a clearance for UFC/NBC/TV/commercial third-party content",
      ),
      false,
      rights.livestreamAllowed,
      false, // monetize still gated
      false, // external recorded distribution still gated without license
    );
  }

  if (
    rights.hasRightsEvidence &&
    rights.contentIdStatus === "CLEARED" &&
    rights.externalRebroadcastAllowed &&
    rights.monetizedVideoAllowed
  ) {
    return decide(assetId, "CLEARED", reasons.concat("Full clearance with evidence"), false, true, true, true);
  }

  if (!rights.platformPlaybackAllowed) {
    return decide(assetId, "RESTRICTED", reasons.concat("Platform playback restricted"), true);
  }

  // Default UNKNOWN — stricter for high-risk uses (Rule 20)
  reasons.push("Unknown / incomplete rights — Yellow/RESTRICTED for high-risk public rebroadcast");
  reasons.push('"I own it" alone never clears commercial third-party content');
  return decide(assetId, "UNKNOWN", reasons, true, rights.platformPlaybackAllowed, false, false);
}

function decide(
  assetId: string,
  classification: ProtectedPlaybackClass,
  reasons: string[],
  requiresHumanReview: boolean,
  publicRebroadcastAllowed = false,
  monetizeAllowed = false,
  recordedDistributionAllowed = false,
): ProtectedPlaybackDecision {
  // High-risk classes never allow monetize/recorded distribution without clearance
  if (
    classification === "UNKNOWN" ||
    classification === "CLAIM_PENDING" ||
    classification === "DISPUTED" ||
    classification === "RESTRICTED" ||
    classification === "TAKEDOWN"
  ) {
    return {
      assetId,
      classification,
      publicRebroadcastAllowed: classification === "UNKNOWN" ? false : publicRebroadcastAllowed,
      monetizeAllowed: false,
      recordedDistributionAllowed: false,
      reasons,
      requiresHumanReview,
    };
  }

  return {
    assetId,
    classification,
    publicRebroadcastAllowed,
    monetizeAllowed,
    recordedDistributionAllowed,
    reasons,
    requiresHumanReview,
  };
}

export function assertPublicRebroadcastAllowed(assetId: string): {
  allowed: boolean;
  decision: ProtectedPlaybackDecision;
} {
  const decision = classifyProtectedPlayback(assetId);
  return { allowed: decision.publicRebroadcastAllowed, decision };
}
