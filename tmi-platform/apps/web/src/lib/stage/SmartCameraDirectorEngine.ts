export type DirectorMode = "world-release" | "versus-2026" | "guest-jam" | "ensemble";
export type DirectorPhase = "drop" | "engage" | "reaction";
export type ActivePerformer = "A" | "B";

export interface DirectorSignal {
  heat: number;
  audioLevelA: number;
  audioLevelB: number;
  fanVotesA: number;
  fanVotesB: number;
  performerActive: ActivePerformer;
  newFanRate: number;
  completionRate: number;
  likeRate: number;
}

export interface SmartCameraDirectorState {
  mode: DirectorMode;
  phase: DirectorPhase;
  phaseStartedAtMs: number;
}

export interface DirectorMomentumState {
  scoreA: number;
  scoreB: number;
  active: ActivePerformer;
  lastSwitchAtMs: number;
}

const SWITCH_COOLDOWN_MS = 1800;
const EMOTIONAL_PEAK_THRESHOLD = 82;

const PHASE_ORDER: DirectorPhase[] = ["drop", "engage", "reaction"];

const PHASE_DURATION_MS: Record<DirectorMode, Record<DirectorPhase, number>> = {
  "world-release": {
    drop: 7000,
    engage: 9000,
    reaction: 12000,
  },
  "versus-2026": {
    drop: 5000,
    engage: 10000,
    reaction: 9000,
  },
  "guest-jam": {
    drop: 6000,
    engage: 9000,
    reaction: 9000,
  },
  "ensemble": {
    drop: 8000,
    engage: 15000,
    reaction: 10000,
  },
};

export function createSmartCameraDirectorState(
  mode: DirectorMode,
  nowMs = Date.now(),
): SmartCameraDirectorState {
  return {
    mode,
    phase: "drop",
    phaseStartedAtMs: nowMs,
  };
}

export function createDirectorMomentumState(
  nowMs = Date.now(),
  active: ActivePerformer = "A",
): DirectorMomentumState {
  return {
    scoreA: 0,
    scoreB: 0,
    active,
    lastSwitchAtMs: nowMs,
  };
}

export function getPhaseDurationMs(mode: DirectorMode, phase: DirectorPhase): number {
  return PHASE_DURATION_MS[mode][phase];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalize(value: number): number {
  return clamp(value / 100, 0, 1);
}

function emotionalHeat(signal: DirectorSignal): number {
  return (
    normalize(signal.heat) * 0.4 +
    normalize(signal.newFanRate) * 0.25 +
    normalize(signal.completionRate) * 0.2 +
    normalize(signal.likeRate) * 0.15
  ) * 100;
}

export function shouldTriggerReactionPeak(signal: DirectorSignal): boolean {
  return emotionalHeat(signal) >= EMOTIONAL_PEAK_THRESHOLD;
}

export function resolveActivePerformer(signal: DirectorSignal): ActivePerformer {
  const audioDelta = signal.audioLevelA - signal.audioLevelB;
  const voteDelta = signal.fanVotesA - signal.fanVotesB;

  if (audioDelta > 10 || voteDelta > 15) return "A";
  if (audioDelta < -10 || voteDelta < -15) return "B";
  return signal.performerActive;
}

export function updateMomentumScores(
  prev: DirectorMomentumState,
  signal: DirectorSignal,
): DirectorMomentumState {
  const audioDelta = signal.audioLevelA - signal.audioLevelB;
  const voteDelta = signal.fanVotesA - signal.fanVotesB;
  const heatBias = signal.heat > 70 ? 0.25 : 0;
  const fanBiasA = signal.newFanRate > 12 && signal.performerActive === "A" ? 0.2 : 0;
  const fanBiasB = signal.newFanRate > 12 && signal.performerActive === "B" ? 0.2 : 0;

  const momentumA = audioDelta * 0.08 + voteDelta * 0.05 + heatBias + fanBiasA;
  const momentumB = -audioDelta * 0.08 - voteDelta * 0.05 + heatBias + fanBiasB;

  return {
    ...prev,
    scoreA: clamp(prev.scoreA * 0.86 + momentumA, -100, 100),
    scoreB: clamp(prev.scoreB * 0.86 + momentumB, -100, 100),
  };
}

export function resolveMomentumFocus(
  prev: DirectorMomentumState,
  signal: DirectorSignal,
  nowMs = Date.now(),
): DirectorMomentumState {
  const next = updateMomentumScores(prev, signal);
  const weighted = resolveActivePerformer(signal);
  const dominant: ActivePerformer = next.scoreA >= next.scoreB ? "A" : "B";
  const desired = weighted === dominant ? weighted : dominant;

  if (desired === prev.active) {
    return {
      ...next,
      active: prev.active,
    };
  }

  if (nowMs - prev.lastSwitchAtMs < SWITCH_COOLDOWN_MS) {
    return {
      ...next,
      active: prev.active,
      lastSwitchAtMs: prev.lastSwitchAtMs,
    };
  }

  return {
    ...next,
    active: desired,
    lastSwitchAtMs: nowMs,
  };
}

export function setDirectorMode(
  prev: SmartCameraDirectorState,
  mode: DirectorMode,
  nowMs = Date.now(),
): SmartCameraDirectorState {
  if (prev.mode === mode) return prev;
  return createSmartCameraDirectorState(mode, nowMs);
}

export function advanceDirectorPhase(
  prev: SmartCameraDirectorState,
  nowMs = Date.now(),
): SmartCameraDirectorState {
  const idx = PHASE_ORDER.indexOf(prev.phase);
  const next = PHASE_ORDER[(idx + 1) % PHASE_ORDER.length] ?? "drop";
  return {
    ...prev,
    phase: next,
    phaseStartedAtMs: nowMs,
  };
}

export function tickDirectorPhase(
  prev: SmartCameraDirectorState,
  nowMs = Date.now(),
): SmartCameraDirectorState {
  const elapsed = nowMs - prev.phaseStartedAtMs;
  const holdMs = getPhaseDurationMs(prev.mode, prev.phase);
  if (elapsed < holdMs) return prev;
  return advanceDirectorPhase(prev, nowMs);
}

export function tickDirectorPhaseWithSignals(
  prev: SmartCameraDirectorState,
  signal: DirectorSignal,
  nowMs = Date.now(),
): SmartCameraDirectorState {
  if (prev.mode === "versus-2026" && prev.phase === "engage" && shouldTriggerReactionPeak(signal)) {
    return {
      ...prev,
      phase: "reaction",
      phaseStartedAtMs: nowMs,
    };
  }

  return tickDirectorPhase(prev, nowMs);
}

// ─── Ensemble mode ─────────────────────────────────────────────────────────────

/**
 * A single performer slot in an ensemble (band, choir, collab studio).
 * `focusScore` drives how much of the frame they occupy (0–100).
 */
export interface EnsembleSlot {
  slotId: string;
  displayName: string;
  audioLevel: number;   // 0–100 live decibel reading
  motionHeat: number;   // 0–100 visual movement energy
  isFeatured: boolean;  // true = currently in the spotlight
  focusScore: number;   // derived weight: 0–100
}

export interface EnsembleDirectorState {
  slots: EnsembleSlot[];
  featuredSlotId: string | null;
  mosaicLayout: EnsembleMosaicLayout;
  lastFocusShiftAt: number;
}

export type EnsembleMosaicLayout =
  | "solo"          // 1 performer full-screen
  | "duo"           // 2-up side by side
  | "trio"          // 3 in a triangle
  | "pentagon"      // 5-piece band
  | "ribbon"        // 3–6 in a horizontal strip
  | "cloud";        // 7+ choir / large ensemble grid

const ENSEMBLE_FOCUS_SHIFT_COOLDOWN_MS = 2400;

function deriveMosaicLayout(slotCount: number): EnsembleMosaicLayout {
  if (slotCount <= 1) return "solo";
  if (slotCount === 2) return "duo";
  if (slotCount === 3) return "trio";
  if (slotCount <= 5) return "pentagon";
  if (slotCount <= 6) return "ribbon";
  return "cloud";
}

function computeFocusScore(slot: EnsembleSlot): number {
  return slot.audioLevel * 0.65 + slot.motionHeat * 0.35;
}

export function createEnsembleDirectorState(slots: Omit<EnsembleSlot, "focusScore" | "isFeatured">[]): EnsembleDirectorState {
  const hydrated: EnsembleSlot[] = slots.map((s) => ({
    ...s,
    isFeatured: false,
    focusScore: computeFocusScore({ ...s, isFeatured: false, focusScore: 0 }),
  }));
  return {
    slots: hydrated,
    featuredSlotId: hydrated[0]?.slotId ?? null,
    mosaicLayout: deriveMosaicLayout(hydrated.length),
    lastFocusShiftAt: Date.now(),
  };
}

/**
 * Tick the ensemble director with fresh audio/motion readings.
 * Automatically shifts the featured slot to whoever has the highest focus score,
 * subject to the 2.4s cooldown to prevent jitter.
 */
export function tickEnsembleDirector(
  prev: EnsembleDirectorState,
  updates: Array<{ slotId: string; audioLevel: number; motionHeat: number }>,
  nowMs = Date.now(),
): EnsembleDirectorState {
  const updatedSlots: EnsembleSlot[] = prev.slots.map((slot) => {
    const patch = updates.find((u) => u.slotId === slot.slotId);
    if (!patch) return slot;
    const next: EnsembleSlot = { ...slot, audioLevel: patch.audioLevel, motionHeat: patch.motionHeat, isFeatured: false };
    next.focusScore = computeFocusScore(next);
    return next;
  });

  const canShift = nowMs - prev.lastFocusShiftAt > ENSEMBLE_FOCUS_SHIFT_COOLDOWN_MS;
  let featuredSlotId = prev.featuredSlotId;
  let lastFocusShiftAt = prev.lastFocusShiftAt;

  if (canShift) {
    const top = updatedSlots.reduce<EnsembleSlot | null>((best, slot) => {
      if (!best || slot.focusScore > best.focusScore) return slot;
      return best;
    }, null);
    if (top && top.slotId !== featuredSlotId) {
      featuredSlotId = top.slotId;
      lastFocusShiftAt = nowMs;
    }
  }

  const finalSlots = updatedSlots.map((s) => ({ ...s, isFeatured: s.slotId === featuredSlotId }));

  return {
    slots: finalSlots,
    featuredSlotId,
    mosaicLayout: deriveMosaicLayout(finalSlots.length),
    lastFocusShiftAt,
  };
}

/** Add a new performer to an existing ensemble (e.g., producer invites a guest) */
export function addEnsembleSlot(
  prev: EnsembleDirectorState,
  slot: Omit<EnsembleSlot, "focusScore" | "isFeatured">,
): EnsembleDirectorState {
  const hydrated: EnsembleSlot = { ...slot, isFeatured: false, focusScore: computeFocusScore({ ...slot, isFeatured: false, focusScore: 0 }) };
  const slots = [...prev.slots, hydrated];
  return { ...prev, slots, mosaicLayout: deriveMosaicLayout(slots.length) };
}

/** Remove a performer slot (they left the session) */
export function removeEnsembleSlot(
  prev: EnsembleDirectorState,
  slotId: string,
): EnsembleDirectorState {
  const slots = prev.slots.filter((s) => s.slotId !== slotId);
  const featuredSlotId =
    prev.featuredSlotId === slotId ? (slots[0]?.slotId ?? null) : prev.featuredSlotId;
  return { ...prev, slots, featuredSlotId, mosaicLayout: deriveMosaicLayout(slots.length) };
}
