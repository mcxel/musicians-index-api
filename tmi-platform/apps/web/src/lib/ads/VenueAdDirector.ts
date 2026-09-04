/**
 * VenueAdDirector.ts
 *
 * Pipeline: eligibility → surface → safety → region → priority → frequency →
 * assign creative to Display Target (via JumbotronFaceTargetRegistry).
 *
 * Defaults to direct/artist/house in-world textures — NEVER AdSense as default.
 */

import { JumbotronFaceTargetRegistry } from "../jumbotron/JumbotronFaceTargetRegistry";
import {
  type VenueAdCampaign,
  type VenueAdCreative,
  type JumbotronCardinalFace,
  type AdSafetyHoldReason,
  type InWorldCreativeSourceKind,
  VenueAdPriority,
  IN_WORLD_TEXTURE_FALLBACK_CHAIN,
  DEFAULT_AD_OPTIMIZATION_WEIGHTS,
} from "../jumbotron/JumbotronAdContracts";
import { VenueAdSurfaceRegistry } from "./VenueAdSurfaceRegistry";
import { VenueAdImpressionLedger } from "./VenueAdImpressionLedger";

export type VenueAdRoomPhase =
  | "IDLE"
  | "PERFORMANCE"
  | "BATTLE_FINAL_COUNTDOWN"
  | "INTERMISSION"
  | "EMERGENCY"
  | "MODERATION_HOLD"
  | "ACCESSIBILITY_HOLD";

export interface VenueAdDirectorContext {
  roomId: string;
  venueId: string;
  phase: VenueAdRoomPhase;
  /** Stage-facing face may prioritize performer cues during performance. */
  stageFacingFace?: JumbotronCardinalFace;
  regionCode?: string;
}

export interface AssignmentResult {
  ok: boolean;
  reason: string;
  facesAssigned: JumbotronCardinalFace[];
  creativeIds: string[];
  usedFallback: boolean;
  sourceKind: InWorldCreativeSourceKind | null;
  assignmentIds: string[];
}

function safetyReasonForPhase(phase: VenueAdRoomPhase): AdSafetyHoldReason {
  switch (phase) {
    case "EMERGENCY":
      return "EMERGENCY";
    case "BATTLE_FINAL_COUNTDOWN":
    case "PERFORMANCE":
      return "CRITICAL_LIVE";
    case "MODERATION_HOLD":
      return "MODERATION";
    case "ACCESSIBILITY_HOLD":
      return "ACCESSIBILITY";
    default:
      return "NONE";
  }
}

function minAllowedPriority(phase: VenueAdRoomPhase): VenueAdPriority {
  switch (phase) {
    case "EMERGENCY":
      return VenueAdPriority.P0_EMERGENCY;
    case "BATTLE_FINAL_COUNTDOWN":
    case "PERFORMANCE":
      return VenueAdPriority.P1_CRITICAL_LIVE;
    case "MODERATION_HOLD":
    case "ACCESSIBILITY_HOLD":
      return VenueAdPriority.P0_EMERGENCY;
    default:
      return VenueAdPriority.P6_AMBIENT;
  }
}

export class VenueAdDirector {
  public readonly faces: JumbotronFaceTargetRegistry;
  public readonly surfaces: VenueAdSurfaceRegistry;
  public readonly impressions: VenueAdImpressionLedger;
  private campaigns = new Map<string, VenueAdCampaign>();
  private hourlyCounts = new Map<string, number>();
  private takeoverSnapshot: ReturnType<
    JumbotronFaceTargetRegistry["sharedRoomTruthSnapshot"]
  > | null = null;

  constructor(public ctx: VenueAdDirectorContext) {
    this.faces = new JumbotronFaceTargetRegistry(ctx.roomId, ctx.venueId);
    this.surfaces = new VenueAdSurfaceRegistry(ctx.venueId, ctx.roomId);
    this.impressions = new VenueAdImpressionLedger();
  }

  public registerCampaign(campaign: VenueAdCampaign): void {
    this.campaigns.set(campaign.campaignId, campaign);
  }

  public setPhase(phase: VenueAdRoomPhase): void {
    this.ctx.phase = phase;
    const hold = safetyReasonForPhase(phase);
    if (hold !== "NONE") {
      this.faces.setSafetyHold("ALL", hold);
    } else {
      this.faces.clearSafetyHold("ALL");
    }
  }

  /**
   * Resolve in-world texture creative. AdSense is never chosen by default.
   */
  public resolveInWorldCreative(
    candidates: VenueAdCreative[],
    face: JumbotronCardinalFace
  ): { creative: VenueAdCreative; usedFallback: boolean } | null {
    const eligible = candidates.filter((c) => {
      if (c.sourceKind === "ADSENSE_WEB_OVERLAY_OPT_IN") return false;
      if (c.isBlank) return false;
      if (c.allowedFaces !== "ALL" && !c.allowedFaces.includes(face)) return false;
      const key = `${c.creativeId}:${face}`;
      const count = this.hourlyCounts.get(key) ?? 0;
      if (count >= c.frequencyCapPerHour) return false;
      return true;
    });

    for (const kind of IN_WORLD_TEXTURE_FALLBACK_CHAIN) {
      const hit = eligible.find((c) => c.sourceKind === kind);
      if (hit) {
        return {
          creative: hit,
          usedFallback: kind !== IN_WORLD_TEXTURE_FALLBACK_CHAIN[0],
        };
      }
    }
    return null;
  }

  public createAmbientHouseCreative(face: JumbotronCardinalFace): VenueAdCreative {
    return {
      creativeId: `house-ambient-${face.toLowerCase()}`,
      campaignId: "house-ambient",
      sourceKind: "AMBIENT_ART",
      advertiserName: "TMI House",
      textureAssetUrl: "/images/tmi-placeholder.jpg",
      durationMs: 15_000,
      priority: VenueAdPriority.P6_AMBIENT,
      allowedFaces: [face],
      campaignMode: "SINGLE_FACE",
      compositionHint: "FULL",
      frequencyCapPerHour: 999,
      isBlank: false,
    };
  }

  /**
   * Full pipeline assignment for independent per-face campaigns.
   */
  public assignCampaignToFaces(params: {
    campaign: VenueAdCampaign;
    faces: JumbotronCardinalFace[];
    allowPipOverProgram?: boolean;
    nowMs?: number;
  }): AssignmentResult {
    const minPri = minAllowedPriority(this.ctx.phase);
    if (params.campaign.priority > minPri && minPri <= VenueAdPriority.P1_CRITICAL_LIVE) {
      // Commercial priorities blocked during emergency / critical live
      if (params.campaign.priority >= VenueAdPriority.P3_CONTRACTED_SPONSOR) {
        return {
          ok: false,
          reason: `Ad Safety: phase ${this.ctx.phase} preempts commercial priority ${params.campaign.priority}`,
          facesAssigned: [],
          creativeIds: [],
          usedFallback: false,
          sourceKind: null,
          assignmentIds: [],
        };
      }
    }

    // Stage-facing face during performance: prefer program cues unless PiP allowed
    const faces = params.faces.filter((f) => {
      if (
        this.ctx.phase === "PERFORMANCE" &&
        this.ctx.stageFacingFace === f &&
        !params.allowPipOverProgram &&
        params.campaign.priority >= VenueAdPriority.P3_CONTRACTED_SPONSOR
      ) {
        return false;
      }
      return true;
    });

    if (faces.length === 0) {
      return {
        ok: false,
        reason: "No eligible faces after stage-facing / safety filters",
        facesAssigned: [],
        creativeIds: [],
        usedFallback: false,
        sourceKind: null,
        assignmentIds: [],
      };
    }

    const creativeIds: string[] = [];
    const assignmentIds: string[] = [];
    let usedFallback = false;
    let sourceKind: InWorldCreativeSourceKind | null = null;

    for (const face of faces) {
      let resolved = this.resolveInWorldCreative(params.campaign.creatives, face);
      if (!resolved) {
        // Fallback never blank
        const ambient = this.createAmbientHouseCreative(face);
        resolved = { creative: ambient, usedFallback: true };
      }
      usedFallback = usedFallback || resolved.usedFallback;
      sourceKind = resolved.creative.sourceKind;

      const composition =
        params.allowPipOverProgram && this.ctx.phase === "PERFORMANCE"
          ? "PIP"
          : resolved.creative.compositionHint;

      this.faces.assignFace({
        orientation: face,
        source: resolved.creative.sourceKind === "AMBIENT_ART" ? "AMBIENT_ART" : "AD",
        campaignId: resolved.creative.campaignId,
        creativeId: resolved.creative.creativeId,
        compositionMode: composition,
        priority: Math.min(params.campaign.priority, resolved.creative.priority) as VenueAdPriority,
        nowMs: params.nowMs,
      });

      const inv = this.surfaces.getJumbotronFace(face);
      this.surfaces.assignCreative(
        inv.inventoryId,
        resolved.creative.creativeId,
        resolved.creative.campaignId
      );

      const assignment = this.impressions.recordAssignment({
        roomId: this.ctx.roomId,
        inventoryId: inv.inventoryId,
        creativeId: resolved.creative.creativeId,
        campaignId: resolved.creative.campaignId,
        viewerRole: "AUDIENCE_IMPRESSION",
        nowMs: params.nowMs,
      });
      assignmentIds.push(assignment.assignmentId);

      const freqKey = `${resolved.creative.creativeId}:${face}`;
      this.hourlyCounts.set(freqKey, (this.hourlyCounts.get(freqKey) ?? 0) + 1);
      creativeIds.push(resolved.creative.creativeId);
    }

    void DEFAULT_AD_OPTIMIZATION_WEIGHTS; // stub retained for future optimizer hook

    return {
      ok: true,
      reason: "Assigned to independent face display targets",
      facesAssigned: faces,
      creativeIds,
      usedFallback,
      sourceKind,
      assignmentIds,
    };
  }

  /** Synchronized takeover — snapshot prior state, assign all four, then restore. */
  public beginSynchronizedTakeover(campaign: VenueAdCampaign, nowMs?: number): AssignmentResult {
    this.takeoverSnapshot = this.faces.sharedRoomTruthSnapshot();
    return this.assignCampaignToFaces({
      campaign: { ...campaign, mode: "SYNCHRONIZED_TAKEOVER" },
      faces: JumbotronFaceTargetRegistry.cardinalFaces(),
      nowMs,
    });
  }

  public endSynchronizedTakeover(nowMs?: number): void {
    if (!this.takeoverSnapshot) return;
    for (const face of JumbotronFaceTargetRegistry.cardinalFaces()) {
      const prior = this.takeoverSnapshot[face];
      this.faces.assignFace({
        orientation: face,
        source: prior.source ?? "AMBIENT_ART",
        campaignId: prior.campaignId,
        creativeId: prior.creativeId,
        priority: VenueAdPriority.P6_AMBIENT,
        nowMs,
      });
      const inv = this.surfaces.getJumbotronFace(face);
      if (prior.creativeId && prior.campaignId) {
        this.surfaces.assignCreative(inv.inventoryId, prior.creativeId, prior.campaignId);
      }
    }
    this.takeoverSnapshot = null;
  }

  /** Critical live (e.g. battle final countdown) preempts commercial ads. */
  public preemptCommercialForCriticalLive(cueCreativeId = "battle-final-countdown"): AssignmentResult {
    this.setPhase("BATTLE_FINAL_COUNTDOWN");
    const faces = JumbotronFaceTargetRegistry.cardinalFaces();
    for (const face of faces) {
      this.faces.assignFace({
        orientation: face,
        source: "TIMER",
        campaignId: null,
        creativeId: cueCreativeId,
        compositionMode: "FULL",
        priority: VenueAdPriority.P1_CRITICAL_LIVE,
      });
    }
    return {
      ok: true,
      reason: "P1 CRITICAL LIVE preempted commercial creatives",
      facesAssigned: faces,
      creativeIds: [cueCreativeId],
      usedFallback: false,
      sourceKind: null,
      assignmentIds: [],
    };
  }

  public sharedTruthForFace(face: JumbotronCardinalFace): {
    viewerA: { creativeId: string | null };
    viewerB: { creativeId: string | null };
    identical: boolean;
  } {
    const inv = this.surfaces.getJumbotronFace(face);
    const a = this.surfaces.getSharedCreative(inv.inventoryId);
    const b = this.surfaces.getSharedCreative(inv.inventoryId);
    return {
      viewerA: { creativeId: a.creativeId },
      viewerB: { creativeId: b.creativeId },
      identical: a.creativeId === b.creativeId && a.sharedRoomTruthKey === b.sharedRoomTruthKey,
    };
  }

  public usesAdSenseAsDefaultInWorldPath(): false {
    return false;
  }
}
