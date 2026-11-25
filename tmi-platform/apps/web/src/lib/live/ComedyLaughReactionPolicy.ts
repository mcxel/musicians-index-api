/**
 * ComedyLaughReactionPolicy — §16767–§16846
 *
 * Comedy / Dirty Dozens / Joke-Off: LAUGH is primary positive reaction.
 * CLAP stays. Cheer is contextual (entrance/winner), not joke-default.
 * Fan presses LAUGH → one reaction event → Avatar laugh + crowd + telemetry.
 * LAUGH ≠ vote ≠ XP ≠ originality.
 *
 * NEW_COMEDY_LAUGH_ANIMATION_ENGINE = NO
 * NEW_COMEDY_VIDEO_HUD_CREATED = NO
 * Binds HudActionRegistry act-laugh/act-clap + CrowdAmbienceListenerMixPolicy.
 */

import type { CrowdReactionFamily } from "@/lib/audio/CrowdAmbienceListenerMixPolicy";
import { buildSpatialAvatarReaction, resolveVoiceProfile } from "@/lib/audio/CrowdAmbienceListenerMixPolicy";
import { presentOwnAvatarReaction } from "@/lib/live/CrowdReactionVariationPolicy";

export const COMEDY_LAUGH_REACTION_POLICY_ID = "COMEDY_LAUGH_REACTION_POLICY_v1" as const;
export const NEW_COMEDY_LAUGH_ANIMATION_ENGINE = false as const;
export const NEW_COMEDY_VIDEO_HUD_CREATED = false as const;

export const LAUGH_HUD_BUTTON = true as const;
export const CLAP_HUD_BUTTON = true as const;
export const COMEDY_LAUGH_PRIMARY = true as const;
export const DIRTY_DOZENS_LAUGH_PRIMARY = true as const;
export const JOKE_OFF_LAUGH_PRIMARY = true as const;

export const LAUGH_REACTION_DUPLICATE_AUTHORITY = 0 as const;
export const COMEDY_CROWD_IDENTICAL_LAUGH_ANIMATION = 0 as const;
export const COMEDY_LAUGH_AUDIO_STORM = 0 as const;
export const LAUGH_REACTION_AUTOMATICALLY_VOTES = 0 as const;
export const LAUGH_EQUALS_ORIGINALITY = 0 as const;
export const LAUGH_SPAM_FARMS_XP = 0 as const;
export const LAUGH_BUTTON_NO_VISIBLE_RESPONSE = 0 as const;
export const STUCK_COMEDY_LAUGH_LOOP = 0 as const;
export const COMEDY_LAUGH_VOICE_FROM_APPEARANCE = 0 as const;
export const BOT_LAUGH_COUNTS_AS_HUMAN_ENGAGEMENT = 0 as const;
export const SINGLE_FAN_TRIGGERS_FULL_ARENA_LAUGH = 0 as const;

export type ComedyCenteredExperience =
  | "COMEDY"
  | "DIRTY_DOZENS"
  | "JOKE_OFF"
  | "COMEDY_BATTLE"
  | "ROAST";

export type ReactionMoment = "JOKE_DELIVERY" | "ENTRANCE" | "WINNER" | "GENERAL";

const LAUGH_VARIANT_ANIMATIONS = [
  "laugh_lean_forward",
  "laugh_cover_mouth",
  "laugh_head_back",
  "laugh_shoulder_bounce",
  "laugh_clap_combo",
] as const;

const lastLaughByFan = new Map<string, number>();
const LAUGH_COOLDOWN_MS = 900;

export function isComedyCentered(experience: string): boolean {
  const u = experience.toUpperCase();
  return (
    u === "COMEDY" ||
    u === "DIRTY_DOZENS" ||
    u === "JOKE_OFF" ||
    u === "JOKE-OFF" ||
    u === "COMEDY_BATTLE" ||
    u === "ROAST"
  );
}

/** Fast HUD reaction strip for experience — LAUGH first-class on comedy. */
export function resolveFastReactionStrip(experience: string): {
  primary: "LAUGH" | "CHEER" | "CLAP";
  actions: Array<{ id: string; label: string; family: CrowdReactionFamily }>;
  LAUGH_HUD_BUTTON: boolean;
  CLAP_HUD_BUTTON: boolean;
} {
  if (isComedyCentered(experience)) {
    return {
      primary: "LAUGH",
      actions: [
        { id: "act-laugh", label: "Laugh", family: "LAUGH" },
        { id: "act-clap", label: "Clap", family: "CLAP" },
        { id: "act-heart", label: "Heart", family: "CHEER" },
        { id: "act-gasp", label: "Gasp", family: "GASP" },
      ],
      LAUGH_HUD_BUTTON: true,
      CLAP_HUD_BUTTON: true,
    };
  }
  // Non-comedy: do not surface LAUGH as a clutter/default button (§17741)
  return {
    primary: "CHEER",
    actions: [
      { id: "act-clap", label: "Clap", family: "CLAP" },
      { id: "act-cheer", label: "Cheer", family: "CHEER" },
      { id: "act-heart", label: "Heart", family: "CHEER" },
    ],
    LAUGH_HUD_BUTTON: false,
    CLAP_HUD_BUTTON: true,
  };
}

export function primaryPositiveReaction(
  experience: string,
  moment: ReactionMoment,
): CrowdReactionFamily {
  if (!isComedyCentered(experience)) {
    return moment === "ENTRANCE" || moment === "WINNER" ? "CHEER" : "CLAP";
  }
  if (moment === "ENTRANCE" || moment === "WINNER") return "APPLAUSE";
  return "LAUGH";
}

export type LaughPressResult = {
  accepted: boolean;
  reactionEventId: string | null;
  avatarAnimation: string | null;
  soundIds: readonly string[];
  hudFeedback: boolean;
  countsAsVote: 0;
  xpAwarded: 0;
  originalitySignal: 0;
  countsAsHumanEngagement: 0 | 1;
  LAUGH_BUTTON_NO_VISIBLE_RESPONSE: 0;
  LAUGH_REACTION_DUPLICATE_AUTHORITY: 0;
};

function hashPick(seed: string, n: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % n;
}

/**
 * One canonical reaction event — avatar + audio + telemetry.
 * Bot/proxy callers must pass isHuman=false.
 */
export function pressLaugh(input: {
  fanId: string;
  avatarId: string;
  seatId?: string | null;
  experience: string;
  voiceProfile?: "VOICE_A" | "VOICE_B" | "VOICE_NEUTRAL" | "UNSET" | null;
  position?: { x: number; y: number; z: number } | null;
  isHuman?: boolean;
  nowMs?: number;
}): LaughPressResult {
  const now = input.nowMs ?? Date.now();
  const last = lastLaughByFan.get(input.fanId) ?? 0;
  if (now - last < LAUGH_COOLDOWN_MS) {
    return {
      accepted: false,
      reactionEventId: null,
      avatarAnimation: null,
      soundIds: [],
      hudFeedback: true, // subtle feedback during cooldown — button not "broken"
      countsAsVote: 0,
      xpAwarded: 0,
      originalitySignal: 0,
      countsAsHumanEngagement: 0,
      LAUGH_BUTTON_NO_VISIBLE_RESPONSE: 0,
      LAUGH_REACTION_DUPLICATE_AUTHORITY: 0,
    };
  }
  lastLaughByFan.set(input.fanId, now);
  const eventId = `laugh-${input.fanId}-${now}`;
  // Crowd variation family — same emotion, different body language (§17970+)
  const presentation = presentOwnAvatarReaction({
    reactionEventId: eventId,
    semantic: "LAUGH",
    fanId: input.fanId,
    avatarId: input.avatarId,
    posture: "ANY",
  });
  const anim = presentation.variant.animationId;
  void LAUGH_VARIANT_ANIMATIONS;
  void hashPick;
  const spatial = buildSpatialAvatarReaction({
    avatarId: input.avatarId,
    seatId: input.seatId,
    reaction: "LAUGH",
    voiceProfile: resolveVoiceProfile(input.voiceProfile),
    position: input.position,
  });
  const isHuman = input.isHuman !== false;
  return {
    accepted: true,
    reactionEventId: eventId,
    avatarAnimation: anim,
    soundIds: spatial.soundIds.length ? spatial.soundIds : [presentation.soundId],
    hudFeedback: true,
    countsAsVote: 0,
    xpAwarded: 0,
    originalitySignal: 0,
    countsAsHumanEngagement: isHuman ? 1 : 0,
    LAUGH_BUTTON_NO_VISIBLE_RESPONSE: 0,
    LAUGH_REACTION_DUPLICATE_AUTHORITY: 0,
  };
}

/** Aggregate real laughs → room energy; one fan cannot create arena scale. */
export function scaleComedyCrowdLaugh(input: {
  humanLaughCount: number;
  roomOccupancy: number;
}): {
  intensity: "SMALL" | "MEDIUM" | "LARGE";
  SINGLE_FAN_TRIGGERS_FULL_ARENA_LAUGH: 0;
  COMEDY_LAUGH_AUDIO_STORM: 0;
} {
  const occ = Math.max(1, input.roomOccupancy);
  const ratio = Math.min(1, Math.max(0, input.humanLaughCount) / occ);
  // Cap absolute contribution from tiny counts in huge rooms
  if (input.humanLaughCount <= 1) {
    return {
      intensity: "SMALL",
      SINGLE_FAN_TRIGGERS_FULL_ARENA_LAUGH: 0,
      COMEDY_LAUGH_AUDIO_STORM: 0,
    };
  }
  if (ratio < 0.15) {
    return {
      intensity: "SMALL",
      SINGLE_FAN_TRIGGERS_FULL_ARENA_LAUGH: 0,
      COMEDY_LAUGH_AUDIO_STORM: 0,
    };
  }
  if (ratio < 0.4) {
    return {
      intensity: "MEDIUM",
      SINGLE_FAN_TRIGGERS_FULL_ARENA_LAUGH: 0,
      COMEDY_LAUGH_AUDIO_STORM: 0,
    };
  }
  return {
    intensity: "LARGE",
    SINGLE_FAN_TRIGGERS_FULL_ARENA_LAUGH: 0,
    COMEDY_LAUGH_AUDIO_STORM: 0,
  };
}

export type ExperienceReactionMatrixRow = {
  experience: string;
  laugh: "PRIMARY" | "YES" | "NO";
  clap: "YES" | "NO";
  cheer: "CONTEXTUAL" | "PRIMARY" | "YES" | "NO";
  gasp: "YES" | "NO";
  heart: "YES" | "NO";
  voteSeparate: true;
};

export function experienceReactionMatrix(): ExperienceReactionMatrixRow[] {
  return [
    {
      experience: "COMEDY",
      laugh: "PRIMARY",
      clap: "YES",
      cheer: "CONTEXTUAL",
      gasp: "YES",
      heart: "YES",
      voteSeparate: true,
    },
    {
      experience: "DIRTY_DOZENS",
      laugh: "PRIMARY",
      clap: "YES",
      cheer: "CONTEXTUAL",
      gasp: "YES",
      heart: "YES",
      voteSeparate: true,
    },
    {
      experience: "JOKE_OFF",
      laugh: "PRIMARY",
      clap: "YES",
      cheer: "CONTEXTUAL",
      gasp: "YES",
      heart: "YES",
      voteSeparate: true,
    },
    {
      experience: "MONDAY_NIGHT_STAGE",
      laugh: "YES",
      clap: "YES",
      cheer: "YES",
      gasp: "YES",
      heart: "YES",
      voteSeparate: true,
    },
    {
      experience: "BATTLE",
      laugh: "NO",
      clap: "YES",
      cheer: "PRIMARY",
      gasp: "NO",
      heart: "YES",
      voteSeparate: true,
    },
    {
      experience: "CYPHER",
      laugh: "NO",
      clap: "YES",
      cheer: "PRIMARY",
      gasp: "NO",
      heart: "YES",
      voteSeparate: true,
    },
    {
      experience: "WORLD_DANCE_PARTY",
      laugh: "NO",
      clap: "YES",
      cheer: "PRIMARY",
      gasp: "NO",
      heart: "YES",
      voteSeparate: true,
    },
    {
      experience: "MONTHLY_IDOL",
      laugh: "YES",
      clap: "YES",
      cheer: "PRIMARY",
      gasp: "NO",
      heart: "YES",
      voteSeparate: true,
    },
  ];
}

export function resetComedyLaughReactionForTests(): void {
  lastLaughByFan.clear();
}

export function comedyLaughReactionBoundaryLocks() {
  return {
    NEW_COMEDY_LAUGH_ANIMATION_ENGINE,
    NEW_COMEDY_VIDEO_HUD_CREATED,
    CANONICAL_REACTION_AUTHORITY: "HudActionRegistry + CrowdAmbienceListenerMixPolicy",
    CANONICAL_AVATAR_REACTION_AUTHORITY: "Avatar animation / emote (reuse)",
    CANONICAL_COMEDY_AUDIO_AUTHORITY: "SoundManifest crowd_laughing + Sounds Pack",
    CANONICAL_VENUE_HUD_AUTHORITY: "HudActionRegistry / TMIExperienceHudRuntime",
    LAUGH_HUD_BUTTON,
    CLAP_HUD_BUTTON,
    COMEDY_LAUGH_PRIMARY,
    DIRTY_DOZENS_LAUGH_PRIMARY,
    JOKE_OFF_LAUGH_PRIMARY,
    AVATAR_LAUGH_ANIMATION: true,
    LAUGH_REACTION_DUPLICATE_AUTHORITY,
    COMEDY_CROWD_IDENTICAL_LAUGH_ANIMATION,
    COMEDY_LAUGH_AUDIO_STORM,
    LAUGH_REACTION_AUTOMATICALLY_VOTES,
    LAUGH_EQUALS_ORIGINALITY,
    LAUGH_SPAM_FARMS_XP,
    LAUGH_BUTTON_NO_VISIBLE_RESPONSE,
    STUCK_COMEDY_LAUGH_LOOP,
    COMEDY_LAUGH_VOICE_FROM_APPEARANCE,
    BOT_LAUGH_COUNTS_AS_HUMAN_ENGAGEMENT,
    SINGLE_FAN_TRIGGERS_FULL_ARENA_LAUGH,
    CHAT_EMOJI_COUNTS_AS_LAUGH_REACTION: 0,
  } as const;
}
