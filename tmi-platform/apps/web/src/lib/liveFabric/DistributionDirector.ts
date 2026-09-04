/**
 * DistributionDirector.ts — Rights propagation for composites (intersection, never widen)
 */

import type { SourceRightsPolicy, SourcePrivacyPolicy } from "./contracts/MediaSourceContracts";
import {
  DEFAULT_FAIL_CLOSED_RIGHTS,
  DEFAULT_FAIL_CLOSED_PRIVACY,
  isSourcePublishEligible,
} from "./contracts/MediaSourceContracts";
import type {
  DerivedOutputRights,
  RightsEvaluationContext,
  RightsEvaluationResult,
} from "./contracts/RightsContracts";
import { LIVE_RIGHTS_CONTRACT_VERSION } from "./contracts/RightsContracts";
import type { RecordingTrackMetadata, RecordingSessionPlan } from "./contracts/RecordingContracts";
import type { ModerationFeedCommand, ModerationFeedState, ModerationGraphSnapshot } from "./contracts/ModerationContracts";

function intersectBool(a: boolean, b: boolean): boolean {
  return a && b;
}

function intersectPrivacyClass(
  a: SourceRightsPolicy["privacyClass"],
  b: SourceRightsPolicy["privacyClass"]
): SourceRightsPolicy["privacyClass"] {
  if (a === "UNKNOWN" || b === "UNKNOWN") return "UNKNOWN";
  if (a === "PRIVATE" || b === "PRIVATE") return "PRIVATE";
  if (a === "FRIENDS" || b === "FRIENDS") return "FRIENDS";
  return "PUBLIC";
}

function intersectVisibility(
  a: SourcePrivacyPolicy["visibility"],
  b: SourcePrivacyPolicy["visibility"]
): SourcePrivacyPolicy["visibility"] {
  if (a === "UNKNOWN" || b === "UNKNOWN") return "UNKNOWN";
  if (a === "PRIVATE" || b === "PRIVATE") return "PRIVATE";
  if (a === "FRIENDS" || b === "FRIENDS") return "FRIENDS";
  return "PUBLIC";
}

export class DistributionDirector {
  private readonly moderation = new Map<string, ModerationFeedState>();
  private readonly recordings: RecordingTrackMetadata[] = [];

  constructor(private readonly sessionId: string, private generation = 1) {}

  public setGeneration(generation: number): void {
    this.generation = generation;
  }

  public evaluateSourceRights(
    rights: SourceRightsPolicy,
    privacy: SourcePrivacyPolicy,
    ctx: RightsEvaluationContext
  ): RightsEvaluationResult {
    const now = ctx.nowMs ?? Date.now();
    if (!rights.known || rights.privacyClass === "UNKNOWN" || privacy.visibility === "UNKNOWN") {
      return {
        decision: "DENY",
        reason: "FAIL_CLOSED_UNKNOWN",
        contractVersion: LIVE_RIGHTS_CONTRACT_VERSION,
        failClosed: true,
      };
    }
    if (rights.expiresAtMs != null && now > rights.expiresAtMs) {
      return {
        decision: "DENY",
        reason: "RIGHTS_EXPIRED",
        contractVersion: LIVE_RIGHTS_CONTRACT_VERSION,
        failClosed: true,
      };
    }
    if (ctx.territory && rights.territoryRestrictions?.includes(ctx.territory)) {
      return {
        decision: "DENY",
        reason: "TERRITORY_RESTRICTED",
        contractVersion: LIVE_RIGHTS_CONTRACT_VERSION,
        failClosed: true,
      };
    }

    const map: Record<RightsEvaluationContext["action"], keyof SourceRightsPolicy | "privacy"> = {
      PUBLISH: "externalAllowed",
      RECORD_PROGRAM: "recordingAllowed",
      RECORD_ISO: "recordingAllowed",
      CAST: "castAllowed",
      REPLAY: "replayAllowed",
      COMMERCIAL: "commercialAllowed",
      EXTERNAL_DISTRIBUTE: "externalAllowed",
    };

    const key = map[ctx.action];
    if (key === "privacy") {
      return {
        decision: "DENY",
        reason: "INTERNAL",
        contractVersion: LIVE_RIGHTS_CONTRACT_VERSION,
        failClosed: true,
      };
    }
    const allowed = Boolean(rights[key]);
    if (!allowed) {
      return {
        decision: "DENY",
        reason: `ACTION_${ctx.action}_NOT_ALLOWED`,
        contractVersion: LIVE_RIGHTS_CONTRACT_VERSION,
        failClosed: true,
      };
    }
    if (!isSourcePublishEligible(rights, privacy) && ctx.action === "PUBLISH") {
      return {
        decision: "DENY",
        reason: "PUBLISH_ELIGIBILITY_FAILED",
        contractVersion: LIVE_RIGHTS_CONTRACT_VERSION,
        failClosed: true,
      };
    }
    return {
      decision: "ALLOW",
      reason: "OK",
      contractVersion: LIVE_RIGHTS_CONTRACT_VERSION,
      failClosed: true,
    };
  }

  /** Composite output rights = intersection of contributors — never more permissive. */
  public deriveCompositeRights(
    outputId: string,
    contributors: Array<{ sourceId: string; rights: SourceRightsPolicy; privacy: SourcePrivacyPolicy }>
  ): DerivedOutputRights {
    if (contributors.length === 0) {
      return {
        outputId,
        effective: { ...DEFAULT_FAIL_CLOSED_RIGHTS },
        contributingSourceIds: [],
        privacy: { ...DEFAULT_FAIL_CLOSED_PRIVACY },
        publishEligible: false,
      };
    }

    let effective: SourceRightsPolicy = { ...contributors[0].rights };
    let privacy: SourcePrivacyPolicy = { ...contributors[0].privacy };

    for (let i = 1; i < contributors.length; i++) {
      const r = contributors[i].rights;
      const p = contributors[i].privacy;
      effective = {
        known: effective.known && r.known,
        externalAllowed: intersectBool(effective.externalAllowed, r.externalAllowed),
        recordingAllowed: intersectBool(effective.recordingAllowed, r.recordingAllowed),
        commercialAllowed: intersectBool(effective.commercialAllowed, r.commercialAllowed),
        replayAllowed: intersectBool(effective.replayAllowed, r.replayAllowed),
        castAllowed: intersectBool(effective.castAllowed, r.castAllowed),
        ageRestricted: effective.ageRestricted || r.ageRestricted,
        privacyClass: intersectPrivacyClass(effective.privacyClass, r.privacyClass),
        licenseHolder: effective.licenseHolder,
        territoryRestrictions: [
          ...new Set([
            ...(effective.territoryRestrictions ?? []),
            ...(r.territoryRestrictions ?? []),
          ]),
        ],
        expiresAtMs:
          effective.expiresAtMs != null && r.expiresAtMs != null
            ? Math.min(effective.expiresAtMs, r.expiresAtMs)
            : effective.expiresAtMs ?? r.expiresAtMs,
      };
      privacy = {
        visibility: intersectVisibility(privacy.visibility, p.visibility),
        faceBlurRequired: privacy.faceBlurRequired || p.faceBlurRequired,
        piiRedactionRequired: privacy.piiRedactionRequired || p.piiRedactionRequired,
        consentVerified: privacy.consentVerified && p.consentVerified,
      };
    }

    return {
      outputId,
      effective,
      contributingSourceIds: contributors.map((c) => c.sourceId),
      privacy,
      publishEligible: isSourcePublishEligible(effective, privacy),
    };
  }

  public applyModeration(cmd: ModerationFeedCommand): ModerationFeedState {
    const prev = this.moderation.get(cmd.sourceId) ?? {
      sourceId: cmd.sourceId,
      audioMuted: false,
      videoHidden: false,
      videoBlurred: false,
      parked: false,
      blocked: false,
      reason: null,
      appliedAtMs: null,
      expiresAtMs: null,
    };

    const next = { ...prev, reason: cmd.reason, appliedAtMs: Date.now(), expiresAtMs: cmd.expiresAtMs ?? null };
    switch (cmd.action) {
      case "MUTE_AUDIO":
        next.audioMuted = true;
        break;
      case "HIDE_VIDEO":
        next.videoHidden = true;
        break;
      case "BLUR_VIDEO":
        next.videoBlurred = true;
        break;
      case "PARK_SOURCE":
        next.parked = true;
        break;
      case "BLOCK_SOURCE":
        next.blocked = true;
        next.parked = true;
        next.audioMuted = true;
        next.videoHidden = true;
        break;
      case "CLEAR_MODERATION":
        return (() => {
          const cleared: ModerationFeedState = {
            sourceId: cmd.sourceId,
            audioMuted: false,
            videoHidden: false,
            videoBlurred: false,
            parked: false,
            blocked: false,
            reason: null,
            appliedAtMs: Date.now(),
            expiresAtMs: null,
          };
          this.moderation.set(cmd.sourceId, cleared);
          return { ...cleared };
        })();
    }
    this.moderation.set(cmd.sourceId, next);
    return { ...next };
  }

  public getModerationSnapshot(): ModerationGraphSnapshot {
    const feeds: Record<string, ModerationFeedState> = {};
    for (const [k, v] of this.moderation) feeds[k] = { ...v };
    return { sessionId: this.sessionId, generation: this.generation, feeds };
  }

  public startRecording(
    plan: RecordingSessionPlan,
    mediaClockMs: number,
    layout: string,
    rightsSnapshotId: string
  ): RecordingTrackMetadata[] {
    const created: RecordingTrackMetadata[] = [];
    if (plan.programEnabled) {
      const program: RecordingTrackMetadata = {
        trackId: `rec-program-${plan.planId}`,
        kind: "PROGRAM",
        sessionId: this.sessionId,
        generation: this.generation,
        composedFromSourceIds: [],
        startedAtMediaClockMs: mediaClockMs,
        endedAtMediaClockMs: null,
        rightsSnapshotId,
        layoutAtStart: layout,
        displayTarget: "RECORDING_PROGRAM",
      };
      this.recordings.push(program);
      created.push(program);
    }
    for (const sourceId of plan.isoSourceIds) {
      const iso: RecordingTrackMetadata = {
        trackId: `rec-iso-${sourceId}-${plan.planId}`,
        kind: "ISO",
        sessionId: this.sessionId,
        generation: this.generation,
        sourceId,
        composedFromSourceIds: [sourceId],
        startedAtMediaClockMs: mediaClockMs,
        endedAtMediaClockMs: null,
        rightsSnapshotId,
        layoutAtStart: layout,
        displayTarget: "RECORDING_ISO",
      };
      this.recordings.push(iso);
      created.push(iso);
    }
    return created.map((r) => ({ ...r }));
  }

  public listRecordings(): RecordingTrackMetadata[] {
    return this.recordings.map((r) => ({ ...r }));
  }
}
