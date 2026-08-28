/**
 * VenueCurtainDirector — synchronized curtain + lighting + scene cues.
 * Harvests CurtainRuntimeManager + StageLifecycleEngine (no duplicate CurtainDirector).
 */

import {
  executeCurtainTransition,
  resolveCurtainAdCampaign,
  type CurtainRuntimeContext,
  type CurtainState,
  type IntermissionType,
} from "@/lib/presentation/CurtainRuntimeManager";
import {
  openCurtain,
  closeCurtainAndEnd,
  resetStage,
  startCountdown,
  requestIntermission,
  resumeFromIntermission,
  triggerIntermission,
  getStageSnapshot,
} from "@/lib/live/StageLifecycleEngine";
import { dispatchVenueToolsCommand } from "@/lib/venue/VenueToolsDirector";
import { getAdSlotForZone } from "@/lib/commerce/SponsorRegistry";
import { reportVenueToolsModuleHealth } from "@/lib/venue/VenueToolsHealthRegistry";

export type VenueCurtainDirectorState =
  | "OPEN"
  | "OPENING"
  | "CLOSING"
  | "CLOSED"
  | "HOLD"
  | "INTERMISSION"
  | "COMMERCIAL_BREAK"
  | "RESUMING"
  | "ERROR";

export type VenueCurtainCueAction =
  | "PREPARE_STAGE"
  | "START_COUNTDOWN"
  | "OPEN_CURTAIN"
  | "CLOSE_AND_END"
  | "INTERMISSION"
  | "RESUME_SHOW";

export interface VenueCurtainCueRequest {
  venueId: string;
  sessionId: string;
  performerId: string;
  action: VenueCurtainCueAction;
  intermissionType?: IntermissionType;
  countdownSeconds?: number;
}

export interface VenueCurtainCueResult {
  ok: boolean;
  action: VenueCurtainCueAction;
  error?: string;
  adCampaignId?: string;
  state?: VenueCurtainDirectorState;
}

export interface VenueBreakClock {
  breakId: string;
  sessionId: string;
  roomId: string;
  resumeAt: string;
  breakDurationMs: number;
  state: VenueCurtainDirectorState;
}

export type CommercialInventoryClass =
  | "TMI_DIRECT_COMMERCIAL"
  | "EVENT_SPONSOR"
  | "HOUSE_PROMO"
  | "NO_FILL";

export interface CommercialInventoryResolution {
  inventoryClass: CommercialInventoryClass;
  campaignId: string;
  creativeUrl: string;
  advertiserName: string;
  honestNoFill: boolean;
}

const _activeBreaks = new Map<string, VenueBreakClock>();
let _directorState: VenueCurtainDirectorState = "OPEN";

function mapCurtainStateToDirector(state: CurtainState): VenueCurtainDirectorState {
  switch (state) {
    case "OPENING":
      return "OPENING";
    case "OPEN":
      return "OPEN";
    case "CLOSING":
      return "CLOSING";
    case "INTERMISSION":
    case "EXTENDED_INTERMISSION":
      return "INTERMISSION";
    case "PRE_SHOW":
    case "POST_SHOW":
      return "CLOSED";
    case "FAILED":
      return "ERROR";
    default:
      return "HOLD";
  }
}

export function getVenueCurtainDirectorState(): VenueCurtainDirectorState {
  return _directorState;
}

export function getActiveBreakClock(sessionId: string): VenueBreakClock | undefined {
  return _activeBreaks.get(sessionId);
}

/** Commercial inventory resolver — Rule 12 chain, honest NO_FILL intermission art. */
export function resolveCommercialInventory(zone: string = "curtain-ad-rail"): CommercialInventoryResolution {
  const slot = getAdSlotForZone(zone);
  if (slot.type === "paid" && slot.sponsor) {
    return {
      inventoryClass: "EVENT_SPONSOR",
      campaignId: slot.sponsor.sponsorId,
      creativeUrl: slot.sponsor.logoUrl ?? slot.sponsor.ctaHref,
      advertiserName: slot.sponsor.name,
      honestNoFill: false,
    };
  }
  if (slot.type === "platform" && slot.platformPromo) {
    return {
      inventoryClass: "HOUSE_PROMO",
      campaignId: `house-${slot.platformPromo.ctaHref.replace(/\W+/g, "-")}`,
      creativeUrl: slot.platformPromo.ctaHref,
      advertiserName: "TMI Network",
      honestNoFill: false,
    };
  }
  if (slot.type === "adnetwork") {
    return {
      inventoryClass: "TMI_DIRECT_COMMERCIAL",
      campaignId: "adsense-curtain-rail",
      creativeUrl: "",
      advertiserName: "Ad Network",
      honestNoFill: false,
    };
  }
  return {
    inventoryClass: "NO_FILL",
    campaignId: "intermission-honest-art",
    creativeUrl: "/images/tmi-intermission-placeholder.jpg",
    advertiserName: "Intermission",
    honestNoFill: true,
  };
}

/** Pause show — preserves roomId + liveSessionId, starts synchronized break clock. */
export function pauseShow(
  roomId: string,
  liveSessionId: string,
  performerId: string,
  venueId: string,
  breakDurationMs: number,
  resumeAt?: string,
): VenueCurtainCueResult {
  const resumeIso = resumeAt ?? new Date(Date.now() + breakDurationMs).toISOString();
  const breakId = `break-${liveSessionId}-${Date.now()}`;

  _activeBreaks.set(liveSessionId, {
    breakId,
    sessionId: liveSessionId,
    roomId,
    resumeAt: resumeIso,
    breakDurationMs,
    state: "INTERMISSION",
  });

  _directorState = "INTERMISSION";
  reportVenueToolsModuleHealth("CURTAIN", "PARTIAL", { lastCommand: "pauseShow" });

  const result = applyVenueCurtainCue({
    venueId,
    sessionId: liveSessionId,
    performerId,
    action: "INTERMISSION",
    countdownSeconds: Math.ceil(breakDurationMs / 1000),
  });

  if (result.ok) {
    const inventory = resolveCommercialInventory();
    _directorState = inventory.honestNoFill ? "INTERMISSION" : "COMMERCIAL_BREAK";
  }

  return { ...result, state: _directorState };
}

/** Resume show — verifies stage ready (optimistic stub per CurtainRuntimeManager). */
export function resumeShow(
  venueId: string,
  liveSessionId: string,
  performerId: string,
): VenueCurtainCueResult {
  _directorState = "RESUMING";
  _activeBreaks.delete(liveSessionId);

  const result = applyVenueCurtainCue({
    venueId,
    sessionId: liveSessionId,
    performerId,
    action: "RESUME_SHOW",
  });

  _directorState = result.ok ? "OPEN" : "ERROR";
  reportVenueToolsModuleHealth("CURTAIN", result.ok ? "PARTIAL" : "ERROR", {
    lastCommand: "resumeShow",
    lastError: result.error,
  });

  return { ...result, state: _directorState };
}

function applyIntermissionLighting(venueId: string): void {
  dispatchVenueToolsCommand({
    type: "VENUE_SCENE_APPLY",
    venueId,
    sceneId: "intermission-cue",
  });
}

export function applyVenueCurtainCue(req: VenueCurtainCueRequest): VenueCurtainCueResult {
  const { venueId, sessionId, performerId, action } = req;

  switch (action) {
    case "PREPARE_STAGE":
      resetStage();
      _directorState = "CLOSED";
      return { ok: true, action, state: _directorState };

    case "START_COUNTDOWN":
      startCountdown();
      _directorState = "HOLD";
      return { ok: true, action, state: _directorState };

    case "OPEN_CURTAIN": {
      openCurtain();
      dispatchVenueToolsCommand({
        type: "VENUE_SCENE_APPLY",
        venueId,
        sceneId: "show-open",
      });
      _directorState = "OPEN";
      return { ok: true, action, state: _directorState };
    }

    case "CLOSE_AND_END":
      closeCurtainAndEnd();
      _directorState = "CLOSED";
      return { ok: true, action, state: _directorState };

    case "INTERMISSION": {
      applyIntermissionLighting(venueId);
      const campaign = resolveCurtainAdCampaign("curtain-ad-rail");
      const inventory = resolveCommercialInventory("curtain-ad-rail");
      const ctx: CurtainRuntimeContext = {
        currentState: "OPEN",
        userCountryCode: "US",
        sessionConnected: true,
        maxBreakCapSeconds: 900,
      };
      void executeCurtainTransition(
        ctx,
        {
          performerId,
          sessionId,
          targetAction: "TAKE_BREAK",
          isAuthorized: true,
          intermissionType: req.intermissionType ?? "INTERMISSION",
          countdownSeconds: req.countdownSeconds ?? 180,
        },
        sessionId,
        venueId,
      );
      requestIntermission({ countdownSeconds: req.countdownSeconds ?? 3 });
      triggerIntermission();
      _directorState = inventory.honestNoFill ? "INTERMISSION" : "COMMERCIAL_BREAK";
      reportVenueToolsModuleHealth("CURTAIN", "PARTIAL", { lastCommand: "INTERMISSION" });
      return { ok: true, action, adCampaignId: campaign.campaignId, state: _directorState };
    }

    case "RESUME_SHOW": {
      resumeFromIntermission(() => ({ ok: true }));
      dispatchVenueToolsCommand({
        type: "VENUE_SCENE_APPLY",
        venueId,
        sceneId: "show-open",
      });
      void executeCurtainTransition(
        {
          currentState: "INTERMISSION",
          userCountryCode: "US",
          sessionConnected: true,
        },
        {
          performerId,
          sessionId,
          targetAction: "RESUME_SHOW",
          isAuthorized: true,
        },
        sessionId,
        venueId,
      );
      _directorState = "OPEN";
      _activeBreaks.delete(sessionId);
      return { ok: true, action, state: _directorState };
    }

    default:
      _directorState = "ERROR";
      return { ok: false, action, error: `Unknown curtain cue: ${action}`, state: _directorState };
  }
}

export function getCurtainStageLabel(): string {
  return getStageSnapshot().state.replace(/_/g, " ");
}

export function syncDirectorStateFromCurtain(curtainState: CurtainState): void {
  _directorState = mapCurtainStateToDirector(curtainState);
}
