/**
 * CanonicalGenreRegistry — 30 system-operated baseline genre lobbies (Marcel lock 2026-08-19).
 *
 * 15 genres × 2 sides (FAN_AVATAR_LOBBY + PERFORMER_LOBBY) = 30 rooms.
 * ONE engine, data-driven GenreRoomDefinition — NOT 30 separate engines.
 *
 * Canonical3DRoomRuntime → FanLobbyPersonality | PerformerLobbyPersonality
 */

import type { PerformerLobbyMode } from "./performerLobbyModes";
import { FAN_LOBBY_PERSONALITY } from "./FanLobbyPersonality";
import { PERFORMER_LOBBY_PERSONALITY } from "./PerformerLobbyPersonality";
import { CANONICAL_WORLD_ZONE, type CanonicalWorldZone } from "./canonicalWorldViewport";
import type { ExperienceClass } from "./ExperienceRoomRegistry";

/** Main genres only — no subgenres (Marcel lock 2026-08-19). */
export type CanonicalGenreId =
  | "HIP_HOP"
  | "RNB_SOUL"
  | "POP"
  | "ROCK"
  | "COUNTRY"
  | "JAZZ"
  | "BLUES"
  | "GOSPEL"
  | "LATIN"
  | "REGGAE_DANCEHALL"
  | "ELECTRONIC_DANCE"
  | "ALTERNATIVE"
  | "CLASSICAL"
  | "WORLD_GLOBAL"
  | "COMEDY_SPOKEN";

/** @deprecated Use CanonicalGenreId */
export type PerformerGenreId = CanonicalGenreId;

export type GenreLobbySide = "FAN" | "PERFORMER";

/** Private visibility — never publish to Live Lobby Wall. */
export type PerformerLobbyPrivateMode =
  | "PRIVATE"
  | "INVITE_ONLY"
  | "TEAM"
  | "REHEARSAL_PRIVATE"
  | "AUDITION_PRIVATE";

export const PERFORMER_LOBBY_PRIVATE_MODES: readonly PerformerLobbyPrivateMode[] = [
  "PRIVATE",
  "INVITE_ONLY",
  "TEAM",
  "REHEARSAL_PRIVATE",
  "AUDITION_PRIVATE",
] as const;

export interface GenreRoomThemeKit {
  accentColor: string;
  floorGradient: string;
  borderColor: string;
  propAccent: string;
  label: string;
}

export interface CanonicalGenreRoomDefinition {
  genreId: CanonicalGenreId;
  label: string;
  side: GenreLobbySide;
  roomId: string;
  systemOperated: true;
  experienceClass: "FAN_AVATAR_LOBBY" | "PERFORMER_LOBBY";
  zone: CanonicalWorldZone;
  theme: GenreRoomThemeKit;
  /** Approved playlist / ambience slot — honest when empty. */
  ambiencePlaylistKey: string;
  hostBotId: string;
  guideBotId: string;
  hostBotLabel: string;
  guideBotLabel: string;
  publishesToWall: true;
  personalityId: typeof FAN_LOBBY_PERSONALITY.id | typeof PERFORMER_LOBBY_PERSONALITY.id;
  /** Performer side only */
  defaultMode?: PerformerLobbyMode;
}

/** @deprecated Use CanonicalGenreRoomDefinition */
export type GenreRoomDefinition = CanonicalGenreRoomDefinition;

function fanGenreRoomId(slug: string): string {
  return `fan-avatar-lobby-${slug}`;
}

function performerGenreRoomId(slug: string): string {
  return `performer-lobby-${slug}`;
}

const GENRE_SLUGS: Record<CanonicalGenreId, string> = {
  HIP_HOP: "hip-hop",
  RNB_SOUL: "rnb-soul",
  POP: "pop",
  ROCK: "rock",
  COUNTRY: "country",
  JAZZ: "jazz",
  BLUES: "blues",
  GOSPEL: "gospel",
  LATIN: "latin",
  REGGAE_DANCEHALL: "reggae-dancehall",
  ELECTRONIC_DANCE: "electronic-dance",
  ALTERNATIVE: "alternative",
  CLASSICAL: "classical",
  WORLD_GLOBAL: "world-global",
  COMEDY_SPOKEN: "comedy-spoken",
};

const GENRE_THEME: Record<CanonicalGenreId, GenreRoomThemeKit> = {
  HIP_HOP: {
    accentColor: "#FF2DAA",
    floorGradient:
      "radial-gradient(ellipse at 50% 18%, rgba(255,45,170,0.16), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)",
    borderColor: "rgba(255,45,170,0.32)",
    propAccent: "rgba(255,45,170,0.2)",
    label: "Hip-Hop",
  },
  RNB_SOUL: {
    accentColor: "#AA2DFF",
    floorGradient:
      "radial-gradient(ellipse at 50% 18%, rgba(170,45,255,0.14), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)",
    borderColor: "rgba(170,45,255,0.32)",
    propAccent: "rgba(170,45,255,0.2)",
    label: "R&B / Soul",
  },
  POP: {
    accentColor: "#00FFFF",
    floorGradient:
      "radial-gradient(ellipse at 50% 18%, rgba(0,255,255,0.14), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)",
    borderColor: "rgba(0,255,255,0.32)",
    propAccent: "rgba(0,255,255,0.2)",
    label: "Pop",
  },
  ROCK: {
    accentColor: "#FF6B35",
    floorGradient:
      "radial-gradient(ellipse at 50% 18%, rgba(255,107,53,0.14), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)",
    borderColor: "rgba(255,107,53,0.32)",
    propAccent: "rgba(255,107,53,0.2)",
    label: "Rock",
  },
  COUNTRY: {
    accentColor: "#FFD700",
    floorGradient:
      "radial-gradient(ellipse at 50% 18%, rgba(255,215,0,0.12), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)",
    borderColor: "rgba(255,215,0,0.28)",
    propAccent: "rgba(255,215,0,0.18)",
    label: "Country",
  },
  JAZZ: {
    accentColor: "#c084fc",
    floorGradient:
      "radial-gradient(ellipse at 50% 18%, rgba(192,132,252,0.14), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)",
    borderColor: "rgba(192,132,252,0.32)",
    propAccent: "rgba(192,132,252,0.2)",
    label: "Jazz",
  },
  BLUES: {
    accentColor: "#38bdf8",
    floorGradient:
      "radial-gradient(ellipse at 50% 18%, rgba(56,189,248,0.14), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)",
    borderColor: "rgba(56,189,248,0.32)",
    propAccent: "rgba(56,189,248,0.2)",
    label: "Blues",
  },
  GOSPEL: {
    accentColor: "#FFD700",
    floorGradient:
      "radial-gradient(ellipse at 50% 18%, rgba(255,215,0,0.16), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)",
    borderColor: "rgba(255,215,0,0.35)",
    propAccent: "rgba(255,215,0,0.22)",
    label: "Gospel",
  },
  LATIN: {
    accentColor: "#FF6B35",
    floorGradient:
      "radial-gradient(ellipse at 50% 18%, rgba(255,107,53,0.15), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)",
    borderColor: "rgba(255,107,53,0.32)",
    propAccent: "rgba(255,107,53,0.2)",
    label: "Latin",
  },
  REGGAE_DANCEHALL: {
    accentColor: "#00FF88",
    floorGradient:
      "radial-gradient(ellipse at 50% 18%, rgba(0,255,136,0.14), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)",
    borderColor: "rgba(0,255,136,0.32)",
    propAccent: "rgba(0,255,136,0.2)",
    label: "Reggae / Dancehall",
  },
  ELECTRONIC_DANCE: {
    accentColor: "#00FFFF",
    floorGradient:
      "radial-gradient(ellipse at 50% 18%, rgba(0,255,255,0.18), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)",
    borderColor: "rgba(0,255,255,0.38)",
    propAccent: "rgba(0,255,255,0.22)",
    label: "Electronic / Dance",
  },
  ALTERNATIVE: {
    accentColor: "#AA2DFF",
    floorGradient:
      "radial-gradient(ellipse at 50% 18%, rgba(170,45,255,0.13), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)",
    borderColor: "rgba(170,45,255,0.28)",
    propAccent: "rgba(170,45,255,0.18)",
    label: "Alternative",
  },
  CLASSICAL: {
    accentColor: "#e2e8f0",
    floorGradient:
      "radial-gradient(ellipse at 50% 18%, rgba(226,232,240,0.1), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)",
    borderColor: "rgba(226,232,240,0.25)",
    propAccent: "rgba(226,232,240,0.15)",
    label: "Classical",
  },
  WORLD_GLOBAL: {
    accentColor: "#FFAB00",
    floorGradient:
      "radial-gradient(ellipse at 50% 18%, rgba(255,171,0,0.14), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)",
    borderColor: "rgba(255,171,0,0.32)",
    propAccent: "rgba(255,171,0,0.2)",
    label: "World / Global",
  },
  COMEDY_SPOKEN: {
    accentColor: "#39FF14",
    floorGradient:
      "radial-gradient(ellipse at 50% 18%, rgba(57,255,20,0.12), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)",
    borderColor: "rgba(57,255,20,0.28)",
    propAccent: "rgba(57,255,20,0.18)",
    label: "Comedy / Spoken",
  },
};

function buildFanDef(genreId: CanonicalGenreId, slug: string): CanonicalGenreRoomDefinition {
  const theme = GENRE_THEME[genreId];
  return {
    genreId,
    label: theme.label,
    side: "FAN",
    roomId: fanGenreRoomId(slug),
    systemOperated: true,
    experienceClass: "FAN_AVATAR_LOBBY",
    zone: CANONICAL_WORLD_ZONE.FAN_AVATAR_LOBBY,
    theme,
    ambiencePlaylistKey: `fan-avatar-lobby-${slug}-ambience`,
    hostBotId: "fan-lobby-host-bot",
    guideBotId: "fan-lobby-guide-bot",
    hostBotLabel: "[BOT] TMI Host",
    guideBotLabel: "[BOT] TMI Guide",
    publishesToWall: true,
    personalityId: FAN_LOBBY_PERSONALITY.id,
  };
}

function buildPerformerDef(
  genreId: CanonicalGenreId,
  slug: string,
  defaultMode: PerformerLobbyMode = "SOCIAL",
): CanonicalGenreRoomDefinition {
  const theme = GENRE_THEME[genreId];
  return {
    genreId,
    label: theme.label,
    side: "PERFORMER",
    roomId: performerGenreRoomId(slug),
    systemOperated: true,
    experienceClass: "PERFORMER_LOBBY",
    zone: CANONICAL_WORLD_ZONE.PERFORMER_LOBBY,
    defaultMode,
    theme,
    ambiencePlaylistKey: `performer-lobby-${slug}-ambience`,
    hostBotId: "performer-lobby-host-bot",
    guideBotId: "performer-lobby-guide-bot",
    hostBotLabel: "[BOT] TMI Host",
    guideBotLabel: "[BOT] TMI Guide",
    publishesToWall: true,
    personalityId: PERFORMER_LOBBY_PERSONALITY.id,
  };
}

export const CANONICAL_GENRE_IDS: readonly CanonicalGenreId[] = Object.keys(
  GENRE_SLUGS,
) as CanonicalGenreId[];

/** @deprecated Use CANONICAL_GENRE_IDS */
export const PERFORMER_GENRE_IDS = CANONICAL_GENRE_IDS;

function buildAllGenreRooms(): CanonicalGenreRoomDefinition[] {
  const rooms: CanonicalGenreRoomDefinition[] = [];
  for (const genreId of CANONICAL_GENRE_IDS) {
    const slug = GENRE_SLUGS[genreId];
    rooms.push(buildFanDef(genreId, slug));
    rooms.push(
      buildPerformerDef(
        genreId,
        slug,
        genreId === "COMEDY_SPOKEN" ? "LISTENING" : "SOCIAL",
      ),
    );
  }
  return rooms;
}

export const CANONICAL_GENRE_ROOM_REGISTRY: readonly CanonicalGenreRoomDefinition[] =
  buildAllGenreRooms();

/** All 30 baseline roomIds — locked Marcel 2026-08-19. */
export const BASELINE_GENRE_LOBBY_ROOM_IDS: readonly string[] =
  CANONICAL_GENRE_ROOM_REGISTRY.map((d) => d.roomId);

/** Performer-side only map (backward compat). */
export const PERFORMER_GENRE_ROOM_REGISTRY: Record<CanonicalGenreId, CanonicalGenreRoomDefinition> =
  Object.fromEntries(
    CANONICAL_GENRE_ROOM_REGISTRY.filter((d) => d.side === "PERFORMER").map((d) => [d.genreId, d]),
  ) as Record<CanonicalGenreId, CanonicalGenreRoomDefinition>;

/** Fan-side only map. */
export const FAN_GENRE_ROOM_REGISTRY: Record<CanonicalGenreId, CanonicalGenreRoomDefinition> =
  Object.fromEntries(
    CANONICAL_GENRE_ROOM_REGISTRY.filter((d) => d.side === "FAN").map((d) => [d.genreId, d]),
  ) as Record<CanonicalGenreId, CanonicalGenreRoomDefinition>;

const ROOM_ID_INDEX = new Map<string, CanonicalGenreRoomDefinition>(
  CANONICAL_GENRE_ROOM_REGISTRY.map((d) => [d.roomId, d]),
);

export function getCanonicalGenreRoomDefinition(
  genreId: CanonicalGenreId,
  side: GenreLobbySide,
): CanonicalGenreRoomDefinition {
  return side === "FAN" ? FAN_GENRE_ROOM_REGISTRY[genreId] : PERFORMER_GENRE_ROOM_REGISTRY[genreId];
}

/** @deprecated Use getCanonicalGenreRoomDefinition(id, "PERFORMER") */
export function getGenreRoomDefinition(genreId: CanonicalGenreId): CanonicalGenreRoomDefinition {
  return PERFORMER_GENRE_ROOM_REGISTRY[genreId];
}

export function getGenreRoomByRoomId(roomId: string): CanonicalGenreRoomDefinition | null {
  const slug = (roomId ?? "").trim().toLowerCase();
  return ROOM_ID_INDEX.get(slug) ?? null;
}

export function listGenreRoomDefinitions(side?: GenreLobbySide): CanonicalGenreRoomDefinition[] {
  if (side === "FAN") return CANONICAL_GENRE_IDS.map((id) => FAN_GENRE_ROOM_REGISTRY[id]);
  if (side === "PERFORMER") return CANONICAL_GENRE_IDS.map((id) => PERFORMER_GENRE_ROOM_REGISTRY[id]);
  return [...CANONICAL_GENRE_ROOM_REGISTRY];
}

export function listCanonicalGenreIds(): readonly CanonicalGenreId[] {
  return CANONICAL_GENRE_IDS;
}

export function isCanonicalGenreRoomId(roomId: string): boolean {
  return getGenreRoomByRoomId(roomId) !== null;
}

export function isFanGenreRoomId(roomId: string): boolean {
  return getGenreRoomByRoomId(roomId)?.side === "FAN";
}

export function isPerformerGenreRoomId(roomId: string): boolean {
  return getGenreRoomByRoomId(roomId)?.side === "PERFORMER";
}

export function resolveGenreLobbyJoinHref(
  roomId: string,
  opts?: { from?: string },
): string {
  const def = getGenreRoomByRoomId(roomId);
  const from = opts?.from ?? "live-lobby-wall";
  if (!def) {
    return `/live/rooms/${encodeURIComponent(roomId)}?from=${encodeURIComponent(from)}`;
  }
  const params = new URLSearchParams();
  params.set("zone", def.zone);
  params.set("experienceClass", def.experienceClass);
  params.set("from", from);
  if (def.side === "PERFORMER") {
    params.set("mode", "performer-lobby");
  }
  return `/live/rooms/${encodeURIComponent(def.roomId)}?${params.toString()}`;
}

export function experienceClassForGenreRoom(roomId: string): ExperienceClass | null {
  return getGenreRoomByRoomId(roomId)?.experienceClass ?? null;
}

export function isPerformerLobbyPrivateMode(
  mode: string | null | undefined,
): mode is PerformerLobbyPrivateMode {
  const v = (mode ?? "").trim().toUpperCase().replace(/-/g, "_");
  return (PERFORMER_LOBBY_PRIVATE_MODES as readonly string[]).includes(v);
}

export function shouldPublishPerformerLobbyToWall(input: {
  visibility?: string | null;
  lobbyMode?: string | null;
}): boolean {
  const vis = (input.visibility ?? "public").toLowerCase();
  if (vis === "private" || vis === "invite" || vis === "invite_only") return false;
  if (isPerformerLobbyPrivateMode(input.lobbyMode)) return false;
  return true;
}
