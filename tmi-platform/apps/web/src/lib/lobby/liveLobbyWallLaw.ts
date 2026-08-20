/**
 * Live Lobby Wall law — category tabs, ExperienceRoom mapping, fan-lobby search gate.
 * Reuses LiveDiscoveryRecord categories + ExperienceRoomRegistry classes (Rule 8).
 */

import type { LobbyCategoryPill } from "@/components/lobby/LobbyCategoryPillRow";
import type { LiveDiscoveryCategory, LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";
import type { ExperienceClass } from "@/lib/live/ExperienceRoomRegistry";
import {
  CANONICAL_GENRE_IDS,
  type CanonicalGenreId,
  type GenreLobbySide,
  getGenreRoomByRoomId,
} from "@/lib/live/CanonicalGenreRegistry";
import { LOUNGE_VIDEO_PRESENCE_LAW } from "@/lib/live/loungeVideoPresenceLaw";
import { isPublicPerformerLobbyDiscovery } from "@/lib/venue-hud/loungeContainer";

/** Primary in-shell category switch — QP-10 LOBBIES mosaic lens order (locked 2026-08-19). */
export type LobbyWallCoreCategoryId =
  | "cyphers"
  | "challenges"
  | "lives"
  | "battles"
  | "lounges"
  | "performer_lobbies"
  | "fan_avatar_lobbies";

export const LOBBY_WALL_CORE_CATEGORY_TABS: readonly LobbyCategoryPill[] = [
  { id: "cyphers", label: "Cyphers", icon: "🎤", accentColor: "#AA2DFF" },
  { id: "challenges", label: "Challenges", icon: "🎯", accentColor: "#FF6B35" },
  { id: "lives", label: "Lives", icon: "🔴", accentColor: "#FF3B5C" },
  { id: "battles", label: "Battles", icon: "⚔️", accentColor: "#FF2DAA" },
  { id: "lounges", label: "Lounges", icon: "🛋️", accentColor: "#00FFFF" },
  { id: "performer_lobbies", label: "Performer Lobbies", icon: "🎤", accentColor: "#FFD700" },
  { id: "fan_avatar_lobbies", label: "Fan Avatar Lobbies", icon: "👥", accentColor: "#00E5FF" },
] as const;

const ARENA_DISCOVERY_CATEGORIES = new Set<LiveDiscoveryCategory>([
  "battles",
  "challenges",
  "cyphers",
]);

const LIVE_GENERAL_CATEGORIES = new Set<LiveDiscoveryCategory>([
  "live_now",
  "concerts",
  "dance",
  "games",
  "comedy",
  "djs",
  "videos",
  "worldwide",
]);

/** Maps wall tab → LiveDiscoveryCategory (GlobalLiveSessionRegistry / DiscoveryBus). */
export const WALL_TAB_TO_DISCOVERY: Record<
  Exclude<LobbyWallCoreCategoryId, "lives" | "performer_lobbies" | "fan_avatar_lobbies">,
  LiveDiscoveryCategory
> = {
  battles: "battles",
  challenges: "challenges",
  cyphers: "cyphers",
  lounges: "lounges",
};

/** Maps wall tab → ExperienceRoomRegistry experience classes (canonical mill). */
export const WALL_TAB_TO_EXPERIENCE: Record<LobbyWallCoreCategoryId, readonly ExperienceClass[]> = {
  cyphers: ["CIPHER"],
  challenges: ["CHALLENGE"],
  lives: ["MAIN_AUDITORIUM"],
  battles: [
    "BATTLE_SONG",
    "BATTLE_DANCE_OFF",
    "BATTLE_JOKE_OFF",
    "BATTLE_GIBBERISH",
    "BATTLE_SCAT_JAZZ",
    "BATTLE_INSTRUMENT",
    "BATTLE_DJ",
    "BATTLE_PRODUCER",
  ],
  lounges: ["LOUNGE_SIDE_ROOM"],
  performer_lobbies: ["PERFORMER_LOBBY"],
  fan_avatar_lobbies: ["FAN_AVATAR_LOBBY"],
};

function recordHasArenaCategory(r: LiveDiscoveryRecord): boolean {
  return (
    ARENA_DISCOVERY_CATEGORIES.has(r.category) ||
    r.categories.some((c) => ARENA_DISCOVERY_CATEGORIES.has(c))
  );
}

function recordHasLiveGeneralCategory(r: LiveDiscoveryRecord): boolean {
  return (
    LIVE_GENERAL_CATEGORIES.has(r.category) ||
    r.categories.some((c) => LIVE_GENERAL_CATEGORIES.has(c))
  );
}

function isListeningLoungeRecord(r: LiveDiscoveryRecord): boolean {
  return r.category === "listening" || r.categories.includes("listening");
}

export const LOBBY_WALL_MOBILE_ROAM_LAW = {
  enabled: true,
  /** Pan surface only — WebRTC preview binds stay subscribed (skin ≠ stream restart). */
  streamRestartOnPan: false,
  collisionMeshCertified: LOUNGE_VIDEO_PRESENCE_LAW.collisionMeshCertified,
  patternSource: "loungeVideoPresenceLaw.ts + SpatialVideoPresenceDirector",
} as const;

/** Roles that may search/join Fan Avatar Lobby rooms (Rule 26 — Prisma enum). */
const FAN_LOBBY_SEARCH_ROLES = new Set(["FAN", "BAND", "USER"]);

export function canSearchFanAvatarLobbies(role: string | null | undefined): boolean {
  if (!role) return false;
  return FAN_LOBBY_SEARCH_ROLES.has(role.trim().toUpperCase());
}

export function isFanAvatarLobbyRecord(r: LiveDiscoveryRecord): boolean {
  if (r.category === "fan_lobbies" || r.categories.includes("fan_lobbies")) return true;
  const fam = (r.anchorFamily ?? "").toLowerCase();
  if (fam === "fan_genre_lobby" || fam === "fan-lobby" || fam === "fan_lobby") return true;
  const def = getGenreRoomByRoomId(r.roomId);
  if (def?.side === "FAN") return true;
  return r.roomId.startsWith("fan-avatar-lobby-");
}

/** Fan Avatar Lobby only — excludes LOUNGE_SIDE_ROOM / playlist lounges. */
export function isLoungeSideRoomRecord(r: LiveDiscoveryRecord): boolean {
  if (r.category === "lounges" || r.categories.includes("lounges")) return true;
  const fam = (r.anchorFamily ?? "").toLowerCase();
  return fam === "playlist_lounge" || fam === "conversation_lounge" || fam === "lounge";
}

export function isPerformerLobbyRecord(r: LiveDiscoveryRecord): boolean {
  if (isFanAvatarLobbyRecord(r)) return false;
  if (isLoungeSideRoomRecord(r) && !isPublicPerformerLobbyDiscovery(r)) return false;
  return isPublicPerformerLobbyDiscovery({
    visibility: r.visibility,
    anchorFamily: r.anchorFamily,
    category: r.category,
    roomId: r.roomId,
  });
}

export function filterDiscoveryByWallCategory(
  records: LiveDiscoveryRecord[],
  categoryId: LobbyWallCoreCategoryId,
): LiveDiscoveryRecord[] {
  if (categoryId === "performer_lobbies") {
    return records.filter((r) => isPerformerLobbyRecord(r));
  }
  if (categoryId === "fan_avatar_lobbies") {
    return records.filter((r) => isFanAvatarLobbyRecord(r) && !isLoungeSideRoomRecord(r));
  }
  if (categoryId === "lives") {
    return records.filter((r) => {
      if (
        isFanAvatarLobbyRecord(r) ||
        isPerformerLobbyRecord(r) ||
        isLoungeSideRoomRecord(r) ||
        isListeningLoungeRecord(r)
      ) {
        return false;
      }
      if (recordHasArenaCategory(r)) return false;
      return recordHasLiveGeneralCategory(r) || (r.isLive && !recordHasArenaCategory(r));
    });
  }
  if (categoryId === "lounges") {
    return records.filter((r) => {
      if (isPerformerLobbyRecord(r) || isFanAvatarLobbyRecord(r)) return false;
      return isLoungeSideRoomRecord(r) || isListeningLoungeRecord(r);
    });
  }
  const target = WALL_TAB_TO_DISCOVERY[categoryId];
  return records.filter(
    (r) =>
      (r.category === target || r.categories.includes(target)) &&
      !isPerformerLobbyRecord(r) &&
      !isFanAvatarLobbyRecord(r),
  );
}

/** Advance category tab — used by horizontal swipe on mobile mosaic. */
export function advanceLobbyWallCategory(
  current: LobbyWallCoreCategoryId,
  direction: "next" | "prev",
): LobbyWallCoreCategoryId {
  const tabs = LOBBY_WALL_CORE_CATEGORY_TABS;
  const idx = tabs.findIndex((t) => t.id === current);
  const base = idx >= 0 ? idx : 0;
  const next =
    direction === "next"
      ? (base + 1) % tabs.length
      : (base - 1 + tabs.length) % tabs.length;
  return tabs[next]!.id as LobbyWallCoreCategoryId;
}

export function filterFanAvatarLobbySearch(
  records: LiveDiscoveryRecord[],
  query: string,
): LiveDiscoveryRecord[] {
  const q = query.trim().toLowerCase();
  const fanLobbies = records.filter(
    (r) => isFanAvatarLobbyRecord(r) && !isLoungeSideRoomRecord(r),
  );
  if (!q) return fanLobbies;
  return fanLobbies.filter((r) => {
    const hay = `${r.title} ${r.hostName} ${r.roomId}`.toLowerCase();
    return hay.includes(q);
  });
}

/** Map overlay / discovery category → core wall tab (defaults lives). */
export function mapDiscoveryToWallCategory(
  category: LiveDiscoveryCategory | null | undefined,
): LobbyWallCoreCategoryId {
  if (category === "challenges") return "challenges";
  if (category === "cyphers") return "cyphers";
  if (category === "lounges" || category === "listening") return "lounges";
  if (category === "fan_lobbies") return "fan_avatar_lobbies";
  if (category === "live_now" || category === "concerts" || category === "worldwide") return "lives";
  if (category === "battles") return "battles";
  return "lives";
}

/** Fan | Performer side tabs for 30-room genre baseline (Marcel lock 2026-08-19). */
export type GenreLobbyWallSide = GenreLobbySide;

export const GENRE_LOBBY_WALL_SIDE_TABS: readonly LobbyCategoryPill[] = [
  { id: "FAN", label: "Fan Lobbies", icon: "👥", accentColor: "#00FFFF" },
  { id: "PERFORMER", label: "Performer Lobbies", icon: "🎤", accentColor: "#FFD700" },
] as const;

export const GENRE_LOBBY_WALL_GENRE_PILLS: readonly LobbyCategoryPill[] = [
  { id: "all", label: "All Genres", icon: "🌐", accentColor: "#AA2DFF" },
  ...CANONICAL_GENRE_IDS.map((id) => ({
    id,
    label: id.replace(/_/g, " "),
    icon: "🎵" as const,
    accentColor: "#00FFFF",
  })),
];

export function isFanGenreLobbyRecord(r: LiveDiscoveryRecord): boolean {
  const def = getGenreRoomByRoomId(r.roomId);
  if (def?.side === "FAN") return true;
  const fam = (r.anchorFamily ?? "").toLowerCase();
  return fam === "fan_genre_lobby";
}

export function isPerformerGenreLobbyRecord(r: LiveDiscoveryRecord): boolean {
  const def = getGenreRoomByRoomId(r.roomId);
  if (def?.side === "PERFORMER") return true;
  return isPerformerLobbyRecord(r) && r.roomId.startsWith("performer-lobby-");
}

export function filterDiscoveryByGenreLobbySide(
  records: LiveDiscoveryRecord[],
  side: GenreLobbyWallSide,
): LiveDiscoveryRecord[] {
  return records.filter((r) =>
    side === "FAN" ? isFanGenreLobbyRecord(r) : isPerformerGenreLobbyRecord(r),
  );
}

export function filterDiscoveryByGenreId(
  records: LiveDiscoveryRecord[],
  genreId: CanonicalGenreId | "all",
): LiveDiscoveryRecord[] {
  if (genreId === "all") return records;
  return records.filter((r) => {
    const def = getGenreRoomByRoomId(r.roomId);
    if (def) return def.genreId === genreId;
    return r.featuredCategory === genreId;
  });
}
