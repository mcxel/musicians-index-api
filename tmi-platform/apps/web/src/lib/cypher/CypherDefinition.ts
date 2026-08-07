/**
 * CypherDefinition — all music / performer styles for cypher rooms.
 * Circles are NOT hip-hop-only: bands, country, DJ B2B, producers, instruments, open mix.
 */

import {
  FULL_STYLE_ROTATION_POOL,
  INSTRUMENTALIST_ROTATION_POOL,
  type PerformerStyleSlot,
  styleLabel,
} from "@/lib/competition/PerformerStyleSlots";

export type CypherFormatId =
  | "hip_hop_freestyle"
  | "rock_band"
  | "country_singer"
  | "rnb_vocal"
  | "gospel_vocal"
  | "pop_vocal"
  | "jazz_improv"
  | "latin_rhythm"
  | "edm_drop"
  | "beat_producer"
  | "dj_b2b"
  | "drums_trade"
  | "guitar_trade"
  | "horns_trade"
  | "keys_trade"
  | "instrumental_open"
  | "open_mixed"
  | "quirky_creative";

export type CypherDefinition = {
  id: CypherFormatId;
  label: string;
  emoji: string;
  styleSlot: PerformerStyleSlot;
  /** Open-call role copy, e.g. "MCs", "bands", "DJs". */
  openCallRole: string;
  /** Honest minimum performers to start. */
  needsPerformers: number;
  beatHint: string;
  entryHint: string;
  accentColor: string;
  quirky?: boolean;
};

export const CYPHER_DEFINITIONS: readonly CypherDefinition[] = [
  {
    id: "hip_hop_freestyle",
    label: "Hip-Hop / Freestyle MC",
    emoji: "🎤",
    styleSlot: "hip_hop",
    openCallRole: "MCs",
    needsPerformers: 3,
    beatHint: "House beat or rotating cypher beat",
    entryHint: "1 min freestyle turn",
    accentColor: "#FF2DAA",
  },
  {
    id: "rock_band",
    label: "Rock Band Cypher",
    emoji: "🎸",
    styleSlot: "band",
    openCallRole: "bands / groups",
    needsPerformers: 3,
    beatHint: "Live preferred — groups take turns",
    entryHint: "One group sings → next → next",
    accentColor: "#FF6600",
  },
  {
    id: "country_singer",
    label: "Country Singer Cypher",
    emoji: "🤠",
    styleSlot: "country",
    openCallRole: "country singers",
    needsPerformers: 3,
    beatHint: "Acoustic / house country bed optional",
    entryHint: "90 sec vocal turn",
    accentColor: "#FFD700",
  },
  {
    id: "rnb_vocal",
    label: "R&B Vocal Cypher",
    emoji: "🌹",
    styleSlot: "rnb",
    openCallRole: "vocalists",
    needsPerformers: 3,
    beatHint: "Backing track or keys",
    entryHint: "90 sec live vocal",
    accentColor: "#AA2DFF",
  },
  {
    id: "gospel_vocal",
    label: "Gospel Cypher",
    emoji: "🙏",
    styleSlot: "gospel",
    openCallRole: "voices",
    needsPerformers: 3,
    beatHint: "Praise bed optional",
    entryHint: "Solo or group turn",
    accentColor: "#FFD700",
  },
  {
    id: "pop_vocal",
    label: "Pop Vocal Cypher",
    emoji: "⭐",
    styleSlot: "pop",
    openCallRole: "pop vocalists",
    needsPerformers: 3,
    beatHint: "Backing track",
    entryHint: "Polished 90 sec turn",
    accentColor: "#00FFFF",
  },
  {
    id: "jazz_improv",
    label: "Jazz Improv Cypher",
    emoji: "🎷",
    styleSlot: "jazz",
    openCallRole: "players / vocalists",
    needsPerformers: 3,
    beatHint: "Live only — no fixed beat",
    entryHint: "Improv solos trade",
    accentColor: "#00FF88",
  },
  {
    id: "latin_rhythm",
    label: "Latin Rhythm Cypher",
    emoji: "🌴",
    styleSlot: "latin",
    openCallRole: "performers",
    needsPerformers: 3,
    beatHint: "Rhythm bed / live percussion",
    entryHint: "90 sec rhythm turn",
    accentColor: "#FFD700",
  },
  {
    id: "edm_drop",
    label: "EDM Drop Cypher",
    emoji: "⚡",
    styleSlot: "edm",
    openCallRole: "producers / DJs",
    needsPerformers: 3,
    beatHint: "Producer / DJ submits drop",
    entryHint: "60 sec drop or live mix",
    accentColor: "#00FFFF",
  },
  {
    id: "beat_producer",
    label: "Beat Producer Cypher",
    emoji: "🎛️",
    styleSlot: "producer",
    openCallRole: "producers",
    needsPerformers: 3,
    beatHint: "Producer submits beat",
    entryHint: "Beat presentation turn",
    accentColor: "#FFD700",
  },
  {
    id: "dj_b2b",
    label: "DJ Cypher (B2B)",
    emoji: "🎧",
    styleSlot: "dj",
    openCallRole: "DJs",
    needsPerformers: 2,
    beatHint: "Back-to-back decks",
    entryHint: "DJ takes the decks → next DJ",
    accentColor: "#00FFFF",
  },
  {
    id: "drums_trade",
    label: "Drums Trade Cypher",
    emoji: "🥁",
    styleSlot: "drums",
    openCallRole: "drummers",
    needsPerformers: 3,
    beatHint: "Live drums / click optional",
    entryHint: "Bars / solos trade",
    accentColor: "#FF8C00",
  },
  {
    id: "guitar_trade",
    label: "Guitar Trade Cypher",
    emoji: "🎸",
    styleSlot: "guitar",
    openCallRole: "guitarists",
    needsPerformers: 3,
    beatHint: "Backing or live rhythm",
    entryHint: "Solo trade",
    accentColor: "#FF2DAA",
  },
  {
    id: "horns_trade",
    label: "Horns Trade Cypher",
    emoji: "🎺",
    styleSlot: "horns",
    openCallRole: "horn players",
    needsPerformers: 3,
    beatHint: "Live or bed",
    entryHint: "Horn solo trade",
    accentColor: "#FFD700",
  },
  {
    id: "keys_trade",
    label: "Keys Trade Cypher",
    emoji: "🎹",
    styleSlot: "keys",
    openCallRole: "keys players",
    needsPerformers: 3,
    beatHint: "Live keys",
    entryHint: "Keys solo trade",
    accentColor: "#AA2DFF",
  },
  {
    id: "instrumental_open",
    label: "Instrumental Cypher",
    emoji: "🎼",
    styleSlot: "instrumental",
    openCallRole: "instrumentalists",
    needsPerformers: 3,
    beatHint: "Any instrument — no required vocals",
    entryHint: "Trade bars / solos",
    accentColor: "#AA2DFF",
  },
  {
    id: "open_mixed",
    label: "Open / Mixed Genre Cypher",
    emoji: "🌊",
    styleSlot: "open_genre",
    openCallRole: "performers",
    needsPerformers: 4,
    beatHint: "House beat or BYOM",
    entryHint: "Any style welcome",
    accentColor: "#00FF88",
  },
  {
    id: "quirky_creative",
    label: "Quirky Creative Cypher",
    emoji: "🌀",
    styleSlot: "open_genre",
    openCallRole: "creatives",
    needsPerformers: 3,
    beatHint: "Theme rotates — weird welcome",
    entryHint: "Creative / quirky turns",
    accentColor: "#c084fc",
    quirky: true,
  },
] as const;

export const CYPHER_IDLE_ROTATION_POOL: readonly PerformerStyleSlot[] = FULL_STYLE_ROTATION_POOL;

export const CYPHER_INSTRUMENTAL_ROTATION_POOL: readonly PerformerStyleSlot[] =
  INSTRUMENTALIST_ROTATION_POOL;

export function getCypherDefinition(id: CypherFormatId): CypherDefinition | undefined {
  return CYPHER_DEFINITIONS.find((d) => d.id === id);
}

export function getCypherDefinitionByStyle(
  slot: PerformerStyleSlot,
): CypherDefinition | undefined {
  return CYPHER_DEFINITIONS.find((d) => d.styleSlot === slot);
}

/** Honest lobby / open-call line. Never invents joined counts. */
export function buildCypherOpenCallCopy(input: {
  styleSlot: PerformerStyleSlot | null | undefined;
  needsPerformers: number;
  openCallRole?: string;
  humanJoined?: number;
  locked?: boolean;
}): string {
  const style = styleLabel(input.styleSlot);
  const role = input.openCallRole ?? "performers";
  const need = Math.max(1, input.needsPerformers);
  const joined = Math.max(0, input.humanJoined ?? 0);
  const remaining = Math.max(0, need - joined);
  const lock = input.locked ? "LOCKED · " : "";
  if (remaining > 0) {
    return `${lock}${style} · Needs ${remaining} ${role}`;
  }
  return `${lock}${style} · Roster full · Cypher ready`;
}

export function listCypherFormats(): readonly CypherDefinition[] {
  return CYPHER_DEFINITIONS;
}
