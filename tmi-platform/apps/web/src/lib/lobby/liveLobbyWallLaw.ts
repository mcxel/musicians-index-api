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

/** Primary in-shell category switch — Battles | Challenges | Cyphers | Lounges | Performer Lobbies */
export type LobbyWallCoreCategoryId =
  | "battles"
  | "challenges"
  | "cyphers"
  | "lounges"
  | "performer_lobbies";

export const LOBBY_WALL_CORE_CATEGORY_TABS: readonly LobbyCategoryPill[] = [
  { id: "battles", label: "Battles", icon: "⚔️", accentColor: "#FF2DAA" },
  { id: "challenges", label: "Challenges", icon: "🎯", accentColor: "#FF6B35" },
  { id: "cyphers", label: "Cyphers", icon: "🎤", accentColor: "#AA2DFF" },
  { id: "lounges", label: "Lounges", icon: "🛋️", accentColor: "#00FFFF" },
  { id: "performer_lobbies", label: "Performer Lobbies", icon: "🎤", accentColor: "#FFD700" },
] as const;

/** Maps wall tab → LiveDiscoveryCategory (GlobalLiveSessionRegistry / DiscoveryBus). */
export const WALL_TAB_TO_DISCOVERY: Record<LobbyWallCoreCategoryId, LiveDiscoveryCategory> = {
  battles: "battles",
  challenges: "challenges",
  cyphers: "cyphers",
  lounges: "lounges",
  performer_lobbies: "lounges",
};

/** Maps wall tab → ExperienceRoomRegistry experience classes (canonical mill). */
export const WALL_TAB_TO_EXPERIENCE: Record<LobbyWallCoreCategoryId, readonly ExperienceClass[]> = {
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
  challenges: ["CHALLENGE"],
  cyphers: ["CIPHER"],
  lounges: ["LOUNGE_SIDE_ROOM"],
  performer_lobbies: ["PERFORMER_LOBBY"],
};

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
  const target = WALL_TAB_TO_DISCOVERY[categoryId];
  return records.filter(
    (r) =>
      (r.category === target || r.categories.includes(target)) &&
      !isPerformerLobbyRecord(r),
  );
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

/** Map overlay / discovery category → core wall tab (defaults battles). */
export function mapDiscoveryToWallCategory(
  category: LiveDiscoveryCategory | null | undefined,
): LobbyWallCoreCategoryId {
  if (category === "challenges") return "challenges";
  if (category === "cyphers") return "cyphers";
  if (category === "lounges") return "lounges";
  if (category === "fan_lobbies") return "lounges";
  return "battles";
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
