/**
 * FreestyleRightsController — phase soundtrack policy for freestyle rounds.
 * PRE-ROUND → creator-safe lobby
 * COUNTDOWN → TMI-owned transition
 * FREESTYLE_ACTIVE → competition beat with verified recording rights
 * POST-ROUND → creator-safe ambience
 */

import type { FreestylePhasePlan, FreestyleRightsPhase, LicenseSource } from "./types";
import { CREATOR_SAFE_AMBIENCE_ID } from "./CreatorSafeMode";
import { getMediaRights } from "./MediaRightsRegistry";

const PLANS: Record<FreestyleRightsPhase, FreestylePhasePlan> = {
  PRE_ROUND: {
    phase: "PRE_ROUND",
    soundtrackPolicy: "Creator-safe lobby soundtrack only",
    preferredLicenseSources: ["TMI_OWNED"],
    recordingSafeRequired: true,
  },
  COUNTDOWN: {
    phase: "COUNTDOWN",
    soundtrackPolicy: "TMI-owned transition stinger/bed",
    preferredLicenseSources: ["TMI_OWNED"],
    recordingSafeRequired: true,
  },
  FREESTYLE_ACTIVE: {
    phase: "FREESTYLE_ACTIVE",
    soundtrackPolicy: "Competition beat with verified recording rights (Competition Vault / TMI-owned)",
    preferredLicenseSources: ["TMI_OWNED", "COMPETITION_VAULT", "BEAT_MARKETPLACE"],
    recordingSafeRequired: true,
  },
  POST_ROUND: {
    phase: "POST_ROUND",
    soundtrackPolicy: "Creator-safe ambience",
    preferredLicenseSources: ["TMI_OWNED"],
    recordingSafeRequired: true,
  },
};

export function getFreestylePhasePlan(phase: FreestyleRightsPhase): FreestylePhasePlan {
  return { ...PLANS[phase], preferredLicenseSources: [...PLANS[phase].preferredLicenseSources] };
}

export function listFreestylePhasePlans(): FreestylePhasePlan[] {
  return (Object.keys(PLANS) as FreestyleRightsPhase[]).map(getFreestylePhasePlan);
}

/**
 * Resolve which asset to play for a freestyle phase.
 * FREESTYLE_ACTIVE requires the proposed beat to have recording rights evidence;
 * otherwise falls back to creator-safe ambience (never invents Green).
 */
export function resolveFreestylePhaseAsset(input: {
  phase: FreestyleRightsPhase;
  proposedBeatAssetId?: string | null;
}): {
  phase: FreestyleRightsPhase;
  assetId: string;
  plan: FreestylePhasePlan;
  usedFallback: boolean;
  reason: string;
} {
  const plan = getFreestylePhasePlan(input.phase);

  if (input.phase === "FREESTYLE_ACTIVE" && input.proposedBeatAssetId) {
    const rights = getMediaRights(input.proposedBeatAssetId);
    const sourceOk = plan.preferredLicenseSources.includes(rights.licenseSource as LicenseSource);
    if (
      rights.hasRightsEvidence &&
      rights.recordingAllowed &&
      rights.contentIdStatus !== "TAKEDOWN" &&
      rights.contentIdStatus !== "DISPUTED" &&
      sourceOk
    ) {
      return {
        phase: input.phase,
        assetId: input.proposedBeatAssetId,
        plan,
        usedFallback: false,
        reason: "Competition beat verified for recording rights",
      };
    }
    return {
      phase: input.phase,
      assetId: CREATOR_SAFE_AMBIENCE_ID,
      plan,
      usedFallback: true,
      reason:
        "Proposed beat lacks verified recording rights — fallback to creator-safe ambience (not Green)",
    };
  }

  return {
    phase: input.phase,
    assetId: CREATOR_SAFE_AMBIENCE_ID,
    plan,
    usedFallback: false,
    reason: plan.soundtrackPolicy,
  };
}

/** Map battle overlay perform phase loosely onto freestyle rights phases. */
export function mapBattlePhaseToFreestyle(
  battlePhase: "intro" | "vs" | "perform" | "vote" | "winner",
): FreestyleRightsPhase {
  switch (battlePhase) {
    case "intro":
    case "vs":
      return "PRE_ROUND";
    case "perform":
      return "FREESTYLE_ACTIVE";
    case "vote":
      return "POST_ROUND";
    case "winner":
      return "POST_ROUND";
    default:
      return "PRE_ROUND";
  }
}
