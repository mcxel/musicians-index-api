/**
 * GauntletDefinition — Musical Gauntlet formats for all performer styles.
 * Vocalists, bands, DJs, producers, instrumentalists, dance, comedy, open mix.
 * Feature flags still gate discovery/entry via GauntletRoomRuntime.
 */

import {
  FULL_STYLE_ROTATION_POOL,
  INSTRUMENTALIST_ROTATION_POOL,
  type PerformerStyleSlot,
  styleLabel,
} from "@/lib/competition/PerformerStyleSlots";

export type GauntletFormatId =
  | "rap_vocal"
  | "sing_vocal"
  | "country_vocal"
  | "gospel_vocal"
  | "rnb_vocal"
  | "pop_vocal"
  | "band_group"
  | "dj_decks"
  | "producer_beats"
  | "drums"
  | "guitar"
  | "horns"
  | "keys"
  | "instrumental_open"
  | "dance"
  | "comedy"
  | "open_mixed";

export type GauntletDefinition = {
  id: GauntletFormatId;
  label: string;
  emoji: string;
  styleSlot: PerformerStyleSlot;
  openCallRole: string;
  /** Competitors needed to open a run (honest open-call). */
  needsCompetitors: number;
  turnHint: string;
  accentColor: string;
};

export const GAUNTLET_DEFINITIONS: readonly GauntletDefinition[] = [
  {
    id: "rap_vocal",
    label: "Rap / Freestyle Gauntlet",
    emoji: "🎤",
    styleSlot: "rap",
    openCallRole: "MCs",
    needsCompetitors: 8,
    turnHint: "One life · 30s turns",
    accentColor: "#FF2DAA",
  },
  {
    id: "sing_vocal",
    label: "Singer Gauntlet",
    emoji: "🎙️",
    styleSlot: "pop",
    openCallRole: "singers",
    needsCompetitors: 8,
    turnHint: "Vocal survival rounds",
    accentColor: "#00FFFF",
  },
  {
    id: "country_vocal",
    label: "Country Gauntlet",
    emoji: "🤠",
    styleSlot: "country",
    openCallRole: "country singers",
    needsCompetitors: 8,
    turnHint: "Country vocal turns",
    accentColor: "#FFD700",
  },
  {
    id: "gospel_vocal",
    label: "Gospel Gauntlet",
    emoji: "🙏",
    styleSlot: "gospel",
    openCallRole: "gospel voices",
    needsCompetitors: 8,
    turnHint: "Praise / solo survival",
    accentColor: "#FFD700",
  },
  {
    id: "rnb_vocal",
    label: "R&B Gauntlet",
    emoji: "🌹",
    styleSlot: "rnb",
    openCallRole: "R&B vocalists",
    needsCompetitors: 8,
    turnHint: "R&B vocal survival",
    accentColor: "#AA2DFF",
  },
  {
    id: "pop_vocal",
    label: "Pop Gauntlet",
    emoji: "⭐",
    styleSlot: "pop",
    openCallRole: "pop vocalists",
    needsCompetitors: 8,
    turnHint: "Pop performance turns",
    accentColor: "#00FFFF",
  },
  {
    id: "band_group",
    label: "Band / Group Gauntlet",
    emoji: "🎸",
    styleSlot: "band",
    openCallRole: "bands / groups",
    needsCompetitors: 4,
    turnHint: "Group takes turn → next group",
    accentColor: "#FF6600",
  },
  {
    id: "dj_decks",
    label: "DJ Gauntlet",
    emoji: "🎧",
    styleSlot: "dj",
    openCallRole: "DJs",
    needsCompetitors: 4,
    turnHint: "Deck survival · drop or die",
    accentColor: "#00FFFF",
  },
  {
    id: "producer_beats",
    label: "Producer / Beatmaker Gauntlet",
    emoji: "🎛️",
    styleSlot: "producer",
    openCallRole: "producers",
    needsCompetitors: 6,
    turnHint: "Beat presentation survival",
    accentColor: "#FFD700",
  },
  {
    id: "drums",
    label: "Drums Gauntlet",
    emoji: "🥁",
    styleSlot: "drums",
    openCallRole: "drummers",
    needsCompetitors: 6,
    turnHint: "Drum solo survival",
    accentColor: "#FF8C00",
  },
  {
    id: "guitar",
    label: "Guitar Gauntlet",
    emoji: "🎸",
    styleSlot: "guitar",
    openCallRole: "guitarists",
    needsCompetitors: 6,
    turnHint: "Guitar solo survival",
    accentColor: "#FF2DAA",
  },
  {
    id: "horns",
    label: "Horns Gauntlet",
    emoji: "🎺",
    styleSlot: "horns",
    openCallRole: "horn players",
    needsCompetitors: 6,
    turnHint: "Horn solo survival",
    accentColor: "#FFD700",
  },
  {
    id: "keys",
    label: "Keys Gauntlet",
    emoji: "🎹",
    styleSlot: "keys",
    openCallRole: "keys players",
    needsCompetitors: 6,
    turnHint: "Keys solo survival",
    accentColor: "#AA2DFF",
  },
  {
    id: "instrumental_open",
    label: "Instrumental Gauntlet",
    emoji: "🎼",
    styleSlot: "instrumental",
    openCallRole: "instrumentalists",
    needsCompetitors: 6,
    turnHint: "Any instrument · one life",
    accentColor: "#AA2DFF",
  },
  {
    id: "dance",
    label: "Dance Gauntlet",
    emoji: "💃",
    styleSlot: "dance",
    openCallRole: "dancers",
    needsCompetitors: 8,
    turnHint: "Dance survival rounds",
    accentColor: "#FF1493",
  },
  {
    id: "comedy",
    label: "Comedy Gauntlet",
    emoji: "😂",
    styleSlot: "comedy",
    openCallRole: "comics",
    needsCompetitors: 8,
    turnHint: "Joke-off survival",
    accentColor: "#FFD700",
  },
  {
    id: "open_mixed",
    label: "Open / Mixed Gauntlet",
    emoji: "🌊",
    styleSlot: "open_genre",
    openCallRole: "performers",
    needsCompetitors: 8,
    turnHint: "Any style · one life",
    accentColor: "#00FF88",
  },
] as const;

export const GAUNTLET_IDLE_ROTATION_POOL: readonly PerformerStyleSlot[] = [
  ...FULL_STYLE_ROTATION_POOL,
] as const;

export const GAUNTLET_INSTRUMENTAL_ROTATION_POOL: readonly PerformerStyleSlot[] =
  INSTRUMENTALIST_ROTATION_POOL;

export function getGauntletDefinition(id: GauntletFormatId): GauntletDefinition | undefined {
  return GAUNTLET_DEFINITIONS.find((d) => d.id === id);
}

export function getGauntletDefinitionByStyle(
  slot: PerformerStyleSlot,
): GauntletDefinition | undefined {
  return GAUNTLET_DEFINITIONS.find((d) => d.styleSlot === slot);
}

/** Honest wall / lobby copy. */
export function buildGauntletOpenCallCopy(input: {
  styleSlot: PerformerStyleSlot | null | undefined;
  needsCompetitors: number;
  openCallRole?: string;
  waitingCount?: number;
  locked?: boolean;
  runLive?: boolean;
}): string {
  const style = styleLabel(input.styleSlot);
  const role = input.openCallRole ?? "competitors";
  const need = Math.max(2, input.needsCompetitors);
  const waiting = Math.max(0, input.waitingCount ?? 0);
  const remaining = Math.max(0, need - waiting);
  const lock = input.locked ? "LOCKED · " : "";
  if (input.runLive) return `${lock}${style} · RUN LIVE · one life`;
  if (remaining > 0) return `${lock}${style} · Needs ${remaining} ${role}`;
  return `${lock}${style} · Ready to start · ${waiting} waiting`;
}

export function listGauntletFormats(): readonly GauntletDefinition[] {
  return GAUNTLET_DEFINITIONS;
}
