/**
 * LivingJumbotronProgramScheduler — structure-level multi-face program frames.
 *
 * Extends existing JumbotronFaceTargetRegistry + VenueAdDirector + ContentScheduler.
 * Does NOT invent ads, crowds, or impressions. No membership-personalized Jumbotron.
 *
 * Pattern (deterministic to platform, unpredictable to viewer):
 *   SPONSOR_AD → ~10s VISUAL_SHOW breather → SPONSOR_AD → PEOPLE_MOMENT/LIVE_STAGE → …
 * Faces may stagger breathers; synchronizedShowId marks full-structure takeovers.
 */

import type { JumbotronCardinalFace } from "./JumbotronAdContracts";
import { JumbotronFaceTargetRegistry } from "./JumbotronFaceTargetRegistry";

export type JumbotronMode =
  | "SPONSOR_AD"
  | "LIVE_STAGE"
  | "PEOPLE_MOMENT"
  | "VISUAL_SHOW"
  | "INTERACTIVE"
  | "INFORMATION";

export type JumbotronFaceId = JumbotronCardinalFace;

export interface JumbotronFaceBlock {
  faceId: JumbotronFaceId;
  mode: JumbotronMode;
  contentId?: string;
  startsAt: number;
  endsAt: number;
}

export interface JumbotronProgramFrame {
  programFrameId: string;
  venueSessionId: string;
  startsAt: number;
  endsAt: number;
  faces: JumbotronFaceBlock[];
  synchronizedShowId?: string;
}

export type JumbotronPresentationKind =
  | "JUMBOTRON_SPONSOR"
  | "FRAMED"
  | "PERIMETER"
  | "VENUE_BILLBOARD"
  | "CURTAIN"
  | "RIBBON";

export type JumbotronPerformanceTier =
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "MOBILE"
  | "REDUCED_MOTION";

export interface EligibleAdSlot {
  contentId: string;
  campaignId: string;
  presentation: JumbotronPresentationKind;
  durationMs: number;
  /** Real inventory only — never fabricate. */
  fromRealInventory: true;
}

export interface EligiblePeopleMoment {
  contentId: string;
  participantId: string;
  hasConsent: boolean;
  durationMs: number;
}

export interface LivingProgramSchedulerInput {
  venueSessionId: string;
  roomId: string;
  nowMs: number;
  /** Eligible real ad creatives for this room (empty → entertainment/info fill). */
  eligibleAds: EligibleAdSlot[];
  eligiblePeopleMoments: EligiblePeopleMoment[];
  liveStageActive: boolean;
  /** Target ad share of face-time when inventory exists (0–1). Default 0.55. */
  adDeliveryTargetRatio?: number;
  breatherMs?: number;
  performanceTier: JumbotronPerformanceTier;
}

export interface LivingProgramSchedulerResult {
  frame: JumbotronProgramFrame;
  usedAdInventory: boolean;
  fellBackToEntertainment: boolean;
  sharedRoomTruthKey: string;
  membershipPersonalized: false;
}

const DEFAULT_BREATHER_MS = 10_000;
const DEFAULT_AD_MS = 15_000;
const DEFAULT_AD_TARGET = 0.55;

function faceOrder(): JumbotronFaceId[] {
  return JumbotronFaceTargetRegistry.cardinalFaces();
}

/**
 * Build one structure-level program frame for all faces.
 * Same frame for every client in the venue — no per-membership ad choice.
 */
export function buildLivingJumbotronProgramFrame(
  input: LivingProgramSchedulerInput,
): LivingProgramSchedulerResult {
  const breatherMs = input.breatherMs ?? DEFAULT_BREATHER_MS;
  const adTarget = input.adDeliveryTargetRatio ?? DEFAULT_AD_TARGET;
  const faces = faceOrder();
  const ads = input.eligibleAds.filter((a) => a.fromRealInventory && a.contentId);
  const people = input.eligiblePeopleMoments.filter((p) => p.hasConsent);

  const usedAdInventory = ads.length > 0;
  const preferAds = usedAdInventory && adTarget > 0;

  const frameFaces: JumbotronFaceBlock[] = faces.map((faceId, index) => {
    const stagger = index * Math.floor(breatherMs / faces.length);
    const startsAt = input.nowMs + stagger;

    if (preferAds) {
      // Stagger: odd faces breather while even faces monetize (multi-face living law).
      const monetizeThisFace = index % 2 === 0;
      if (monetizeThisFace) {
        const ad = ads[index % ads.length]!;
        return {
          faceId,
          mode: "SPONSOR_AD" as const,
          contentId: ad.contentId,
          startsAt,
          endsAt: startsAt + (ad.durationMs || DEFAULT_AD_MS),
        };
      }
      if (people.length > 0 && index % 3 === 1) {
        const moment = people[index % people.length]!;
        return {
          faceId,
          mode: "PEOPLE_MOMENT" as const,
          contentId: moment.contentId,
          startsAt,
          endsAt: startsAt + moment.durationMs,
        };
      }
      return {
        faceId,
        mode: "VISUAL_SHOW" as const,
        contentId: `breather:${input.performanceTier}`,
        startsAt,
        endsAt: startsAt + breatherMs,
      };
    }

    if (input.liveStageActive) {
      return {
        faceId,
        mode: "LIVE_STAGE" as const,
        contentId: "live-stage-program",
        startsAt: input.nowMs,
        endsAt: input.nowMs + DEFAULT_AD_MS,
      };
    }

    if (people.length > 0) {
      const moment = people[index % people.length]!;
      return {
        faceId,
        mode: "PEOPLE_MOMENT" as const,
        contentId: moment.contentId,
        startsAt,
        endsAt: startsAt + moment.durationMs,
      };
    }

    return {
      faceId,
      mode: "INFORMATION" as const,
      contentId: "venue-info-idle",
      startsAt: input.nowMs,
      endsAt: input.nowMs + breatherMs,
    };
  });

  const startsAt = Math.min(...frameFaces.map((f) => f.startsAt));
  const endsAt = Math.max(...frameFaces.map((f) => f.endsAt));

  const frame: JumbotronProgramFrame = {
    programFrameId: `jpf-${input.venueSessionId}-${startsAt}`,
    venueSessionId: input.venueSessionId,
    startsAt,
    endsAt,
    faces: frameFaces,
  };

  return {
    frame,
    usedAdInventory,
    fellBackToEntertainment: !usedAdInventory,
    sharedRoomTruthKey: `${input.roomId}:${frame.programFrameId}`,
    membershipPersonalized: false,
  };
}

/**
 * Occasional full-structure synchronized show — all faces same mode/content.
 */
export function buildSynchronizedShowFrame(params: {
  venueSessionId: string;
  roomId: string;
  nowMs: number;
  mode: JumbotronMode;
  contentId: string;
  durationMs: number;
  synchronizedShowId: string;
}): JumbotronProgramFrame {
  const faces: JumbotronFaceBlock[] = faceOrder().map((faceId) => ({
    faceId,
    mode: params.mode,
    contentId: params.contentId,
    startsAt: params.nowMs,
    endsAt: params.nowMs + params.durationMs,
  }));
  return {
    programFrameId: `jpf-sync-${params.synchronizedShowId}-${params.nowMs}`,
    venueSessionId: params.venueSessionId,
    startsAt: params.nowMs,
    endsAt: params.nowMs + params.durationMs,
    faces,
    synchronizedShowId: params.synchronizedShowId,
  };
}

/**
 * Performance-tier presentation knobs for living bezel/spill/VFX.
 * Decorative only unless Reward Engine authorizes real rewards.
 */
export function resolveJumbotronPresentationBudget(tier: JumbotronPerformanceTier): {
  bezelLeds: boolean;
  environmentalSpill: boolean;
  particles: boolean;
  audioReactiveViz: boolean;
  coinBurstDecorativeOnly: true;
  webrtcWinsOverViz: true;
  oneActiveAudio: true;
} {
  switch (tier) {
    case "HIGH":
      return {
        bezelLeds: true,
        environmentalSpill: true,
        particles: true,
        audioReactiveViz: true,
        coinBurstDecorativeOnly: true,
        webrtcWinsOverViz: true,
        oneActiveAudio: true,
      };
    case "MEDIUM":
      return {
        bezelLeds: true,
        environmentalSpill: true,
        particles: false,
        audioReactiveViz: true,
        coinBurstDecorativeOnly: true,
        webrtcWinsOverViz: true,
        oneActiveAudio: true,
      };
    case "LOW":
    case "MOBILE":
      return {
        bezelLeds: true,
        environmentalSpill: false,
        particles: false,
        audioReactiveViz: false,
        coinBurstDecorativeOnly: true,
        webrtcWinsOverViz: true,
        oneActiveAudio: true,
      };
    case "REDUCED_MOTION":
      return {
        bezelLeds: false,
        environmentalSpill: false,
        particles: false,
        audioReactiveViz: false,
        coinBurstDecorativeOnly: true,
        webrtcWinsOverViz: true,
        oneActiveAudio: true,
      };
  }
}
