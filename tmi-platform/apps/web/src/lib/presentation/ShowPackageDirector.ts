/**
 * ShowPackageDirector — semantic event → Show Package resolver.
 *
 * Complements the existing spatial PresentationDirector (anchors/overlays/camera)
 * and BroadcastDirectorEngine (shot probability profiles). This layer owns
 * television grammar packages, not camera math or 3D sockets.
 *
 * Multi-pack: Battle (default), Cypher Pack v1, Challenge Pack v1 via ShowPackCatalog.
 * Phase 5.1 directors subscribe to this director — do not duplicate it.
 */

import PresentationDirector from "./PresentationDirector";
import PresentationStateMachine, { type PresentationState } from "./PresentationStateMachine";
import PresentationTimelineEngine from "./PresentationTimelineEngine";
import {
  DEFAULT_SHOW_PACK_ID,
  getShowPack,
  resolvePhaseFromPack,
} from "./ShowPackCatalog";
import type { ShowPackPhase } from "./ShowPackTypes";
import type {
  PresentationEventPayload,
  PresentationSemanticEvent,
} from "./PresentationEvents";
import { createPresentationEvent } from "./PresentationEvents";

export type ActiveShowPackageSnapshot = {
  packId: string;
  packName: string;
  phaseId: string | null;
  phaseLabel: string | null;
  triggerEvent: PresentationSemanticEvent | null;
  cameraCaption: string | null;
  activeSurfaceIds: string[];
  presentationState: PresentationState;
  lastEventAt: number | null;
  /** Honest mode flag for preview UIs */
  mode: "LIVE" | "PREVIEW" | "IDLE";
};

type Listener = (snapshot: ActiveShowPackageSnapshot) => void;

const EVENT_TO_STATE: Partial<Record<PresentationSemanticEvent, PresentationState>> = {
  BATTLE_START: "OPENING",
  BATTLE_INTRO: "OPENING",
  CYPHER_START: "OPENING",
  CHALLENGE_START: "OPENING",
  VS_REVEAL: "LIVE",
  PERFORMER_TURN: "LIVE",
  PERFORMANCE_START: "LIVE",
  VOTING_OPEN: "JUDGING",
  VOTING_CLOSE: "JUDGING",
  WINNER_DECLARED: "WINNER_REVEAL",
  ROUND_COMPLETE: "CELEBRATION",
  SHOW_IDLE: "IDLE",
  CRITICAL_ALERT: "LIVE",
};

function packIdForEvent(
  event: PresentationSemanticEvent,
  payloadPackageId?: string,
  currentPackId?: string
): string {
  if (payloadPackageId && getShowPack(payloadPackageId)) return payloadPackageId;
  if (event === "CYPHER_START") return "cypher-presentation-v1";
  if (event === "CHALLENGE_START") return "challenge-presentation-v1";
  if (
    event === "BATTLE_START" ||
    event === "BATTLE_INTRO" ||
    event === "VS_REVEAL"
  ) {
    return "battle-presentation-v1";
  }
  return currentPackId && getShowPack(currentPackId)
    ? currentPackId
    : DEFAULT_SHOW_PACK_ID;
}

class ShowPackageDirectorEngine {
  private activePackId = DEFAULT_SHOW_PACK_ID;
  private phase: ShowPackPhase | null = null;
  private lastEvent: PresentationSemanticEvent | null = null;
  private lastEventAt: number | null = null;
  private mode: ActiveShowPackageSnapshot["mode"] = "IDLE";
  private listeners = new Set<Listener>();

  public getActivePackId(): string {
    return this.activePackId;
  }

  public setActivePack(packId: string): boolean {
    const pack = getShowPack(packId);
    if (!pack) return false;
    this.activePackId = packId;
    this.emit();
    return true;
  }

  public getSnapshot(): ActiveShowPackageSnapshot {
    const pack = getShowPack(this.activePackId);
    return {
      packId: pack?.packId ?? this.activePackId,
      packName: pack?.name ?? this.activePackId,
      phaseId: this.phase?.phaseId ?? null,
      phaseLabel: this.phase?.label ?? null,
      triggerEvent: this.lastEvent,
      cameraCaption: this.phase?.cameraCue.caption ?? null,
      activeSurfaceIds: this.phase?.surfaces.map((s) => s.surfaceId) ?? [],
      presentationState: PresentationStateMachine.getState(),
      lastEventAt: this.lastEventAt,
      mode: this.mode,
    };
  }

  public subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    const snap = this.getSnapshot();
    this.listeners.forEach((fn) => fn(snap));
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent("tmi:presentation:show_package", { detail: snap })
        );
      } catch {
        /* SSR / non-DOM */
      }
    }
  }

  /**
   * Resolve a semantic event into the active pack phase and sync
   * spatial PresentationDirector + optional legacy timeline package.
   */
  public handleEvent(
    event: PresentationSemanticEvent,
    payload?: PresentationEventPayload,
    opts?: { mode?: ActiveShowPackageSnapshot["mode"]; playLegacyTimeline?: boolean }
  ): ActiveShowPackageSnapshot {
    this.mode = opts?.mode ?? "LIVE";
    this.lastEvent = event;
    this.lastEventAt = Date.now();
    this.activePackId = packIdForEvent(
      event,
      payload?.packageId,
      this.activePackId
    );

    if (event === "CRITICAL_ALERT") {
      PresentationDirector.mountOverlay({
        id: `alert-${this.lastEventAt}`,
        type: "SPONSOR_LOWER_THIRD",
        targetAnchorId: "battle-score-top",
        visible: true,
        opacity: 1,
        scale: 1,
        data: {
          alertMessage: payload?.alertMessage ?? "ALERT",
          layer: "CRITICAL_ALERTS",
        },
      });
      this.emit();
      return this.getSnapshot();
    }

    const phase = resolvePhaseFromPack(this.activePackId, event);
    if (phase) {
      this.phase = phase;
      this.applyPhase(phase, payload, opts?.playLegacyTimeline === true);
    }

    const targetState = EVENT_TO_STATE[event];
    if (targetState && PresentationStateMachine.canTransitionTo(targetState)) {
      PresentationStateMachine.transitionTo(targetState);
    } else if (targetState === "IDLE") {
      if (PresentationStateMachine.getState() !== "IDLE") {
        if (PresentationStateMachine.canTransitionTo("COOLDOWN")) {
          PresentationStateMachine.transitionTo("COOLDOWN");
        }
        if (PresentationStateMachine.canTransitionTo("IDLE")) {
          PresentationStateMachine.transitionTo("IDLE");
        }
      }
    }

    this.emit();
    return this.getSnapshot();
  }

  private applyPhase(
    phase: ShowPackPhase,
    payload?: PresentationEventPayload,
    playLegacyTimeline = false
  ) {
    for (const overlay of PresentationDirector.getActiveOverlays()) {
      if (overlay.id.startsWith("pack-")) {
        PresentationDirector.unmountOverlay(overlay.id);
      }
    }

    const cameraMode =
      phase.cameraCue.mode === "FOLLOW"
        ? "FOLLOW"
        : phase.cameraCue.mode === "ORBIT"
          ? "ORBIT"
          : phase.cameraCue.mode === "CINEMATIC_FLY_IN"
            ? "CINEMATIC_FLY_IN"
            : "FIXED";

    const winnerFocus =
      phase.phaseId === "WINNER" || phase.phaseId === "RESULT";

    PresentationDirector.setCameraTarget({
      mode: cameraMode,
      targetAnchorId: winnerFocus ? "winner-focus-center" : "performer-primary",
      transitionDurationMs: 1200,
    });

    for (const surface of phase.surfaces) {
      PresentationDirector.mountOverlay({
        id: `pack-${phase.phaseId}-${surface.surfaceId}`,
        type:
          surface.type === "WINNER_PANEL"
            ? "WINNER_CROWN_BANNER"
            : surface.type === "VS_BADGE"
              ? "BATTLE_VERSUS_BADGE"
              : surface.type === "SCORE_PANEL"
                ? "SCOREBOARD_HUD"
                : surface.type === "SPONSOR_PANEL" || surface.type === "LOWER_THIRD"
                  ? "SPONSOR_LOWER_THIRD"
                  : "NEON_PERFORMER_FRAME",
        targetAnchorId: winnerFocus ? "winner-focus-center" : "battle-score-top",
        visible: true,
        opacity: 1,
        scale: 1,
        data: {
          surfaceId: surface.surfaceId,
          anchorId: surface.anchorId,
          layer: surface.layer,
          label: surface.label,
          leftLabel: payload?.leftLabel,
          rightLabel: payload?.rightLabel,
          performerLabel: payload?.performerLabel,
          winnerLabel: payload?.winnerLabel,
          roundLabel: payload?.roundLabel,
          cameraCaption: phase.cameraCue.caption,
          scores: null,
        },
      });
    }

    if (playLegacyTimeline && phase.legacyPackageId) {
      PresentationTimelineEngine.playPackage(phase.legacyPackageId, {
        ...payload?.meta,
        winnerName: payload?.winnerLabel,
      });
    }

    if (winnerFocus && payload?.winnerLabel) {
      PresentationDirector.triggerCelebration(payload.winnerLabel);
    }
  }

  /** Preview-only: walk grammar phases with package data (no fake scores). */
  public async playPreviewTimeline(
    onTick?: (snapshot: ActiveShowPackageSnapshot) => void,
    labels?: Pick<
      PresentationEventPayload,
      "leftLabel" | "rightLabel" | "winnerLabel"
    >,
    packId?: string
  ): Promise<void> {
    if (packId) this.setActivePack(packId);
    const pack = getShowPack(this.activePackId);
    if (!pack) return;
    for (const phaseId of pack.grammar) {
      const phase = pack.phases[phaseId];
      if (!phase) continue;
      const snap = this.handleEvent(
        phase.triggerEvent,
        {
          packageId: this.activePackId,
          leftLabel: labels?.leftLabel ?? "Performer A",
          rightLabel: labels?.rightLabel ?? "Performer B",
          winnerLabel: labels?.winnerLabel ?? "Winner (preview label)",
          performerLabel: labels?.leftLabel ?? "Performer A",
          roundLabel: phase.label,
        },
        { mode: "PREVIEW", playLegacyTimeline: false }
      );
      onTick?.(snap);
      await new Promise((r) => setTimeout(r, phase.previewHoldMs));
    }
    this.mode = "IDLE";
    this.emit();
  }

  public reset() {
    for (const overlay of PresentationDirector.getActiveOverlays()) {
      if (overlay.id.startsWith("pack-") || overlay.id.startsWith("alert-")) {
        PresentationDirector.unmountOverlay(overlay.id);
      }
    }
    PresentationTimelineEngine.stopCurrent();
    this.phase = null;
    this.lastEvent = "SHOW_IDLE";
    this.lastEventAt = Date.now();
    this.mode = "IDLE";
    this.activePackId = DEFAULT_SHOW_PACK_ID;
    if (PresentationStateMachine.canTransitionTo("COOLDOWN")) {
      PresentationStateMachine.transitionTo("COOLDOWN");
    }
    if (PresentationStateMachine.canTransitionTo("IDLE")) {
      PresentationStateMachine.transitionTo("IDLE");
    }
    this.emit();
  }

  /** Convenience for DOM / ExperienceOrchestrator bridges */
  public dispatchEnvelope(
    event: PresentationSemanticEvent,
    payload?: PresentationEventPayload
  ) {
    const envelope = createPresentationEvent(event, payload);
    return this.handleEvent(envelope.event, envelope.payload);
  }
}

export const ShowPackageDirector = new ShowPackageDirectorEngine();
export default ShowPackageDirector;
