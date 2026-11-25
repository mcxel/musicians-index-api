/**
 * CrowdAmbienceListenerMixPolicy — §15426 crowd bed + §15512 Listener Mix
 *
 * Layered crowd ambience + spatial avatar reaction emitters.
 * Show Mix (PROGRAM) vs Listener Mix (PERSONAL) — local Crowd slider never
 * changes other listeners. Voice/reaction samples map from chosen voice profile,
 * never appearance-guessed gender.
 *
 * NEW_CROWD_AUDIO_ENGINE_CREATED = NO — binds SoundManifest + ChannelMixerDirector
 * + CrowdAudioMixEngine + BeboSoundCues.
 */

import { SOUND_MANIFEST, getSoundsByCategory, type SoundManifestEntry } from "@/lib/sound/SoundManifest";
import { BEBO_SOUND_CUES } from "@/lib/sound/BeboSoundCues";
import {
  mayPlayCrowdReactionInPerformerPersonal,
  resolvePerformerCrowdMixPlan,
  type PerformerCrowdMixPlan,
} from "@/lib/audio/mixer/PerformerLiveMixCrowdPolicy";

export const CROWD_AMBIENCE_LISTENER_MIX_POLICY_ID =
  "CROWD_AMBIENCE_LISTENER_MIX_POLICY_v1" as const;
export const NEW_CROWD_AUDIO_ENGINE_CREATED = false as const;
export const NEW_HD_ROOM_RENDERER_CREATED = false as const;

/** Room-scale bed keyed by real occupancy — never invents attendance. */
export type CrowdBedScale =
  | "SOLO"
  | "SMALL_ROOM"
  | "SMALL_CROWD"
  | "LARGE_CROWD"
  | "ARENA";

export type CrowdReactionFamily =
  | "APPLAUSE"
  | "CHEER"
  | "LAUGH"
  | "BOO"
  | "GROAN"
  | "GASP"
  | "CLAP"
  | "DISAPPOINTMENT"
  | "ENTRANCE"
  | "WINNER";

/** Chosen profile — never inferred from avatar appearance (§ owner correction). */
export type VoiceReactionProfile = "VOICE_A" | "VOICE_B" | "VOICE_NEUTRAL" | "UNSET";

export type MixScopeLaw = {
  showMixBus: "PROGRAM";
  listenerMixBus: "PERSONAL";
  localCrowdAffectsOthers: 0;
  performerStageMonitorIsPersonal: true;
};

export const SHOW_VS_LISTENER_MIX: MixScopeLaw = {
  showMixBus: "PROGRAM",
  listenerMixBus: "PERSONAL",
  localCrowdAffectsOthers: 0,
  performerStageMonitorIsPersonal: true,
};

export const AMBIENT_CROWD_COUNTS_AS_HUMAN_ENGAGEMENT = 0 as const;
export const HOST_LAUGH_CUE_COUNTS_AS_VOTE = 0 as const;
export const CROWD_AUDIO_CREATES_MNS_VOTE = 0 as const;
export const VOICE_PROFILE_FROM_APPEARANCE = 0 as const;

/** Map occupancy count → bed scale (honest empty = no bed). */
export function resolveCrowdBedScale(realOccupancy: number): CrowdBedScale | "EMPTY" {
  if (!Number.isFinite(realOccupancy) || realOccupancy <= 0) return "EMPTY";
  if (realOccupancy === 1) return "SOLO";
  if (realOccupancy <= 4) return "SMALL_ROOM";
  if (realOccupancy <= 25) return "SMALL_CROWD";
  if (realOccupancy <= 250) return "LARGE_CROWD";
  return "ARENA";
}

/** Canonical SoundManifest bed IDs per scale — reuse existing entries only. */
export const CROWD_BED_BY_SCALE: Record<CrowdBedScale, readonly string[]> = {
  SOLO: ["crowd_small_reactions"],
  SMALL_ROOM: ["crowd_small_reactions", "crowd_clap_cheer"],
  SMALL_CROWD: ["crowd_clap_cheer", "crowd_cheer_auditorium", "crowd_small_reactions"],
  LARGE_CROWD: ["crowd_cheer_auditorium", "crowd_cheering_1", "crowd_cheers_2", "crowd_laughing"],
  ARENA: ["crowd_cheering_stadium", "crowd_cheering_1", "crowd_cheers_2", "crowd_cheering_2"],
};

export const REACTION_FAMILY_TO_MANIFEST: Record<CrowdReactionFamily, readonly string[]> = {
  APPLAUSE: ["crowd_clap_cheer", "crowd_cheer_auditorium"],
  CHEER: ["crowd_cheering_1", "crowd_cheers_2", "crowd_cheering_2"],
  LAUGH: ["crowd_laughing"],
  // Prefer promoted Sounds Pack boos; disappointment remains secondary bed
  BOO: ["crowd_boo_1", "crowd_boo_2", "crowd_booing", "crowd_disappointment"],
  GROAN: ["crowd_disappointment"],
  GASP: ["crowd_small_reactions"],
  CLAP: ["crowd_clap_cheer"],
  DISAPPOINTMENT: ["crowd_disappointment"],
  ENTRANCE: ["crowd_cheer_auditorium", "crowd_cheering_stadium"],
  WINNER: ["crowd_cheering_stadium", "crowd_cheer_auditorium"],
};

/**
 * Raw Sounds Pack folder (repo root) — inventory evidence for certification.
 * Paths are relative to `tmi-platform/Sounds Pack/` (not a second engine).
 */
export const SOUNDS_PACK_CROWD_RAW_FILES = [
  "dragon-studio-crowd-cheer-406646.mp3",
  "dragon-studio-crowd-booing-494319.mp3", // → public/sounds/crowd/crowd-booing.mp3
  "driken5482-crowd-cheer-in-school-auditorium-236699.mp3",
  "freesound_community-small-crowd-clapping-2-106993.mp3",
  "freesound_community-small-crowd-reactions-6977.mp3",
  "freesound_community-boo-36556.mp3", // → public/sounds/crowd/crowd-boo-1.mp3
  "freesound_community-boo-6377.mp3", // → public/sounds/crowd/crowd-boo-2.mp3

  "ribhavagrawal-crowd-laughing-sound-effect-no-copyright-390899.mp3",
  "ribhavagrawal-laughing-crowd-sound-effect-type-01-294192.mp3",
  "storegraphic-crowd-cheering-310544.mp3",
  "vishiv-crowd-cheering-in-stadium-435357.mp3",
  "universfield-crowd-disappointment-reaction-352718.mp3",
] as const;

/** Individual male/female solo reaction packs — not present as dedicated SKUs yet. */
export const SOLO_VOICE_REACTION_ASSET = "ASSET_GAP" as const;

export type SpatialEmitterCue = {
  avatarId: string;
  seatId: string | null;
  reaction: CrowdReactionFamily;
  voiceProfile: VoiceReactionProfile;
  /** World position when known — spatial bus; null = non-spatial bed only */
  position: { x: number; y: number; z: number } | null;
  soundIds: readonly string[];
  countsAsHumanEngagement: 0;
};

export function resolveVoiceProfile(
  chosen: VoiceReactionProfile | null | undefined,
): VoiceReactionProfile {
  if (!chosen || chosen === "UNSET") return "VOICE_NEUTRAL";
  return chosen;
}

/**
 * Build a spatial emitter from avatar seat + chosen voice profile.
 * Never reads appearance/gender fields.
 */
export function buildSpatialAvatarReaction(input: {
  avatarId: string;
  seatId?: string | null;
  reaction: CrowdReactionFamily;
  voiceProfile?: VoiceReactionProfile | null;
  position?: { x: number; y: number; z: number } | null;
}): SpatialEmitterCue {
  const profile = resolveVoiceProfile(input.voiceProfile);
  const soundIds = REACTION_FAMILY_TO_MANIFEST[input.reaction] ?? ["crowd_small_reactions"];
  return {
    avatarId: input.avatarId,
    seatId: input.seatId ?? null,
    reaction: input.reaction,
    voiceProfile: profile,
    position: input.position ?? null,
    soundIds,
    countsAsHumanEngagement: 0,
  };
}

export type ListenerMixSnapshot = {
  listenerId: string;
  crowdPersonalGain: number;
  performerPersonalGain: number;
  musicPersonalGain: number;
  screenSharePersonalGain: number;
  /** Same show event, different personal gains */
  showMixUnchanged: true;
};

export function applyLocalCrowdSlider(input: {
  listenerId: string;
  crowdGain: number;
  performerGain?: number;
  musicGain?: number;
  screenShareGain?: number;
}): ListenerMixSnapshot {
  const clamp = (n: number) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
  return {
    listenerId: input.listenerId,
    crowdPersonalGain: clamp(input.crowdGain),
    performerPersonalGain: clamp(input.performerGain ?? 0.85),
    musicPersonalGain: clamp(input.musicGain ?? 0.7),
    screenSharePersonalGain: clamp(input.screenShareGain ?? 0.7),
    showMixUnchanged: true,
  };
}

/** Two listeners — same PROGRAM crowd event, independent PERSONAL levels. */
export function proveListenerMixIsolation(fixture: {
  eventId: string;
  performerCrowd: number;
  fanCrowd: number;
}): {
  sameEvent: true;
  performer: ListenerMixSnapshot;
  fan: ListenerMixSnapshot;
  LOCAL_CROWD_AFFECTS_OTHERS: 0;
} {
  return {
    sameEvent: true,
    performer: applyLocalCrowdSlider({
      listenerId: "performer",
      crowdGain: fixture.performerCrowd,
    }),
    fan: applyLocalCrowdSlider({
      listenerId: "fan",
      crowdGain: fixture.fanCrowd,
    }),
    LOCAL_CROWD_AFFECTS_OTHERS: 0,
  };
}

export function listCanonicalCrowdManifestEntries(): SoundManifestEntry[] {
  return getSoundsByCategory("crowd");
}

/**
 * PERSONAL-route filter for crowd reaction SFX.
 * When the listener is the active performer on Battle/Cypher/Song Challenge,
 * negative families (BOO/GROAN/DISAPPOINTMENT) return empty soundIds.
 * PROGRAM / audience listeners are unchanged.
 */
export function resolvePersonalCrowdReactionSounds(input: {
  reaction: CrowdReactionFamily;
  listenerIsActivePerformer: boolean;
  experienceType?: string | null;
  plan?: PerformerCrowdMixPlan | null;
}): { soundIds: readonly string[]; routedToPersonal: boolean; suppressedBoo: boolean } {
  const plan =
    input.plan ??
    resolvePerformerCrowdMixPlan({
      experienceType: input.experienceType,
      positiveCrowdEnabled: true,
    });
  const catalog = REACTION_FAMILY_TO_MANIFEST[input.reaction] ?? ["crowd_small_reactions"];
  if (!input.listenerIsActivePerformer) {
    return { soundIds: catalog, routedToPersonal: true, suppressedBoo: false };
  }
  const allowed = mayPlayCrowdReactionInPerformerPersonal(input.reaction, plan);
  if (!allowed) {
    return { soundIds: [], routedToPersonal: false, suppressedBoo: true };
  }
  return { soundIds: catalog, routedToPersonal: true, suppressedBoo: false };
}

/**
 * Dual-listener routing — same reaction event, different PERSONAL outcomes.
 * Audience / non-performer listeners still receive BOO; only the active
 * performer's PERSONAL monitor is suppressed. PROGRAM bus is never touched here.
 */
export function resolveCrowdReactionForListeners(input: {
  reaction: CrowdReactionFamily;
  experienceType?: string | null;
  activePerformerUserId: string | null;
  listenerUserIds: readonly string[];
}): {
  byListener: Record<string, { soundIds: readonly string[]; suppressedBoo: boolean }>;
  programUnaffected: true;
} {
  const plan = resolvePerformerCrowdMixPlan({
    experienceType: input.experienceType,
    positiveCrowdEnabled: true,
  });
  const byListener: Record<string, { soundIds: readonly string[]; suppressedBoo: boolean }> = {};
  for (const listenerId of input.listenerUserIds) {
    const isPerformer =
      Boolean(input.activePerformerUserId) && listenerId === input.activePerformerUserId;
    const routed = resolvePersonalCrowdReactionSounds({
      reaction: input.reaction,
      listenerIsActivePerformer: isPerformer,
      experienceType: input.experienceType,
      plan,
    });
    byListener[listenerId] = {
      soundIds: routed.soundIds,
      suppressedBoo: routed.suppressedBoo,
    };
  }
  return { byListener, programUnaffected: true };
}

export function crowdAmbienceBoundaryLocks() {
  return {
    NEW_CROWD_AUDIO_ENGINE_CREATED,
    CANONICAL_SOUND_PACK_REGISTRY: "SoundManifest.ts",
    CANONICAL_MIXER: "ChannelMixerDirector.ts",
    CANONICAL_CROWD_MOMENT: "CrowdAudioMixEngine.ts",
    CANONICAL_BEBO_CUES: "BeboSoundCues.ts",
    SHOW_VS_LISTENER_MIX,
    AMBIENT_CROWD_COUNTS_AS_HUMAN_ENGAGEMENT,
    HOST_LAUGH_CUE_COUNTS_AS_VOTE,
    CROWD_AUDIO_CREATES_MNS_VOTE,
    VOICE_PROFILE_FROM_APPEARANCE,
    SOLO_VOICE_REACTION_ASSET,
    CROWD_MANIFEST_COUNT: listCanonicalCrowdManifestEntries().length,
    SOUNDS_PACK_RAW_COUNT: SOUNDS_PACK_CROWD_RAW_FILES.length,
    BEBO_CUE_KEYS: Object.keys(BEBO_SOUND_CUES).length,
    TOTAL_MANIFEST: SOUND_MANIFEST.length,
  } as const;
}
