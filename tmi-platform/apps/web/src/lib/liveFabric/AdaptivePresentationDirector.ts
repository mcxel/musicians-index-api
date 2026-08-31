/**
 * AdaptivePresentationDirector.ts — AUTO / DIRECTOR / MANUAL
 * Never bypasses safety, rights, or role capability gates.
 */

import type { PresentationMode, PresentationPlan, VoltronScoreFactors } from "./contracts/PresentationContracts";
import type { ExperiencePresentationContract } from "./contracts/ExperienceContracts";
import type { LiveCapabilitySet } from "./contracts/CapabilityContracts";
import { SurfaceComposer } from "./SurfaceComposer";
import type { LiveFrameGraph } from "./LiveFrameGraph";

export interface DirectorSafetyGate {
  rightsPublishAllowed: boolean;
  roleAllowsDirect: boolean;
  budgetAllowsVoltron: boolean;
}

export class AdaptivePresentationDirector {
  private mode: PresentationMode = "AUTO";

  constructor(
    private readonly sessionId: string,
    private readonly generation: number,
    private readonly composer: SurfaceComposer,
    private readonly frameGraph: LiveFrameGraph,
    private readonly experience: ExperiencePresentationContract
  ) {}

  public getMode(): PresentationMode {
    return this.mode;
  }

  public setMode(mode: PresentationMode, capability: LiveCapabilitySet, gate: DirectorSafetyGate): void {
    if (mode === "DIRECTOR" || mode === "MANUAL") {
      if (!capability.canDirectPresentation || !gate.roleAllowsDirect) {
        throw new Error("PRESENTATION_MODE_DENIED: role cannot direct");
      }
    }
    if (!gate.rightsPublishAllowed) {
      throw new Error("PRESENTATION_MODE_DENIED: rights gate closed");
    }
    this.mode = mode;
  }

  public scoreVoltron(factors: VoltronScoreFactors, gate: DirectorSafetyGate): boolean {
    if (!this.experience.voltronAllowed) return false;
    if (!gate.budgetAllowsVoltron) return false;
    if (factors.reducedMotionPreference) return false;
    if (factors.deviceGpuTier === "LOW") return false;
    if (factors.bandwidthTier === "LOW") return false;
    if (factors.participantCount < 2) return false;
    const score =
      factors.crowdActivityScore * 0.4 +
      (factors.displayCount > 1 ? 0.3 : 0.1) +
      (factors.historicalEngagementWeight ?? 0.2);
    return score >= 0.55;
  }

  public buildPlan(input: {
    toLayout: PresentationPlan["toLayout"];
    frameAssignments: Record<string, string | null>;
    reason: string;
    mediaClockMs: number;
    reducedMotion: boolean;
    takeAfterCommit?: boolean;
    targetBus?: "PROGRAM" | "PREVIEW";
  }): PresentationPlan {
    let toLayout = input.toLayout;
    if (!this.experience.allowedLayouts.includes(toLayout)) {
      toLayout = this.experience.defaultLayout;
    }
    if (input.reducedMotion && toLayout === "VOLTRON") {
      toLayout = this.experience.accessibility.reducedMotionLayout;
    }

    return {
      planId: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sessionId: this.sessionId,
      generation: this.generation,
      expectedRevision: this.composer.getRevision(),
      fromLayout: this.composer.getLayout(),
      toLayout,
      frameAssignments: input.frameAssignments,
      targetBus: input.targetBus ?? "PREVIEW",
      takeAfterCommit: input.takeAfterCommit ?? false,
      transition: {
        type: toLayout === "VOLTRON" && !input.reducedMotion ? "VOLTRON_MORPH" : "CUT",
        durationMs: toLayout === "VOLTRON" && !input.reducedMotion ? 400 : 0,
      },
      startAtMonotonicMs: input.mediaClockMs,
      durationMs: 0,
      fallbackLayout: this.experience.singleScreenFallbackLayout,
      reason: input.reason,
      reducedMotionSafe: toLayout !== "VOLTRON",
    };
  }

  /** AUTO mode: propose layout; MANUAL/DIRECTOR: caller owns plan content. */
  public proposeAutoLayout(factors: VoltronScoreFactors, gate: DirectorSafetyGate): PresentationPlan["toLayout"] {
    if (this.mode !== "AUTO") return this.composer.getLayout();
    if (this.scoreVoltron(factors, gate)) return "VOLTRON";
    if (this.experience.defaultLayout) return this.experience.defaultLayout;
    return this.experience.singleScreenFallbackLayout;
  }

  public prepareThenTake(
    plan: PresentationPlan,
    opts?: { reducedMotion?: boolean }
  ): { prepare: ReturnType<SurfaceComposer["executePlan"]>; take?: void } {
    const preparePlan: PresentationPlan = {
      ...plan,
      targetBus: "PREVIEW",
      takeAfterCommit: false,
      expectedRevision: this.composer.getRevision(),
    };
    const prepare = this.composer.executePlan(preparePlan, opts);
    if (!prepare.success) return { prepare };
    this.frameGraph.promotePreviewToProgram();
    return { prepare };
  }
}
