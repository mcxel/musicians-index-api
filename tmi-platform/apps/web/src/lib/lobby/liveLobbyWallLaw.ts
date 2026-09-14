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
import { isShowsOrReleaseDiscoveryCategory } from "@/lib/events/ScheduledEventRegistry";

/**
 * Primary in-shell category switch — QP-10 LOBBIES mosaic (locked 2026-08-19).
 * BROAD types only. Never section a mosaic by sub-genre / music-type chips —
 * one room can mix performers; tiles show country + genre + name so users pick visually.
 */
export type LobbyWallCoreCategoryId =
  | "challenges"
  | "battles"
  | "cyphers"
  | "world_dance_party"
  | "performer_lobbies"
  | "fan_avatar_lobbies"
  | "lounges"
  | "games"
  | "lives"
  | "shows_and_releases";

/** Canonical order: Challenges → Battles → Cyphers → World Dance → Performer Lobbies → … */
export const LOBBY_WALL_CORE_CATEGORY_TABS: readonly LobbyCategoryPill[] = [
  { id: "challenges", label: "Challenges", icon: "🎯", accentColor: "#FF6B35" },
  { id: "battles", label: "Battles", icon: "⚔️", accentColor: "#FF2DAA" },
  { id: "cyphers", label: "Cyphers", icon: "🎤", accentColor: "#AA2DFF" },
  { id: "world_dance_party", label: "World Dance", icon: "🌍", accentColor: "#00FF88" },
  { id: "performer_lobbies", label: "Performer Lobbies", icon: "🎸", accentColor: "#FFD700" },
  { id: "fan_avatar_lobbies", label: "Fan Lobbies", icon: "👥", accentColor: "#00FFFF" },
  { id: "lounges", label: "Lounges", icon: "🛋️", accentColor: "#00FFFF" },
  { id: "games", label: "Games", icon: "🎮", accentColor: "#22c55e" },
  { id: "lives", label: "Live", icon: "🔴", accentColor: "#FF3B5C" },
  { id: "shows_and_releases", label: "Shows & Releases", icon: "📺", accentColor: "#FFD700" },
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
  Exclude<
    LobbyWallCoreCategoryId,
    "lives" | "performer_lobbies" | "fan_avatar_lobbies" | "shows_and_releases"
  >,
  LiveDiscoveryCategory
> = {
  challenges: "challenges",
  battles: "battles",
  cyphers: "cyphers",
  world_dance_party: "dance",
  lounges: "lounges",
  games: "games",
};

/** Maps wall tab → ExperienceRoomRegistry experience classes (canonical mill). */
export const WALL_TAB_TO_EXPERIENCE: Record<LobbyWallCoreCategoryId, readonly ExperienceClass[]> = {
  challenges: ["CHALLENGE"],
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
  cyphers: ["CIPHER"],
  world_dance_party: ["MAIN_AUDITORIUM"],
  performer_lobbies: ["PERFORMER_LOBBY"],
  fan_avatar_lobbies: ["FAN_AVATAR_LOBBY"],
  lounges: ["LOUNGE_SIDE_ROOM"],
  games: ["DEALERS_CHOICE", "DEAL_OR_FEUD_1000", "CIRCLE_OF_SQUARES", "NAME_THAT_TUNE", "DIRTY_DOZENS", "MONDAY_NIGHT_STAGE", "MONTHLY_IDOL", "CHAMPIONSHIP"],
  lives: ["MAIN_AUDITORIUM"],
  shows_and_releases: ["MAIN_AUDITORIUM"],
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

/** True for the single official Friday World Dance Party hosted by DJ Record Ralph. */
export function isOfficialWDPRecord(r: LiveDiscoveryRecord): boolean {
  return (
    r.roomId === "world-dance-party" ||
    r.roomId.startsWith("world-dance-party") ||
    r.roomId === "anchor-world-dance-room" ||
    (r.anchorFamily ?? "").toLowerCase() === "world-dance-party" ||
    r.hostUserId === "record-ralph"
  );
}

function isWorldDanceRecord(r: LiveDiscoveryRecord): boolean {
  const fam = (r.anchorFamily ?? "").toLowerCase();
  return (
    r.category === "dance" ||
    r.categories.includes("dance") ||
    fam === "dance" ||
    fam === "mini-dance-party" ||
    r.roomId.includes("world-dance") ||
    r.roomId.includes("mini-dance") ||
    r.roomId === "anchor-world-dance-room" ||
    (r.experienceId ?? "").includes("world-dance") ||
    (r.experienceId ?? "").includes("mini-dance")
  );
}

export function filterDiscoveryByWallCategory(
  records: LiveDiscoveryRecord[],
  categoryId: LobbyWallCoreCategoryId,
): LiveDiscoveryRecord[] {
  if (categoryId === "world_dance_party") {
    return records.filter((r) => isWorldDanceRecord(r));
  }
  if (categoryId === "performer_lobbies") {
    return records.filter((r) => isPerformerLobbyRecord(r));
  }
  if (categoryId === "fan_avatar_lobbies") {
    return records.filter((r) => isFanAvatarLobbyRecord(r) && !isLoungeSideRoomRecord(r));
  }
  if (categoryId === "shows_and_releases") {
    // Concerts + world/mini releases only — no sub-genre chips (locked).
    return records.filter(
      (r) =>
        isShowsOrReleaseDiscoveryCategory(r.category, r.categories) &&
        !isFanAvatarLobbyRecord(r) &&
        !isPerformerLobbyRecord(r) &&
        !isLoungeSideRoomRecord(r),
    );
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
      // Shows & Releases owns concerts/releases — keep Live tab free of that category.
      if (isShowsOrReleaseDiscoveryCategory(r.category, r.categories)) return false;
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
  const target =
    WALL_TAB_TO_DISCOVERY[
      categoryId as Exclude<
        LobbyWallCoreCategoryId,
        "lives" | "performer_lobbies" | "fan_avatar_lobbies" | "shows_and_releases"
      >
    ];
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
  if (category === "battles") return "battles";
  if (category === "cyphers") return "cyphers";
  if (category === "dance") return "world_dance_party";
  if (category === "fan_lobbies") return "fan_avatar_lobbies";
  if (category === "lounges" || category === "listening") return "lounges";
  if (category === "games") return "games";
  if (category === "concerts") return "shows_and_releases";
  if (category === "live_now" || category === "worldwide") return "lives";
  return "lives";
}

/**
 * Genre-lobby mill helpers remain for CanonicalGenreRegistry room IDs.
 * Do NOT mount these as mosaic filter chips (locked 2026-08-19 — no sub-genre sectioning).
 */
export type GenreLobbyWallSide = GenreLobbySide;

export const GENRE_LOBBY_WALL_SIDE_TABS: readonly LobbyCategoryPill[] = [
  { id: "FAN", label: "Fan Lobbies", icon: "👥", accentColor: "#00FFFF" },
  { id: "PERFORMER", label: "Performer Lobbies", icon: "🎤", accentColor: "#FFD700" },
] as const;

/** @deprecated Mosaic must not filter by these pills. Kept for registry mill lookups. */
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

/** Minimal tile shape for mosaic sort — mirrors LiveLobbyWallGrid.LobbyRoom. */
export type LobbyWallSortableTile = {
  id: string;
  viewerCount: number;
  status: "live" | "starting" | "recruiting" | "ended";
  isBoosted?: boolean;
  boostExpiresAt?: number;
  boostKind?: "lobby_wall" | "wdp_submission";
};

const LOBBY_STATUS_RANK: Record<LobbyWallSortableTile["status"], number> = {
  live: 0,
  starting: 1,
  recruiting: 2,
  ended: 3,
};

/**
 * Marcel lock — organic: fewer views = top, more views = bottom.
 * Boost band: PROMOTED tiles rank above organic peers within the same status tier.
 * LIVE always beats starting/recruiting regardless of boost.
 */
export function sortLobbyTilesByViewRank<T extends LobbyWallSortableTile>(rooms: T[]): T[] {
  return [...rooms].sort((a, b) => {
    const statusDelta = LOBBY_STATUS_RANK[a.status] - LOBBY_STATUS_RANK[b.status];
    if (statusDelta !== 0) return statusDelta;
    const boostDelta = (a.isBoosted ? 0 : 1) - (b.isBoosted ? 0 : 1);
    if (boostDelta !== 0) return boostDelta;
    return a.viewerCount - b.viewerCount;
  });
}

export function attachLobbyBoostFlags<T extends LobbyWallSortableTile>(
  rooms: T[],
  boosts: Map<string, { expiresAtMs: number; kind: "lobby_wall" | "wdp_submission" }>,
): T[] {
  return rooms.map((room) => {
    const boost = boosts.get(room.id);
    if (!boost) return room;
    return {
      ...room,
      isBoosted: true,
      boostExpiresAt: boost.expiresAtMs,
      boostKind: boost.kind,
    };
  });
}

export function boostLobbyWallCheckoutUrl(
  origin: string,
  params: { roomId: string; category: LobbyWallCoreCategoryId | "all"; wdpEntryId?: string },
): string {
  const q = new URLSearchParams({
    type: params.wdpEntryId ? "wdp_submission_boost" : "boost_lobby_wall",
    roomId: params.roomId,
    category: params.category,
  });
  if (params.wdpEntryId) q.set("wdpEntryId", params.wdpEntryId);
  return `${origin}/api/stripe/checkout?${q.toString()}`;
}
