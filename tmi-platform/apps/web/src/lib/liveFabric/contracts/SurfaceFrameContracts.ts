/**
 * SurfaceFrameContracts.ts — Addressable frames, PROGRAM vs PREVIEW, atomic tx
 */

export type CanonicalFrameSlot =
  | "PRIMARY"
  | "SECONDARY"
  | "AUDIENCE"
  | "SELF"
  | "GUEST"
  | "OPPONENT"
  | "JUDGE"
  | "DJ"
  | "BACKSTAGE"
  | "CONTEXT"
  | "COMMERCE"
  | "REPLAY"
  | "OVERLAY";

export type FrameSlot = CanonicalFrameSlot | (string & {});

export type FrameTargetBus = "PROGRAM" | "PREVIEW";

export interface FrameTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  scale?: number;
  rotation?: number;
}

export interface FrameAssignmentRecord {
  slot: FrameSlot;
  sourceId: string | null;
  assignedAtMs: number;
  zIndex: number;
  opacity: number;
  visible: boolean;
  parked: boolean;
  transform?: FrameTransform;
}

export type FrameGraph = Record<string, FrameAssignmentRecord>;

export interface FrameAssignmentOp {
  slot: FrameSlot;
  sourceId: string | null;
  zIndex?: number;
  opacity?: number;
  visible?: boolean;
  parked?: boolean;
  transform?: FrameTransform;
}

/** Atomic frame assignment transaction — all-or-nothing. */
export interface FrameTransactionPlan {
  transactionId: string;
  sessionId: string;
  generation: number;
  expectedRevision: number;
  targetBus: FrameTargetBus;
  assignments: FrameAssignmentOp[];
  timestampMs: number;
  /** Optional promote: copy PREVIEW → PROGRAM after commit. */
  takeAfterCommit?: boolean;
}

export interface FrameTransactionResult {
  transactionId: string;
  success: boolean;
  appliedRevision: number;
  error?: string;
  tookToProgram?: boolean;
}
