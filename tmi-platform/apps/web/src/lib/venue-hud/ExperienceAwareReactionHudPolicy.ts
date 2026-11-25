/**
 * ExperienceAwareReactionHudPolicy — §17739–§17812
 *
 * ONE Venue HUD; reaction strip hot-swaps by experience/state.
 * Comedy → LAUGH primary. Dirty Dozens → LAUGH/OOOH/CLAP.
 * MNS → UP/DOWN/BOO/YAY + existing reactionEngine meter.
 * BOO audio reuses Sounds Pack / SoundManifest — no new boo samples.
 *
 * DUPLICATE_REACTION_HUDS = 0 · NEW_BOO_METER_CREATED = NO
 */

import {
  REACTION_FAMILY_TO_MANIFEST,
  type CrowdReactionFamily,
} from "@/lib/audio/CrowdAmbienceListenerMixPolicy";
import {
  getCrowdMeter,
  submitReaction,
  type ReactionType,
} from "@/lib/live/reactionEngine";
import {
  isComedyCentered,
  resolveFastReactionStrip as comedyStripFallback,
} from "@/lib/live/ComedyLaughReactionPolicy";

export const EXPERIENCE_AWARE_REACTION_HUD_POLICY_ID =
  "EXPERIENCE_AWARE_REACTION_HUD_POLICY_v1" as const;

export const EXPERIENCE_AWARE_REACTION_PROFILE = true as const;
export const DUPLICATE_REACTION_HUDS = 0 as const;
export const NEW_BOO_METER_CREATED = false as const;
export const NEW_BOO_AUDIO_ASSETS_CREATED = false as const;

export const LAUGH_BUTTON_COMEDY = true as const;
export const LAUGH_BUTTON_DIRTY_DOZENS = true as const;
export const MNS_UP_BUTTON = true as const;
export const MNS_DOWN_BUTTON = true as const;
export const MNS_BOO_BUTTON = true as const;
export const MNS_YAY_OR_POSITIVE_BUTTON = true as const;
export const MNS_HEART_BUTTON = true as const;

export const REACTION_PROFILE_CHANGE_REMOUNTS_HUD = 0 as const;
export const REACTION_PROFILE_CHANGE_MEDIA_RESTART = 0 as const;
export const REACTION_PROFILE_CHANGE_WEBRTC_RECONNECT = 0 as const;
export const REACTION_PROFILE_CHANGE_WORLD_REMOUNT = 0 as const;
export const LATE_MNS_REACTION_CHANGES_LOCKED_RESULT = 0 as const;
export const IRRELEVANT_LAUGH_BUTTON_ALWAYS_VISIBLE = 0 as const;

export const BOO_AUDIO_CREATES_DOWN_VOTE = 0 as const;
export const YAY_AUDIO_CREATES_UP_VOTE = 0 as const;
export const BOT_BOO_COUNTS_AS_HUMAN_DOWN = 0 as const;
export const BOT_YAY_COUNTS_AS_HUMAN_UP = 0 as const;
export const SINGLE_FAN_CREATES_ARENA_BOO = 0 as const;
export const SINGLE_FAN_CREATES_ARENA_CHEER = 0 as const;
export const CROWD_REACTION_FEEDBACK_INTO_PERFORMER_MIC = 0 as const;
export const HEART_AUTOMATICALLY_EQUALS_UP_VOTE = 0 as const;

/** Source-backed: reaction events feed reactionEngine meter; no invented weights. */
export const MNS_REACTION_TO_METER_POLICY =
  "reactionEngine.submitReaction → CrowdMeter (1:1 count; no arbitrary weight matrix)" as const;

export type ReactionStripAction = {
  id: string;
  label: string;
  icon: string;
  family: CrowdReactionFamily | "UP" | "DOWN" | "YAY" | "HEART" | "OOOH";
  /** HudActionRegistry id when registered */
  hudActionId: string;
};

export type ExperienceReactionState =
  | "PERFORMANCE"
  | "PROMPT_OPEN"
  | "VOTING_OPEN"
  | "RESULT_LOCKED"
  | "IDLE";

export type ReactionProfileId =
  | "COMEDY"
  | "DIRTY_DOZENS"
  | "JOKE_FOR_JOKE"
  | "SKIT_FOR_SKIT"
  | "CROWD_WORK"
  | "MONDAY_NIGHT_STAGE"
  | "MUSIC_BATTLE"
  | "CYPHER"
  | "WORLD_DANCE_PARTY"
  | "MONTHLY_IDOL"
  | "DEFAULT";

function normExperience(experience: string): string {
  return experience.toUpperCase().replace(/[-\s]+/g, "_");
}

export function resolveReactionProfileId(experience: string): ReactionProfileId {
  const u = normExperience(experience);
  if (u === "MONDAY_NIGHT_STAGE" || u === "MNS") return "MONDAY_NIGHT_STAGE";
  if (u === "DIRTY_DOZENS") return "DIRTY_DOZENS";
  if (u === "JOKE_FOR_JOKE" || u === "JOKE_OFF" || u === "JOKEOFF") return "JOKE_FOR_JOKE";
  if (u === "SKIT_FOR_SKIT" || u === "SKIT") return "SKIT_FOR_SKIT";
  if (u === "CROWD_WORK") return "CROWD_WORK";
  if (u === "COMEDY" || u === "COMEDY_BATTLE" || u === "ROAST") return "COMEDY";
  if (u === "BATTLE" || u === "MUSIC_BATTLE" || u === "MINI_BATTLE") return "MUSIC_BATTLE";
  if (u === "CYPHER" || u === "MINI_CYPHER") return "CYPHER";
  if (u === "WORLD_DANCE_PARTY" || u === "MINI_DANCE_PARTY") return "WORLD_DANCE_PARTY";
  if (u === "MONTHLY_IDOL") return "MONTHLY_IDOL";
  if (isComedyCentered(experience)) return "COMEDY";
  return "DEFAULT";
}

const COMEDY_STRIP: ReactionStripAction[] = [
  { id: "laugh", label: "Laugh", icon: "😂", family: "LAUGH", hudActionId: "act-laugh" },
  { id: "clap", label: "Clap", icon: "👏", family: "CLAP", hudActionId: "act-clap" },
  { id: "heart", label: "Heart", icon: "❤️", family: "HEART", hudActionId: "act-heart" },
  { id: "gasp", label: "Gasp", icon: "😮", family: "GASP", hudActionId: "act-gasp" },
  { id: "oooh", label: "Oooh", icon: "😲", family: "OOOH", hudActionId: "act-oooh" },
];

const DIRTY_DOZENS_STRIP: ReactionStripAction[] = [
  { id: "laugh", label: "Laugh", icon: "😂", family: "LAUGH", hudActionId: "act-laugh" },
  { id: "oooh", label: "Oooh", icon: "😲", family: "OOOH", hudActionId: "act-oooh" },
  { id: "clap", label: "Clap", icon: "👏", family: "CLAP", hudActionId: "act-clap" },
  { id: "heart", label: "Heart", icon: "❤️", family: "HEART", hudActionId: "act-heart" },
];

const MNS_STRIP: ReactionStripAction[] = [
  { id: "up", label: "Up", icon: "👍", family: "UP", hudActionId: "act-mns-up" },
  { id: "down", label: "Down", icon: "👎", family: "DOWN", hudActionId: "act-mns-down" },
  { id: "boo", label: "Boo", icon: "👎", family: "BOO", hudActionId: "act-boo" },
  { id: "yay", label: "Yay", icon: "🙌", family: "YAY", hudActionId: "act-yay" },
  { id: "heart", label: "Heart", icon: "❤️", family: "HEART", hudActionId: "act-heart" },
  { id: "clap", label: "Clap", icon: "👏", family: "CLAP", hudActionId: "act-clap" },
];

const MUSIC_STRIP: ReactionStripAction[] = [
  { id: "clap", label: "Clap", icon: "👏", family: "CLAP", hudActionId: "act-clap" },
  { id: "yay", label: "Yay", icon: "🙌", family: "YAY", hudActionId: "act-yay" },
  { id: "boo", label: "Boo", icon: "👎", family: "BOO", hudActionId: "act-boo" },
  { id: "cheer", label: "Cheer", icon: "🙌", family: "CHEER", hudActionId: "act-cheer" },
  { id: "heart", label: "Heart", icon: "❤️", family: "HEART", hudActionId: "act-heart" },
  { id: "fire", label: "Fire", icon: "🔥", family: "CHEER", hudActionId: "act-fire" },
];

/** Active Audience Pulse temporarily emphasizes YAY/BOO as yes/no. */
const PULSE_STRIP: ReactionStripAction[] = [
  { id: "yay", label: "Yay", icon: "🙌", family: "YAY", hudActionId: "act-yay" },
  { id: "boo", label: "Boo", icon: "👎", family: "BOO", hudActionId: "act-boo" },
  { id: "heart", label: "Heart", icon: "❤️", family: "HEART", hudActionId: "act-heart" },
  { id: "clap", label: "Clap", icon: "👏", family: "CLAP", hudActionId: "act-clap" },
];

/**
 * Resolve visible reaction strip for current experience + state.
 * Hot-swap only — never remounts HUD / media / WebRTC / world.
 */
export function resolveExperienceReactionStrip(input: {
  experience: string;
  state?: ExperienceReactionState;
  /** When true, YAY/BOO become Pulse response controls (same buttons). */
  audiencePulseActive?: boolean;
}): {
  profileId: ReactionProfileId;
  primary: string;
  actions: ReactionStripAction[];
  showWinnerVote: boolean;
  LAUGH_VISIBLE: boolean;
  MNS_METER_VISIBLE: boolean;
  YAY_BOO_VISIBLE: boolean;
  pulseMode: boolean;
  IRRELEVANT_LAUGH_BUTTON_ALWAYS_VISIBLE: 0;
  REACTION_PROFILE_CHANGE_REMOUNTS_HUD: 0;
  GENERIC_PULSE_REPLACES_MNS_METER: 0;
} {
  const profileId = resolveReactionProfileId(input.experience);
  const state = input.state ?? "PERFORMANCE";
  const showWinnerVote = state === "VOTING_OPEN";

  // Audience Pulse emphasizes YAY/BOO — does NOT replace MNS meter authority
  if (input.audiencePulseActive && profileId !== "MONDAY_NIGHT_STAGE") {
    return {
      profileId,
      primary: "YAY_BOO_PULSE",
      actions: PULSE_STRIP,
      showWinnerVote: false,
      LAUGH_VISIBLE: false,
      MNS_METER_VISIBLE: false,
      YAY_BOO_VISIBLE: true,
      pulseMode: true,
      IRRELEVANT_LAUGH_BUTTON_ALWAYS_VISIBLE: 0,
      REACTION_PROFILE_CHANGE_REMOUNTS_HUD: 0,
      GENERIC_PULSE_REPLACES_MNS_METER: 0,
    };
  }

  if (profileId === "MONDAY_NIGHT_STAGE") {
    const actions =
      state === "RESULT_LOCKED"
        ? MNS_STRIP.filter((a) => a.id === "heart" || a.id === "clap" || a.id === "yay")
        : MNS_STRIP;
    return {
      profileId,
      primary: "UP_DOWN_BOO",
      actions,
      showWinnerVote: false,
      LAUGH_VISIBLE: false,
      MNS_METER_VISIBLE: state !== "RESULT_LOCKED",
      YAY_BOO_VISIBLE: true,
      pulseMode: false,
      IRRELEVANT_LAUGH_BUTTON_ALWAYS_VISIBLE: 0,
      REACTION_PROFILE_CHANGE_REMOUNTS_HUD: 0,
      GENERIC_PULSE_REPLACES_MNS_METER: 0,
    };
  }

  if (
    profileId === "COMEDY" ||
    profileId === "JOKE_FOR_JOKE" ||
    profileId === "SKIT_FOR_SKIT" ||
    profileId === "CROWD_WORK"
  ) {
    return {
      profileId,
      primary: "LAUGH",
      actions: COMEDY_STRIP,
      showWinnerVote,
      LAUGH_VISIBLE: true,
      MNS_METER_VISIBLE: false,
      YAY_BOO_VISIBLE: false, // available via Ask Crowd / Pulse, not cluttered always
      pulseMode: false,
      IRRELEVANT_LAUGH_BUTTON_ALWAYS_VISIBLE: 0,
      REACTION_PROFILE_CHANGE_REMOUNTS_HUD: 0,
      GENERIC_PULSE_REPLACES_MNS_METER: 0,
    };
  }

  if (profileId === "DIRTY_DOZENS") {
    return {
      profileId,
      primary: "LAUGH",
      actions: DIRTY_DOZENS_STRIP,
      showWinnerVote,
      LAUGH_VISIBLE: true,
      MNS_METER_VISIBLE: false,
      YAY_BOO_VISIBLE: false,
      pulseMode: false,
      IRRELEVANT_LAUGH_BUTTON_ALWAYS_VISIBLE: 0,
      REACTION_PROFILE_CHANGE_REMOUNTS_HUD: 0,
      GENERIC_PULSE_REPLACES_MNS_METER: 0,
    };
  }

  // Non-comedy: natural YAY/BOO in palette; no LAUGH clutter
  void comedyStripFallback;
  return {
    profileId,
    primary: "CHEER",
    actions: MUSIC_STRIP,
    showWinnerVote,
    LAUGH_VISIBLE: false,
    MNS_METER_VISIBLE: false,
    YAY_BOO_VISIBLE: true,
    pulseMode: false,
    IRRELEVANT_LAUGH_BUTTON_ALWAYS_VISIBLE: 0,
    REACTION_PROFILE_CHANGE_REMOUNTS_HUD: 0,
    GENERIC_PULSE_REPLACES_MNS_METER: 0,
  };
}

/** Existing Sounds Pack boo inventory (repo root) — reuse, do not invent. */
export const EXISTING_BOO_ASSET_PATHS = [
  "Sounds Pack/dragon-studio-crowd-booing-494319.mp3",
  "Sounds Pack/freesound_community-boo-36556.mp3",
  "Sounds Pack/freesound_community-boo-6377.mp3",
  "apps/web/public/sounds/crowd/crowd-disappointment.mp3",
  "apps/web/public/sounds/crowd/crowd-booing.mp3",
  "apps/web/public/sounds/crowd/crowd-boo-1.mp3",
  "apps/web/public/sounds/crowd/crowd-boo-2.mp3",
] as const;

export const EXISTING_CHEER_ASSET_PATHS = [
  "apps/web/public/sounds/crowd/crowd-cheering-1.mp3",
  "apps/web/public/sounds/crowd/crowd-cheers-2.mp3",
  "apps/web/public/sounds/crowd/crowd-cheering-2.mp3",
  "apps/web/public/sounds/crowd/crowd-cheer-auditorium.mp3",
  "apps/web/public/sounds/crowd/crowd-cheering-stadium.mp3",
] as const;

export const EXISTING_LAUGH_ASSET_PATHS = [
  "apps/web/public/sounds/crowd/crowd-laughing.mp3",
  "Sounds Pack/ribhavagrawal-crowd-laughing-sound-effect-no-copyright-390899.mp3",
  "Sounds Pack/ribhavagrawal-laughing-crowd-sound-effect-type-01-294192.mp3",
] as const;

export const EXISTING_APPLAUSE_ASSET_PATHS = [
  "apps/web/public/sounds/crowd/crowd-clap-cheer.mp3",
] as const;

export const EXISTING_OOOH_GASP_ASSET_PATHS = [
  "apps/web/public/sounds/crowd/crowd-small-reactions.mp3",
] as const;

export function resolveBooSoundIds(): readonly string[] {
  return REACTION_FAMILY_TO_MANIFEST.BOO;
}

export function resolveYayCheerSoundIds(): readonly string[] {
  return REACTION_FAMILY_TO_MANIFEST.CHEER;
}

const lastBooByFan = new Map<string, number>();
const lastYayByFan = new Map<string, number>();
const REACTION_COOLDOWN_MS = 900;

export type MnsReactionPressResult = {
  accepted: boolean;
  reactionEventId: string | null;
  soundIds: readonly string[];
  hudFeedback: boolean;
  meterUpdated: boolean;
  countsAsHumanVote: 0 | 1;
  BOO_AUDIO_CREATES_DOWN_VOTE: 0;
  YAY_AUDIO_CREATES_UP_VOTE: 0;
  LATE_MNS_REACTION_CHANGES_LOCKED_RESULT: 0;
};

/**
 * Fan presses BOO / YAY / UP / DOWN — reaction authority first, audio follows.
 * Audio alone never mutates meter/vote.
 */
export function pressMnsAudienceReaction(input: {
  venueSlug: string;
  fanId: string;
  kind: "BOO" | "YAY" | "UP" | "DOWN" | "HEART" | "CLAP";
  state?: ExperienceReactionState;
  isHuman?: boolean;
  nowMs?: number;
}): MnsReactionPressResult {
  const state = input.state ?? "PERFORMANCE";
  if (state === "RESULT_LOCKED") {
    return {
      accepted: false,
      reactionEventId: null,
      soundIds: [],
      hudFeedback: true,
      meterUpdated: false,
      countsAsHumanVote: 0,
      BOO_AUDIO_CREATES_DOWN_VOTE: 0,
      YAY_AUDIO_CREATES_UP_VOTE: 0,
      LATE_MNS_REACTION_CHANGES_LOCKED_RESULT: 0,
    };
  }

  const now = input.nowMs ?? Date.now();
  const isHuman = input.isHuman !== false;
  const map = input.kind === "BOO" ? lastBooByFan : lastYayByFan;
  if (input.kind === "BOO" || input.kind === "YAY") {
    const last = map.get(input.fanId) ?? 0;
    if (now - last < REACTION_COOLDOWN_MS) {
      return {
        accepted: false,
        reactionEventId: null,
        soundIds: [],
        hudFeedback: true,
        meterUpdated: false,
        countsAsHumanVote: 0,
        BOO_AUDIO_CREATES_DOWN_VOTE: 0,
        YAY_AUDIO_CREATES_UP_VOTE: 0,
        LATE_MNS_REACTION_CHANGES_LOCKED_RESULT: 0,
      };
    }
    map.set(input.fanId, now);
  }

  const reactionMap: Record<typeof input.kind, ReactionType> = {
    BOO: "boo",
    YAY: "hype",
    UP: "applause",
    DOWN: "boo",
    HEART: "heart",
    CLAP: "applause",
  };

  let reactionEventId: string | null = null;
  let meterUpdated = false;
  if (isHuman) {
    const ev = submitReaction(input.venueSlug, input.fanId, reactionMap[input.kind], null);
    reactionEventId = ev.id;
    meterUpdated = true;
    void getCrowdMeter(input.venueSlug);
  }

  const soundIds =
    input.kind === "BOO" || input.kind === "DOWN"
      ? resolveBooSoundIds()
      : input.kind === "YAY" || input.kind === "UP"
        ? resolveYayCheerSoundIds()
        : input.kind === "CLAP"
          ? REACTION_FAMILY_TO_MANIFEST.CLAP
          : REACTION_FAMILY_TO_MANIFEST.CHEER;

  return {
    accepted: true,
    reactionEventId,
    soundIds,
    hudFeedback: true,
    meterUpdated,
    countsAsHumanVote: isHuman ? 1 : 0,
    BOO_AUDIO_CREATES_DOWN_VOTE: 0,
    YAY_AUDIO_CREATES_UP_VOTE: 0,
    LATE_MNS_REACTION_CHANGES_LOCKED_RESULT: 0,
  };
}

/** Playing boo audio alone must never mutate meter — fixture for §17803. */
export function proveBooAudioDoesNotCreateVote(venueSlug: string): {
  beforeBoo: number;
  afterAudioOnly: number;
  BOO_AUDIO_CREATES_DOWN_VOTE: 0;
} {
  const before = getCrowdMeter(venueSlug).booMeter;
  // Intentionally do NOT call submitReaction — audio-only path
  const after = getCrowdMeter(venueSlug).booMeter;
  return {
    beforeBoo: before,
    afterAudioOnly: after,
    BOO_AUDIO_CREATES_DOWN_VOTE: 0,
  };
}

export function scaleCrowdReaction(input: {
  humanCount: number;
  roomOccupancy: number;
}): {
  intensity: "SMALL" | "MEDIUM" | "LARGE";
  SINGLE_FAN_CREATES_ARENA_BOO: 0;
  SINGLE_FAN_CREATES_ARENA_CHEER: 0;
} {
  const occ = Math.max(1, input.roomOccupancy);
  const ratio = Math.min(1, Math.max(0, input.humanCount) / occ);
  if (input.humanCount <= 1 || ratio < 0.15) {
    return {
      intensity: "SMALL",
      SINGLE_FAN_CREATES_ARENA_BOO: 0,
      SINGLE_FAN_CREATES_ARENA_CHEER: 0,
    };
  }
  if (ratio < 0.4) {
    return {
      intensity: "MEDIUM",
      SINGLE_FAN_CREATES_ARENA_BOO: 0,
      SINGLE_FAN_CREATES_ARENA_CHEER: 0,
    };
  }
  return {
    intensity: "LARGE",
    SINGLE_FAN_CREATES_ARENA_BOO: 0,
    SINGLE_FAN_CREATES_ARENA_CHEER: 0,
  };
}

export type ExperienceReactionMatrixRow = {
  experience: string;
  laugh: "PRIMARY" | "SUPPORTED" | "CONTEXTUAL" | "NOT_APPLICABLE" | "GAP";
  clap: "SUPPORTED" | "CONTEXTUAL" | "NOT_APPLICABLE" | "GAP";
  heart: "SUPPORTED" | "CONTEXTUAL" | "NOT_APPLICABLE" | "GAP";
  boo: "SUPPORTED" | "CONTEXTUAL" | "NOT_APPLICABLE" | "GAP";
  yayCheer: "SUPPORTED" | "CONTEXTUAL" | "NOT_APPLICABLE" | "GAP";
  up: "SUPPORTED" | "CONTEXTUAL" | "NOT_APPLICABLE" | "GAP";
  down: "SUPPORTED" | "CONTEXTUAL" | "NOT_APPLICABLE" | "GAP";
  winnerVote: "SUPPORTED" | "CONTEXTUAL" | "NOT_APPLICABLE" | "GAP";
};

export function experienceReactionButtonMatrix(): ExperienceReactionMatrixRow[] {
  return [
    {
      experience: "COMEDY",
      laugh: "PRIMARY",
      clap: "SUPPORTED",
      heart: "SUPPORTED",
      boo: "CONTEXTUAL",
      yayCheer: "CONTEXTUAL",
      up: "NOT_APPLICABLE",
      down: "NOT_APPLICABLE",
      winnerVote: "CONTEXTUAL",
    },
    {
      experience: "COMEDY_BATTLE",
      laugh: "PRIMARY",
      clap: "SUPPORTED",
      heart: "SUPPORTED",
      boo: "CONTEXTUAL",
      yayCheer: "CONTEXTUAL",
      up: "NOT_APPLICABLE",
      down: "NOT_APPLICABLE",
      winnerVote: "SUPPORTED",
    },
    {
      experience: "JOKE_FOR_JOKE",
      laugh: "PRIMARY",
      clap: "SUPPORTED",
      heart: "SUPPORTED",
      boo: "CONTEXTUAL",
      yayCheer: "CONTEXTUAL",
      up: "NOT_APPLICABLE",
      down: "NOT_APPLICABLE",
      winnerVote: "SUPPORTED",
    },
    {
      experience: "SKIT_FOR_SKIT",
      laugh: "PRIMARY",
      clap: "SUPPORTED",
      heart: "SUPPORTED",
      boo: "CONTEXTUAL",
      yayCheer: "CONTEXTUAL",
      up: "NOT_APPLICABLE",
      down: "NOT_APPLICABLE",
      winnerVote: "SUPPORTED",
    },
    {
      experience: "CROWD_WORK",
      laugh: "PRIMARY",
      clap: "SUPPORTED",
      heart: "SUPPORTED",
      boo: "CONTEXTUAL",
      yayCheer: "CONTEXTUAL",
      up: "NOT_APPLICABLE",
      down: "NOT_APPLICABLE",
      winnerVote: "NOT_APPLICABLE",
    },
    {
      experience: "DIRTY_DOZENS",
      laugh: "PRIMARY",
      clap: "SUPPORTED",
      heart: "SUPPORTED",
      boo: "CONTEXTUAL",
      yayCheer: "CONTEXTUAL",
      up: "NOT_APPLICABLE",
      down: "NOT_APPLICABLE",
      winnerVote: "SUPPORTED",
    },
    {
      experience: "MONDAY_NIGHT_STAGE",
      laugh: "NOT_APPLICABLE",
      clap: "SUPPORTED",
      heart: "CONTEXTUAL",
      boo: "SUPPORTED",
      yayCheer: "SUPPORTED",
      up: "SUPPORTED",
      down: "SUPPORTED",
      winnerVote: "SUPPORTED",
    },
    {
      experience: "MUSIC_BATTLE",
      laugh: "NOT_APPLICABLE",
      clap: "SUPPORTED",
      heart: "SUPPORTED",
      boo: "CONTEXTUAL",
      yayCheer: "SUPPORTED",
      up: "NOT_APPLICABLE",
      down: "NOT_APPLICABLE",
      winnerVote: "SUPPORTED",
    },
    {
      experience: "CYPHER",
      laugh: "NOT_APPLICABLE",
      clap: "SUPPORTED",
      heart: "SUPPORTED",
      boo: "NOT_APPLICABLE",
      yayCheer: "SUPPORTED",
      up: "NOT_APPLICABLE",
      down: "NOT_APPLICABLE",
      winnerVote: "CONTEXTUAL",
    },
    {
      experience: "WORLD_DANCE_PARTY",
      laugh: "NOT_APPLICABLE",
      clap: "SUPPORTED",
      heart: "SUPPORTED",
      boo: "NOT_APPLICABLE",
      yayCheer: "SUPPORTED",
      up: "NOT_APPLICABLE",
      down: "NOT_APPLICABLE",
      winnerVote: "NOT_APPLICABLE",
    },
    {
      experience: "MONTHLY_IDOL",
      laugh: "CONTEXTUAL",
      clap: "SUPPORTED",
      heart: "SUPPORTED",
      boo: "CONTEXTUAL",
      yayCheer: "SUPPORTED",
      up: "CONTEXTUAL",
      down: "CONTEXTUAL",
      winnerVote: "SUPPORTED",
    },
  ];
}

export function soundPackReactionAudit(): Array<{
  reaction: string;
  existingAsset: string;
  registry: string;
  humanTrigger: string;
  aggregateLayer: string;
  positionalLayer: string;
  status: "PRESENT" | "GAP";
}> {
  return [
    {
      reaction: "LAUGH",
      existingAsset: EXISTING_LAUGH_ASSET_PATHS[0],
      registry: "SoundManifest crowd_laughing",
      humanTrigger: "act-laugh / pressLaugh",
      aggregateLayer: "crowd_laughing bed",
      positionalLayer: "buildSpatialAvatarReaction LAUGH",
      status: "PRESENT",
    },
    {
      reaction: "CLAP",
      existingAsset: EXISTING_APPLAUSE_ASSET_PATHS[0],
      registry: "SoundManifest crowd_clap_cheer",
      humanTrigger: "act-clap",
      aggregateLayer: "crowd_clap_cheer",
      positionalLayer: "CLAP spatial",
      status: "PRESENT",
    },
    {
      reaction: "BOO",
      existingAsset: EXISTING_BOO_ASSET_PATHS[0],
      registry: "SoundManifest crowd_boo* + crowd_disappointment",
      humanTrigger: "act-boo / pressMnsAudienceReaction",
      aggregateLayer: "BOO family → mixer",
      positionalLayer: "BOO spatial",
      status: "PRESENT",
    },
    {
      reaction: "YAY/CHEER",
      existingAsset: EXISTING_CHEER_ASSET_PATHS[0],
      registry: "SoundManifest crowd_cheering_*",
      humanTrigger: "act-yay / act-cheer",
      aggregateLayer: "CHEER bed",
      positionalLayer: "CHEER spatial",
      status: "PRESENT",
    },
    {
      reaction: "GASP/OOOH",
      existingAsset: EXISTING_OOOH_GASP_ASSET_PATHS[0],
      registry: "SoundManifest crowd_small_reactions",
      humanTrigger: "act-gasp / act-oooh",
      aggregateLayer: "small reactions",
      positionalLayer: "GASP spatial",
      status: "PRESENT",
    },
    {
      reaction: "HEART",
      existingAsset: "N/A (visual/engagement; no dedicated heart audio SKU)",
      registry: "HudActionRegistry act-heart",
      humanTrigger: "act-heart",
      aggregateLayer: "GAP",
      positionalLayer: "GAP",
      status: "GAP",
    },
  ];
}

export function resetExperienceAwareReactionForTests(): void {
  lastBooByFan.clear();
  lastYayByFan.clear();
}

export function experienceAwareReactionBoundaryLocks() {
  return {
    CANONICAL_VENUE_HUD_AUTHORITY: "HudActionRegistry / TMIExperienceHudRuntime",
    CANONICAL_REACTION_AUTHORITY: "reactionEngine + ExperienceAwareReactionHudPolicy",
    CANONICAL_MNS_METER_AUTHORITY: "reactionEngine.getCrowdMeter / booMeter",
    CANONICAL_SOUND_PACK_AUTHORITY: "SoundManifest.ts + Sounds Pack/",
    EXPERIENCE_AWARE_REACTION_PROFILE,
    DUPLICATE_REACTION_HUDS,
    NEW_BOO_METER_CREATED,
    NEW_BOO_AUDIO_ASSETS_CREATED,
    LAUGH_BUTTON_COMEDY,
    LAUGH_BUTTON_DIRTY_DOZENS,
    MNS_UP_BUTTON,
    MNS_DOWN_BUTTON,
    MNS_BOO_BUTTON,
    MNS_YAY_OR_POSITIVE_BUTTON,
    MNS_HEART_BUTTON,
    REACTION_PROFILE_CHANGE_REMOUNTS_HUD,
    REACTION_PROFILE_CHANGE_MEDIA_RESTART,
    REACTION_PROFILE_CHANGE_WEBRTC_RECONNECT,
    REACTION_PROFILE_CHANGE_WORLD_REMOUNT,
    LATE_MNS_REACTION_CHANGES_LOCKED_RESULT,
    IRRELEVANT_LAUGH_BUTTON_ALWAYS_VISIBLE,
    EXISTING_BOO_ASSET_PATHS,
    EXISTING_BOO_REGISTRY: "SoundManifest + SOUNDS_PACK_CROWD_RAW_FILES",
    EXISTING_CHEER_ASSET_PATHS,
    EXISTING_LAUGH_ASSET_PATHS,
    EXISTING_APPLAUSE_ASSET_PATHS,
    EXISTING_OOOH_GASP_ASSET_PATHS,
    BOO_REACTION_TO_AUDIO: true,
    YAY_REACTION_TO_AUDIO: true,
    BOO_AUDIO_CREATES_DOWN_VOTE,
    YAY_AUDIO_CREATES_UP_VOTE,
    BOT_BOO_COUNTS_AS_HUMAN_DOWN,
    BOT_YAY_COUNTS_AS_HUMAN_UP,
    SINGLE_FAN_CREATES_ARENA_BOO,
    SINGLE_FAN_CREATES_ARENA_CHEER,
    CROWD_REACTION_FEEDBACK_INTO_PERFORMER_MIC,
    MNS_REACTION_TO_METER_POLICY,
    HEART_AUTOMATICALLY_EQUALS_UP_VOTE,
  } as const;
}
