/**
 * Mini-Me Individual Personality, Idle Behavior & Spontaneous Motion Law.
 * Personality-weighted idle scheduler — not a fixed 5s loop.
 * Autonomous idle yields instantly to owner input / performance / voice.
 * Reuses manufactured animation library — no per-user skeleton remanufacture.
 */

export const MINI_ME_IDLE_PERSONALITY_LAW_ID = "MINI_ME_IDLE_PERSONALITY_LAW_v1" as const;

export const IDENTICAL_IDLE_FOR_SAME_MODEL_FORBIDDEN = true as const;
export const FIXED_FIVE_SECOND_IDLE_LOOP_FORBIDDEN = true as const;
export const AUTONOMOUS_IDLE_OVERRIDES_OWNER_INPUT = 0 as const;
export const IDLE_TRIGGERS_PUBLIC_MIC_BROADCAST = 0 as const;
export const NEW_PER_USER_SKELETON_MANUFACTURE = false as const;
export const QUIET_PERIODS_REQUIRED = true as const;

export type MiniMePersonalityTraits = {
  energy: number; // 0..1
  playfulness: number;
  curiosity: number;
  sociability: number;
  expressiveness: number;
  /** Aggregate of learned habit strength 0..1 */
  learnedHabitWeight: number;
};

export type IdleBehaviorKind =
  | "STILL_OBSERVE"
  | "SUBTLE_BREATHE"
  | "LOOK_AROUND"
  | "SCRATCH_HEAD"
  | "STRETCH_YAWN"
  | "SOFT_HUM_MINI_SPEAK"
  | "SHORT_DANCE"
  | "FUNNY_FACE"
  | "HEAD_BOB"
  | "SIT_RELAX"
  | "REACT_NEARBY"
  | "CATCHPHRASE_ATTEMPT"
  | "GIGGLE"
  | "DO_NOTHING";

export type IdleSchedulerDecision =
  | {
      ok: true;
      kind: IdleBehaviorKind;
      durationMs: number;
      quiet: boolean;
      yieldsToOwnerInput: true;
    }
  | { ok: false; reason: string };

export const DEFAULT_NEWBORN_PERSONALITY: MiniMePersonalityTraits = {
  energy: 0.35,
  playfulness: 0.3,
  curiosity: 0.4,
  sociability: 0.25,
  expressiveness: 0.35,
  learnedHabitWeight: 0.05,
};

export function clampTrait(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function createNewbornPersonality(): MiniMePersonalityTraits {
  return { ...DEFAULT_NEWBORN_PERSONALITY };
}

/**
 * Gradual trait nudge from authorized interaction — bounded; never one-session flip.
 */
export function nudgePersonality(
  traits: MiniMePersonalityTraits,
  deltas: Partial<MiniMePersonalityTraits>,
  maxStep = 0.04,
): MiniMePersonalityTraits {
  const step = (cur: number, d?: number) =>
    clampTrait(cur + Math.max(-maxStep, Math.min(maxStep, d ?? 0)));
  return {
    energy: step(traits.energy, deltas.energy),
    playfulness: step(traits.playfulness, deltas.playfulness),
    curiosity: step(traits.curiosity, deltas.curiosity),
    sociability: step(traits.sociability, deltas.sociability),
    expressiveness: step(traits.expressiveness, deltas.expressiveness),
    learnedHabitWeight: step(traits.learnedHabitWeight, deltas.learnedHabitWeight),
  };
}

/** Playful raising → energy/playfulness; gentle → lower energy, softer expressiveness. */
export function reinforceFromInteractionStyle(
  traits: MiniMePersonalityTraits,
  style: "PLAYFUL" | "GENTLE" | "DANCE" | "TEACH" | "QUIET",
): MiniMePersonalityTraits {
  if (style === "PLAYFUL") {
    return nudgePersonality(traits, { playfulness: 0.03, energy: 0.02, expressiveness: 0.02 });
  }
  if (style === "GENTLE") {
    return nudgePersonality(traits, { energy: -0.02, playfulness: -0.01, expressiveness: 0.01 });
  }
  if (style === "DANCE") {
    return nudgePersonality(traits, { energy: 0.03, playfulness: 0.02, learnedHabitWeight: 0.02 });
  }
  if (style === "TEACH") {
    return nudgePersonality(traits, { curiosity: 0.02, learnedHabitWeight: 0.03 });
  }
  return nudgePersonality(traits, { energy: -0.01, curiosity: 0.01 });
}

type Weighted = { kind: IdleBehaviorKind; weight: number; durationMs: number; quiet: boolean };

function candidateWeights(traits: MiniMePersonalityTraits): Weighted[] {
  return [
    { kind: "DO_NOTHING", weight: 0.35 + (1 - traits.energy) * 0.4, durationMs: 8000, quiet: true },
    { kind: "SUBTLE_BREATHE", weight: 0.45, durationMs: 5000, quiet: true },
    { kind: "STILL_OBSERVE", weight: 0.3 + traits.curiosity * 0.2, durationMs: 6000, quiet: true },
    { kind: "LOOK_AROUND", weight: 0.2 + traits.curiosity * 0.5, durationMs: 3500, quiet: false },
    { kind: "SCRATCH_HEAD", weight: 0.12 + traits.expressiveness * 0.15, durationMs: 2200, quiet: false },
    { kind: "STRETCH_YAWN", weight: 0.15 + (1 - traits.energy) * 0.25, durationMs: 4000, quiet: true },
    { kind: "SIT_RELAX", weight: 0.1 + (1 - traits.energy) * 0.35, durationMs: 7000, quiet: true },
    { kind: "SOFT_HUM_MINI_SPEAK", weight: 0.08 + traits.expressiveness * 0.2, durationMs: 2500, quiet: false },
    { kind: "SHORT_DANCE", weight: 0.05 + traits.energy * 0.35 + traits.playfulness * 0.2, durationMs: 3000, quiet: false },
    { kind: "FUNNY_FACE", weight: 0.05 + traits.playfulness * 0.4, durationMs: 2000, quiet: false },
    { kind: "HEAD_BOB", weight: 0.08 + traits.energy * 0.2, durationMs: 1800, quiet: false },
    { kind: "GIGGLE", weight: 0.05 + traits.playfulness * 0.3, durationMs: 1500, quiet: false },
    { kind: "REACT_NEARBY", weight: 0.05 + traits.sociability * 0.4 + traits.curiosity * 0.1, durationMs: 2500, quiet: false },
    { kind: "CATCHPHRASE_ATTEMPT", weight: 0.02 + traits.learnedHabitWeight * 0.35, durationMs: 2800, quiet: false },
  ];
}

export function decideIdleBehavior(input: {
  traits: MiniMePersonalityTraits;
  nowMs: number;
  lastKind: IdleBehaviorKind | null;
  lastDecisionAtMs: number | null;
  ownerInputActive: boolean;
  performanceOrBroadcastActive: boolean;
  reducedMotion: boolean;
  quietMode: boolean;
  autonomousEnabled: boolean;
  /** 0..1 deterministic */
  random01: number;
}): IdleSchedulerDecision {
  if (!input.autonomousEnabled) return { ok: false, reason: "AUTONOMOUS_OFF" };
  if (input.ownerInputActive) return { ok: false, reason: "YIELD_OWNER_INPUT" };
  if (input.performanceOrBroadcastActive) return { ok: false, reason: "PERFORMANCE_QUIET" };
  if (AUTONOMOUS_IDLE_OVERRIDES_OWNER_INPUT !== 0) {
    return { ok: false, reason: "PRIORITY_LOCK_BROKEN" };
  }

  // Cooldown — avoid metronomic loops.
  if (input.lastDecisionAtMs != null && input.nowMs - input.lastDecisionAtMs < 4000) {
    return { ok: false, reason: "COOLDOWN" };
  }

  if (input.quietMode || input.reducedMotion) {
    return {
      ok: true,
      kind: "SUBTLE_BREATHE",
      durationMs: 6000,
      quiet: true,
      yieldsToOwnerInput: true,
    };
  }

  let pool = candidateWeights(input.traits).filter((c) => c.kind !== input.lastKind);
  // Soft bias toward quiet periods.
  if (QUIET_PERIODS_REQUIRED && input.random01 < 0.28) {
    pool = pool.filter((c) => c.quiet);
  }
  if (pool.length === 0) pool = candidateWeights(input.traits);

  const total = pool.reduce((s, c) => s + c.weight, 0);
  let cursor = input.random01 * total;
  let pick = pool[pool.length - 1]!;
  for (const c of pool) {
    cursor -= c.weight;
    if (cursor <= 0) {
      pick = c;
      break;
    }
  }

  return {
    ok: true,
    kind: pick.kind,
    durationMs: pick.durationMs,
    quiet: pick.quiet,
    yieldsToOwnerInput: true,
  };
}

/** Two histories → divergent trait vectors (identity beyond appearance). */
export function personalitiesLikelyDistinct(
  a: MiniMePersonalityTraits,
  b: MiniMePersonalityTraits,
  epsilon = 0.08,
): boolean {
  const keys: (keyof MiniMePersonalityTraits)[] = [
    "energy",
    "playfulness",
    "curiosity",
    "sociability",
    "expressiveness",
    "learnedHabitWeight",
  ];
  return keys.some((k) => Math.abs(a[k] - b[k]) >= epsilon);
}

export function applyPersonalityReset(
  kind: "PERSONALITY_RESET" | "FULL_REBIRTH" | "VOICE_RESET",
): MiniMePersonalityTraits | "UNCHANGED" {
  if (kind === "VOICE_RESET") return "UNCHANGED";
  return createNewbornPersonality();
}

export function miniMeIdlePersonalityLocks() {
  return {
    IDENTICAL_IDLE_FOR_SAME_MODEL_FORBIDDEN,
    FIXED_FIVE_SECOND_IDLE_LOOP_FORBIDDEN,
    AUTONOMOUS_IDLE_OVERRIDES_OWNER_INPUT,
    IDLE_TRIGGERS_PUBLIC_MIC_BROADCAST,
    NEW_PER_USER_SKELETON_MANUFACTURE,
    QUIET_PERIODS_REQUIRED,
  } as const;
}
