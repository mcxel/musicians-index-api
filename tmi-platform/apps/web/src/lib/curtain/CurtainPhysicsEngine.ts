/**
 * CurtainPhysicsEngine
 * Manages curtain state transitions with physics-informed timing curves.
 * The heartbeat of the live show experience — every performance begins and ends here.
 */

import type { StageState } from "@/components/stage/StageCurtain";
import { transitionStage } from "@/lib/hub/UnifiedStageRuntime";
import { openCurtain, revealPerformer, goLive, closeCurtain } from "@/lib/hub/LiveExperienceCoordinator";

export interface CurtainPhysics {
  openDurationMs: number;      // time for curtain to fully open
  closeDurationMs: number;     // time for curtain to fully close
  wobbleFactor: number;        // 0-1 sway at end of open
  smokeDelayMs: number;        // smoke/fog ramp delay
  spotlightDelayMs: number;    // spotlight activation after open
  revealDelayMs: number;       // performer reveal beat
  audienceReactionDelayMs: number;
}

export interface CurtainState {
  roomId: string;
  stageState: StageState;
  physics: CurtainPhysics;
  isAnimating: boolean;
  animationStartedAt: number | null;
  smokeActive: boolean;
  spotlightActive: boolean;
  curtainPosition: number;   // 0 = closed, 1 = fully open
}

const DEFAULT_PHYSICS: CurtainPhysics = {
  openDurationMs: 1800,
  closeDurationMs: 2200,
  wobbleFactor: 0.08,
  smokeDelayMs: 400,
  spotlightDelayMs: 900,
  revealDelayMs: 1400,
  audienceReactionDelayMs: 1800,
};

const curtainStates = new Map<string, CurtainState>();
type CurtainListener = (state: CurtainState) => void;
const listeners = new Map<string, Set<CurtainListener>>();

function getCurtainState(roomId: string): CurtainState {
  return curtainStates.get(roomId) ?? {
    roomId,
    stageState: "IDLE",
    physics: { ...DEFAULT_PHYSICS },
    isAnimating: false,
    animationStartedAt: null,
    smokeActive: false,
    spotlightActive: false,
    curtainPosition: 0,
  };
}

function updateCurtain(roomId: string, patch: Partial<CurtainState>): CurtainState {
  const current = getCurtainState(roomId);
  const updated = { ...current, ...patch };
  curtainStates.set(roomId, updated);
  listeners.get(roomId)?.forEach(l => l(updated));
  return updated;
}

export function initCurtain(roomId: string, physics?: Partial<CurtainPhysics>): CurtainState {
  return updateCurtain(roomId, {
    stageState: "CURTAIN_CLOSED",
    physics: { ...DEFAULT_PHYSICS, ...(physics ?? {}) },
    isAnimating: false,
    animationStartedAt: null,
    smokeActive: false,
    spotlightActive: false,
    curtainPosition: 0,
  });
}

export async function performCurtainOpen(roomId: string): Promise<void> {
  const state = getCurtainState(roomId);
  if (state.isAnimating) return;

  updateCurtain(roomId, { isAnimating: true, animationStartedAt: Date.now(), stageState: "CURTAIN_OPENING" });

  // Start experience coordinator
  openCurtain(roomId);
  transitionStage(roomId, "CURTAIN_OPENING", "performer");

  // Physics-timed sequence
  await delay(state.physics.smokeDelayMs);
  updateCurtain(roomId, { smokeActive: true, curtainPosition: 0.3 });

  await delay(state.physics.spotlightDelayMs - state.physics.smokeDelayMs);
  updateCurtain(roomId, { spotlightActive: true, curtainPosition: 0.7 });

  await delay(state.physics.revealDelayMs - state.physics.spotlightDelayMs);
  updateCurtain(roomId, { curtainPosition: 1.0 });
  revealPerformer(roomId);

  await delay(state.physics.audienceReactionDelayMs - state.physics.revealDelayMs);
  updateCurtain(roomId, { isAnimating: false, stageState: "LIVE" });
  transitionStage(roomId, "LIVE", "system");
  goLive(roomId);
}

export async function performCurtainClose(roomId: string): Promise<void> {
  const state = getCurtainState(roomId);
  if (state.isAnimating) return;

  updateCurtain(roomId, { isAnimating: true, animationStartedAt: Date.now(), stageState: "CURTAIN_CLOSING" });
  closeCurtain(roomId);
  transitionStage(roomId, "CURTAIN_CLOSING", "system");

  const step = state.physics.closeDurationMs / 4;

  await delay(step);
  updateCurtain(roomId, { curtainPosition: 0.6, smokeActive: false });
  await delay(step);
  updateCurtain(roomId, { curtainPosition: 0.3, spotlightActive: false });
  await delay(step);
  updateCurtain(roomId, { curtainPosition: 0.1 });
  await delay(step);
  updateCurtain(roomId, {
    curtainPosition: 0,
    stageState: "ENDED",
    isAnimating: false,
    smokeActive: false,
    spotlightActive: false,
  });
  transitionStage(roomId, "ENDED", "system");
}

export function setCurtainPosition(roomId: string, position: number): void {
  updateCurtain(roomId, { curtainPosition: Math.max(0, Math.min(1, position)) });
}

export function subscribeToCurtain(roomId: string, listener: CurtainListener): () => void {
  if (!listeners.has(roomId)) listeners.set(roomId, new Set());
  listeners.get(roomId)!.add(listener);
  const state = curtainStates.get(roomId);
  if (state) listener(state);
  return () => listeners.get(roomId)?.delete(listener);
}

export function getCurtainPosition(roomId: string): number {
  return curtainStates.get(roomId)?.curtainPosition ?? 0;
}

export function isAnimating(roomId: string): boolean {
  return curtainStates.get(roomId)?.isAnimating ?? false;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
