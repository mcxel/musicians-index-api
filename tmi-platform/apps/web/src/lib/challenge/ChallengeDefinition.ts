/**
 * ChallengeDefinition — completed work vs work for ANY performer style.
 * Songs, videos, clips, comedy, streamer VODs, instrumentals, beats, DJ mixes, bands…
 * Song Challenge remains a filter subtype. AI Music Challenge is a distinct lane.
 */

import {
  FULL_STYLE_ROTATION_POOL,
  type PerformerStyleSlot,
  styleLabel,
} from "@/lib/competition/PerformerStyleSlots";

export type ChallengeWorkType =
  | "songs"
  | "videos"
  | "clips"
  | "scenes"
  | "comedy_sets"
  | "streamer_vods"
  | "instrumental_recordings"
  | "producer_beats"
  | "dj_mixes"
  | "band_submissions"
  | "ai_songs"
  | "ai_beats"
  | "any_work";

export type ChallengeLaneId =
  | "human_open"
  | "song_challenge"
  | "video_clip"
  | "comedy_set"
  | "streamer_vod"
  | "instrumental"
  | "producer_beat"
  | "dj_mix"
  | "band_group"
  | "country"
  | "rock"
  | "gospel"
  | "rnb"
  | "pop"
  | "jazz"
  | "latin"
  | "edm"
  | "dance"
  | "ai_music"
  | "creative_mixed";

export type ChallengeDefinition = {
  id: ChallengeLaneId;
  label: string;
  /** Card badge — AI lane must say AI MUSIC CHALLENGE. */
  cardBadge: string;
  emoji: string;
  styleSlot: PerformerStyleSlot;
  workTypes: readonly ChallengeWorkType[];
  /** Song Challenge subtype filters Media Locker to songs only. */
  songOnly?: boolean;
  /** Distinct AI Music Challenge lane (Suno / Udio / similar). */
  aiLane?: boolean;
  /** Human challenges forbid undeclared AI work against humans. */
  humanOnly?: boolean;
  needsWorks: number;
  openCallRole: string;
  accentColor: string;
};

export const CHALLENGE_DEFINITIONS: readonly ChallengeDefinition[] = [
  {
    id: "human_open",
    label: "Open Work Challenge",
    cardBadge: "WORK VS WORK",
    emoji: "⚔️",
    styleSlot: "open_genre",
    workTypes: ["any_work"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "works",
    accentColor: "#FFAB00",
  },
  {
    id: "song_challenge",
    label: "Song Challenge",
    cardBadge: "SONG CHALLENGE",
    emoji: "🎵",
    styleSlot: "open_genre",
    workTypes: ["songs"],
    songOnly: true,
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "songs",
    accentColor: "#FFB000",
  },
  {
    id: "video_clip",
    label: "Video / Clip Challenge",
    cardBadge: "VIDEO VS VIDEO",
    emoji: "🎬",
    styleSlot: "open_genre",
    workTypes: ["videos", "clips", "scenes"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "videos / clips",
    accentColor: "#00E5C8",
  },
  {
    id: "comedy_set",
    label: "Comedy Set Challenge",
    cardBadge: "COMEDY CHALLENGE",
    emoji: "😂",
    styleSlot: "comedy",
    workTypes: ["comedy_sets", "videos", "clips"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "comedy sets",
    accentColor: "#FFD700",
  },
  {
    id: "streamer_vod",
    label: "Streamer VOD Challenge",
    cardBadge: "VOD CHALLENGE",
    emoji: "📺",
    styleSlot: "open_genre",
    workTypes: ["streamer_vods", "videos", "clips"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "VODs",
    accentColor: "#AA2DFF",
  },
  {
    id: "instrumental",
    label: "Instrumental Recording Challenge",
    cardBadge: "INSTRUMENTAL",
    emoji: "🎼",
    styleSlot: "instrumental",
    workTypes: ["instrumental_recordings", "songs"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "instrumental works",
    accentColor: "#AA2DFF",
  },
  {
    id: "producer_beat",
    label: "Producer Beat Challenge",
    cardBadge: "BEAT VS BEAT",
    emoji: "🎛️",
    styleSlot: "producer",
    workTypes: ["producer_beats", "songs"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "beats",
    accentColor: "#FFD700",
  },
  {
    id: "dj_mix",
    label: "DJ Mix Challenge",
    cardBadge: "DJ MIX",
    emoji: "🎧",
    styleSlot: "dj",
    workTypes: ["dj_mixes", "songs"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "mixes",
    accentColor: "#00FFFF",
  },
  {
    id: "band_group",
    label: "Band / Group Challenge",
    cardBadge: "BAND VS BAND",
    emoji: "🎸",
    styleSlot: "band",
    workTypes: ["band_submissions", "songs", "videos"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "band works",
    accentColor: "#FF6600",
  },
  {
    id: "country",
    label: "Country Challenge",
    cardBadge: "COUNTRY",
    emoji: "🤠",
    styleSlot: "country",
    workTypes: ["songs", "videos", "clips"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "works",
    accentColor: "#FFD700",
  },
  {
    id: "rock",
    label: "Rock Challenge",
    cardBadge: "ROCK",
    emoji: "🤘",
    styleSlot: "rock",
    workTypes: ["songs", "videos", "band_submissions"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "works",
    accentColor: "#FF6600",
  },
  {
    id: "gospel",
    label: "Gospel Challenge",
    cardBadge: "GOSPEL",
    emoji: "🙏",
    styleSlot: "gospel",
    workTypes: ["songs", "videos"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "works",
    accentColor: "#FFD700",
  },
  {
    id: "rnb",
    label: "R&B Challenge",
    cardBadge: "R&B",
    emoji: "🌹",
    styleSlot: "rnb",
    workTypes: ["songs", "videos", "clips"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "works",
    accentColor: "#AA2DFF",
  },
  {
    id: "pop",
    label: "Pop Challenge",
    cardBadge: "POP",
    emoji: "⭐",
    styleSlot: "pop",
    workTypes: ["songs", "videos", "clips"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "works",
    accentColor: "#00FFFF",
  },
  {
    id: "jazz",
    label: "Jazz Challenge",
    cardBadge: "JAZZ",
    emoji: "🎷",
    styleSlot: "jazz",
    workTypes: ["songs", "instrumental_recordings", "videos"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "works",
    accentColor: "#00FF88",
  },
  {
    id: "latin",
    label: "Latin Challenge",
    cardBadge: "LATIN",
    emoji: "🌴",
    styleSlot: "latin",
    workTypes: ["songs", "videos", "clips"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "works",
    accentColor: "#FFD700",
  },
  {
    id: "edm",
    label: "EDM Challenge",
    cardBadge: "EDM",
    emoji: "⚡",
    styleSlot: "edm",
    workTypes: ["songs", "dj_mixes", "producer_beats"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "works",
    accentColor: "#00FFFF",
  },
  {
    id: "dance",
    label: "Dance Video Challenge",
    cardBadge: "DANCE",
    emoji: "💃",
    styleSlot: "dance",
    workTypes: ["videos", "clips", "scenes"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "dance works",
    accentColor: "#FF1493",
  },
  {
    id: "ai_music",
    label: "AI Music Challenge",
    cardBadge: "AI MUSIC CHALLENGE",
    emoji: "🤖",
    styleSlot: "ai_music",
    workTypes: ["ai_songs", "ai_beats", "songs"],
    aiLane: true,
    needsWorks: 2,
    openCallRole: "AI works",
    accentColor: "#7C3AED",
  },
  {
    id: "creative_mixed",
    label: "Creative Mixed Challenge",
    cardBadge: "CREATIVE MIX",
    emoji: "🌀",
    styleSlot: "open_genre",
    workTypes: ["any_work"],
    humanOnly: true,
    needsWorks: 2,
    openCallRole: "works",
    accentColor: "#c084fc",
  },
] as const;

/** Idle rotation for human challenge anchors — excludes AI lane (dedicated room). */
export const CHALLENGE_IDLE_ROTATION_POOL: readonly PerformerStyleSlot[] = FULL_STYLE_ROTATION_POOL;

export function getChallengeDefinition(id: ChallengeLaneId): ChallengeDefinition | undefined {
  return CHALLENGE_DEFINITIONS.find((d) => d.id === id);
}

export function getAiMusicChallengeDefinition(): ChallengeDefinition {
  return CHALLENGE_DEFINITIONS.find((d) => d.id === "ai_music")!;
}

export function isAiMusicChallengeLane(id: ChallengeLaneId | string | null | undefined): boolean {
  return id === "ai_music";
}

/** Media Locker type filter for Content Picker. Song Challenge → songs only. */
export function contentPickerTypeFilter(
  def: ChallengeDefinition,
): string[] | null {
  if (def.songOnly) return ["songs"];
  if (def.aiLane) return ["ai_songs", "ai_beats", "songs", "beats"];
  if (def.workTypes.includes("any_work")) return null;
  return [...def.workTypes];
}

/** Honest lobby copy: Need 2 works · Genre/Style X */
export function buildChallengeOpenCallCopy(input: {
  styleSlot: PerformerStyleSlot | null | undefined;
  needsWorks?: number;
  openCallRole?: string;
  locked?: boolean;
  aiLane?: boolean;
  songOnly?: boolean;
}): string {
  const style = input.aiLane ? "AI Music" : styleLabel(input.styleSlot);
  const need = Math.max(2, input.needsWorks ?? 2);
  const role = input.openCallRole ?? (input.songOnly ? "songs" : "works");
  const lock = input.locked ? "LOCKED · " : "";
  const badge = input.aiLane ? "AI MUSIC CHALLENGE · " : "";
  return `${lock}${badge}Need ${need} ${role} · ${style}`;
}

export function listChallengeFormats(): readonly ChallengeDefinition[] {
  return CHALLENGE_DEFINITIONS;
}

export function listHumanChallengeFormats(): ChallengeDefinition[] {
  return CHALLENGE_DEFINITIONS.filter((d) => !d.aiLane);
}
