/**
 * JumbotronShowDirector.ts
 *
 * Event-driven choreography. Does NOT create LiveSessions.
 * Supports PiP recomposition, synchronized takeover, and Presentation Event Bus beats.
 */

import {
  type PresentationTemplateId,
  PRESENTATION_TEMPLATE_LIBRARY,
  VenueAdPriority,
  type JumbotronCardinalFace,
  type FaceCompositionMode,
} from "./JumbotronAdContracts";
import { JumbotronContentScheduler, type FaceQueueItem } from "./JumbotronContentScheduler";
import { JumbotronFaceTargetRegistry } from "./JumbotronFaceTargetRegistry";

export type ShowDirectorBusEvent =
  | { type: "TIP_SETTLED"; tipId: string; amountCents: number; recipientId: string }
  | { type: "PRIZE_AWARDED"; prizeId: string; recipientId: string; ledgerRef: string }
  | { type: "ROUND_START"; roundId: string }
  | { type: "ROUND_END"; roundId: string }
  | { type: "MIC_HANDOFF"; fromUserId: string; toUserId: string }
  | { type: "GROUP_ACTION"; groupId: string; action: string }
  | { type: "GUEST_JOIN"; userId: string }
  | { type: "BATTLE_FINAL_COUNTDOWN"; secondsRemaining: number };

export interface ShowBeat {
  beatId: string;
  busEventType: string;
  templateId: PresentationTemplateId;
  faces: JumbotronCardinalFace[];
  composition: FaceCompositionMode;
  priority: VenueAdPriority;
  durationMs: number;
  inventsOutcomes: false;
}

export type ShowComposition =
  | FaceCompositionMode
  | "PIP_TOP_RIGHT"
  | "PIP_BOTTOM_LEFT"
  | "FULL_TAKEOVER";

export interface ShowFaceState {
  direction: JumbotronCardinalFace;
  currentComposition: ShowComposition;
  overlayText: string | null;
  sponsorCampaignId: string | null;
  sourceId: string | null;
}

export class JumbotronShowDirector {
  private scheduler: JumbotronContentScheduler;
  private beats: ShowBeat[] = [];
  private seq = 0;
  private faceStates = new Map<JumbotronCardinalFace, ShowFaceState>();
  private preTakeover = new Map<JumbotronCardinalFace, ShowFaceState>();
  private facesRegistry: JumbotronFaceTargetRegistry | null = null;
  public readonly venueId: string;
  public readonly sessionId: string;
  public readonly roomId: string;

  constructor(
    venueIdOrRoom: string | JumbotronFaceTargetRegistry,
    sessionOrFaces?: string | JumbotronFaceTargetRegistry
  ) {
    if (typeof venueIdOrRoom === "string") {
      this.venueId = venueIdOrRoom;
      this.sessionId = typeof sessionOrFaces === "string" ? sessionOrFaces : "sess-default";
      this.roomId = `room:${this.venueId}`;
      this.facesRegistry = new JumbotronFaceTargetRegistry(this.roomId, this.venueId);
    } else {
      this.facesRegistry = venueIdOrRoom;
      this.venueId = venueIdOrRoom.venueId;
      this.roomId = venueIdOrRoom.roomId;
      this.sessionId = "sess-default";
    }
    if (sessionOrFaces && typeof sessionOrFaces !== "string") {
      this.facesRegistry = sessionOrFaces;
      this.venueId = sessionOrFaces.venueId;
      this.roomId = sessionOrFaces.roomId;
    }
    this.scheduler = new JumbotronContentScheduler(this.roomId);
    for (const d of JumbotronFaceTargetRegistry.cardinalFaces()) {
      this.faceStates.set(d, {
        direction: d,
        currentComposition: "FULL",
        overlayText: null,
        sponsorCampaignId: d === "EAST" ? "camp-local-restaurant-01" : null,
        sourceId: null,
      });
    }
  }

  public get contentScheduler(): JumbotronContentScheduler {
    return this.scheduler;
  }

  public getFaceState(direction: JumbotronCardinalFace): ShowFaceState | undefined {
    return this.faceStates.get(direction);
  }

  public getAllFaceStates(): ShowFaceState[] {
    return JumbotronFaceTargetRegistry.cardinalFaces().map((d) => this.faceStates.get(d)!);
  }

  public handleLiveEvent(
    eventType: string,
    payload: Record<string, string>
  ): ShowFaceState | null {
    if (eventType === "PRIZE_WINNER_CONFIRMED") {
      const west = this.faceStates.get("WEST")!;
      const next: ShowFaceState = {
        ...west,
        currentComposition: "PIP_TOP_RIGHT",
        overlayText: `PRIZE WINNER: ${payload.displayName ?? "WINNER"}`,
        sourceId: payload.participantId ?? null,
      };
      this.faceStates.set("WEST", next);
      // East keeps sponsor — ads can PiP while live moment shows
      return next;
    }
    return null;
  }

  public triggerSynchronizedTakeover(
    campaignId: string,
    headline: string,
    _durationSec: number
  ): void {
    this.preTakeover.clear();
    for (const d of JumbotronFaceTargetRegistry.cardinalFaces()) {
      this.preTakeover.set(d, { ...this.faceStates.get(d)! });
      this.faceStates.set(d, {
        direction: d,
        currentComposition: "FULL_TAKEOVER",
        overlayText: headline,
        sponsorCampaignId: campaignId,
        sourceId: campaignId,
      });
    }
  }

  public releaseTakeoverToScheduled(): void {
    if (this.preTakeover.size === 0) return;
    for (const d of JumbotronFaceTargetRegistry.cardinalFaces()) {
      const prior = this.preTakeover.get(d);
      if (prior) this.faceStates.set(d, prior);
    }
    this.preTakeover.clear();
  }

  public handleBusEvent(event: ShowDirectorBusEvent, nowMs = Date.now()): ShowBeat | null {
    const templateId = this.pickTemplate(event);
    const template = PRESENTATION_TEMPLATE_LIBRARY[templateId];
    if (template.inventsOutcomes !== false) {
      throw new Error("Template must never invent outcomes");
    }

    let faces: JumbotronCardinalFace[] = ["NORTH"];
    let composition: FaceCompositionMode = "FULL";
    let priority = VenueAdPriority.P5_HOUSE;
    let durationMs = 5000;

    switch (event.type) {
      case "TIP_SETTLED":
      case "PRIZE_AWARDED":
        faces = ["NORTH", "SOUTH"];
        composition = "PIP";
        priority = VenueAdPriority.P2_RESULT_TIMER_SCORE;
        durationMs = 6000;
        break;
      case "ROUND_START":
      case "ROUND_END":
        faces = JumbotronFaceTargetRegistry.cardinalFaces();
        composition = "SCORE_STRIP";
        priority = VenueAdPriority.P2_RESULT_TIMER_SCORE;
        durationMs = 4000;
        break;
      case "BATTLE_FINAL_COUNTDOWN":
        faces = JumbotronFaceTargetRegistry.cardinalFaces();
        composition = "FULL";
        priority = VenueAdPriority.P1_CRITICAL_LIVE;
        durationMs = Math.max(1000, event.secondsRemaining * 1000);
        break;
      case "MIC_HANDOFF":
        faces = ["EAST", "WEST"];
        composition = "SPLIT";
        priority = VenueAdPriority.P2_RESULT_TIMER_SCORE;
        durationMs = 3500;
        break;
      case "GROUP_ACTION":
        faces = ["NORTH"];
        composition = "QUAD";
        priority = VenueAdPriority.P3_CONTRACTED_SPONSOR;
        durationMs = 5000;
        break;
      case "GUEST_JOIN":
        faces = ["SOUTH"];
        composition = "LOWER_THIRD";
        priority = VenueAdPriority.P5_HOUSE;
        durationMs = 3000;
        break;
    }

    const beat: ShowBeat = {
      beatId: `beat-${++this.seq}`,
      busEventType: event.type,
      templateId,
      faces,
      composition,
      priority,
      durationMs,
      inventsOutcomes: false,
    };
    this.beats.push(beat);

    for (const face of faces) {
      const item: FaceQueueItem = {
        id: `${beat.beatId}:${face}`,
        kind:
          event.type === "BATTLE_FINAL_COUNTDOWN"
            ? "TIMER"
            : event.type === "TIP_SETTLED" || event.type === "PRIZE_AWARDED"
              ? "PROGRAM"
              : "PROMO",
        creativeId: null,
        campaignId: null,
        priority,
        durationMs,
        enqueuedAtMs: nowMs,
        payload: { event, templateId },
      };
      this.scheduler.enqueue(face, item);
      this.faceStates.set(face, {
        direction: face,
        currentComposition: composition,
        overlayText: event.type,
        sponsorCampaignId: this.faceStates.get(face)?.sponsorCampaignId ?? null,
        sourceId: `show:${beat.beatId}`,
      });
      this.facesRegistry?.assignFace({
        orientation: face,
        source: item.kind,
        campaignId: null,
        creativeId: `show:${beat.beatId}`,
        compositionMode: composition,
        priority,
        nowMs,
      });
    }

    return beat;
  }

  private pickTemplate(event: ShowDirectorBusEvent): PresentationTemplateId {
    switch (event.type) {
      case "TIP_SETTLED":
        return "NEON_POP";
      case "PRIZE_AWARDED":
        return "GOLD_TICKER";
      case "ROUND_START":
      case "ROUND_END":
      case "BATTLE_FINAL_COUNTDOWN":
        return "ARENA_FIRE";
      case "MIC_HANDOFF":
        return "VICE_GLASS";
      case "GROUP_ACTION":
        return "COMIC_BURST";
      case "GUEST_JOIN":
        return "LOWER_THIRD_CLEAN";
      default:
        return "NEON_POP";
    }
  }

  public listBeats(): ShowBeat[] {
    return [...this.beats];
  }
}
