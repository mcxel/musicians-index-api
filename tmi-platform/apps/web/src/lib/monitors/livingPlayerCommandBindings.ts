/**
 * livingPlayerCommandBindings — STATION / ROOM / SOURCE / MIX → canonical authorities.
 * No second broadcast engine. UI requests; authorities decide.
 */

import {
  getActiveSessions,
  getSessionsByCategory,
  type LiveSession,
} from "@/lib/broadcast/GlobalLiveSessionRegistry";
import type { StreamCategory } from "@/lib/broadcast/globalLiveSessionStore";
import type {
  LivingPlayerCommand,
  LivingPlayerStationFamily,
  LivingViewCount,
} from "@/lib/monitors/livingPlayerControlContract";
import type { FrameId, LayoutMode, MediaSource } from "@/lib/media/canonicalMediaPlayerRuntime";

export type LivingBindingResult = {
  ok: boolean;
  command: LivingPlayerCommand;
  authority: string;
  detail: string;
  station?: LivingPlayerStationFamily;
  roomId?: string | null;
  session?: LiveSession | null;
  source?: MediaSource;
  layout?: LayoutMode;
  empty?: boolean;
};

const STATION_TO_CATEGORY: Partial<Record<LivingPlayerStationFamily, StreamCategory>> = {
  LIVE_LOBBY_WALL: "live",
  PERFORMER_LIVE: "live",
  LOUNGES: "lounge",
  BATTLES: "battle",
  CHALLENGES: "challenge",
  CYPHERS: "cypher",
  GAME_SHOWS: "game",
  WORLD_DANCE_PARTY: "dance-party",
  FAN_LOBBIES: "fan-lobby",
  MONDAY_NIGHT_STAGE: "live",
  AUTOMATED_BOT_ROOMS: "live",
  VENUE_PROGRAM: "concert",
  EVENT_PROGRAM: "concert",
  MY_LIVE_SESSION: "live",
  REHEARSAL: "session",
};

const SOURCE_CYCLE: MediaSource[] = [
  "SELF_CAMERA",
  "PERFORMER_FEED",
  "AUDIENCE_VIEW",
  "VENUE_VIEW",
  "SCREEN_SHARE",
  "VIDEO_PLAYBACK",
  "MONITOR_FEED",
];

const VIEW_TO_LAYOUT: Record<LivingViewCount, LayoutMode> = {
  1: "SINGLE",
  2: "SPLIT_2",
  3: "SPLIT_3",
  4: "SPLIT_4",
  5: "SPLIT_4",
  6: "GRID_6",
  7: "GRID_8",
  8: "GRID_8",
};

export function mapStationToCategory(
  station: LivingPlayerStationFamily,
): StreamCategory | null {
  return STATION_TO_CATEGORY[station] ?? null;
}

export function roomsForStation(station: LivingPlayerStationFamily): LiveSession[] {
  const cat = mapStationToCategory(station);
  if (!cat) return getActiveSessions();
  return getSessionsByCategory(cat);
}

export function resolveStationCommand(
  stations: LivingPlayerStationFamily[],
  currentIndex: number,
): LivingBindingResult & { nextIndex: number } {
  if (!stations.length) {
    return {
      ok: false,
      command: "STATION",
      authority: "livingPlayerControlContract.stations",
      detail: "No stations entitled for this role",
      empty: true,
      nextIndex: 0,
    };
  }
  const nextIndex = (currentIndex + 1) % stations.length;
  const station = stations[nextIndex]!;
  const rooms = roomsForStation(station);
  return {
    ok: true,
    command: "STATION",
    authority: "GlobalLiveSessionRegistry",
    detail: `Station ${station} · ${rooms.length} live room(s)`,
    station,
    empty: rooms.length === 0,
    nextIndex,
  };
}

export function resolveRoomCommand(
  station: LivingPlayerStationFamily | undefined,
  roomIndex: number,
): LivingBindingResult & { nextRoomIndex: number; rooms: LiveSession[] } {
  const rooms = station ? roomsForStation(station) : getActiveSessions();
  if (!rooms.length) {
    return {
      ok: true,
      command: "ROOM",
      authority: "GlobalLiveSessionRegistry",
      detail: "No active rooms in station family (honest empty)",
      roomId: null,
      session: null,
      empty: true,
      nextRoomIndex: 0,
      rooms,
    };
  }
  const nextRoomIndex = (roomIndex + 1) % rooms.length;
  const session = rooms[nextRoomIndex]!;
  return {
    ok: true,
    command: "ROOM",
    authority: "GlobalLiveSessionRegistry",
    detail: `Room ${session.roomId} · ${session.category}`,
    roomId: session.roomId,
    session,
    empty: false,
    nextRoomIndex,
    rooms,
  };
}

export function resolveSourceCommand(
  current: MediaSource,
  frameId: FrameId,
): LivingBindingResult & { nextSource: MediaSource } {
  const idx = Math.max(0, SOURCE_CYCLE.indexOf(current ?? "SELF_CAMERA"));
  const nextSource = SOURCE_CYCLE[(idx + 1) % SOURCE_CYCLE.length]!;
  return {
    ok: true,
    command: "SOURCE",
    authority: "canonicalMediaPlayerRuntime.assignSource",
    detail: `Frame ${frameId} → ${nextSource}`,
    source: nextSource,
    nextSource,
  };
}

export function resolveMixCommand(viewCount: LivingViewCount): LivingBindingResult {
  const layout = VIEW_TO_LAYOUT[viewCount];
  return {
    ok: true,
    command: "MIX",
    authority: "canonicalMediaPlayerRuntime.setLayout",
    detail: `View ${viewCount} → layout ${layout}`,
    layout,
  };
}

export function nextSourceInCycle(current: MediaSource): MediaSource {
  return resolveSourceCommand(current, "a").nextSource;
}
