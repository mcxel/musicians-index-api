/**
 * CurtainRuntimeManager.ts — Performer Curtain Control & Ad Rail overlay engine.
 *
 * Client-side curtain state transitions via existing presentation directors
 * (Overlay / Motion / Monitor / Lighting / Sound / Broadcast). Not a new CurtainDirector.
 *
 * Honest scope (Rule 20):
 * - Overlay curtain + program-feed restore only — no ultra-realistic 3D .glb venue reveal.
 * - Ad rail uses getAdSlotForZone (Rule 12) — no fabricated sponsor revenue.
 * - Preflight resume checks are optimistic client stubs until media health APIs wire in.
 * - Authorization is caller-supplied (isAuthorized); enforce at UI / session boundary.
 */

import DirectorRegistry from "./DirectorRegistry";
import { PresentationCommand, PresentationContext } from "./directors/types";
import PresentationTelemetryDirector from "./directors/PresentationTelemetryDirector";
import { getAdSlotForZone } from "@/lib/commerce/SponsorRegistry";

export type CurtainState =
  | "PRE_SHOW"
  | "OPENING"
  | "OPEN"
  | "CLOSING"
  | "INTERMISSION"
  | "EXTENDED_INTERMISSION"
  | "TECHNICAL_DELAY"
  | "POST_SHOW"
  | "FAILED";

export type IntermissionType =
  | "WATER_BREAK"
  | "INTERMISSION"
  | "SPONSOR_BREAK"
  | "PRIZE_GIVEAWAY"
  | "VIDEO_PREMIERE"
  | "AUDIENCE_QA"
  | "INSTRUMENT_CHANGE"
  | "OUTFIT_CHANGE"
  | "EQUIPMENT_SETUP"
  | "GUEST_JOINING"
  | "DJ_TRANSITION"
  | "CUSTOM_TIMER";

export interface CurtainControlRequest {
  performerId: string;
  sessionId: string;
  targetAction: "TAKE_BREAK" | "RESUME_SHOW" | "END_PERFORMANCE" | "OPEN_STAGE" | "EXTEND_TIME";
  isAuthorized: boolean;
  intermissionType?: IntermissionType;
  countdownSeconds?: number;
  extensionSecondsToAdd?: number;
}

export interface AdRailCampaign {
  campaignId: string;
  advertiserName: string;
  creativeUrl: string;
  isHousePromotion: boolean;
  eligibleCountryCodes: string[];
  frequencyCapPerUser: number;
}

export interface CurtainRuntimeContext {
  currentState: CurtainState;
  runtimeLocked?: boolean;
  lockReason?: string;
  activeCampaign?: AdRailCampaign;
  userCountryCode: string;
  sessionConnected: boolean;
  maxBreakCapSeconds?: number; // Defaults to 900s (15 minutes)
}

export interface ResumeReadinessStatus {
  microphoneReady: boolean;
  cameraVideoReady: boolean;
  connectionHealthy: boolean;
  audioStreamReady: boolean;
  chatActive: boolean;
  audienceConnected: boolean;
  preflightPassed: boolean;
}

export interface CanonicalTimerSnapshot {
  sessionId: string;
  currentState: CurtainState;
  remainingSeconds: number;
  maxCapSeconds: number;
  intermissionType: IntermissionType;
  lastUpdatedIso: string;
  displayStatusText: string;
}

export interface CurtainTransitionResult {
  success: boolean;
  newState?: CurtainState;
  dispatchCommands: PresentationCommand[];
  adRailActive: boolean;
  impressionRecorded: boolean;
  readinessStatus?: ResumeReadinessStatus;
  intermissionType?: IntermissionType;
  countdownSeconds?: number;
  timerSnapshot?: CanonicalTimerSnapshot;
  error?: string;
}

const qualifiedImpressionsStore = new Map<string, number>();
const canonicalTimersStore = new Map<string, CanonicalTimerSnapshot>();

export function recordQualifiedImpression(campaignId: string): number {
  const current = qualifiedImpressionsStore.get(campaignId) ?? 0;
  const updated = current + 1;
  qualifiedImpressionsStore.set(campaignId, updated);
  return updated;
}

export function getQualifiedImpressions(campaignId: string): number {
  return qualifiedImpressionsStore.get(campaignId) ?? 0;
}

/** Optimistic client stub — all green until real media-health probes exist. */
export function performPreflightResumeCheck(_sessionId: string): ResumeReadinessStatus {
  return {
    microphoneReady: true,
    cameraVideoReady: true,
    connectionHealthy: true,
    audioStreamReady: true,
    chatActive: true,
    audienceConnected: true,
    preflightPassed: true,
  };
}

/** Rule 12 ad rail — paid → platform promo → advertise CTA. Never empty, never fake revenue. */
export function resolveCurtainAdCampaign(zone: string = "curtain-ad-rail"): AdRailCampaign {
  const slot = getAdSlotForZone(zone);
  if (slot.type === "paid" && slot.sponsor) {
    return {
      campaignId: slot.sponsor.sponsorId,
      advertiserName: slot.sponsor.name,
      creativeUrl: slot.sponsor.logoUrl ?? slot.sponsor.ctaHref,
      isHousePromotion: false,
      eligibleCountryCodes: [],
      frequencyCapPerUser: 10,
    };
  }
  if (slot.type === "platform" && slot.platformPromo) {
    return {
      campaignId: `platform-${slot.platformPromo.ctaHref.replace(/\W+/g, "-")}`,
      advertiserName: "TMI Network",
      creativeUrl: slot.platformPromo.ctaHref,
      isHousePromotion: true,
      eligibleCountryCodes: [],
      frequencyCapPerUser: 20,
    };
  }
  return {
    campaignId: "advertise-cta-curtain",
    advertiserName: "Advertise on TMI",
    creativeUrl: "/sponsors/advertise",
    isHousePromotion: true,
    eligibleCountryCodes: [],
    frequencyCapPerUser: 50,
  };
}

export function getCanonicalTimerSnapshot(sessionId: string): CanonicalTimerSnapshot | undefined {
  return canonicalTimersStore.get(sessionId);
}

export function addIntermissionTime(
  sessionId: string,
  secondsToAdd: number,
): { success: boolean; snapshot?: CanonicalTimerSnapshot; error?: string } {
  const snapshot = canonicalTimersStore.get(sessionId);
  if (!snapshot) {
    return { success: false, error: `No active timer found for session [${sessionId}].` };
  }

  const updatedRemaining = snapshot.remainingSeconds + secondsToAdd;
  if (updatedRemaining > snapshot.maxCapSeconds) {
    snapshot.remainingSeconds = snapshot.maxCapSeconds;
    snapshot.currentState = "EXTENDED_INTERMISSION";
    snapshot.displayStatusText = `EXTENDED INTERMISSION — Cap Reached (${snapshot.maxCapSeconds}s max)`;
  } else {
    snapshot.remainingSeconds = updatedRemaining;
    snapshot.displayStatusText = `${snapshot.intermissionType.replace("_", " ")} — Returning in ${formatMmSs(updatedRemaining)}`;
  }

  snapshot.lastUpdatedIso = new Date().toISOString();
  canonicalTimersStore.set(sessionId, snapshot);
  return { success: true, snapshot };
}

export async function executeCurtainTransition(
  ctx: CurtainRuntimeContext,
  req: CurtainControlRequest,
  runtimeId: string = "curtain-runtime-session-01",
  venueId: string = "3d-arena-venue-main",
): Promise<CurtainTransitionResult> {
  if (!req.isAuthorized) {
    return {
      success: false,
      dispatchCommands: [],
      adRailActive: false,
      impressionRecorded: false,
      error: `Unauthorized curtain control attempt by user [${req.performerId}].`,
    };
  }

  if (!ctx.sessionConnected) {
    return {
      success: false,
      dispatchCommands: [],
      adRailActive: false,
      impressionRecorded: false,
      error: "Session disconnected; cannot execute curtain transition.",
    };
  }

  if (ctx.runtimeLocked) {
    return {
      success: false,
      dispatchCommands: [],
      adRailActive: false,
      impressionRecorded: false,
      error: `Curtain locked: ${ctx.lockReason ?? "Production sequence in progress"}.`,
    };
  }

  // Time extension handling
  if (req.targetAction === "EXTEND_TIME" && req.extensionSecondsToAdd) {
    const res = addIntermissionTime(req.sessionId, req.extensionSecondsToAdd);
    if (!res.success) {
      return { success: false, dispatchCommands: [], adRailActive: true, impressionRecorded: false, error: res.error };
    }
    return {
      success: true,
      newState: res.snapshot?.currentState,
      dispatchCommands: [],
      adRailActive: true,
      impressionRecorded: false,
      timerSnapshot: res.snapshot,
      countdownSeconds: res.snapshot?.remainingSeconds,
    };
  }

  let newState: CurtainState = ctx.currentState;
  let adRailActive = false;
  let impressionRecorded = false;
  let readinessStatus: ResumeReadinessStatus | undefined = undefined;
  const dispatchCommands: PresentationCommand[] = [];

  const maxCap = ctx.maxBreakCapSeconds ?? 900; // 15 mins cap

  const context: PresentationContext = {
    runtimeId,
    venueId,
    registeredAnchors: ["curtain-marquee-anchor", "stage-program-feed-anchor"],
    registeredMonitorSurfaces: ["main-stage-screen", "curtain-ad-marquee"],
  };

  switch (req.targetAction) {
    case "TAKE_BREAK":
    case "END_PERFORMANCE": {
      newState = req.targetAction === "TAKE_BREAK" ? "INTERMISSION" : "POST_SHOW";
      adRailActive = true;
      const presetType = req.intermissionType ?? "INTERMISSION";
      let countdown = req.countdownSeconds ?? (presetType === "WATER_BREAK" ? 90 : 180);

      if (countdown > maxCap) {
        countdown = maxCap;
        newState = "TECHNICAL_DELAY";
      }

      // Initialize Canonical Timer Snapshot for cross-platform sync
      const timerSnapshot: CanonicalTimerSnapshot = {
        sessionId: req.sessionId,
        currentState: newState,
        remainingSeconds: countdown,
        maxCapSeconds: maxCap,
        intermissionType: presetType,
        lastUpdatedIso: new Date().toISOString(),
        displayStatusText: `${presetType.replace("_", " ")} — Returning in ${formatMmSs(countdown)}`,
      };
      canonicalTimersStore.set(req.sessionId, timerSnapshot);

      const campaign = ctx.activeCampaign ?? resolveCurtainAdCampaign("curtain-ad-rail");

      const impressionCount = recordQualifiedImpression(campaign.campaignId);
      impressionRecorded = impressionCount > 0;

      const overlayCmd = buildCmd("OVERLAY", "RENDER_CURTAIN_SURFACE", { state: newState, adRailVisible: true, campaign, presetType, countdown, timerSnapshot }, runtimeId, venueId);
      const motionCmd = buildCmd("MOTION", "FOLD_AND_CLOSE_CURTAIN", { durationMs: 1200 }, runtimeId, venueId);
      const monitorCmd = buildCmd("MONITOR", "SWITCH_TO_AD_RAIL_FEED", { campaignId: campaign.campaignId, presetType }, runtimeId, venueId);
      const lightingCmd = buildCmd("LIGHTING", "TRANSITION_HOUSE_LIGHTS", { brightness: 0.4 }, runtimeId, venueId);
      const soundCmd = buildCmd("SOUND", "PLAY_INTERMISSION_CUE", { volume: 0.8 }, runtimeId, venueId);
      const broadcastCmd = buildCmd("BROADCAST", "SWITCH_SCENE", { scene: "INTERMISSION_BREAK", presetType, countdown }, runtimeId, venueId);

      dispatchCommands.push(overlayCmd, motionCmd, monitorCmd, lightingCmd, soundCmd, broadcastCmd);

      for (const cmd of dispatchCommands) {
        await DirectorRegistry.dispatch(cmd, context);
      }
      break;
    }

    case "RESUME_SHOW":
    case "OPEN_STAGE": {
      // Execute Preflight Resume Readiness Check
      readinessStatus = performPreflightResumeCheck(req.sessionId);
      if (!readinessStatus.preflightPassed) {
        return {
          success: false,
          dispatchCommands: [],
          adRailActive: true,
          impressionRecorded: false,
          readinessStatus,
          error: "Preflight resume readiness check failed; check microphone and camera connections.",
        };
      }

      newState = "OPEN";
      adRailActive = false;
      impressionRecorded = false;
      canonicalTimersStore.delete(req.sessionId);

      const overlayCmd = buildCmd("OVERLAY", "HIDE_CURTAIN_SURFACE", { state: newState }, runtimeId, venueId);
      const motionCmd = buildCmd("MOTION", "OPEN_AND_REVEAL_STAGE", { durationMs: 1500 }, runtimeId, venueId);
      const monitorCmd = buildCmd("MONITOR", "RESTORE_PROGRAM_FEED", {}, runtimeId, venueId);
      const lightingCmd = buildCmd("LIGHTING", "RESTORE_PERFORMANCE_LIGHTING", {}, runtimeId, venueId);
      const broadcastCmd = buildCmd("BROADCAST", "SWITCH_SCENE", { scene: "LIVE_PERFORMANCE" }, runtimeId, venueId);

      dispatchCommands.push(overlayCmd, motionCmd, monitorCmd, lightingCmd, broadcastCmd);

      for (const cmd of dispatchCommands) {
        await DirectorRegistry.dispatch(cmd, context);
      }
      break;
    }
  }

  // Record Telemetry
  PresentationTelemetryDirector.getTelemetry(runtimeId);

  return {
    success: true,
    newState,
    dispatchCommands,
    adRailActive,
    impressionRecorded,
    readinessStatus,
    intermissionType: req.intermissionType,
    countdownSeconds: req.countdownSeconds,
    timerSnapshot: canonicalTimersStore.get(req.sessionId),
  };
}

function formatMmSs(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function buildCmd(
  director: PresentationCommand["director"],
  action: string,
  payload: Record<string, unknown>,
  runtimeId: string,
  venueId: string,
): PresentationCommand {
  return {
    commandId: `cmd-curtain-${director.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    runtimeId,
    venueId,
    correlationId: `corr-${runtimeId}-${Date.now()}`,
    director,
    action,
    payload,
    priority: "CRITICAL",
    requestedAt: new Date().toISOString(),
  };
}
