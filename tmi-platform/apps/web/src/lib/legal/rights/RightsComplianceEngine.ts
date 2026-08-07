/**
 * RightsComplianceEngine — under Legal Command (not a competing top-level product).
 *
 * Hierarchy:
 *   RightsComplianceEngine
 *   ├── MediaRightsRegistry
 *   ├── QuickClaim
 *   ├── RightsFingerprintRegistry
 *   ├── ProtectedPlaybackGate
 *   ├── DisputeCenter
 *   ├── TakedownWorkflow / CounterNoticeWorkflow
 *   ├── RepeatInfringerPolicy
 *   ├── RecordingContextDetector / CreatorSafeMode / FreestyleRightsController
 *   ├── AttributionEngine / CopyrightNoticeEngine
 *   ├── RightsEvidenceVault
 *   └── ClaimDisputePackageBuilder
 *
 * Cannot auto-approve external rebroadcast of uncleared tracks.
 * "I own it" alone never clears UFC/NBC/TV/commercial third-party content.
 */

import { buildAttribution } from "./AttributionEngine";
import { buildMixDecision } from "./CreatorSafeMode";
import { listCopyrightNotices } from "./CopyrightNoticeEngine";
import {
  detectRecordingContext,
  shouldApplyCreatorRecordingSplit,
} from "./RecordingContextDetector";
import {
  countMediaRightsByLight,
  ensureMediaRightsSeeded,
  getMediaRights,
  listMediaRights,
} from "./MediaRightsRegistry";
import {
  getFreestylePhasePlan,
  listFreestylePhasePlans,
  resolveFreestylePhaseAsset,
} from "./FreestyleRightsController";
import { listRightsEvidence } from "./RightsEvidenceVault";
import { listClaimDisputePackages } from "./ClaimDisputePackageBuilder";
import {
  countOpenCopyrightComplaints,
  listCopyrightComplaints,
} from "./CopyrightComplaintEngine";
import { countQuickClaimsByOutcome, listQuickClaims, listQuickClaimTypes } from "./QuickClaim";
import { classifyProtectedPlayback } from "./ProtectedPlaybackGate";
import { countOpenDisputes, listDisputes } from "./DisputeCenter";
import { countActiveTakedowns, getTakedownPolicyStub, listTakedowns } from "./TakedownWorkflow";
import { getCounterNoticePolicyStub, listCounterNotices } from "./CounterNoticeWorkflow";
import { getRepeatInfringerPolicyStub, listInfringerStrikes } from "./RepeatInfringerPolicy";
import { listFingerprints } from "./RightsFingerprintRegistry";
import type {
  FreestyleRightsPhase,
  MediaSurface,
  MixDecision,
  RecordingContext,
  RightsTrafficLight,
} from "./types";

export function classifyRightsLight(assetId: string): {
  light: RightsTrafficLight;
  reasons: string[];
} {
  ensureMediaRightsSeeded();
  const r = getMediaRights(assetId);
  const reasons: string[] = [];

  if (r.contentIdStatus === "TAKEDOWN" || r.contentIdStatus === "DISPUTED" || r.disputeEvidenceId) {
    reasons.push("Asset under takedown/dispute — restricted");
    return { light: "RED", reasons };
  }
  if (!r.platformPlaybackAllowed) {
    reasons.push("Platform playback not allowed");
    return { light: "RED", reasons };
  }

  // GREEN only with evidence + recording + external rebroadcast + monetized cleared
  if (
    r.hasRightsEvidence &&
    r.recordingAllowed &&
    r.externalRebroadcastAllowed &&
    r.monetizedVideoAllowed &&
    r.contentIdStatus === "CLEARED"
  ) {
    reasons.push("Rights evidence present; recording and external monetized use permitted");
    return { light: "GREEN", reasons };
  }

  // Default unknown / partial → YELLOW (Rule 20)
  if (!r.hasRightsEvidence) {
    reasons.push("No rights evidence — unknown defaults to Yellow / Creator Safe Mode");
  } else if (!r.recordingAllowed || !r.externalRebroadcastAllowed || !r.monetizedVideoAllowed) {
    reasons.push("Partial clearance — TMI playback only; recording mix must be sanitized");
  } else {
    reasons.push("Content ID not CLEARED — Yellow default");
  }
  return { light: "YELLOW", reasons };
}

/**
 * Hard block: RightsComplianceEngine / agents cannot auto-approve uncleared rebroadcast.
 */
export function canAutoApproveExternalRebroadcast(assetId: string): {
  allowed: false;
  reason: string;
} | {
  allowed: true;
  reason: string;
} {
  const { light } = classifyRightsLight(assetId);
  if (light !== "GREEN") {
    return {
      allowed: false,
      reason:
        "Auto-approve blocked: external rebroadcast of uncleared/unknown tracks is forbidden. Human/counsel process required for disputes; Green requires evidence.",
    };
  }
  // Even Green is a rights decision for mix — not a legal disclosure approval.
  return {
    allowed: true,
    reason: "Asset classified GREEN with evidence — rebroadcast metadata may attach; legal disclosure still uses HumanApprovalGate.",
  };
}

export function evaluateRecordingMix(input: {
  assetId?: string | null;
  userRecordingOrBroadcasting?: boolean;
  freestyleActive?: boolean;
  surface?: MediaSurface;
  roomId?: string;
}): {
  context: RecordingContext;
  light: RightsTrafficLight;
  decision: MixDecision;
  attribution: ReturnType<typeof buildAttribution> | null;
  autoRebroadcast: ReturnType<typeof canAutoApproveExternalRebroadcast> | null;
} {
  const context = detectRecordingContext({
    userRecordingOrBroadcasting: input.userRecordingOrBroadcasting,
    freestyleActive: input.freestyleActive,
    backgroundMusicAssetId: input.assetId ?? null,
    surface: input.surface,
    roomId: input.roomId,
  });

  const assetId = context.backgroundMusicAssetId;
  if (!assetId) {
    const decision = buildMixDecision({
      light: "GREEN",
      assetId: null,
      attributionRequired: false,
      reasons: ["No background music in context"],
      applySplit: false,
    });
    return {
      context,
      light: "GREEN",
      decision: { ...decision, label: "🟢 NO BACKGROUND MUSIC" },
      attribution: null,
      autoRebroadcast: null,
    };
  }

  const { light, reasons } = classifyRightsLight(assetId);
  const rights = getMediaRights(assetId);
  const applySplit = shouldApplyCreatorRecordingSplit(context);
  const decision = buildMixDecision({
    light,
    assetId,
    attributionRequired: rights.attributionRequired,
    reasons,
    applySplit,
  });

  return {
    context,
    light,
    decision,
    attribution: buildAttribution(assetId),
    autoRebroadcast: canAutoApproveExternalRebroadcast(assetId),
  };
}

export function evaluateFreestylePhase(input: {
  phase: FreestyleRightsPhase;
  proposedBeatAssetId?: string | null;
  userRecordingOrBroadcasting?: boolean;
}) {
  const resolved = resolveFreestylePhaseAsset({
    phase: input.phase,
    proposedBeatAssetId: input.proposedBeatAssetId,
  });
  const mix = evaluateRecordingMix({
    assetId: resolved.assetId,
    userRecordingOrBroadcasting: input.userRecordingOrBroadcasting ?? true,
    freestyleActive: input.phase === "FREESTYLE_ACTIVE",
    surface: "BATTLE",
  });
  return { resolved, mix, plan: getFreestylePhasePlan(input.phase) };
}

export function getRightsComplianceSnapshot() {
  ensureMediaRightsSeeded();
  const assets = listMediaRights(40);
  return {
    counts: countMediaRightsByLight(),
    notices: listCopyrightNotices(),
    freestylePhases: listFreestylePhasePlans(),
    assets,
    evidence: listRightsEvidence(20),
    disputePackages: listClaimDisputePackages(20),
    disputes: listDisputes(20),
    openDisputes: countOpenDisputes(),
    complaints: listCopyrightComplaints(20),
    openComplaints: countOpenCopyrightComplaints(),
    quickClaims: listQuickClaims(30),
    quickClaimOutcomes: countQuickClaimsByOutcome(),
    quickClaimTypes: listQuickClaimTypes(),
    fingerprints: listFingerprints(20),
    takedowns: listTakedowns(20),
    activeTakedowns: countActiveTakedowns(),
    counterNotices: listCounterNotices(20),
    infringerStrikes: listInfringerStrikes(20),
    policyStubs: {
      takedown: getTakedownPolicyStub(),
      counterNotice: getCounterNoticePolicyStub(),
      repeatInfringer: getRepeatInfringerPolicyStub(),
    },
    playbackSamples: assets.slice(0, 8).map((a) => classifyProtectedPlayback(a.assetId)),
  };
}

/** UI indicator payload for live/battle shells. */
export function getRightsIndicatorState(input: {
  assetId?: string | null;
  userRecordingOrBroadcasting?: boolean;
  freestyleActive?: boolean;
  surface?: MediaSurface;
}) {
  const result = evaluateRecordingMix(input);
  return {
    light: result.light,
    label: result.decision.label,
    creatorSafeModeActive: result.decision.creatorSafeModeActive,
    recordingMixAction: result.decision.recordingMixAction,
    experienceMixAction: result.decision.experienceMixAction,
    attributionLine: result.attribution?.line ?? null,
    reasons: result.decision.reasons,
  };
}
