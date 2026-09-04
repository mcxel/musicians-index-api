/**
 * SurfaceComposer.ts — Atomic PresentationPlan execution across layouts + display targets
 */

import { LiveFrameGraph } from "./LiveFrameGraph";
import type {
  PresentationLayout,
  PresentationPlan,
  PresentationPlanResult,
  DisplayTarget,
  DisplayTargetBinding,
  SingleScreenCompositionSpec,
} from "./contracts/PresentationContracts";
import type { FrameAssignmentOp } from "./contracts/SurfaceFrameContracts";

export class SurfaceComposer {
  private layout: PresentationLayout = "FLAT";
  private revision: number;
  private readonly displayTargets = new Map<DisplayTarget, DisplayTargetBinding>();

  constructor(
    private readonly sessionId: string,
    private readonly frameGraph: LiveFrameGraph,
    private generation = 1
  ) {
    this.revision = 0;
    this.bindDisplay("LOCAL_PRIMARY", "FLAT", "PROGRAM", true);
    this.bindDisplay("RECORDING_PROGRAM", "FLAT", "PROGRAM", false);
    this.bindDisplay("RECORDING_ISO", "FLAT", "PREVIEW", false);
  }

  public setGeneration(generation: number): void {
    this.generation = generation;
    this.revision = 0;
  }

  public getLayout(): PresentationLayout {
    return this.layout;
  }

  public getRevision(): number {
    return this.revision;
  }

  public bindDisplay(
    target: DisplayTarget,
    layout: PresentationLayout,
    bus: "PROGRAM" | "PREVIEW",
    active: boolean
  ): void {
    this.displayTargets.set(target, { target, layout, bus, active });
  }

  public getDisplayTargets(): DisplayTargetBinding[] {
    return Array.from(this.displayTargets.values()).map((d) => ({ ...d }));
  }

  /**
   * Execute PresentationPlan atomically.
   * Reduced-motion: VOLTRON_MORPH → CUT; fallback layout if plan not reducedMotionSafe.
   */
  public executePlan(
    plan: PresentationPlan,
    opts?: { reducedMotion?: boolean }
  ): PresentationPlanResult {
    if (plan.sessionId !== this.sessionId) {
      return {
        planId: plan.planId,
        success: false,
        appliedLayout: this.layout,
        appliedRevision: this.revision,
        usedFallback: false,
        error: "SESSION_MISMATCH",
      };
    }
    if (plan.generation !== this.generation) {
      return {
        planId: plan.planId,
        success: false,
        appliedLayout: this.layout,
        appliedRevision: this.revision,
        usedFallback: false,
        error: "GENERATION_MISMATCH",
      };
    }
    if (plan.expectedRevision !== this.revision) {
      return {
        planId: plan.planId,
        success: false,
        appliedLayout: this.layout,
        appliedRevision: this.revision,
        usedFallback: false,
        error: "REVISION_MISMATCH",
      };
    }

    const reduced = opts?.reducedMotion === true;
    let targetLayout = plan.toLayout;
    let usedFallback = false;

    if (reduced) {
      if (targetLayout === "VOLTRON" || !plan.reducedMotionSafe) {
        targetLayout = plan.fallbackLayout === "VOLTRON" ? "FLAT" : plan.fallbackLayout;
        usedFallback = true;
      }
      if (plan.transition.type === "VOLTRON_MORPH") {
        plan = {
          ...plan,
          transition: { ...plan.transition, type: "CUT", durationMs: 0 },
        };
      }
    }

    const assignments: FrameAssignmentOp[] = Object.entries(plan.frameAssignments).map(
      ([slot, sourceId]) => ({
        slot,
        sourceId,
        visible: sourceId != null,
        parked: false,
      })
    );

    const frameExpected = this.frameGraph.getRevision();
    const tx = this.frameGraph.commitTransaction({
      transactionId: `compose-${plan.planId}`,
      sessionId: this.sessionId,
      generation: this.generation,
      expectedRevision: frameExpected,
      targetBus: plan.targetBus,
      assignments,
      timestampMs: Date.now(),
      takeAfterCommit: plan.takeAfterCommit,
    });

    if (!tx.success) {
      return {
        planId: plan.planId,
        success: false,
        appliedLayout: this.layout,
        appliedRevision: this.revision,
        usedFallback,
        error: tx.error ?? "FRAME_TX_FAILED",
      };
    }

    this.layout = targetLayout;
    this.revision += 1;
    this.bindDisplay("LOCAL_PRIMARY", targetLayout, plan.targetBus === "PROGRAM" ? "PROGRAM" : "PREVIEW", true);

    return {
      planId: plan.planId,
      success: true,
      appliedLayout: this.layout,
      appliedRevision: this.revision,
      usedFallback,
    };
  }

  public static buildSingleScreenSpec(
    experienceType: string,
    layout: PresentationLayout,
    primarySourceId: string | null
  ): SingleScreenCompositionSpec {
    return {
      experienceType,
      guaranteedLayout: layout === "MULTI_MONITOR" || layout === "VOLTRON" ? "FLAT" : layout,
      framePlacement: {
        PRIMARY: { widthPct: 100, heightPct: 70, topPct: 0, leftPct: 0 },
        AUDIENCE: { widthPct: 100, heightPct: 20, topPct: 70, leftPct: 0 },
        OVERLAY: { widthPct: 100, heightPct: 10, topPct: 90, leftPct: 0 },
        ...(primarySourceId
          ? {}
          : {}),
      },
      overlaySafeZonePct: { top: 8, bottom: 12, left: 4, right: 4 },
    };
  }
}
