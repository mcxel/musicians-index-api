// ─── OCCUPANT SWAP ENGINE ─────────────────────────────────────────────────────
// Computes animated transitions for Top 10 occupant changes on Homepage 1-2.
//
// Build Director patch model:
//   - No bulk ladder rise.
//   - No all-10 synchronous motion.
//   - Slot positions stay fixed.
//   - Occupants animate independently.
//
// Runtime sequence:
//   1) Reveal      pop-in, bottom->top (10 -> 1)
//   2) Climb       only affected occupants move, independently
//   3) Correction  micro-adjust for fine rank reconciliation
//   4) Settle      fast lock, glow settle, dust burst, slot lock
//   5) Crown flash when #1 changes
//
// Visual rule: cards stay FLUSH to the magazine page surface.
//   No floating. Cards animate via translate within their recessed frame.
// ─────────────────────────────────────────────────────────────────────────────

import type { RankOccupant, RankSlot } from "@/lib/rankings/RankRotationEngine";
import {
  buildNearWinPulseHints,
  type NearWinPulseHint,
} from "@/lib/rankings/NearWinPulseEngine";
import {
  buildHotStreakBadges,
  type HotStreakBadgeHint,
} from "@/lib/rankings/HotStreakBadgeEngine";
import {
  buildFallTrailHints,
  type FallTrailHint,
} from "@/lib/rankings/FallTrailEngine";
import {
  buildNewChallengerFlashHints,
  type NewChallengerFlashHint,
} from "@/lib/rankings/NewChallengerFlash";
import {
  deriveCrownTransferAnimation,
  type CrownTransferAnimation,
} from "@/lib/rankings/CrownTransferAnimation";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type SwapAnimationType = "promote" | "demote" | "enter" | "exit" | "hold";
export type AnimationPhase = "reveal" | "climb" | "correction" | "settle";

export interface SwapInstruction {
  slotPosition: number;
  occupantId: string;
  animation: SwapAnimationType;
  phase: AnimationPhase;
  /** Normalized delta: positive = moving up in rank (promote), negative = down */
  rankDelta: number;
  /** CSS transition duration (ms) */
  durationMs: number;
  /** CSS easing */
  easing: string;
  /** Stagger delay offset (ms) so all swaps don't fire at once */
  staggerDelayMs: number;
}

export interface AnimationBatchPlan {
  reveal: SwapInstruction[];
  climb: SwapInstruction[];
  correction: SwapInstruction[];
  settle: SwapInstruction[];
  overlays: {
    nearWinPulse: NearWinPulseHint[];
    hotStreakBadges: HotStreakBadgeHint[];
    fallTrails: FallTrailHint[];
    newChallengerFlash: NewChallengerFlashHint[];
    crownTransfer: CrownTransferAnimation | null;
  };
}

// ─── TIMING CONSTANTS ────────────────────────────────────────────────────────

export const SWAP_DURATIONS: Record<SwapAnimationType, number> = {
  promote: 480,
  demote:  420,
  enter:   560,
  exit:    320,
  hold:    0,
};

// Fast lock-in pass for the end of each update round.
export const SETTLE_DURATION_MS = 160;

export const SWAP_EASINGS: Record<SwapAnimationType, string> = {
  promote: "cubic-bezier(.12,.8,.2,1)",
  demote:  "cubic-bezier(.4,0,.6,1)",
  enter:   "cubic-bezier(.22,.8,.2,1)",
  exit:    "cubic-bezier(.6,0,1,.6)",
  hold:    "linear",
};

/** Stagger increment per slot to avoid all cards animating identically */
const STAGGER_INCREMENT_MS = 40;
const REVEAL_MIN_STEP_MS = 120;
const REVEAL_MAX_STEP_MS = 220;

// ─── ANIMATION DERIVATION ─────────────────────────────────────────────────────

export function deriveSwapAnimation(occupant: RankOccupant): SwapAnimationType {
  switch (occupant.status) {
    case "promoted": return "promote";
    case "demoted":  return "demote";
    case "entering": return "enter";
    case "exiting":  return "exit";
    default:         return "hold";
  }
}

function hashToRange(value: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  const normalized = Math.abs(hash % 1000) / 1000;
  return Math.round(min + normalized * (max - min));
}

function getRevealDelayMs(slotPosition: number): number {
  // Bottom-to-top reveal means slot 10 appears first, then 9 ... then 1.
  const revealIndex = 10 - slotPosition;
  const step = Math.round((REVEAL_MIN_STEP_MS + REVEAL_MAX_STEP_MS) / 2);
  return revealIndex * step;
}

function getIndependentDelayMs(occupantId: string, rankDelta: number): number {
  // Independent timing per affected occupant (no grouped motion).
  const base = hashToRange(occupantId, 40, 180);
  const distanceBoost = Math.min(120, Math.abs(rankDelta) * 22);
  return base + distanceBoost;
}

// ─── DIFF ENGINE ─────────────────────────────────────────────────────────────
// Compares two slot snapshots and returns the list of swap instructions
// needed to animate from prev → next.

export function computeSwapInstructions(
  prevSlots: RankSlot[],
  nextSlots: RankSlot[]
): SwapInstruction[] {
  const instructions: SwapInstruction[] = [];

  for (const nextSlot of nextSlots) {
    const prevSlot = prevSlots.find((s) => s.position === nextSlot.position);

    if (!nextSlot.occupant) continue;

    const occupant = nextSlot.occupant;
    const animation = deriveSwapAnimation(occupant);

    if (animation === "hold") continue;

    const rankDelta = occupant.previousRank - occupant.rank;
    const staggerDelayMs = (nextSlot.position - 1) * STAGGER_INCREMENT_MS;

    instructions.push({
      slotPosition: nextSlot.position,
      occupantId: occupant.id,
      animation,
      phase: "climb",
      rankDelta,
      durationMs: SWAP_DURATIONS[animation],
      easing: SWAP_EASINGS[animation],
      staggerDelayMs: getIndependentDelayMs(occupant.id, rankDelta),
    });

    void prevSlot; // suppress unused warning — kept for future delta logic
  }

  return instructions;
}

// ─── REVEAL PHASE (10 -> 1) ──────────────────────────────────────────────────

export function buildRevealInstructions(nextSlots: RankSlot[]): SwapInstruction[] {
  const reveal: SwapInstruction[] = [];

  for (const slot of nextSlots) {
    if (!slot.occupant) continue;
    const animation: SwapAnimationType = slot.occupant.status === "entering" ? "enter" : "hold";
    reveal.push({
      slotPosition: slot.position,
      occupantId: slot.occupant.id,
      animation,
      phase: "reveal",
      rankDelta: 0,
      durationMs: animation === "enter" ? 260 : 220,
      easing: "cubic-bezier(.22,.8,.2,1)",
      staggerDelayMs: getRevealDelayMs(slot.position),
    });
  }

  return reveal.sort((a, b) => a.staggerDelayMs - b.staggerDelayMs);
}

// ─── CORRECTION + SETTLE ─────────────────────────────────────────────────────

export function buildCorrectionInstructions(climb: SwapInstruction[]): SwapInstruction[] {
  return climb
    .filter((i) => i.animation !== "hold")
    .map((i) => ({
      ...i,
      phase: "correction",
      durationMs: 140,
      easing: "cubic-bezier(.3,.9,.2,1)",
      staggerDelayMs: i.staggerDelayMs + i.durationMs,
    }));
}

export function buildSettleInstructions(nextSlots: RankSlot[]): SwapInstruction[] {
  return nextSlots
    .filter((s) => s.occupant)
    .map((s) => ({
      slotPosition: s.position,
      occupantId: s.occupant!.id,
      animation: "hold" as const,
      phase: "settle" as const,
      rankDelta: 0,
      durationMs: SETTLE_DURATION_MS,
      easing: "cubic-bezier(.2,.9,.2,1)",
      staggerDelayMs: hashToRange(s.occupant!.id, 0, 40),
    }));
}

// ─── FULL BROADCAST PLAN ─────────────────────────────────────────────────────

export function buildAnimationBatchPlan(
  prevSlots: RankSlot[],
  nextSlots: RankSlot[]
): AnimationBatchPlan {
  const reveal = buildRevealInstructions(nextSlots);
  const climb = computeSwapInstructions(prevSlots, nextSlots).map((i) => ({ ...i, phase: "climb" as const }));
  const correction = buildCorrectionInstructions(climb);
  const settle = buildSettleInstructions(nextSlots);

  return {
    reveal,
    climb,
    correction,
    settle,
    overlays: {
      nearWinPulse: buildNearWinPulseHints(nextSlots),
      hotStreakBadges: buildHotStreakBadges(nextSlots),
      fallTrails: buildFallTrailHints(nextSlots),
      newChallengerFlash: buildNewChallengerFlashHints(nextSlots),
      crownTransfer: deriveCrownTransferAnimation(prevSlots, nextSlots),
    },
  };
}

// ─── CSS STYLE FACTORY ────────────────────────────────────────────────────────
// Produces CSS custom properties for a given swap instruction.
// Applied as inline style on the occupant card element.

export interface OccupantCardStyles {
  transform: string;
  opacity: number;
  transition: string;
  /** Positive = crown glow; negative = exit fade */
  glowMultiplier: number;
  filter?: string;
}

export function getOccupantCardStyles(
  instruction: SwapInstruction | null,
  phase: "before" | "active" | "after"
): OccupantCardStyles {
  if (!instruction || instruction.animation === "hold") {
    if (instruction?.phase === "settle") {
      return {
        transform: phase === "before" ? "translateY(1px)" : "translateY(0px)",
        opacity: 1,
        transition: `transform ${instruction.durationMs}ms ${instruction.easing} ${instruction.staggerDelayMs}ms`,
        glowMultiplier: 0.25,
        filter: "saturate(1.06)",
      };
    }
    return { transform: "translateY(0px)", opacity: 1, transition: "none", glowMultiplier: 0 };
  }

  const { animation, durationMs, easing, staggerDelayMs } = instruction;
  const delay = `${staggerDelayMs}ms`;

  switch (animation) {
    case "promote":
      return {
        transform:
          phase === "before"
            ? "translateY(12px) scale(0.985)"
            : phase === "after"
              ? "translateY(-1px)"
              : "translateY(0px) scale(1)",
        opacity: phase === "before" ? 0.6 : 1,
        transition: `transform ${durationMs}ms ${easing} ${delay}, opacity ${durationMs}ms ease ${delay}`,
        glowMultiplier: 1,
        filter: "saturate(1.06)",
      };

    case "demote":
      return {
        transform:
          phase === "before"
            ? "translateY(-8px)"
            : phase === "after"
              ? "translateY(1px)"
              : "translateY(0px)",
        opacity: phase === "before" ? 0.7 : 1,
        transition: `transform ${durationMs}ms ${easing} ${delay}, opacity ${durationMs}ms ease ${delay}`,
        glowMultiplier: -0.5,
        filter: "saturate(0.98)",
      };

    case "enter":
      return {
        transform:
          phase === "before"
            ? "translateY(20px) scale(0.9)"
            : phase === "after"
              ? "translateY(-1px) scale(1.01)"
              : "translateY(0px) scale(1)",
        opacity: phase === "before" ? 0 : 1,
        transition: `transform ${durationMs}ms ${easing} ${delay}, opacity ${durationMs}ms ease ${delay}`,
        glowMultiplier: 0.8,
        filter: "brightness(1.06)",
      };

    case "exit":
      return {
        transform: phase === "after" ? "translateY(-12px) scale(0.96)" : "translateY(0px) scale(1)",
        opacity: phase === "after" ? 0 : 1,
        transition: `transform ${durationMs}ms ${easing} ${delay}, opacity ${durationMs}ms ease ${delay}`,
        glowMultiplier: -1,
        filter: "saturate(0.9)",
      };

    default:
      return { transform: "translateY(0px)", opacity: 1, transition: "none", glowMultiplier: 0 };
  }
}

// ─── PROMOTION CROWN FLASH ────────────────────────────────────────────────────
// For #1 slot promotions — returns a CSS keyframe name trigger hint.

export function shouldTriggerCrownFlash(instruction: SwapInstruction): boolean {
  return (
    instruction.slotPosition === 1 &&
    (instruction.animation === "enter" || instruction.animation === "promote") &&
    (instruction.phase === "climb" || instruction.phase === "settle")
  );
}

// ─── BATCH ANIMATION WINDOW ───────────────────────────────────────────────────
// Returns the total window (ms) needed for all swap instructions to complete.

export function getBatchAnimationWindowMs(instructions: SwapInstruction[]): number {
  if (instructions.length === 0) return 0;
  return Math.max(
    ...instructions.map((i) => i.staggerDelayMs + i.durationMs)
  );
}

export function getAnimationBatchPlanWindowMs(plan: AnimationBatchPlan): number {
  const revealEnd = getBatchAnimationWindowMs(plan.reveal);
  const climbEnd = revealEnd + getBatchAnimationWindowMs(plan.climb);
  const correctionEnd = climbEnd + getBatchAnimationWindowMs(plan.correction);
  const settleEnd = correctionEnd + getBatchAnimationWindowMs(plan.settle);
  return settleEnd;
}
