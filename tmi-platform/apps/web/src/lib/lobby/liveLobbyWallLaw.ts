/**
 * Live Lobby Wall law — category tabs, ExperienceRoom mapping, fan-lobby search gate,
 * and Universal Live Programming Router (13-second two-level section + panel rotation).
 * Reuses LiveDiscoveryRecord categories + ExperienceRoomRegistry classes (Rule 8).
 */

import type { LobbyCategoryPill } from "@/components/lobby/LobbyCategoryPillRow";
import type {
  LiveDiscoveryCategory,
  LiveDiscoveryRecord,
  LobbyWallPanelLayoutKind,
} from "@/lib/discovery/LiveDiscoveryRecord";
import {
  projectDiscoveryRecordToSurfaceCard,
  type LiveSurfaceCard,
} from "@/lib/discovery/LiveSurfaceCard";
import { filterPromotionalEligibleRecords } from "@/lib/discovery/PromotionalMosaicFabric";
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
  | "all"
  | "performers_live"
  | "fans_live"
  | "challenges"
  | "battles"
  | "gauntlets"
  | "cyphers"
  | "world_dance_party"
  | "performer_lobbies"
  | "fan_avatar_lobbies"
  | "lounges"
  | "backstage"
  | "games"
  | "events"
  | "lives"
  | "shows_and_releases"
  | "games_and_shows";

/** Canonical order: Challenges → Battles → Gauntlets → Cyphers → World Dance → Performer Lobbies → … */
export const LOBBY_WALL_CORE_CATEGORY_TABS: readonly LobbyCategoryPill[] = [
  { id: "challenges", label: "Challenges", icon: "🎯", accentColor: "#FF6B35" },
  { id: "battles", label: "Battles", icon: "⚔️", accentColor: "#FF2DAA" },
  { id: "gauntlets", label: "Gauntlets", icon: "🥊", accentColor: "#FFD700" },
  { id: "cyphers", label: "Cyphers", icon: "🎤", accentColor: "#AA2DFF" },
  { id: "world_dance_party", label: "WDP", icon: "🌍", accentColor: "#00FF88" },
  { id: "performer_lobbies", label: "Performer Lobbies", icon: "🎸", accentColor: "#FFD700" },
  { id: "fan_avatar_lobbies", label: "FAN LIVES", icon: "👥", accentColor: "#00FFFF" },
  { id: "lounges", label: "Lounges", icon: "🛋️", accentColor: "#00FFFF" },
  { id: "backstage", label: "Backstage", icon: "🎧", accentColor: "#FFD700" },
  { id: "games", label: "Games", icon: "🎮", accentColor: "#22c55e" },
  { id: "games_and_shows", label: "Contests & Shows", icon: "🎭", accentColor: "#22c55e" },
  { id: "lives", label: "Live", icon: "🔴", accentColor: "#FF3B5C" },
  { id: "shows_and_releases", label: "Shows & Releases", icon: "📺", accentColor: "#FFD700" },
] as const;

/**
 * TV-style channel switcher — filters on the same /rooms discovery inventory.
 * Internal ids preserved; user-facing labels locked: ALL LIVES | FAN LIVES | PRO LIVES.
 */
export const LOBBY_WALL_CHANNEL_TABS: readonly LobbyCategoryPill[] = [
  { id: "all", label: "ALL LIVES", icon: "◉", accentColor: "#00FFFF" },
  { id: "fans_live", label: "FAN LIVES", icon: "👤", accentColor: "#00FF88" },
  { id: "performers_live", label: "PRO LIVES", icon: "🎤", accentColor: "#FFD700" },
  { id: "lounges", label: "Lounges", icon: "🛋️", accentColor: "#7a5cff" },
  { id: "backstage", label: "Backstage", icon: "🎧", accentColor: "#FFD700" },
  { id: "battles", label: "Battles", icon: "⚔️", accentColor: "#FF2DAA" },
  { id: "gauntlets", label: "Gauntlets", icon: "🥊", accentColor: "#FFD700" },
  { id: "challenges", label: "Challenges", icon: "🎯", accentColor: "#FF6B35" },
  { id: "cyphers", label: "Cyphers", icon: "🎤", accentColor: "#AA2DFF" },
  { id: "world_dance_party", label: "WDP", icon: "🌍", accentColor: "#00FF88" },
  { id: "games_and_shows", label: "Contests", icon: "🎭", accentColor: "#22c55e" },
  { id: "events", label: "Events", icon: "📺", accentColor: "#00FFFF" },
  { id: "fan_avatar_lobbies", label: "Fan Avatar Lobbies", icon: "👥", accentColor: "#00FFFF" },
] as const;

const ARENA_DISCOVERY_CATEGORIES = new Set<LiveDiscoveryCategory>([
  "battles",
  "gauntlets",
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
    | "all"
    | "performers_live"
    | "fans_live"
    | "events"
    | "lives"
    | "performer_lobbies"
    | "fan_avatar_lobbies"
    | "backstage"
    | "shows_and_releases"
    | "games_and_shows"
  >,
  LiveDiscoveryCategory
> = {
  challenges: "challenges",
  battles: "battles",
  gauntlets: "gauntlets",
  cyphers: "cyphers",
  world_dance_party: "dance",
  lounges: "lounges",
  games: "games",
};

/** Maps wall tab → ExperienceRoomRegistry experience classes (canonical mill). */
export const WALL_TAB_TO_EXPERIENCE: Record<LobbyWallCoreCategoryId, readonly ExperienceClass[]> = {
  all: [],
  performers_live: ["MAIN_AUDITORIUM"],
  fans_live: ["MAIN_AUDITORIUM", "FAN_AVATAR_LOBBY"],
  events: [],
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
  gauntlets: ["BATTLE_SONG"],
  cyphers: ["CIPHER"],
  world_dance_party: ["MAIN_AUDITORIUM"],
  performer_lobbies: ["PERFORMER_LOBBY"],
  fan_avatar_lobbies: ["FAN_AVATAR_LOBBY"],
  lounges: ["LOUNGE_SIDE_ROOM"],
  backstage: ["PERFORMER_LOBBY"],
  games: ["DEALERS_CHOICE", "DEAL_OR_FEUD_1000", "CIRCLE_OF_SQUARES", "NAME_THAT_TUNE", "DIRTY_DOZENS", "MONDAY_NIGHT_STAGE", "MONTHLY_IDOL", "CHAMPIONSHIP"],
  games_and_shows: ["DEALERS_CHOICE", "DEAL_OR_FEUD_1000", "CIRCLE_OF_SQUARES", "NAME_THAT_TUNE", "DIRTY_DOZENS", "MONDAY_NIGHT_STAGE", "MONTHLY_IDOL", "CHAMPIONSHIP", "CONTEST"],
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

/**
 * Unified WDP channel membership — Mini + creator World + TMI automated World Dance Parties.
 * One discovery channel; subtypes are filters on the same inventory, not separate databases.
 */
export function isWorldDanceRecord(r: LiveDiscoveryRecord): boolean {
  const fam = (r.anchorFamily ?? "").toLowerCase();
  const experience = (r.experienceId ?? "").toLowerCase().replace(/_/g, "-");
  return (
    isOfficialWDPRecord(r) ||
    fam === "mini-dance-party" ||
    fam === "world-dance-party" ||
    experience === "mini-dance-party" ||
    experience === "world-dance-party" ||
    experience === "wdp" ||
    r.category === "dance" ||
    r.categories.includes("dance")
  );
}

/** Creator-hosted Mini Dance Party (⭐ MINI). */
export function isMiniDancePartyRecord(r: LiveDiscoveryRecord): boolean {
  if (!isWorldDanceRecord(r)) return false;
  const fam = (r.anchorFamily ?? "").toLowerCase();
  const experience = (r.experienceId ?? "").toLowerCase().replace(/_/g, "-");
  const title = (r.title ?? "").toLowerCase();
  return (
    fam === "mini-dance-party" ||
    fam.includes("mini-dance") ||
    experience === "mini-dance-party" ||
    experience.includes("mini-dance") ||
    title.includes("mini dance")
  );
}

/**
 * TMI system-hosted / automated World Dance Party.
 * Live status still comes from DiscoveryPublisher / schedule — never invent LIVE.
 */
export function isAutomatedWdpRecord(r: LiveDiscoveryRecord): boolean {
  if (!isWorldDanceRecord(r) || isMiniDancePartyRecord(r)) return false;
  if (r.sourceType === "HUMAN_CREATED" && !isOfficialWDPRecord(r)) return false;
  return (
    isOfficialWDPRecord(r) ||
    r.sourceType === "AUTOMATED" ||
    r.isAnchor === true ||
    r.isBotOnly === true
  );
}

/** Creator-hosted World Dance Party (🌍 WORLD) — same WDP channel, not Mini, not automated. */
export function isCreatorWorldDancePartyRecord(r: LiveDiscoveryRecord): boolean {
  return isWorldDanceRecord(r) && !isMiniDancePartyRecord(r) && !isAutomatedWdpRecord(r);
}

/** In-channel WDP mosaic subfilters — ALL WDP | MINI | WORLD | AUTOMATED. */
export type WdpDiscoverySubtype = "all_wdp" | "mini" | "world" | "automated";

export const WDP_SUBFILTER_TABS: readonly {
  id: WdpDiscoverySubtype;
  label: string;
}[] = [
  { id: "all_wdp", label: "ALL WDP" },
  { id: "mini", label: "MINI" },
  { id: "world", label: "WORLD" },
  { id: "automated", label: "AUTOMATED" },
] as const;

export function filterWdpDiscoveryBySubtype(
  records: LiveDiscoveryRecord[],
  subtype: WdpDiscoverySubtype,
): LiveDiscoveryRecord[] {
  const wdp = records.filter(isWorldDanceRecord);
  switch (subtype) {
    case "mini":
      return wdp.filter(isMiniDancePartyRecord);
    case "world":
      return wdp.filter(isCreatorWorldDancePartyRecord);
    case "automated":
      return wdp.filter(isAutomatedWdpRecord);
    case "all_wdp":
    default:
      return wdp;
  }
}

export function resolveWdpDiscoverySubtype(r: LiveDiscoveryRecord): Exclude<WdpDiscoverySubtype, "all_wdp"> | null {
  if (!isWorldDanceRecord(r)) return null;
  if (isMiniDancePartyRecord(r)) return "mini";
  if (isAutomatedWdpRecord(r)) return "automated";
  return "world";
}

const GAME_SHOW_ROOM_IDS = new Set([
  "deal-or-feud",
  "dealer-feud-1000",
  "circle-squares",
  "name-that-tune",
  "dirty-dozens",
  "monday-night-stage",
  "monthly-idol",
  "championship",
]);

const GAME_SHOW_EXPERIENCE_IDS = new Set([
  "DEALERS_CHOICE",
  "DEAL_OR_FEUD_1000",
  "CIRCLE_OF_SQUARES",
  "NAME_THAT_TUNE",
  "DIRTY_DOZENS",
  "MONDAY_NIGHT_STAGE",
  "MONTHLY_IDOL",
  "CHAMPIONSHIP",
  "CONTEST",
]);

/** Uses canonical category/experience/room IDs, never title matching. */
export function isGamesAndShowsRecord(record: LiveDiscoveryRecord): boolean {
  return record.category === "games" ||
    record.categories.includes("games") ||
    GAME_SHOW_ROOM_IDS.has(record.roomId) ||
    GAME_SHOW_EXPERIENCE_IDS.has((record.experienceId ?? "").toUpperCase());
}

/**
 * BACKSTAGE — performer collaboration / recruitment / rehearsal sessions.
 * Reuses performer lobby + recruiting flags; never invents a second room engine.
 */
export function isBackstageCollaborationRecord(r: LiveDiscoveryRecord): boolean {
  if (isFanAvatarLobbyRecord(r)) return false;
  if (isLoungeSideRoomRecord(r)) return false;
  if (recordHasArenaCategory(r)) return false;
  const fam = (r.anchorFamily ?? "").toLowerCase();
  const exp = (r.experienceId ?? "").toUpperCase();
  if (r.recruiting === true) return true;
  if (fam.includes("rehearsal") || fam.includes("backstage") || fam.includes("audition")) return true;
  if (
    exp.includes("REHEARSAL") ||
    exp.includes("BACKSTAGE") ||
    exp.includes("AUDITION") ||
    exp.includes("RECRUIT")
  ) {
    return true;
  }
  if ((r.categories as readonly string[]).includes("rehearsal") || fam === "rehearsal") {
    return true;
  }
  // Recruiting performer lobbies only — ordinary public performer lobbies stay off Backstage.
  if (isPerformerLobbyRecord(r) && Boolean(r.recruiting)) return true;
  return false;
}

/** FAN LIVES — fan regular lives + Fan Avatar Lobby broadcasts (not video lounges). */
export function matchesFanLivesChannel(r: LiveDiscoveryRecord): boolean {
  if (isLoungeSideRoomRecord(r) || isListeningLoungeRecord(r)) return false;
  if (recordHasArenaCategory(r)) return false;
  if (isShowsOrReleaseDiscoveryCategory(r.category, r.categories)) return false;
  if (isFanAvatarLobbyRecord(r)) return true;
  if (r.category === "fans_live" || r.categories.includes("fans_live")) return true;
  return false;
}

/** PRO LIVES — performer regular broadcasts (not arena / lounge / private backstage). */
export function matchesProLivesChannel(r: LiveDiscoveryRecord): boolean {
  if (isFanAvatarLobbyRecord(r)) return false;
  if (isLoungeSideRoomRecord(r) || isListeningLoungeRecord(r)) return false;
  if (recordHasArenaCategory(r)) return false;
  if (isShowsOrReleaseDiscoveryCategory(r.category, r.categories)) return false;
  if (isBackstageCollaborationRecord(r)) return false;
  if (r.category === "performers_live" || r.categories.includes("performers_live")) return true;
  if (r.experienceId === "REGULAR_GO_LIVE" && r.category !== "fans_live") return true;
  return false;
}

export function filterDiscoveryByWallCategory(
  records: LiveDiscoveryRecord[],
  categoryId: LobbyWallCoreCategoryId,
): LiveDiscoveryRecord[] {
  // ALL LIVES = Fan Lives ∪ Pro Lives only (arena/lounge/backstage keep own channels).
  if (categoryId === "all") {
    return records.filter((r) => matchesFanLivesChannel(r) || matchesProLivesChannel(r));
  }
  if (categoryId === "performers_live") {
    return records.filter((r) => matchesProLivesChannel(r));
  }
  if (categoryId === "fans_live") {
    return records.filter((r) => matchesFanLivesChannel(r));
  }
  if (categoryId === "backstage") {
    return records.filter((r) => isBackstageCollaborationRecord(r));
  }
  if (categoryId === "events") {
    return records.filter(
      (r) => r.category === "events" || r.categories.includes("events") || (r.experienceId ?? "").startsWith("ev-"),
    );
  }
  if (categoryId === "world_dance_party") {
    return records.filter((r) => isWorldDanceRecord(r));
  }
  if (categoryId === "games_and_shows") {
    return records.filter(isGamesAndShowsRecord);
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
        | "all"
        | "performers_live"
        | "fans_live"
        | "events"
        | "lives"
        | "performer_lobbies"
        | "fan_avatar_lobbies"
        | "backstage"
        | "shows_and_releases"
        | "games_and_shows"
      >
    ];
  return records.filter(
    (r) =>
      (r.category === target || r.categories.includes(target)) &&
      !isPerformerLobbyRecord(r) &&
      !isFanAvatarLobbyRecord(r),
  );
}

export function advanceLobbyWallChannel(
  current: LobbyWallCoreCategoryId,
  direction: "next" | "prev",
): LobbyWallCoreCategoryId {
  const tabs = LOBBY_WALL_CHANNEL_TABS;
  const idx = tabs.findIndex((t) => t.id === current);
  const base = idx >= 0 ? idx : 0;
  const next =
    direction === "next"
      ? (base + 1) % tabs.length
      : (base - 1 + tabs.length) % tabs.length;
  return tabs[next]!.id as LobbyWallCoreCategoryId;
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
  if (category === "gauntlets") return "gauntlets";
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
  boostKind?: "lobby_wall" | "lobby_wall_299" | "wdp_submission";
};

const LOBBY_STATUS_RANK: Record<LobbyWallSortableTile["status"], number> = {
  live: 0,
  starting: 1,
  recruiting: 2,
  ended: 3,
};

/**
 * Marcel lock — organic: fewer views = top, more views = bottom.
 * Shared with LiveMosaicPromotionDirector (HOME chaos vs LOBBY ladder).
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
  boosts: Map<string, { expiresAtMs: number; kind: "lobby_wall" | "lobby_wall_299" | "wdp_submission" }>,
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

export function boostLobbyWall299CheckoutUrl(
  origin: string,
  params: { roomId: string; category: LobbyWallCoreCategoryId | "all" },
): string {
  const q = new URLSearchParams({
    type: "boost_lobby_wall_299",
    roomId: params.roomId,
    category: params.category,
  });
  return `${origin}/api/stripe/checkout?${q.toString()}`;
}

/** Re-export mosaic director for Lobby/Home consumers — same least-viewers law. */
export {
  LiveMosaicPromotionDirector,
  rankLobbyOrganicLeastViewersFirst,
  buildHomeTileSchedules,
} from "@/lib/discovery/LiveMosaicPromotionDirector";

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE LOBBY WALL — UNIVERSAL LIVE PROGRAMMING ROUTER (13-SECOND ROTATION)
// ═══════════════════════════════════════════════════════════════════════════════

/** Owner lock: 13-second programming rotation interval across Home 1–5. */
export const WALL_PROGRAMMING_ROTATION_INTERVAL_MS = 13_000;
export const WALL_PROGRAMMING_ROTATION_SECONDS = 13;

export type LobbyWallPresentationVariant =
  | "FULL_WALL"
  | "COMPACT_HOME_PANEL"
  | "MINI_WALL"
  | "DRAWER_WALL";

export type LobbyWallProgrammingSectionId =
  | "ALL_LIVE"
  | "BATTLES"
  | "GAUNTLETS"
  | "CHALLENGES"
  | "CYPHERS"
  | "FAN_AVATAR_LOBBIES"
  | "REGULAR_LIVES"
  | "MONDAY_NIGHT_STAGE"
  | "WORLD_DANCE_PARTY"
  | "SHOWS_AND_RELEASES";

export interface LobbyWallProgrammingSectionMeta {
  id: LobbyWallProgrammingSectionId;
  label: string;
  headerTitle: string;
  wallTabId: LobbyWallCoreCategoryId;
  accentColor: string;
}

export const LOBBY_WALL_PROGRAMMING_SECTIONS: readonly LobbyWallProgrammingSectionMeta[] = [
  { id: "ALL_LIVE", label: "ALL LIVES", headerTitle: "LIVE AROUND TMI · ALL LIVES", wallTabId: "all", accentColor: "#00FFFF" },
  { id: "BATTLES", label: "BATTLES", headerTitle: "LIVE AROUND TMI · BATTLES", wallTabId: "battles", accentColor: "#FF2DAA" },
  { id: "GAUNTLETS", label: "GAUNTLETS", headerTitle: "LIVE AROUND TMI · GAUNTLETS", wallTabId: "gauntlets", accentColor: "#FFD700" },
  { id: "CHALLENGES", label: "CHALLENGES", headerTitle: "LIVE AROUND TMI · CHALLENGES", wallTabId: "challenges", accentColor: "#FF6B35" },
  { id: "CYPHERS", label: "CYPHERS", headerTitle: "LIVE AROUND TMI · CYPHERS", wallTabId: "cyphers", accentColor: "#AA2DFF" },
  { id: "FAN_AVATAR_LOBBIES", label: "FAN LIVES", headerTitle: "LIVE AROUND TMI · FAN LIVES", wallTabId: "fans_live", accentColor: "#00FFFF" },
  { id: "REGULAR_LIVES", label: "PRO LIVES", headerTitle: "LIVE AROUND TMI · PRO LIVES", wallTabId: "performers_live", accentColor: "#00FF88" },
  { id: "MONDAY_NIGHT_STAGE", label: "MONDAY NIGHT STAGE", headerTitle: "LIVE AROUND TMI · MONDAY NIGHT STAGE", wallTabId: "games_and_shows", accentColor: "#FFD700" },
  { id: "WORLD_DANCE_PARTY", label: "WORLD DANCE PARTY", headerTitle: "LIVE AROUND TMI · WORLD DANCE PARTY", wallTabId: "world_dance_party", accentColor: "#00FF88" },
  { id: "SHOWS_AND_RELEASES", label: "SHOWS & RELEASES", headerTitle: "LIVE AROUND TMI · SHOWS & RELEASES", wallTabId: "shows_and_releases", accentColor: "#FFD700" },
] as const;

export interface LobbyWallPanelProjection {
  panelId: string;
  sessionId: string;
  roomId: string;
  experienceType: string;
  sectionId: Exclude<LobbyWallProgrammingSectionId, "ALL_LIVE">;
  participantIds: string[];
  participantNames: string[];
  isCameraOn: boolean;
  authorizedVideoPreviewUrl: string | null;
  posterUrl: string | null;
  title: string;
  hostName: string;
  destinationHref: string;
  isLive: boolean;
  visibility: LiveDiscoveryRecord["visibility"];
  panelLayout: LobbyWallPanelLayoutKind;
  winnerStays?: boolean;
  nonWinnerOriented?: boolean;
  avatarCapable?: boolean;
  humanViewerCount: number;
  card: LiveSurfaceCard;
  record: LiveDiscoveryRecord;
}

export interface LobbyWallSectionProjection {
  sectionId: Exclude<LobbyWallProgrammingSectionId, "ALL_LIVE">;
  label: string;
  headerTitle: string;
  wallTabId: LobbyWallCoreCategoryId;
  accentColor: string;
  panels: LobbyWallPanelProjection[];
}

/**
 * Classify a canonical LiveDiscoveryRecord into its Lobby Wall Programming Section.
 */
export function classifyRecordToWallSection(
  record: LiveDiscoveryRecord,
): Exclude<LobbyWallProgrammingSectionId, "ALL_LIVE"> {
  const exp = (record.experienceId ?? "").toUpperCase();
  if (exp === "MONDAY_NIGHT_STAGE" || record.roomId === "monday-night-stage") {
    return "MONDAY_NIGHT_STAGE";
  }
  if (isWorldDanceRecord(record)) {
    return "WORLD_DANCE_PARTY";
  }
  if (record.category === "gauntlets" || record.categories.includes("gauntlets") || exp.includes("GAUNTLET")) {
    return "GAUNTLETS";
  }
  if (record.category === "battles" || record.categories.includes("battles")) {
    return "BATTLES";
  }
  if (record.category === "challenges" || record.categories.includes("challenges")) {
    return "CHALLENGES";
  }
  if (record.category === "cyphers" || record.categories.includes("cyphers")) {
    return "CYPHERS";
  }
  if (isFanAvatarLobbyRecord(record)) {
    return "FAN_AVATAR_LOBBIES";
  }
  if (isShowsOrReleaseDiscoveryCategory(record.category, record.categories)) {
    return "SHOWS_AND_RELEASES";
  }
  return "REGULAR_LIVES";
}

export function projectRecordToWallPanel(
  record: LiveDiscoveryRecord,
): LobbyWallPanelProjection | null {
  const card = projectDiscoveryRecordToSurfaceCard(record);
  if (!card) return null;
  const sectionId = classifyRecordToWallSection(record);
  const isCameraOn = record.isCameraOn ?? Boolean(record.previewUrl);
  const authorizedVideoPreviewUrl = isCameraOn && record.previewUrl ? record.previewUrl : null;
  const participantIds = record.participantIds?.length
    ? [...record.participantIds]
    : record.hostUserId
      ? [record.hostUserId]
      : [];
  const participantNames = record.participantNames?.length
    ? [...record.participantNames]
    : record.hostName
      ? [record.hostName]
      : [];
  const defaultLayout: LobbyWallPanelLayoutKind =
    sectionId === "BATTLES"
      ? "MULTI_PARTICIPANT_VS"
      : sectionId === "GAUNTLETS"
        ? "GAUNTLET_MATCHUP"
        : sectionId === "CHALLENGES"
          ? "CHALLENGE_VS"
          : sectionId === "CYPHERS"
            ? "CYPHER_CIRCLE"
            : sectionId === "FAN_AVATAR_LOBBIES"
              ? "FAN_AVATAR_LOBBY"
              : "SINGLE_BROADCASTER";

  return {
    panelId: `wall-panel-${record.roomId}`,
    sessionId: record.id || record.roomId,
    roomId: record.roomId,
    experienceType: record.experienceId ?? sectionId,
    sectionId,
    participantIds,
    participantNames,
    isCameraOn,
    authorizedVideoPreviewUrl,
    posterUrl: record.posterUrl ?? null,
    title: record.title,
    hostName: record.hostName,
    destinationHref: card.joinAction.href,
    isLive: record.isLive,
    visibility: record.visibility,
    panelLayout: record.panelLayout ?? defaultLayout,
    winnerStays: record.winnerStays ?? (sectionId === "GAUNTLETS" ? true : undefined),
    nonWinnerOriented: record.nonWinnerOriented ?? (sectionId === "CYPHERS" ? true : undefined),
    avatarCapable: record.avatarCapable ?? (sectionId === "FAN_AVATAR_LOBBIES" ? true : undefined),
    humanViewerCount: Math.max(0, record.humanViewerCount),
    card,
    record,
  };
}

/**
 * Organize real eligible live discovery records into populated Lobby Wall sections.
 * Never returns an empty section (EMPTY_CATEGORY_SKIP = true).
 * Private/invite/friends/rehearsal/test/bot-only-non-anchor sessions are excluded BEFORE public distribution.
 */
export function organizeLobbyWallSections(
  records: readonly LiveDiscoveryRecord[],
  options?: { includeAnchors?: boolean },
): LobbyWallSectionProjection[] {
  const includeAnchors = options?.includeAnchors ?? false;
  const eligible = filterPromotionalEligibleRecords(records).filter((r) =>
    includeAnchors ? true : !r.isAnchor && r.sourceType !== "AUTOMATED",
  );

  const bySection = new Map<Exclude<LobbyWallProgrammingSectionId, "ALL_LIVE">, LobbyWallPanelProjection[]>();
  const seenRoomIds = new Set<string>();

  for (const rec of eligible) {
    if (!rec.roomId || seenRoomIds.has(rec.roomId)) continue;
    const panel = projectRecordToWallPanel(rec);
    if (!panel) continue;
    seenRoomIds.add(rec.roomId);
    const list = bySection.get(panel.sectionId) ?? [];
    list.push(panel);
    bySection.set(panel.sectionId, list);
  }

  const out: LobbyWallSectionProjection[] = [];
  for (const meta of LOBBY_WALL_PROGRAMMING_SECTIONS) {
    if (meta.id === "ALL_LIVE") continue;
    const panels = bySection.get(meta.id);
    if (!panels || panels.length === 0) continue;
    out.push({
      sectionId: meta.id,
      label: meta.label,
      headerTitle: meta.headerTitle,
      wallTabId: meta.wallTabId,
      accentColor: meta.accentColor,
      panels,
    });
  }
  return out;
}

/**
 * Deterministic seeded PRNG (Mulberry32) — zero Math.random() scattered in UI components.
 */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Controlled fair shuffle of populated sections for a given cycle.
 * Guarantees every populated section appears once per cycle (no category starvation)
 * and prevents immediate boundary repeats when populatedIds.length > 1.
 */
export function buildFairWallSectionOrder(
  populatedIds: readonly Exclude<LobbyWallProgrammingSectionId, "ALL_LIVE">[],
  cycleIndex: number,
  seed = 13,
  previousLastSectionId?: Exclude<LobbyWallProgrammingSectionId, "ALL_LIVE"> | null,
): Exclude<LobbyWallProgrammingSectionId, "ALL_LIVE">[] {
  if (populatedIds.length <= 1) return [...populatedIds];
  const arr = [...populatedIds];
  const rng = seededRandom((seed * 1009 + cycleIndex * 9176 + arr.length * 31) >>> 0);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  if (previousLastSectionId && arr[0] === previousLastSectionId && arr.length > 1) {
    const swapIdx = 1 + (cycleIndex % (arr.length - 1));
    const first = arr[0]!;
    arr[0] = arr[swapIdx]!;
    arr[swapIdx] = first;
  }
  return arr;
}

function surfaceIndexOffset(surfaceId?: string): number {
  if (!surfaceId) return 0;
  const s = surfaceId.toLowerCase();
  if (s.includes("home1_2") || s.includes("home-1-2")) return 1;
  if (s.includes("home1") || s.includes("home-1")) return 0;
  if (s.includes("home2") || s.includes("home-2")) return 1;
  if (s.includes("home3") || s.includes("home-3")) return 2;
  if (s.includes("home4") || s.includes("home-4")) return 3;
  if (s.includes("home5") || s.includes("home-5")) return 4;
  return 0;
}

export interface LobbyWallProgrammingTickProjection {
  tickIndex: number;
  rotationIntervalSeconds: 13;
  surfaceId: string;
  populatedSections: LobbyWallSectionProjection[];
  activeSectionId: LobbyWallProgrammingSectionId | null;
  activeSectionLabel: string;
  activeSectionHeader: string;
  activeAccentColor: string;
  /** Bounded window of visible panels for this tick (never renders 500 simultaneous WebRTC tiles). */
  visiblePanels: LobbyWallPanelProjection[];
  /** All eligible panels in the active section (metadata only). */
  totalSectionPanelCount: number;
  /** Total eligible live sessions across the entire Lobby Wall. */
  totalWallLiveCount: number;
  /** Bounded roomIds authorized to hold an active live video preview subscription right now. */
  activeMediaSubscriptionRoomIds: string[];
  /** Updated per-section panel cursors after this tick. */
  nextSectionCursors: Record<string, number>;
  /** Whether manual category selection is overriding automatic 13s section rotation. */
  isManualOverride: boolean;
  /** Whether interaction pause is active. */
  isInteractionPaused: boolean;
  /** Preserves broadcaster WebRTC session across viewer rotation. */
  preservesBroadcasterSession: true;
}

/**
 * Coordinate one 13-second programming tick from the canonical Live Lobby Wall.
 * - Level 1: Rotates across populated sections (skipping empty sections, preventing starvation,
 *   and distributing across Home 1–5 via surfaceId offset).
 * - Level 2: Advances the per-section panel cursor (Battle A → Battle B → Battle C).
 * - Manual Override: If `manualSectionId` is provided, locks to that section immediately.
 * - Bounded Media Subscriptions: Only `visiblePanels` with `isCameraOn && authorizedVideoPreviewUrl`
 *   enter `activeMediaSubscriptionRoomIds` (bounded by `maxPanels`, safe at 5, 50, or 500+ sessions).
 */
export function projectLobbyWallProgrammingAtTick(
  records: readonly LiveDiscoveryRecord[],
  options?: {
    tickIndex?: number;
    surfaceId?: string;
    manualSectionId?: LobbyWallProgrammingSectionId | null;
    interactionPaused?: boolean;
    maxPanels?: number;
    seed?: number;
    sectionCursors?: Record<string, number>;
    includeAnchors?: boolean;
  },
): LobbyWallProgrammingTickProjection {
  const tickIndex = Math.max(0, Math.trunc(options?.tickIndex ?? 0));
  const surfaceId = options?.surfaceId ?? "home1";
  const manualSectionId = options?.manualSectionId ?? null;
  const interactionPaused = Boolean(options?.interactionPaused);
  const maxPanels = Math.max(1, Math.min(options?.maxPanels ?? 4, 16));
  const seed = options?.seed ?? 13;
  const cursors: Record<string, number> = { ...(options?.sectionCursors ?? {}) };

  const populatedSections = organizeLobbyWallSections(records, {
    includeAnchors: options?.includeAnchors ?? false,
  });
  const totalWallLiveCount = populatedSections.reduce((sum, s) => sum + s.panels.length, 0);

  if (populatedSections.length === 0 && !manualSectionId) {
    return {
      tickIndex,
      rotationIntervalSeconds: WALL_PROGRAMMING_ROTATION_SECONDS,
      surfaceId,
      populatedSections: [],
      activeSectionId: null,
      activeSectionLabel: "WAITING FOR LIVE PROGRAMMING",
      activeSectionHeader: "LIVE AROUND TMI · WAITING FOR LIVE SESSIONS",
      activeAccentColor: "#00FFFF",
      visiblePanels: [],
      totalSectionPanelCount: 0,
      totalWallLiveCount: 0,
      activeMediaSubscriptionRoomIds: [],
      nextSectionCursors: cursors,
      isManualOverride: false,
      isInteractionPaused: interactionPaused,
      preservesBroadcasterSession: true,
    };
  }

  // Manual category selection overrides automatic 13s section waiting
  if (manualSectionId) {
    if (manualSectionId === "ALL_LIVE") {
      const allPanels = populatedSections.flatMap((s) => s.panels);
      const start = Math.abs(cursors["ALL_LIVE"] ?? 0) % Math.max(1, allPanels.length);
      const visiblePanels: LobbyWallPanelProjection[] = [];
      for (let i = 0; i < Math.min(maxPanels, allPanels.length); i++) {
        visiblePanels.push(allPanels[(start + i) % allPanels.length]!);
      }
      if (!interactionPaused && allPanels.length > 0) {
        cursors["ALL_LIVE"] = (start + 1) % allPanels.length;
      }
      return {
        tickIndex,
        rotationIntervalSeconds: WALL_PROGRAMMING_ROTATION_SECONDS,
        surfaceId,
        populatedSections,
        activeSectionId: "ALL_LIVE",
        activeSectionLabel: "ALL LIVE",
        activeSectionHeader: "LIVE AROUND TMI · ALL LIVE",
        activeAccentColor: "#00FFFF",
        visiblePanels,
        totalSectionPanelCount: allPanels.length,
        totalWallLiveCount,
        activeMediaSubscriptionRoomIds: visiblePanels
          .filter((p) => p.isCameraOn && Boolean(p.authorizedVideoPreviewUrl))
          .map((p) => p.roomId),
        nextSectionCursors: cursors,
        isManualOverride: true,
        isInteractionPaused: interactionPaused,
        preservesBroadcasterSession: true,
      };
    }

    const meta = LOBBY_WALL_PROGRAMMING_SECTIONS.find((m) => m.id === manualSectionId);
    const matchingSection = populatedSections.find((s) => s.sectionId === manualSectionId);
    const sectionPanels = matchingSection?.panels ?? [];
    const start = sectionPanels.length > 0
      ? Math.abs(cursors[manualSectionId] ?? 0) % sectionPanels.length
      : 0;
    const visiblePanels: LobbyWallPanelProjection[] = [];
    for (let i = 0; i < Math.min(maxPanels, sectionPanels.length); i++) {
      visiblePanels.push(sectionPanels[(start + i) % sectionPanels.length]!);
    }
    if (!interactionPaused && sectionPanels.length > 0) {
      cursors[manualSectionId] = (start + 1) % sectionPanels.length;
    }

    return {
      tickIndex,
      rotationIntervalSeconds: WALL_PROGRAMMING_ROTATION_SECONDS,
      surfaceId,
      populatedSections,
      activeSectionId: manualSectionId,
      activeSectionLabel: meta?.label ?? manualSectionId,
      activeSectionHeader: meta?.headerTitle ?? `LIVE AROUND TMI · ${manualSectionId}`,
      activeAccentColor: meta?.accentColor ?? "#00FFFF",
      visiblePanels,
      totalSectionPanelCount: sectionPanels.length,
      totalWallLiveCount,
      activeMediaSubscriptionRoomIds: visiblePanels
        .filter((p) => p.isCameraOn && Boolean(p.authorizedVideoPreviewUrl))
        .map((p) => p.roomId),
      nextSectionCursors: cursors,
      isManualOverride: true,
      isInteractionPaused: interactionPaused,
      preservesBroadcasterSession: true,
    };
  }

  // Automatic 13-second Level 1 (Section) + Level 2 (Panel) rotation
  const populatedIds = populatedSections.map((s) => s.sectionId);
  const n = populatedIds.length;
  const effectiveTick = tickIndex + surfaceIndexOffset(surfaceId);
  const cycleIndex = Math.floor(effectiveTick / n);
  const stepInCycle = effectiveTick % n;

  let prevLast: Exclude<LobbyWallProgrammingSectionId, "ALL_LIVE"> | null = null;
  if (cycleIndex > 0 && n > 1) {
    const prevOrder = buildFairWallSectionOrder(populatedIds, cycleIndex - 1, seed, null);
    prevLast = prevOrder[prevOrder.length - 1] ?? null;
  }
  const order = buildFairWallSectionOrder(populatedIds, cycleIndex, seed, prevLast);
  const chosenSectionId = order[stepInCycle]!;
  const chosenSection = populatedSections.find((s) => s.sectionId === chosenSectionId) ?? populatedSections[0]!;
  const panels = chosenSection.panels;

  // Level 2: Within-section panel cursor advances each time this section is visited
  const explicitCursor = cursors[chosenSection.sectionId];
  const baseCursor = explicitCursor !== undefined ? explicitCursor : cycleIndex;
  const start = panels.length > 0 ? Math.abs(baseCursor) % panels.length : 0;

  const visiblePanels: LobbyWallPanelProjection[] = [];
  for (let i = 0; i < Math.min(maxPanels, panels.length); i++) {
    visiblePanels.push(panels[(start + i) % panels.length]!);
  }

  if (!interactionPaused && panels.length > 0) {
    cursors[chosenSection.sectionId] = (start + 1) % panels.length;
  }

  return {
    tickIndex,
    rotationIntervalSeconds: WALL_PROGRAMMING_ROTATION_SECONDS,
    surfaceId,
    populatedSections,
    activeSectionId: chosenSection.sectionId,
    activeSectionLabel: chosenSection.label,
    activeSectionHeader: chosenSection.headerTitle,
    activeAccentColor: chosenSection.accentColor,
    visiblePanels,
    totalSectionPanelCount: panels.length,
    totalWallLiveCount,
    activeMediaSubscriptionRoomIds: visiblePanels
      .filter((p) => p.isCameraOn && Boolean(p.authorizedVideoPreviewUrl))
      .map((p) => p.roomId),
    nextSectionCursors: cursors,
    isManualOverride: false,
    isInteractionPaused: interactionPaused,
    preservesBroadcasterSession: true,
  };
}

/**
 * Distribute active Lobby Wall sections across Home 1–5 at a given 13-second tick.
 */
export function distributeWallSectionsAcrossHomes(
  records: readonly LiveDiscoveryRecord[],
  tickIndex = 0,
  maxPanelsPerHome = 2,
): Record<"home1" | "home2" | "home3" | "home4" | "home5", LobbyWallProgrammingTickProjection> {
  return {
    home1: projectLobbyWallProgrammingAtTick(records, { tickIndex, surfaceId: "home1", maxPanels: maxPanelsPerHome }),
    home2: projectLobbyWallProgrammingAtTick(records, { tickIndex, surfaceId: "home2", maxPanels: maxPanelsPerHome }),
    home3: projectLobbyWallProgrammingAtTick(records, { tickIndex, surfaceId: "home3", maxPanels: maxPanelsPerHome }),
    home4: projectLobbyWallProgrammingAtTick(records, { tickIndex, surfaceId: "home4", maxPanels: maxPanelsPerHome }),
    home5: projectLobbyWallProgrammingAtTick(records, { tickIndex, surfaceId: "home5", maxPanels: maxPanelsPerHome }),
  };
}
