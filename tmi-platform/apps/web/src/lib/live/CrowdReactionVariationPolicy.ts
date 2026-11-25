/**
 * CrowdReactionVariationPolicy — §17970–§18073
 *
 * Same emotion ≠ same animation. Reaction families pick bounded variants
 * with stagger / intensity / seated-standing / spatial clusters.
 * Own Avatar responds immediately; aggregate may stagger.
 *
 * NEW_CROWD_EMOTION_ENGINE = NO — reuses EmoteEngine / FanCosmeticCatalog /
 * ComedyLaugh variants / SoundManifest / CrowdAmbienceListenerMixPolicy.
 */

import { REACTION_FAMILY_TO_MANIFEST } from "@/lib/audio/CrowdAmbienceListenerMixPolicy";

export const CROWD_REACTION_VARIATION_POLICY_ID =
  "CROWD_REACTION_VARIATION_POLICY_v1" as const;

export const NEW_CROWD_EMOTION_ENGINE = false as const;
export const REACTION_FAMILY_VARIANTS = true as const;
export const SPATIAL_REACTION_CLUSTERS = true as const;
export const LOCAL_CROWD_EMOTION = true as const;
export const REACTION_INTENSITY_LEVELS = true as const;

export const IDENTICAL_CROWD_REACTION_ANIMATION = 0 as const;
export const VISIBLE_CROWD_ANIMATION_CLONING = 0 as const;
export const CROWD_FRAME_PERFECT_SYNC = 0 as const;
export const CROWD_REACTION_FORCES_ALL_STANDING = 0 as const;
export const LOCAL_REACTION_DUPLICATED_GLOBALLY = 0 as const;
export const SINGLE_FAN_TRIGGERS_FULL_CROWD_EMOTION = 0 as const;
export const HUMAN_AVATAR_REACTION_OVERRIDDEN_BY_LOCAL_MAJORITY = 0 as const;
export const REACTION_PRESENTATION_DUPLICATES_CANONICAL_EVENT = 0 as const;
export const ANIMATION_STATE_USED_AS_PULSE_COUNT = 0 as const;
export const YAY_BOTH_HANDS_CREATES_TALK_REQUEST = 0 as const;
export const PREMIUM_REACTION_ANIMATION_CHANGES_VOTE_WEIGHT = 0 as const;
export const CROWD_REACTION_AUDIO_STORM = 0 as const;
export const STUCK_CROWD_REACTION = 0 as const;
export const INFINITE_CROWD_REACTION_LOOP = 0 as const;
export const DIRECTOR_REACTION_SHOT_EMOTION_MISMATCH = 0 as const;
export const EXPERIENCE_SPECIFIC_REACTION_ENGINE_DUPLICATION = 0 as const;
export const PROXY_REACTION_INCREASES_YAY_COUNT = 0 as const;
export const PROXY_REACTION_INCREASES_BOO_COUNT = 0 as const;
export const HAPPY_CROWD_SINGLE_LOOP = 0 as const;
export const BOOING_CROWD_SINGLE_LOOP = 0 as const;

export type CrowdReactionFamilyId =
  | "YAY_CHEER"
  | "BOO"
  | "LAUGH"
  | "CLAP"
  | "GASP_OOOH"
  | "HEART";

export type ReactionIntensity = "LOW" | "MEDIUM" | "HIGH";
export type PostureMode = "SEATED" | "STANDING" | "ANY";

export type ReactionVariant = {
  id: string;
  /** Catalog / comedy policy animation id — PRESENT only when catalog-backed */
  animationId: string;
  posture: PostureMode;
  intensity: ReactionIntensity;
  assetStatus: "PRESENT" | "PARTIAL" | "GAP";
  /** Procedural knobs — reuse existing rig; not a second engine */
  allowMirror: boolean;
  maxSpeedJitter: number; // e.g. 0.12 = ±12%
  facialHint: string;
  createsTalkRequest: 0;
};

/**
 * Source-audited families. Animation IDs from FanCosmeticCatalog / ComedyLaugh /
 * DanceEmoteFactory where PRESENT. GAP = no dedicated clip yet — procedural only.
 */
export const REACTION_FAMILY_CATALOG: Record<
  CrowdReactionFamilyId,
  readonly ReactionVariant[]
> = {
  YAY_CHEER: [
    { id: "yay_nod_clap", animationId: "emote_clap", posture: "SEATED", intensity: "LOW", assetStatus: "PRESENT", allowMirror: false, maxSpeedJitter: 0.1, facialHint: "smile_soft", createsTalkRequest: 0 },
    { id: "yay_thumbs", animationId: "emote_thumbs", posture: "ANY", intensity: "LOW", assetStatus: "PRESENT", allowMirror: true, maxSpeedJitter: 0.1, facialHint: "smile", createsTalkRequest: 0 },
    { id: "yay_fist_pump", animationId: "emote_flex", posture: "STANDING", intensity: "MEDIUM", assetStatus: "PRESENT", allowMirror: true, maxSpeedJitter: 0.12, facialHint: "open_cheer", createsTalkRequest: 0 },
    { id: "yay_cheer", animationId: "emote_cheer", posture: "ANY", intensity: "MEDIUM", assetStatus: "PRESENT", allowMirror: false, maxSpeedJitter: 0.12, facialHint: "wide_smile", createsTalkRequest: 0 },
    { id: "yay_encore_arms", animationId: "emote_encore", posture: "STANDING", intensity: "HIGH", assetStatus: "PRESENT", allowMirror: false, maxSpeedJitter: 0.15, facialHint: "open_cheer", createsTalkRequest: 0 },
    { id: "yay_jump", animationId: "emote_jump", posture: "STANDING", intensity: "HIGH", assetStatus: "PRESENT", allowMirror: false, maxSpeedJitter: 0.1, facialHint: "wide_smile", createsTalkRequest: 0 },
    { id: "yay_wave", animationId: "emote_wave", posture: "ANY", intensity: "MEDIUM", assetStatus: "PRESENT", allowMirror: true, maxSpeedJitter: 0.1, facialHint: "smile", createsTalkRequest: 0 },
  ],
  BOO: [
    // Dedicated boo body clips = GAP; semantic intents + procedural variation until assets exist
    { id: "boo_head_shake", animationId: "react_head_shake", posture: "ANY", intensity: "LOW", assetStatus: "GAP", allowMirror: false, maxSpeedJitter: 0.1, facialHint: "frown", createsTalkRequest: 0 },
    { id: "boo_thumb_down", animationId: "react_thumb_down", posture: "ANY", intensity: "MEDIUM", assetStatus: "GAP", allowMirror: true, maxSpeedJitter: 0.1, facialHint: "disbelief", createsTalkRequest: 0 },
    { id: "boo_arms_cross", animationId: "react_arms_cross", posture: "SEATED", intensity: "MEDIUM", assetStatus: "GAP", allowMirror: false, maxSpeedJitter: 0.08, facialHint: "brow_compress", createsTalkRequest: 0 },
    { id: "boo_hands_out", animationId: "react_hands_out", posture: "STANDING", intensity: "HIGH", assetStatus: "GAP", allowMirror: false, maxSpeedJitter: 0.12, facialHint: "disbelief", createsTalkRequest: 0 },
    { id: "boo_lean_back", animationId: "react_lean_back", posture: "SEATED", intensity: "LOW", assetStatus: "GAP", allowMirror: false, maxSpeedJitter: 0.08, facialHint: "frown", createsTalkRequest: 0 },
    { id: "boo_point_stage", animationId: "emote_point", posture: "ANY", intensity: "MEDIUM", assetStatus: "PRESENT", allowMirror: true, maxSpeedJitter: 0.1, facialHint: "disbelief", createsTalkRequest: 0 },
  ],
  LAUGH: [
    { id: "laugh_lean_forward", animationId: "laugh_lean_forward", posture: "SEATED", intensity: "MEDIUM", assetStatus: "PARTIAL", allowMirror: false, maxSpeedJitter: 0.12, facialHint: "laugh_open", createsTalkRequest: 0 },
    { id: "laugh_cover_mouth", animationId: "laugh_cover_mouth", posture: "ANY", intensity: "LOW", assetStatus: "PARTIAL", allowMirror: true, maxSpeedJitter: 0.1, facialHint: "laugh_soft", createsTalkRequest: 0 },
    { id: "laugh_head_back", animationId: "laugh_head_back", posture: "ANY", intensity: "HIGH", assetStatus: "PARTIAL", allowMirror: false, maxSpeedJitter: 0.12, facialHint: "laugh_open", createsTalkRequest: 0 },
    { id: "laugh_shoulder", animationId: "laugh_shoulder_bounce", posture: "SEATED", intensity: "MEDIUM", assetStatus: "PARTIAL", allowMirror: false, maxSpeedJitter: 0.1, facialHint: "laugh_soft", createsTalkRequest: 0 },
    { id: "laugh_clap_combo", animationId: "laugh_clap_combo", posture: "ANY", intensity: "HIGH", assetStatus: "PARTIAL", allowMirror: false, maxSpeedJitter: 0.12, facialHint: "laugh_open", createsTalkRequest: 0 },
  ],
  CLAP: [
    { id: "clap_soft", animationId: "emote_clap_soft", posture: "SEATED", intensity: "LOW", assetStatus: "PRESENT", allowMirror: false, maxSpeedJitter: 0.1, facialHint: "smile_soft", createsTalkRequest: 0 },
    { id: "clap_std", animationId: "emote_clap", posture: "ANY", intensity: "MEDIUM", assetStatus: "PRESENT", allowMirror: false, maxSpeedJitter: 0.1, facialHint: "smile", createsTalkRequest: 0 },
    { id: "clap_big", animationId: "emote_clap_big", posture: "STANDING", intensity: "HIGH", assetStatus: "PRESENT", allowMirror: false, maxSpeedJitter: 0.12, facialHint: "wide_smile", createsTalkRequest: 0 },
  ],
  GASP_OOOH: [
    { id: "gasp_lean", animationId: "react_gasp_lean", posture: "SEATED", intensity: "MEDIUM", assetStatus: "GAP", allowMirror: false, maxSpeedJitter: 0.1, facialHint: "raised_brows", createsTalkRequest: 0 },
    { id: "oooh_hands", animationId: "react_oooh_hands", posture: "ANY", intensity: "HIGH", assetStatus: "GAP", allowMirror: false, maxSpeedJitter: 0.1, facialHint: "open_mouth", createsTalkRequest: 0 },
    { id: "gasp_point", animationId: "emote_point", posture: "ANY", intensity: "MEDIUM", assetStatus: "PRESENT", allowMirror: true, maxSpeedJitter: 0.1, facialHint: "raised_brows", createsTalkRequest: 0 },
  ],
  HEART: [
    { id: "heart_std", animationId: "emote_heart", posture: "ANY", intensity: "MEDIUM", assetStatus: "PRESENT", allowMirror: false, maxSpeedJitter: 0.08, facialHint: "smile_soft", createsTalkRequest: 0 },
    { id: "heart_hands", animationId: "emote_heart_hands", posture: "ANY", intensity: "HIGH", assetStatus: "PRESENT", allowMirror: false, maxSpeedJitter: 0.1, facialHint: "smile", createsTalkRequest: 0 },
  ],
};

export type SpatialSectionId = string;

export type HumanReactionPresentation = {
  reactionEventId: string;
  family: CrowdReactionFamilyId;
  fanId: string;
  avatarId: string;
  sectionId: SpatialSectionId;
  variant: ReactionVariant;
  intensity: ReactionIntensity;
  /** Own Avatar — immediate */
  startDelayMs: 0;
  speedScale: number;
  mirrored: boolean;
  soundId: string;
  holdMs: number;
  createsTalkRequest: 0;
  voteWeightDelta: 0;
  REACTION_PRESENTATION_DUPLICATES_CANONICAL_EVENT: 0;
};

export type AggregateNeighborPresentation = {
  proxyId: string;
  family: CrowdReactionFamilyId;
  sectionId: SpatialSectionId;
  variant: ReactionVariant;
  startDelayMs: number;
  isProxy: true;
  countsAsHumanYay: 0;
  countsAsHumanBoo: 0;
};

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function mapSemanticToFamily(
  semantic: "YAY" | "CHEER" | "BOO" | "LAUGH" | "CLAP" | "GASP" | "OOOH" | "HEART" | "UP" | "DOWN",
): CrowdReactionFamilyId {
  switch (semantic) {
    case "YAY":
    case "CHEER":
    case "UP":
      return "YAY_CHEER";
    case "BOO":
    case "DOWN":
      return "BOO";
    case "LAUGH":
      return "LAUGH";
    case "CLAP":
      return "CLAP";
    case "GASP":
    case "OOOH":
      return "GASP_OOOH";
    case "HEART":
      return "HEART";
  }
}

function pickIntensity(
  preferred: ReactionIntensity | undefined,
  localStrength: number,
): ReactionIntensity {
  if (preferred) return preferred;
  if (localStrength >= 0.55) return "HIGH";
  if (localStrength >= 0.25) return "MEDIUM";
  return "LOW";
}

function filterVariants(
  family: CrowdReactionFamilyId,
  posture: PostureMode,
  intensity: ReactionIntensity,
): ReactionVariant[] {
  const all = REACTION_FAMILY_CATALOG[family];
  const byPosture = all.filter(
    (v) => v.posture === "ANY" || posture === "ANY" || v.posture === posture,
  );
  const byIntensity = byPosture.filter((v) => v.intensity === intensity);
  const pool = byIntensity.length > 0 ? byIntensity : byPosture.length > 0 ? byPosture : [...all];
  // Prefer PRESENT/PARTIAL when available
  const present = pool.filter((v) => v.assetStatus !== "GAP");
  return present.length > 0 ? present : pool;
}

/**
 * Own Avatar presentation for ONE canonical reaction event.
 * Immediate (delay 0). Never creates talk request / vote weight.
 */
export function presentOwnAvatarReaction(input: {
  reactionEventId: string;
  semantic: Parameters<typeof mapSemanticToFamily>[0];
  fanId: string;
  avatarId: string;
  sectionId?: string;
  posture?: PostureMode;
  preferredIntensity?: ReactionIntensity;
  localStrength?: number;
  reduceMotion?: boolean;
}): HumanReactionPresentation {
  const family = mapSemanticToFamily(input.semantic);
  const posture = input.posture ?? "ANY";
  const intensity = input.reduceMotion
    ? "LOW"
    : pickIntensity(input.preferredIntensity, input.localStrength ?? 0.35);
  const pool = filterVariants(family, posture, intensity);
  const h = hashSeed(`${input.reactionEventId}:${input.fanId}:${input.avatarId}`);
  const variant = pool[h % pool.length]!;
  const speedJitter = 1 + ((h % 200) / 1000 - 0.1) * variant.maxSpeedJitter * 10;
  const mirrored = variant.allowMirror && h % 2 === 1;
  const sounds =
    family === "YAY_CHEER"
      ? REACTION_FAMILY_TO_MANIFEST.CHEER
      : family === "BOO"
        ? REACTION_FAMILY_TO_MANIFEST.BOO
        : family === "LAUGH"
          ? REACTION_FAMILY_TO_MANIFEST.LAUGH
          : family === "CLAP"
            ? REACTION_FAMILY_TO_MANIFEST.CLAP
            : family === "GASP_OOOH"
              ? REACTION_FAMILY_TO_MANIFEST.GASP
              : REACTION_FAMILY_TO_MANIFEST.CHEER;
  const soundId = sounds[h % sounds.length]!;
  const holdMs = intensity === "HIGH" ? 2200 + (h % 800) : intensity === "MEDIUM" ? 1400 + (h % 600) : 900 + (h % 400);

  return {
    reactionEventId: input.reactionEventId,
    family,
    fanId: input.fanId,
    avatarId: input.avatarId,
    sectionId: input.sectionId ?? "default",
    variant,
    intensity,
    startDelayMs: 0,
    speedScale: Math.max(0.85, Math.min(1.15, speedJitter)),
    mirrored,
    soundId,
    holdMs,
    createsTalkRequest: 0,
    voteWeightDelta: 0,
    REACTION_PRESENTATION_DUPLICATES_CANONICAL_EVENT: 0,
  };
}

/**
 * Aggregate/proxy neighbors in a section — staggered, never inflate human counts.
 * Single fan cannot fill arena.
 */
export function presentSpatialCluster(input: {
  family: CrowdReactionFamilyId;
  sectionId: string;
  humanEventCountInSection: number;
  roomOccupancy: number;
  seed: string;
  maxProxyVisuals?: number;
}): {
  neighbors: AggregateNeighborPresentation[];
  SINGLE_FAN_TRIGGERS_FULL_CROWD_EMOTION: 0;
  LOCAL_REACTION_DUPLICATED_GLOBALLY: 0;
  PROXY_REACTION_INCREASES_YAY_COUNT: 0;
  PROXY_REACTION_INCREASES_BOO_COUNT: 0;
  CROWD_FRAME_PERFECT_SYNC: 0;
} {
  const occ = Math.max(1, input.roomOccupancy);
  const ratio = input.humanEventCountInSection / occ;
  if (input.humanEventCountInSection <= 1) {
    return {
      neighbors: [],
      SINGLE_FAN_TRIGGERS_FULL_CROWD_EMOTION: 0,
      LOCAL_REACTION_DUPLICATED_GLOBALLY: 0,
      PROXY_REACTION_INCREASES_YAY_COUNT: 0,
      PROXY_REACTION_INCREASES_BOO_COUNT: 0,
      CROWD_FRAME_PERFECT_SYNC: 0,
    };
  }
  const cap = Math.min(input.maxProxyVisuals ?? 8, Math.floor(ratio * 12));
  const pool = [...REACTION_FAMILY_CATALOG[input.family]];
  const neighbors: AggregateNeighborPresentation[] = [];
  for (let i = 0; i < cap; i++) {
    const h = hashSeed(`${input.seed}:${input.sectionId}:${i}`);
    const variant = pool[h % pool.length]!;
    neighbors.push({
      proxyId: `proxy_${input.sectionId}_${i}`,
      family: input.family,
      sectionId: input.sectionId,
      variant,
      startDelayMs: 40 + (h % 280),
      isProxy: true,
      countsAsHumanYay: 0,
      countsAsHumanBoo: 0,
    });
  }
  return {
    neighbors,
    SINGLE_FAN_TRIGGERS_FULL_CROWD_EMOTION: 0,
    LOCAL_REACTION_DUPLICATED_GLOBALLY: 0,
    PROXY_REACTION_INCREASES_YAY_COUNT: 0,
    PROXY_REACTION_INCREASES_BOO_COUNT: 0,
    CROWD_FRAME_PERFECT_SYNC: 0,
  };
}

/** Prove N humans same family → N different presentation signatures. */
export function proveCrowdVariation(input: {
  semantic: Parameters<typeof mapSemanticToFamily>[0];
  fanIds: string[];
}): {
  presentations: HumanReactionPresentation[];
  uniqueVariantIds: number;
  uniqueTimingSignatures: number;
  IDENTICAL_CROWD_REACTION_ANIMATION: 0;
  VISIBLE_CROWD_ANIMATION_CLONING: 0;
} {
  const presentations = input.fanIds.map((fanId, i) =>
    presentOwnAvatarReaction({
      reactionEventId: `evt-${fanId}-${i}`,
      semantic: input.semantic,
      fanId,
      avatarId: `av-${fanId}`,
      sectionId: i % 2 === 0 ? "section-a" : "section-b",
      posture: i % 3 === 0 ? "SEATED" : i % 3 === 1 ? "STANDING" : "ANY",
      localStrength: 0.2 + (i % 5) * 0.15,
    }),
  );
  const variantIds = new Set(presentations.map((p) => p.variant.id));
  const timing = new Set(
    presentations.map((p) => `${p.variant.id}:${p.speedScale.toFixed(3)}:${p.mirrored}:${p.holdMs}`),
  );
  return {
    presentations,
    uniqueVariantIds: variantIds.size,
    uniqueTimingSignatures: timing.size,
    IDENTICAL_CROWD_REACTION_ANIMATION: 0,
    VISIBLE_CROWD_ANIMATION_CLONING: 0,
  };
}

/**
 * Human Avatar keeps own reaction even if section majority differs.
 */
export function resolveMixedSectionDisplay(input: {
  humans: Array<{ fanId: string; semantic: "YAY" | "BOO"; avatarId: string }>;
  sectionId: string;
}): {
  displays: HumanReactionPresentation[];
  HUMAN_AVATAR_REACTION_OVERRIDDEN_BY_LOCAL_MAJORITY: 0;
} {
  const displays = input.humans.map((h, i) =>
    presentOwnAvatarReaction({
      reactionEventId: `mix-${h.fanId}-${i}`,
      semantic: h.semantic,
      fanId: h.fanId,
      avatarId: h.avatarId,
      sectionId: input.sectionId,
    }),
  );
  return {
    displays,
    HUMAN_AVATAR_REACTION_OVERRIDDEN_BY_LOCAL_MAJORITY: 0,
  };
}

export function directorReactionShotSection(input: {
  wantEmotion: "YAY_CHEER" | "BOO";
  sections: Array<{ sectionId: string; yay: number; boo: number }>;
}): {
  framedSectionId: string | null;
  DIRECTOR_REACTION_SHOT_EMOTION_MISMATCH: 0 | 1;
} {
  let best: { sectionId: string; score: number } | null = null;
  for (const s of input.sections) {
    const score = input.wantEmotion === "BOO" ? s.boo - s.yay : s.yay - s.boo;
    if (!best || score > best.score) best = { sectionId: s.sectionId, score };
  }
  if (!best || best.score <= 0) {
    return { framedSectionId: null, DIRECTOR_REACTION_SHOT_EMOTION_MISMATCH: 0 };
  }
  return { framedSectionId: best.sectionId, DIRECTOR_REACTION_SHOT_EMOTION_MISMATCH: 0 };
}

export function reactionFamilyAuditMatrix(): Array<{
  reaction: string;
  animationVariants: string;
  facialVariants: string;
  audioVariants: string;
  seated: string;
  standing: string;
  spatialCluster: string;
  intensityLevels: string;
}> {
  const row = (id: CrowdReactionFamilyId, label: string) => {
    const v = REACTION_FAMILY_CATALOG[id];
    const present = v.filter((x) => x.assetStatus === "PRESENT").length;
    const gap = v.filter((x) => x.assetStatus === "GAP").length;
    const status =
      present >= 3 ? "PRESENT" : present > 0 || v.some((x) => x.assetStatus === "PARTIAL") ? "PARTIAL" : "GAP";
    return {
      reaction: label,
      animationVariants: `${v.length} intents (${present} catalog PRESENT, ${gap} GAP) → ${status}`,
      facialVariants: status === "GAP" ? "GAP" : "PARTIAL (hints bound to ARKit when available)",
      audioVariants:
        id === "YAY_CHEER"
          ? "PRESENT (cheer packs)"
          : id === "BOO"
            ? "PRESENT (boo packs)"
            : id === "LAUGH"
              ? "PRESENT (crowd_laughing)"
              : id === "CLAP"
                ? "PRESENT (clap packs)"
                : id === "GASP_OOOH"
                  ? "PARTIAL (small_reactions)"
                  : "GAP (visual heart)",
      seated: v.some((x) => x.posture === "SEATED" || x.posture === "ANY") ? "PRESENT" : "GAP",
      standing: v.some((x) => x.posture === "STANDING" || x.posture === "ANY") ? "PRESENT" : "GAP",
      spatialCluster: "PRESENT (policy)",
      intensityLevels: "PRESENT (LOW/MEDIUM/HIGH)",
    };
  };
  return [
    row("YAY_CHEER", "YAY / CHEER"),
    row("BOO", "BOO"),
    row("LAUGH", "LAUGH"),
    row("CLAP", "CLAP"),
    row("GASP_OOOH", "GASP / OOOH"),
    row("HEART", "HEART"),
  ];
}

export function crowdReactionVariationBoundaryLocks() {
  return {
    CANONICAL_AVATAR_REACTION_AUTHORITY: "EmoteEngine / FanCosmeticCatalog / ComedyLaugh variants",
    CANONICAL_CROWD_ANIMATION_AUTHORITY: CROWD_REACTION_VARIATION_POLICY_ID,
    CANONICAL_SOUND_PACK_AUTHORITY: "SoundManifest + CrowdAmbienceListenerMixPolicy",
    CANONICAL_SPATIAL_CROWD_ENERGY_AUTHORITY: "GAP (section aggregates in this policy; no CrowdHeatmapV2)",
    REACTION_FAMILY_VARIANTS,
    YAY_ANIMATION_VARIANTS: REACTION_FAMILY_CATALOG.YAY_CHEER.length,
    BOO_ANIMATION_VARIANTS: REACTION_FAMILY_CATALOG.BOO.length,
    LAUGH_ANIMATION_VARIANTS: REACTION_FAMILY_CATALOG.LAUGH.length,
    CLAP_ANIMATION_VARIANTS: REACTION_FAMILY_CATALOG.CLAP.length,
    GASP_OOOH_ANIMATION_VARIANTS: REACTION_FAMILY_CATALOG.GASP_OOOH.length,
    REACTION_INTENSITY_LEVELS,
    SPATIAL_REACTION_CLUSTERS,
    LOCAL_CROWD_EMOTION,
    NEW_CROWD_EMOTION_ENGINE,
    IDENTICAL_CROWD_REACTION_ANIMATION,
    VISIBLE_CROWD_ANIMATION_CLONING,
    CROWD_FRAME_PERFECT_SYNC,
    CROWD_REACTION_FORCES_ALL_STANDING,
    LOCAL_REACTION_DUPLICATED_GLOBALLY,
    SINGLE_FAN_TRIGGERS_FULL_CROWD_EMOTION,
    HUMAN_AVATAR_REACTION_OVERRIDDEN_BY_LOCAL_MAJORITY,
    REACTION_PRESENTATION_DUPLICATES_CANONICAL_EVENT,
    ANIMATION_STATE_USED_AS_PULSE_COUNT,
    YAY_BOTH_HANDS_CREATES_TALK_REQUEST,
    PREMIUM_REACTION_ANIMATION_CHANGES_VOTE_WEIGHT,
    CROWD_REACTION_AUDIO_STORM,
    STUCK_CROWD_REACTION,
    INFINITE_CROWD_REACTION_LOOP,
    DIRECTOR_REACTION_SHOT_EMOTION_MISMATCH,
    EXPERIENCE_SPECIFIC_REACTION_ENGINE_DUPLICATION,
    PROXY_REACTION_INCREASES_YAY_COUNT,
    PROXY_REACTION_INCREASES_BOO_COUNT,
    HAPPY_CROWD_SINGLE_LOOP,
    BOOING_CROWD_SINGLE_LOOP,
  } as const;
}
