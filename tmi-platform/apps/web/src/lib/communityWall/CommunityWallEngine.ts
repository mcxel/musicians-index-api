/**
 * CommunityWallEngine — layout + progressive append helpers (presentation authority).
 * Does not own post persistence or moderation — consumers wire those.
 */

import {
  type CommunityWallChannel,
  type CommunityWallDataClass,
  type CommunityWallMotionLevel,
  type CommunityWallNote,
  type CommunityWallNoteColor,
  type CommunityWallNoteShape,
  type CommunityWallTheme,
  defaultThemeForChannel,
  noteColumnSpan,
} from "./CommunityWallContracts";

export type CommunityWallLayoutItem = CommunityWallNote & {
  columnSpan: 1 | 2;
};

export function layoutWallNotes(notes: readonly CommunityWallNote[]): CommunityWallLayoutItem[] {
  return notes.map((n) => ({
    ...n,
    columnSpan: noteColumnSpan(n.body.length, n.featured),
  }));
}

/** Progressive append — never replace the list; never invent posts. */
export function appendWallBatch(
  existing: readonly CommunityWallNote[],
  nextBatch: readonly CommunityWallNote[],
): CommunityWallNote[] {
  const seen = new Set(existing.map((n) => n.id));
  const merged = [...existing];
  for (const n of nextBatch) {
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    merged.push(n);
  }
  return merged;
}

export function resolveMotionLevel(input: {
  requested?: CommunityWallMotionLevel;
  reducedMotion?: boolean;
  isMobile?: boolean;
}): CommunityWallMotionLevel {
  if (input.reducedMotion) return "STATIC";
  if (input.isMobile && (input.requested === "RICH" || input.requested === "IMMERSIVE")) {
    return "SUBTLE";
  }
  return input.requested ?? "STATIC";
}

export function createUserWallNote(input: {
  channel: CommunityWallChannel;
  authorLabel: string;
  body: string;
  shape: CommunityWallNoteShape;
  color: CommunityWallNoteColor;
  dataClass?: CommunityWallDataClass;
  id?: string;
  originalLanguage?: string;
}): CommunityWallNote {
  const now = new Date();
  return {
    id: input.id ?? `wall-${now.getTime()}`,
    channel: input.channel,
    authorLabel: input.authorLabel.trim() || "You",
    body: input.body.trim(),
    createdAtIso: now.toISOString(),
    relativeTimeLabel: "Just now",
    shape: input.shape,
    color: input.color,
    dataClass: input.dataClass ?? "USER_SESSION",
    originalLanguage: input.originalLanguage ?? "und",
    contentVersion: 1,
  };
}

/**
 * Global-together seed wall — many languages, ONE community (§9753).
 * Honest SEED classification — not live production activity.
 */
export function magazineArticleGossipSeeds(): CommunityWallNote[] {
  return [
    {
      id: "seed-gossip-es-1",
      channel: "COMMUNITY_GOSSIP",
      authorLabel: "Sofia_CDMX",
      body: "Esa línea sobre el voltaje en las botas es pura verdad. Nada supera un cuarto en vivo.",
      createdAtIso: "2026-06-01T12:00:00.000Z",
      relativeTimeLabel: "2h ago",
      shape: "POSTER",
      color: "GOLD",
      dataClass: "SEED",
      originalLanguage: "es",
      contentVersion: 1,
    },
    {
      id: "seed-gossip-en-1",
      channel: "COMMUNITY_GOSSIP",
      authorLabel: "Marcus_V",
      body: "That line about the voltage through your boots is so true. Nothing beats a live room.",
      createdAtIso: "2026-06-01T11:40:00.000Z",
      relativeTimeLabel: "2h ago",
      shape: "STICKY",
      color: "PAPER_WHITE",
      dataClass: "SEED",
      originalLanguage: "en",
      contentVersion: 1,
    },
    {
      id: "seed-gossip-ja-1",
      channel: "COMMUNITY_GOSSIP",
      authorLabel: "Yuki_Osaka",
      body: "ライブの熱量がすごかった。また絶対行く。",
      createdAtIso: "2026-06-01T10:00:00.000Z",
      relativeTimeLabel: "4h ago",
      shape: "CLOUD",
      color: "CYAN",
      dataClass: "SEED",
      originalLanguage: "ja",
      contentVersion: 1,
    },
    {
      id: "seed-gossip-fr-1",
      channel: "COMMUNITY_GOSSIP",
      authorLabel: "Léa_Paris",
      body: "Respect énorme à tous les artistes indépendants qui tiennent le mur ce soir.",
      createdAtIso: "2026-06-01T08:00:00.000Z",
      relativeTimeLabel: "6h ago",
      shape: "ROUNDED",
      color: "LAVENDER",
      dataClass: "SEED",
      originalLanguage: "fr",
      contentVersion: 1,
    },
  ];
}

export function magazineHappyDaysSeeds(): CommunityWallNote[] {
  return [
    {
      id: "seed-happy-pt-1",
      channel: "HAPPY_DAYS",
      authorLabel: "NeighborhoodChoir",
      body: "Minha prima conseguiu o primeiro show pago. Choramos de alegria na cozinha.",
      createdAtIso: "2026-06-01T14:00:00.000Z",
      relativeTimeLabel: "1h ago",
      shape: "ROUNDED",
      color: "SUNSHINE",
      dataClass: "SEED",
      originalLanguage: "pt",
      contentVersion: 1,
    },
    {
      id: "seed-happy-ko-1",
      channel: "HAPPY_DAYS",
      authorLabel: "DJSunrise",
      body: "오늘 새로운 리스너에게 플레이리스트를 나눠준 모두에게 박수!",
      createdAtIso: "2026-06-01T11:00:00.000Z",
      relativeTimeLabel: "3h ago",
      shape: "CLOUD",
      color: "MINT",
      dataClass: "SEED",
      originalLanguage: "ko",
      contentVersion: 1,
    },
    {
      id: "seed-happy-en-1",
      channel: "HAPPY_DAYS",
      authorLabel: "RiverFan",
      body: "Shout-out to everyone who shared a playlist with a new listener today. Tiny wins count.",
      createdAtIso: "2026-06-01T10:30:00.000Z",
      relativeTimeLabel: "3h ago",
      shape: "STAR",
      color: "CORAL",
      dataClass: "SEED",
      originalLanguage: "en",
      contentVersion: 1,
    },
  ];
}

export function themeForWall(channel: CommunityWallChannel): CommunityWallTheme {
  return defaultThemeForChannel(channel);
}

export const COMMUNITY_WALL_SHAPE_OPTIONS: CommunityWallNoteShape[] = [
  "RECTANGLE",
  "ROUNDED",
  "SQUARE",
  "CLOUD",
  "POSTER",
  "STICKY",
  "PILL",
  "STAR",
];

export const COMMUNITY_WALL_COLOR_OPTIONS: CommunityWallNoteColor[] = [
  "PAPER_WHITE",
  "GOLD",
  "CYAN",
  "FUCHSIA",
  "LAVENDER",
  "SUNSHINE",
  "MINT",
  "CORAL",
];
