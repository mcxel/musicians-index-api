/**
 * Mini-Me Spontaneous Memory Callback & Catchphrase Engine (contract).
 * Reuses owner-scoped memory + slow-growth stage. No second AI/audio engine.
 * Public lobby speech requires explicit owner opt-in; never auto-broadcast.
 * PHYSICAL_VERIFIED=NO until Copilot real-device matrix.
 */

import {
  catchphraseRenditionForStage,
  type MiniMeGrowthProfile,
  type MiniMeVocalStage,
} from "@/lib/avatars/MiniMeSlowGrowthLaw";

export const MINI_ME_SPONTANEOUS_CALLBACK_POLICY_ID =
  "MINI_ME_SPONTANEOUS_CALLBACK_POLICY_v1" as const;

export const NEW_CATCHPHRASE_AUDIO_ENGINE = false as const;
export const CROSS_OWNER_MEMORY_LEAK_FORBIDDEN = true as const;
export const LEARNING_IMPLIES_PUBLIC_BROADCAST = 0 as const;
export const FIXED_FIVE_MINUTE_TIMER_FORBIDDEN = true as const;

export type MiniMeSpeechSurface =
  | "FAN_AVATAR_LOBBY"
  | "AVATAR_CREATION_CENTER"
  | "MINI_ME_CANISTER"
  | "QUICK_PANEL"
  | "PERFORMER_VENUE_PRIVATE"
  | "PERFORMER_LOBBY"
  | "PURPOSE_LOUNGE"
  | "LIVE_SHOW"
  | "CYPHER"
  | "BATTLE";

export type SpontaneousFrequency = "OFF" | "RARE" | "OCCASIONAL" | "PLAYFUL";

export type MiniMeCatchphraseRecord = {
  phraseId: string;
  ownerUserId: string;
  companionId: string;
  text: string;
  approvedForCallback: boolean;
  favorited: boolean;
  neverSayAgain: boolean;
  reinforcementCount: number;
  lastSpokenAtMs: number | null;
  createdAtMs: number;
};

export type MiniMeOwnerSpeechSettings = {
  spontaneousSpeech: boolean;
  frequency: SpontaneousFrequency;
  publicAvatarLobbySpeech: boolean;
  quietDuringPerformances: boolean;
  voiceVolume: number; // 0..1
  muted: boolean;
};

export const DEFAULT_MINI_ME_SPEECH_SETTINGS: MiniMeOwnerSpeechSettings = {
  spontaneousSpeech: true,
  frequency: "OCCASIONAL",
  publicAvatarLobbySpeech: false,
  quietDuringPerformances: true,
  voiceVolume: 0.7,
  muted: false,
};

const SURFACE_POLICY: Record<
  MiniMeSpeechSurface,
  { allow: boolean; requiresPublicOptIn: boolean; performanceQuiet: boolean }
> = {
  FAN_AVATAR_LOBBY: { allow: true, requiresPublicOptIn: true, performanceQuiet: false },
  AVATAR_CREATION_CENTER: { allow: true, requiresPublicOptIn: false, performanceQuiet: false },
  MINI_ME_CANISTER: { allow: true, requiresPublicOptIn: false, performanceQuiet: false },
  QUICK_PANEL: { allow: true, requiresPublicOptIn: false, performanceQuiet: false },
  PERFORMER_VENUE_PRIVATE: { allow: true, requiresPublicOptIn: false, performanceQuiet: true },
  PERFORMER_LOBBY: { allow: false, requiresPublicOptIn: false, performanceQuiet: true },
  PURPOSE_LOUNGE: { allow: false, requiresPublicOptIn: false, performanceQuiet: true },
  LIVE_SHOW: { allow: false, requiresPublicOptIn: false, performanceQuiet: true },
  CYPHER: { allow: false, requiresPublicOptIn: false, performanceQuiet: true },
  BATTLE: { allow: false, requiresPublicOptIn: false, performanceQuiet: true },
};

const FREQUENCY_COOLDOWN_MS: Record<Exclude<SpontaneousFrequency, "OFF">, number> = {
  RARE: 45 * 60_000,
  OCCASIONAL: 18 * 60_000,
  PLAYFUL: 8 * 60_000,
};

const PER_PHRASE_COOLDOWN_MS = 2 * 60 * 60_000;
const MIN_IDLE_MS = 25_000;
const SESSION_MAX_CALLBACKS: Record<Exclude<SpontaneousFrequency, "OFF">, number> = {
  RARE: 2,
  OCCASIONAL: 5,
  PLAYFUL: 10,
};

export function surfaceAllowsCallback(
  surface: MiniMeSpeechSurface,
  settings: MiniMeOwnerSpeechSettings,
  performanceActive: boolean,
): { ok: boolean; reason: string } {
  const pol = SURFACE_POLICY[surface];
  if (!pol.allow) return { ok: false, reason: "SURFACE_FORBIDDEN" };
  if (!settings.spontaneousSpeech || settings.frequency === "OFF") {
    return { ok: false, reason: "SPONTANEOUS_OFF" };
  }
  if (settings.muted || settings.voiceVolume <= 0) return { ok: false, reason: "MUTED" };
  if (pol.requiresPublicOptIn && !settings.publicAvatarLobbySpeech) {
    return { ok: false, reason: "PUBLIC_OPT_IN_REQUIRED" };
  }
  if (performanceActive && (settings.quietDuringPerformances || pol.performanceQuiet)) {
    return { ok: false, reason: "PERFORMANCE_QUIET" };
  }
  return { ok: true, reason: "ALLOWED" };
}

export type SpontaneousCallbackDecision =
  | {
      ok: true;
      phraseId: string;
      text: string;
      rendition: ReturnType<typeof catchphraseRenditionForStage>;
      stage: MiniMeVocalStage;
      spatialPublic: boolean;
      cooldownMs: number;
    }
  | { ok: false; reason: string };

/**
 * Pure scheduler decision — randomized idle trigger, per-phrase cooldown, session caps.
 * Caller supplies eligible phrases already filtered to this owner/companion only.
 */
export function decideSpontaneousCallback(input: {
  surface: MiniMeSpeechSurface;
  settings: MiniMeOwnerSpeechSettings;
  growth: MiniMeGrowthProfile;
  phrases: readonly MiniMeCatchphraseRecord[];
  nowMs: number;
  idleMs: number;
  sessionCallbackCount: number;
  lastAnyCallbackAtMs: number | null;
  performanceActive?: boolean;
  ownerIsSpeaking?: boolean;
  teachingOrRecording?: boolean;
  /** Deterministic unit-test seed 0..1; omit for Math.random. */
  random01?: number;
}): SpontaneousCallbackDecision {
  const gate = surfaceAllowsCallback(
    input.surface,
    input.settings,
    input.performanceActive === true,
  );
  if (!gate.ok) return { ok: false, reason: gate.reason };
  if (input.ownerIsSpeaking) return { ok: false, reason: "OWNER_SPEAKING" };
  if (input.teachingOrRecording) return { ok: false, reason: "TEACHING_OR_RECORDING" };
  if (input.idleMs < MIN_IDLE_MS) return { ok: false, reason: "IDLE_TOO_SHORT" };

  const freq = input.settings.frequency;
  if (freq === "OFF") return { ok: false, reason: "SPONTANEOUS_OFF" };

  if (input.sessionCallbackCount >= SESSION_MAX_CALLBACKS[freq]) {
    return { ok: false, reason: "SESSION_CAP" };
  }
  const globalCd = FREQUENCY_COOLDOWN_MS[freq];
  if (
    input.lastAnyCallbackAtMs != null &&
    input.nowMs - input.lastAnyCallbackAtMs < globalCd
  ) {
    return { ok: false, reason: "GLOBAL_COOLDOWN" };
  }

  const eligible = input.phrases.filter(
    (p) =>
      p.ownerUserId === input.growth.ownerUserId &&
      p.companionId === input.growth.companionId &&
      p.approvedForCallback &&
      !p.neverSayAgain &&
      p.text.trim().length > 0 &&
      (p.lastSpokenAtMs == null || input.nowMs - p.lastSpokenAtMs >= PER_PHRASE_COOLDOWN_MS),
  );
  if (eligible.length === 0) return { ok: false, reason: "NO_ELIGIBLE_PHRASE" };

  // Soft random gate so timing is not a fixed metronome.
  const roll = typeof input.random01 === "number" ? input.random01 : Math.random();
  const chance = freq === "RARE" ? 0.35 : freq === "OCCASIONAL" ? 0.55 : 0.75;
  if (roll > chance) return { ok: false, reason: "RANDOM_DEFER" };

  // Prefer favorited / reinforced, then oldest unspoken.
  const ranked = [...eligible].sort((a, b) => {
    if (a.favorited !== b.favorited) return a.favorited ? -1 : 1;
    if (a.reinforcementCount !== b.reinforcementCount) {
      return b.reinforcementCount - a.reinforcementCount;
    }
    const aSpoken = a.lastSpokenAtMs ?? 0;
    const bSpoken = b.lastSpokenAtMs ?? 0;
    return aSpoken - bSpoken;
  });
  const pick = ranked[0]!;
  const spatialPublic =
    input.surface === "FAN_AVATAR_LOBBY" && input.settings.publicAvatarLobbySpeech;

  return {
    ok: true,
    phraseId: pick.phraseId,
    text: pick.text,
    rendition: catchphraseRenditionForStage(input.growth.stage),
    stage: input.growth.stage,
    spatialPublic,
    cooldownMs: globalCd,
  };
}

/** Learning a phrase never auto-approves public lobby speech. */
export function teachPhraseDoesNotAuthorizePublicBroadcast(): typeof LEARNING_IMPLIES_PUBLIC_BROADCAST {
  return LEARNING_IMPLIES_PUBLIC_BROADCAST;
}

export function miniMeSpontaneousCallbackLocks() {
  return {
    NEW_CATCHPHRASE_AUDIO_ENGINE,
    CROSS_OWNER_MEMORY_LEAK_FORBIDDEN,
    LEARNING_IMPLIES_PUBLIC_BROADCAST,
    FIXED_FIVE_MINUTE_TIMER_FORBIDDEN,
  } as const;
}
