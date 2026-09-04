/**
 * ExperienceRoom family — ONE mill, many rooms.
 *
 * Different room ≠ different system. Every class maps to
 * `/live/rooms/[id]` + UniversalVenueRenderer + Monitor A/B.
 * Experience-specific HUD modules only. Do not invent BattleV2 / DealOrFeud mill.
 *
 * Gate 3 physical photoreal mesh remains OPEN. Empty seats stay empty.
 */

import {
  CANONICAL_WORLD_ZONE,
  SYSTEM_OPERATED_FAN_LOBBY_ROOM_ID,
  SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID,
  auditoriumEntryHref,
  fanAvatarLobbyEntryHref,
  loungeSideRoomEntryHref,
  type CanonicalWorldGate3Status,
  type CanonicalWorldZone,
  type HubMonitorSlot,
} from "./canonicalWorldViewport";
import {
  BASELINE_GENRE_LOBBY_ROOM_IDS,
  CANONICAL_GENRE_ROOM_REGISTRY,
  getGenreRoomByRoomId,
  resolveGenreLobbyJoinHref,
  type CanonicalGenreRoomDefinition,
} from "./CanonicalGenreRegistry";

/** Existing ArenaEventShell types only — do not invent BattleV2. */
type MillArenaEventType =
  | "concert"
  | "battle"
  | "cypher"
  | "challenge"
  | "song-challenge"
  | "live-show"
  | "monday-stage"
  | "deal-or-feud"
  | "lounge"
  | "world-dance-party";

export type ExperienceClass =
  | "MAIN_AUDITORIUM"
  | "FAN_AVATAR_LOBBY"
  | "LOUNGE_SIDE_ROOM"
  | "PERFORMER_LOBBY"
  | "DEALERS_CHOICE"
  | "DEAL_OR_FEUD_1000"
  | "CIRCLE_OF_SQUARES"
  | "NAME_THAT_TUNE"
  | "DIRTY_DOZENS"
  | "MONDAY_NIGHT_STAGE"
  | "MONTHLY_IDOL"
  | "CHAMPIONSHIP"
  | "BATTLE_SONG"
  | "BATTLE_DANCE_OFF"
  | "BATTLE_JOKE_OFF"
  | "BATTLE_GIBBERISH"
  | "BATTLE_SCAT_JAZZ"
  | "BATTLE_INSTRUMENT"
  | "BATTLE_DJ"
  | "BATTLE_PRODUCER"
  | "CHALLENGE"
  | "CIPHER"
  | "CONTEST";

/** How this leftover route relates to the mill. Never delete this pass. */
export type ExperienceAliasStatus =
  | "ALIASED_TO_MILL"
  | "STANDALONE_SHELL"
  | "OPEN_NOT_FOLDED";

export type ExperienceSeatingPolicy =
  | "LIVE_PERFORMANCE"
  | "LOUNGE_VIDEO_PANELS"
  | "FAN_AVATAR_LOBBY";

export interface ExperienceMonitorLaw {
  slotA: string;
  slotB: string;
  fullscreen: "same-viewport";
}

export interface ExperienceRoomDefinition {
  experienceClass: ExperienceClass;
  label: string;
  millRoomId: string;
  millRoute: string;
  zone: CanonicalWorldZone;
  /** Existing ArenaEventShell type only — no BattleV2 mill. */
  arenaEventType: MillArenaEventType | null;
  seating: ExperienceSeatingPolicy;
  fakeCrowdFill: false;
  monitor: ExperienceMonitorLaw;
  hudModule: string;
  existingRoutes: readonly string[];
  aliasStatus: ExperienceAliasStatus;
  gate3: CanonicalWorldGate3Status;
}

const SAME_VIEWPORT = "same-viewport" as const;

function monitors(slotA: string, slotB: string): ExperienceMonitorLaw {
  return { slotA, slotB, fullscreen: SAME_VIEWPORT };
}

function millRoute(roomId: string): string {
  return `/live/rooms/${roomId}`;
}

export const EXPERIENCE_ROOM_REGISTRY: Record<ExperienceClass, ExperienceRoomDefinition> = {
  MAIN_AUDITORIUM: {
    experienceClass: "MAIN_AUDITORIUM",
    label: "Main Auditorium",
    millRoomId: SYSTEM_OPERATED_FAN_LOBBY_ROOM_ID,
    millRoute: millRoute(SYSTEM_OPERATED_FAN_LOBBY_ROOM_ID),
    zone: CANONICAL_WORLD_ZONE.AUDITORIUM,
    arenaEventType: "live-show",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("FOH / active room primary", "house / judges / group"),
    hudModule: "VenueHUD",
    existingRoutes: ["/live/rooms/[id]", "/rooms/live/[id]"],
    aliasStatus: "ALIASED_TO_MILL",
    gate3: "OPEN",
  },
  FAN_AVATAR_LOBBY: {
    experienceClass: "FAN_AVATAR_LOBBY",
    label: "Fan Avatar Lobby",
    millRoomId: SYSTEM_OPERATED_FAN_LOBBY_ROOM_ID,
    millRoute: millRoute(SYSTEM_OPERATED_FAN_LOBBY_ROOM_ID),
    zone: CANONICAL_WORLD_ZONE.FAN_AVATAR_LOBBY,
    arenaEventType: null,
    seating: "FAN_AVATAR_LOBBY",
    fakeCrowdFill: false,
    monitor: monitors("FOH / stage camera", "BOH / house view"),
    hudModule: "FanLobbyVenue",
    existingRoutes: [fanAvatarLobbyEntryHref(SYSTEM_OPERATED_FAN_LOBBY_ROOM_ID), "/live/lobby/fans"],
    aliasStatus: "ALIASED_TO_MILL",
    gate3: "OPEN",
  },
  LOUNGE_SIDE_ROOM: {
    experienceClass: "LOUNGE_SIDE_ROOM",
    label: "Lounge Side Room",
    millRoomId: SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID,
    millRoute: millRoute(SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID),
    zone: CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM,
    arenaEventType: "lounge",
    seating: "LOUNGE_VIDEO_PANELS",
    fakeCrowdFill: false,
    monitor: monitors("conversation / selected participant / self cam", "lounge group / room view"),
    hudModule: "TMIInteractiveLoungeHud",
    existingRoutes: ["/rooms/playlist-lounge", "/live/rooms/lounge-playlist"],
    aliasStatus: "ALIASED_TO_MILL",
    gate3: "OPEN",
  },
  PERFORMER_LOBBY: {
    experienceClass: "PERFORMER_LOBBY",
    label: "Performer Lobby",
    millRoomId: "performer-lobby-global",
    millRoute: millRoute("performer-lobby-global"),
    zone: CANONICAL_WORLD_ZONE.PERFORMER_LOBBY,
    arenaEventType: "lounge",
    seating: "LOUNGE_VIDEO_PANELS",
    fakeCrowdFill: false,
    monitor: monitors("selected performer panel / self cam", "free-roam panel floor"),
    hudModule: "PerformerVideoPresenceFloor",
    existingRoutes: [
      "/live/lobby/performers",
      "/live/rooms/[id]?zone=PERFORMER_LOBBY",
      "/live/rooms/performer-lobby-*",
    ],
    aliasStatus: "ALIASED_TO_MILL",
    gate3: "OPEN",
  },
  DEALERS_CHOICE: {
    experienceClass: "DEALERS_CHOICE",
    label: "Dealer's Choice",
    millRoomId: "deal-or-feud",
    millRoute: millRoute("deal-or-feud"),
    zone: CANONICAL_WORLD_ZONE.GAME_SHOW_ROOM,
    arenaEventType: "deal-or-feud",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("selected contestant", "house / judges"),
    hudModule: "ArenaEventShell+deal-or-feud",
    existingRoutes: ["/rooms/deal-or-feud", "/games/deal-or-feud"],
    aliasStatus: "ALIASED_TO_MILL",
    gate3: "OPEN",
  },
  DEAL_OR_FEUD_1000: {
    experienceClass: "DEAL_OR_FEUD_1000",
    label: "Dealer Feud 1000",
    millRoomId: "dealer-feud-1000",
    millRoute: millRoute("dealer-feud-1000"),
    zone: CANONICAL_WORLD_ZONE.GAME_SHOW_ROOM,
    arenaEventType: "deal-or-feud",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("selected contestant", "house / judges"),
    hudModule: "ArenaEventShell+deal-or-feud",
    existingRoutes: ["/live/rooms/dealer-feud-1000"],
    aliasStatus: "ALIASED_TO_MILL",
    gate3: "OPEN",
  },
  CIRCLE_OF_SQUARES: {
    experienceClass: "CIRCLE_OF_SQUARES",
    label: "Circle of Squares",
    millRoomId: "circle-squares",
    millRoute: millRoute("circle-squares"),
    zone: CANONICAL_WORLD_ZONE.GAME_SHOW_ROOM,
    arenaEventType: "live-show",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("active contestant / board", "house / group"),
    hudModule: "CircleAndSquaresEngine",
    existingRoutes: ["/games/circle-squares", "/shows/circle-and-squares"],
    aliasStatus: "STANDALONE_SHELL",
    gate3: "OPEN",
  },
  NAME_THAT_TUNE: {
    experienceClass: "NAME_THAT_TUNE",
    label: "Name That Tune",
    millRoomId: "name-that-tune",
    millRoute: millRoute("name-that-tune"),
    zone: CANONICAL_WORLD_ZONE.GAME_SHOW_ROOM,
    arenaEventType: "live-show",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("clip / contestant", "house / judges"),
    hudModule: "ArenaEventShell+live-show",
    existingRoutes: ["/rooms/name-that-tune", "/games/name-that-tune"],
    aliasStatus: "ALIASED_TO_MILL",
    gate3: "OPEN",
  },
  DIRTY_DOZENS: {
    experienceClass: "DIRTY_DOZENS",
    label: "Dirty Dozens",
    millRoomId: "dirty-dozens",
    millRoute: millRoute("dirty-dozens"),
    zone: CANONICAL_WORLD_ZONE.RECURRING_EVENT_STAGE,
    arenaEventType: "battle",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("active battler", "house / judges"),
    hudModule: "ArenaEventShell+DirtyDozensBattleEngine",
    existingRoutes: ["/rooms/dirty-dozens", "/games/dirty-dozens"],
    aliasStatus: "STANDALONE_SHELL",
    gate3: "OPEN",
  },
  MONDAY_NIGHT_STAGE: {
    experienceClass: "MONDAY_NIGHT_STAGE",
    label: "Monday Night Stage",
    millRoomId: "monday-night-stage",
    millRoute: millRoute("monday-night-stage"),
    zone: CANONICAL_WORLD_ZONE.RECURRING_EVENT_STAGE,
    arenaEventType: "monday-stage",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("FOH / called performer", "house"),
    hudModule: "ArenaEventShell+MondayNightStageEngine",
    existingRoutes: ["/rooms/monday-stage", "/games/monday-night"],
    aliasStatus: "STANDALONE_SHELL",
    gate3: "OPEN",
  },
  MONTHLY_IDOL: {
    experienceClass: "MONTHLY_IDOL",
    label: "Monthly Idol",
    millRoomId: "monthly-idol",
    millRoute: millRoute("monthly-idol"),
    zone: CANONICAL_WORLD_ZONE.RECURRING_EVENT_STAGE,
    arenaEventType: "live-show",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("selected contestant", "house / judges"),
    hudModule: "ArenaEventShell+EventOrchestrator",
    existingRoutes: ["/rooms/monthly-idol", "/events/monthly-idol"],
    aliasStatus: "STANDALONE_SHELL",
    gate3: "OPEN",
  },
  CHAMPIONSHIP: {
    experienceClass: "CHAMPIONSHIP",
    label: "Championship",
    millRoomId: "championship",
    millRoute: millRoute("championship"),
    zone: CANONICAL_WORLD_ZONE.CHAMPIONSHIP_ARENA,
    arenaEventType: "battle",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("active contestant", "house / judges"),
    hudModule: "ArenaEventShell+battle",
    existingRoutes: ["/games/tournaments", "/rooms/winner-hall"],
    aliasStatus: "STANDALONE_SHELL",
    gate3: "OPEN",
  },
  BATTLE_SONG: {
    experienceClass: "BATTLE_SONG",
    label: "Song Battle",
    millRoomId: "battle-song",
    millRoute: millRoute("battle-song"),
    zone: CANONICAL_WORLD_ZONE.BATTLE_ARENA,
    arenaEventType: "battle",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("selected contestant", "house / judges"),
    hudModule: "ArenaEventShell+battle",
    existingRoutes: ["/rooms/battle/[roomId]", "/games/battle"],
    aliasStatus: "STANDALONE_SHELL",
    gate3: "OPEN",
  },
  BATTLE_DANCE_OFF: {
    experienceClass: "BATTLE_DANCE_OFF",
    label: "Dance-Off",
    millRoomId: "dance-off",
    millRoute: millRoute("dance-off"),
    zone: CANONICAL_WORLD_ZONE.BATTLE_ARENA,
    arenaEventType: "challenge",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("selected contestant", "house / judges"),
    hudModule: "ArenaEventShell+challenge",
    existingRoutes: ["/games/dance-offs"],
    aliasStatus: "ALIASED_TO_MILL",
    gate3: "OPEN",
  },
  BATTLE_JOKE_OFF: {
    experienceClass: "BATTLE_JOKE_OFF",
    label: "Joke-Off",
    millRoomId: "joke-off",
    millRoute: millRoute("joke-off"),
    zone: CANONICAL_WORLD_ZONE.BATTLE_ARENA,
    arenaEventType: "challenge",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("selected contestant", "house / judges"),
    hudModule: "ArenaEventShell+challenge",
    existingRoutes: ["/games/joke-offs"],
    aliasStatus: "ALIASED_TO_MILL",
    gate3: "OPEN",
  },
  BATTLE_GIBBERISH: {
    experienceClass: "BATTLE_GIBBERISH",
    label: "Gibberish Battle",
    millRoomId: "battle-gibberish",
    millRoute: millRoute("battle-gibberish"),
    zone: CANONICAL_WORLD_ZONE.BATTLE_ARENA,
    arenaEventType: "battle",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("selected contestant", "house / judges"),
    hudModule: "ArenaEventShell+battle",
    existingRoutes: [],
    aliasStatus: "ALIASED_TO_MILL",
    gate3: "OPEN",
  },
  BATTLE_SCAT_JAZZ: {
    experienceClass: "BATTLE_SCAT_JAZZ",
    label: "Scat Jazz Battle",
    millRoomId: "battle-scat-jazz",
    millRoute: millRoute("battle-scat-jazz"),
    zone: CANONICAL_WORLD_ZONE.BATTLE_ARENA,
    arenaEventType: "battle",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("selected contestant", "house / judges"),
    hudModule: "ArenaEventShell+battle",
    existingRoutes: [],
    aliasStatus: "ALIASED_TO_MILL",
    gate3: "OPEN",
  },
  BATTLE_INSTRUMENT: {
    experienceClass: "BATTLE_INSTRUMENT",
    label: "Instrument Battle",
    millRoomId: "battle-instrument",
    millRoute: millRoute("battle-instrument"),
    zone: CANONICAL_WORLD_ZONE.BATTLE_ARENA,
    arenaEventType: "battle",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("selected contestant", "house / judges"),
    hudModule: "ArenaEventShell+battle",
    existingRoutes: [],
    aliasStatus: "ALIASED_TO_MILL",
    gate3: "OPEN",
  },
  BATTLE_DJ: {
    experienceClass: "BATTLE_DJ",
    label: "DJ Battle",
    millRoomId: "battle-dj",
    millRoute: millRoute("battle-dj"),
    zone: CANONICAL_WORLD_ZONE.BATTLE_ARENA,
    arenaEventType: "battle",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("selected contestant", "house / judges"),
    hudModule: "ArenaEventShell+battle",
    existingRoutes: ["/games/dj-mix-off"],
    aliasStatus: "STANDALONE_SHELL",
    gate3: "OPEN",
  },
  BATTLE_PRODUCER: {
    experienceClass: "BATTLE_PRODUCER",
    label: "Producer Battle",
    millRoomId: "battle-producer",
    millRoute: millRoute("battle-producer"),
    zone: CANONICAL_WORLD_ZONE.BATTLE_ARENA,
    arenaEventType: "battle",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("selected contestant", "house / judges"),
    hudModule: "ArenaEventShell+battle",
    existingRoutes: [],
    aliasStatus: "ALIASED_TO_MILL",
    gate3: "OPEN",
  },
  CHALLENGE: {
    experienceClass: "CHALLENGE",
    label: "Challenge",
    millRoomId: "anchor-song-challenge-lab",
    millRoute: millRoute("anchor-song-challenge-lab"),
    zone: CANONICAL_WORLD_ZONE.CHALLENGE_ROOM,
    arenaEventType: "song-challenge",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("active work / contestant", "house / judges"),
    hudModule: "SongChallengeVenueRoom",
    existingRoutes: ["/rooms/challenge-arena"],
    aliasStatus: "STANDALONE_SHELL",
    gate3: "OPEN",
  },
  CIPHER: {
    experienceClass: "CIPHER",
    label: "Cipher",
    millRoomId: "cypher",
    millRoute: millRoute("cypher"),
    zone: CANONICAL_WORLD_ZONE.CIPHER_ROOM,
    arenaEventType: "cypher",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("active performer", "circle / house"),
    hudModule: "CipherArenaShell",
    existingRoutes: ["/rooms/cypher", "/games/cypher-arena", "/rooms/cypher-arena"],
    aliasStatus: "STANDALONE_SHELL",
    gate3: "OPEN",
  },
  CONTEST: {
    experienceClass: "CONTEST",
    label: "Contest",
    millRoomId: "contest-performance",
    millRoute: millRoute("contest-performance"),
    zone: CANONICAL_WORLD_ZONE.CONTEST_ROOM,
    arenaEventType: "challenge",
    seating: "LIVE_PERFORMANCE",
    fakeCrowdFill: false,
    monitor: monitors("selected contestant", "house / judges"),
    hudModule: "ArenaEventShell+challenge",
    existingRoutes: ["/rooms/contest-performance"],
    aliasStatus: "ALIASED_TO_MILL",
    gate3: "OPEN",
  },
};

export const EXPERIENCE_CLASSES: readonly ExperienceClass[] = Object.keys(
  EXPERIENCE_ROOM_REGISTRY,
) as ExperienceClass[];

/** VIP lounge still uses StageLoader — not folded into mill this pass. */
export const VIP_STAGELOADER_FOLD_STATUS = {
  route: "/rooms/vip-lounge",
  loader: "StageLoader",
  experienceId: "lounge",
  status: "OPEN_NOT_FOLDED" as const,
  gate3: "OPEN" as CanonicalWorldGate3Status,
};

export function getExperienceRoom(experienceClass: ExperienceClass): ExperienceRoomDefinition {
  return EXPERIENCE_ROOM_REGISTRY[experienceClass];
}

export function listExperienceRooms(): ExperienceRoomDefinition[] {
  return EXPERIENCE_CLASSES.map((id) => EXPERIENCE_ROOM_REGISTRY[id]);
}

export function parseExperienceClass(value?: string | null): ExperienceClass | null {
  const v = (value ?? "").trim().toUpperCase().replace(/-/g, "_");
  if ((EXPERIENCE_CLASSES as readonly string[]).includes(v)) return v as ExperienceClass;
  const aliases: Record<string, ExperienceClass> = {
    LOUNGE: "LOUNGE_SIDE_ROOM",
    PLAYLIST_LOUNGE: "LOUNGE_SIDE_ROOM",
    PERFORMER_LOBBY: "PERFORMER_LOBBY",
    PERFORMER_LOBBY_GLOBAL: "PERFORMER_LOBBY",
    DEAL_OR_FEUD: "DEALERS_CHOICE",
    DEALERSCHOICE: "DEALERS_CHOICE",
    "1000": "DEAL_OR_FEUD_1000",
    CIRCLE_SQUARES: "CIRCLE_OF_SQUARES",
    CIRCLE_AND_SQUARES: "CIRCLE_OF_SQUARES",
    MONDAY_STAGE: "MONDAY_NIGHT_STAGE",
    MONDAY_NIGHT: "MONDAY_NIGHT_STAGE",
    CYPHER: "CIPHER",
    DANCE_OFF: "BATTLE_DANCE_OFF",
    JOKE_OFF: "BATTLE_JOKE_OFF",
    SONG_CHALLENGE: "CHALLENGE",
    AUDITORIUM: "MAIN_AUDITORIUM",
    FAN_LOBBY: "FAN_AVATAR_LOBBY",
  };
  return aliases[v] ?? null;
}

export function millHrefForExperience(
  experienceClass: ExperienceClass,
  opts?: { roomId?: string; from?: string },
): string {
  const def = EXPERIENCE_ROOM_REGISTRY[experienceClass];
  const roomId = (opts?.roomId ?? def.millRoomId).trim() || def.millRoomId;
  if (experienceClass === "FAN_AVATAR_LOBBY") {
    return fanAvatarLobbyEntryHref(roomId, { from: opts?.from });
  }
  if (experienceClass === "LOUNGE_SIDE_ROOM") {
    return loungeSideRoomEntryHref(roomId, { from: opts?.from ?? "fan-avatar-lobby" });
  }
  if (experienceClass === "PERFORMER_LOBBY") {
    const params = new URLSearchParams();
    params.set("zone", CANONICAL_WORLD_ZONE.PERFORMER_LOBBY);
    params.set("experienceClass", "PERFORMER_LOBBY");
    params.set("mode", "performer-lobby");
    if (opts?.from) params.set("from", opts.from);
    return `/live/rooms/${encodeURIComponent(roomId)}?${params.toString()}`;
  }
  if (experienceClass === "MAIN_AUDITORIUM") {
    return auditoriumEntryHref(roomId, { from: opts?.from });
  }
  const params = new URLSearchParams();
  params.set("experienceClass", experienceClass);
  params.set("zone", def.zone);
  if (opts?.from) params.set("from", opts.from);
  return `/live/rooms/${encodeURIComponent(roomId)}?${params.toString()}`;
}

export function arenaEventTypeForExperience(experienceClass: ExperienceClass): MillArenaEventType | null {
  return EXPERIENCE_ROOM_REGISTRY[experienceClass].arenaEventType;
}

export function resolveHubMonitorCopy(
  experienceClass: ExperienceClass,
  slot: HubMonitorSlot,
): string {
  const law = EXPERIENCE_ROOM_REGISTRY[experienceClass].monitor;
  return slot === "A" ? law.slotA : law.slotB;
}

export function aliasedToMillThisPass(): ExperienceRoomDefinition[] {
  return listExperienceRooms().filter((r) => r.aliasStatus === "ALIASED_TO_MILL");
}

export function stillStandaloneShells(): ExperienceRoomDefinition[] {
  return listExperienceRooms().filter((r) => r.aliasStatus === "STANDALONE_SHELL");
}

/** Marcel lock 2026-08-19 — 30 system-operated genre baseline lobbies (15 fan + 15 performer). */
export const GENRE_LOBBY_BASELINE = {
  roomCount: BASELINE_GENRE_LOBBY_ROOM_IDS.length,
  roomIds: BASELINE_GENRE_LOBBY_ROOM_IDS,
  systemOperated: true as const,
  alwaysOn: true as const,
} as const;

export function isBaselineGenreLobbyRoomId(roomId: string): boolean {
  return getGenreRoomByRoomId(roomId) !== null;
}

export function resolveBaselineGenreLobby(roomId: string): CanonicalGenreRoomDefinition | null {
  return getGenreRoomByRoomId(roomId);
}

export function millHrefForGenreLobby(roomId: string, opts?: { from?: string }): string {
  return resolveGenreLobbyJoinHref(roomId, opts);
}

/** ExperienceRoom index entries for all 30 genre lobbies — data-driven, not 30 engines. */
export function listGenreLobbyExperienceIndex(): Array<{
  roomId: string;
  experienceClass: ExperienceClass;
  zone: CanonicalWorldZone;
  label: string;
  millRoute: string;
}> {
  return CANONICAL_GENRE_ROOM_REGISTRY.map((def) => ({
    roomId: def.roomId,
    experienceClass: def.experienceClass,
    zone: def.zone,
    label: `${def.label} ${def.side === "FAN" ? "Fan Avatar Lobby" : "Performer Lobby"}`,
    millRoute: millRoute(def.roomId),
  }));
}
