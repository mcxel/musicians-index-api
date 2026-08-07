/**
 * CreatorSafeMode — substitutes recording-safe music / TMI ambience / silence
 * in the CREATOR RECORDING MIX while experience mix may keep normal playback.
 *
 * TMI EXPERIENCE MIX ≠ CREATOR RECORDING MIX
 */

import { getMediaRights } from "./MediaRightsRegistry";
import type { MixDecision, RightsTrafficLight } from "./types";

export const CREATOR_SAFE_AMBIENCE_ID = "tmi-ambience-safe-01";

export function resolveCreatorSafeSubstitute(assetId: string | null): {
  substituteAssetId: string | null;
  mode: "AMBIENCE" | "SILENCE" | "NONE";
} {
  if (!assetId) return { substituteAssetId: null, mode: "NONE" };
  const safe = getMediaRights(CREATOR_SAFE_AMBIENCE_ID);
  if (safe.hasRightsEvidence && safe.recordingAllowed) {
    return { substituteAssetId: CREATOR_SAFE_AMBIENCE_ID, mode: "AMBIENCE" };
  }
  return { substituteAssetId: null, mode: "SILENCE" };
}

export function buildMixDecision(input: {
  light: RightsTrafficLight;
  assetId: string | null;
  attributionRequired: boolean;
  reasons: string[];
  applySplit: boolean;
}): MixDecision {
  const baseReasons = [...input.reasons];

  if (!input.applySplit) {
    return {
      light: input.light,
      label: labelFor(input.light, false),
      experienceMixAction: "KEEP",
      recordingMixAction: "KEEP",
      creatorSafeModeActive: false,
      attributionRequired: input.attributionRequired,
      reasons: baseReasons,
      assetId: input.assetId,
      forbiddenCopyUsed: false,
    };
  }

  if (input.light === "GREEN") {
    return {
      light: "GREEN",
      label: "🟢 RECORDING SAFE",
      experienceMixAction: "KEEP",
      recordingMixAction: "KEEP",
      creatorSafeModeActive: false,
      attributionRequired: input.attributionRequired,
      reasons: [...baseReasons, "Rights permit external recorded/monetized use"],
      assetId: input.assetId,
      forbiddenCopyUsed: false,
    };
  }

  if (input.light === "RED") {
    return {
      light: "RED",
      label: "🔴 RESTRICTED — removed from recording-safe mix",
      experienceMixAction: "KEEP",
      recordingMixAction: "REMOVE",
      creatorSafeModeActive: true,
      attributionRequired: true,
      reasons: [...baseReasons, "Restricted — remove from creator recording mix"],
      assetId: input.assetId,
      forbiddenCopyUsed: false,
    };
  }

  // YELLOW — Creator Safe Mode
  const sub = resolveCreatorSafeSubstitute(input.assetId);
  return {
    light: "YELLOW",
    label: "🟡 TMI PLAYBACK ONLY / Creator Safe Mode active",
    experienceMixAction: "KEEP",
    recordingMixAction: sub.mode === "AMBIENCE" ? "SAFE_SUBSTITUTE" : "SILENCE",
    creatorSafeModeActive: true,
    attributionRequired: true,
    reasons: [
      ...baseReasons,
      "TMI playback only — recording mix uses creator-safe substitute or silence",
      sub.mode === "AMBIENCE"
        ? `Substitute: ${sub.substituteAssetId}`
        : "Substitute: silence",
    ],
    assetId: input.assetId,
    forbiddenCopyUsed: false,
  };
}

function labelFor(light: RightsTrafficLight, safeActive: boolean): string {
  if (light === "GREEN") return "🟢 RECORDING SAFE";
  if (light === "RED") return "🔴 RESTRICTED";
  return safeActive
    ? "🟡 TMI PLAYBACK ONLY / Creator Safe Mode active"
    : "🟡 TMI PLAYBACK ONLY";
}
