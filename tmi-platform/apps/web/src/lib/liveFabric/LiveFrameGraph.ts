/**
 * LiveFrameGraph.ts — Assign / swap / promote / park without media restart
 * PROGRAM vs PREVIEW buses; atomic transactions.
 */

import {
  type FrameSlot,
  type FrameAssignmentRecord,
  type FrameGraph,
  type FrameTransactionPlan,
  type FrameTransactionResult,
  type FrameTargetBus,
} from "./contracts/SurfaceFrameContracts";

const CANONICAL_SLOTS: FrameSlot[] = [
  "PRIMARY",
  "SECONDARY",
  "AUDIENCE",
  "SELF",
  "GUEST",
  "OPPONENT",
  "JUDGE",
  "DJ",
  "BACKSTAGE",
  "CONTEXT",
  "COMMERCE",
  "REPLAY",
  "OVERLAY",
];

function emptyAssignment(slot: FrameSlot): FrameAssignmentRecord {
  return {
    slot,
    sourceId: null,
    assignedAtMs: 0,
    zIndex: 0,
    opacity: 1,
    visible: false,
    parked: false,
  };
}

export class LiveFrameGraph {
  private readonly sessionId: string;
  private generation: number;
  private revision: number;
  private readonly program: FrameGraph = {};
  private readonly preview: FrameGraph = {};

  constructor(sessionId: string, generation = 1) {
    this.sessionId = sessionId;
    this.generation = generation;
    this.revision = 0;
    for (const slot of CANONICAL_SLOTS) {
      this.program[slot] = emptyAssignment(slot);
      this.preview[slot] = emptyAssignment(slot);
    }
  }

  public setGeneration(generation: number): void {
    this.generation = generation;
    this.revision = 0;
  }

  public getRevision(): number {
    return this.revision;
  }

  public getBus(bus: FrameTargetBus): FrameGraph {
    const src = bus === "PROGRAM" ? this.program : this.preview;
    const out: FrameGraph = {};
    for (const [k, v] of Object.entries(src)) {
      out[k] = { ...v };
    }
    return out;
  }

  public getAssignment(bus: FrameTargetBus, slot: FrameSlot): FrameAssignmentRecord {
    const graph = bus === "PROGRAM" ? this.program : this.preview;
    if (!graph[slot]) graph[slot] = emptyAssignment(slot);
    return { ...graph[slot] };
  }

  /** Atomic all-or-nothing assignment transaction. */
  public commitTransaction(plan: FrameTransactionPlan): FrameTransactionResult {
    if (plan.sessionId !== this.sessionId) {
      return {
        transactionId: plan.transactionId,
        success: false,
        appliedRevision: this.revision,
        error: "SESSION_MISMATCH",
      };
    }
    if (plan.generation !== this.generation) {
      return {
        transactionId: plan.transactionId,
        success: false,
        appliedRevision: this.revision,
        error: "GENERATION_MISMATCH",
      };
    }
    if (plan.expectedRevision !== this.revision) {
      return {
        transactionId: plan.transactionId,
        success: false,
        appliedRevision: this.revision,
        error: "REVISION_MISMATCH",
      };
    }

    const target = plan.targetBus === "PROGRAM" ? this.program : this.preview;
    const rollback = Object.fromEntries(
      Object.entries(target).map(([k, v]) => [k, { ...v }])
    ) as FrameGraph;

    try {
      for (const op of plan.assignments) {
        const prev = target[op.slot] ?? emptyAssignment(op.slot);
        target[op.slot] = {
          slot: op.slot,
          sourceId: op.sourceId,
          assignedAtMs: Date.now(),
          zIndex: op.zIndex ?? prev.zIndex,
          opacity: op.opacity ?? prev.opacity,
          visible: op.visible ?? (op.sourceId != null && !(op.parked ?? false)),
          parked: op.parked ?? false,
          transform: op.transform ?? prev.transform,
        };
      }
      this.revision += 1;

      let tookToProgram = false;
      if (plan.takeAfterCommit && plan.targetBus === "PREVIEW") {
        this.promotePreviewToProgram();
        tookToProgram = true;
      }

      return {
        transactionId: plan.transactionId,
        success: true,
        appliedRevision: this.revision,
        tookToProgram,
      };
    } catch (err) {
      for (const k of Object.keys(target)) delete target[k];
      Object.assign(target, rollback);
      return {
        transactionId: plan.transactionId,
        success: false,
        appliedRevision: this.revision,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  public assign(bus: FrameTargetBus, slot: FrameSlot, sourceId: string | null): FrameTransactionResult {
    return this.commitTransaction({
      transactionId: `assign-${slot}-${Date.now()}`,
      sessionId: this.sessionId,
      generation: this.generation,
      expectedRevision: this.revision,
      targetBus: bus,
      assignments: [{ slot, sourceId, visible: sourceId != null, parked: false }],
      timestampMs: Date.now(),
    });
  }

  public swap(bus: FrameTargetBus, slotA: FrameSlot, slotB: FrameSlot): FrameTransactionResult {
    const a = this.getAssignment(bus, slotA);
    const b = this.getAssignment(bus, slotB);
    return this.commitTransaction({
      transactionId: `swap-${slotA}-${slotB}-${Date.now()}`,
      sessionId: this.sessionId,
      generation: this.generation,
      expectedRevision: this.revision,
      targetBus: bus,
      assignments: [
        { slot: slotA, sourceId: b.sourceId, visible: b.visible, parked: b.parked, zIndex: b.zIndex },
        { slot: slotB, sourceId: a.sourceId, visible: a.visible, parked: a.parked, zIndex: a.zIndex },
      ],
      timestampMs: Date.now(),
    });
  }

  public park(bus: FrameTargetBus, slot: FrameSlot): FrameTransactionResult {
    const cur = this.getAssignment(bus, slot);
    return this.commitTransaction({
      transactionId: `park-${slot}-${Date.now()}`,
      sessionId: this.sessionId,
      generation: this.generation,
      expectedRevision: this.revision,
      targetBus: bus,
      assignments: [{ slot, sourceId: cur.sourceId, parked: true, visible: false }],
      timestampMs: Date.now(),
    });
  }

  /** Director TAKE: copy PREVIEW → PROGRAM without media restart. */
  public promotePreviewToProgram(): { success: true; appliedRevision: number } {
    for (const slot of Object.keys(this.preview)) {
      const p = this.preview[slot];
      this.program[slot] = { ...p, assignedAtMs: Date.now() };
    }
    this.revision += 1;
    return { success: true, appliedRevision: this.revision };
  }

  public sourceIdsOnBus(bus: FrameTargetBus): string[] {
    const g = bus === "PROGRAM" ? this.program : this.preview;
    return Object.values(g)
      .map((a) => a.sourceId)
      .filter((id): id is string => id != null);
  }
}
