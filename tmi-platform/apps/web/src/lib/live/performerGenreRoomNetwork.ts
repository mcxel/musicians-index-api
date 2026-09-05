/**
 * 24/7 system-operated genre lobbies (fan + performer) — seed + DiscoveryBus publication.
 * Assembles onto LiveRoomEngine + DiscoveryPublisher — not a parallel venue runtime.
 */

import { ensureLiveRoom, getLiveRoom, type LiveRoom } from "@/lib/live/LiveRoomEngine";
import { getLivePresenceSnapshot } from "@/lib/live/LivePresenceEngine";
import { publishLiveRoom, type PublishLiveRoomInput } from "@/lib/discovery/DiscoveryPublisher";
import type { LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";
import { resolvePerformerLobbyJoinHref } from "@/lib/venue-hud/loungeContainer";
import { sendBotToRoom } from "@/lib/bots/permanentBotOperationsEngine";
import {
  listGenreRoomDefinitions,
  type CanonicalGenreRoomDefinition,
  getGenreRoomByRoomId,
  resolveGenreLobbyJoinHref,
  type GenreLobbySide,
} from "./CanonicalGenreRegistry";

const PLATFORM_HOST_ID = "tmi-platform-genre-lobby";

let botsAssigned = false;

function assignGenreLobbyBots(def: CanonicalGenreRoomDefinition): void {
  sendBotToRoom(def.hostBotId, def.roomId, false);
  sendBotToRoom(def.guideBotId, def.roomId, false);
}

function buildStatusLine(def: CanonicalGenreRoomDefinition, humanViewers: number): string {
  const sideLabel = def.side === "FAN" ? "Fan Avatar Lobby" : "Performer Lobby";
  const humans = `👤 ${humanViewers} human${humanViewers === 1 ? "" : "s"}`;
  return `24/7 · ${def.label} ${sideLabel} · Ambience + approved playlist · ${def.guideBotLabel} on duty · ${humans}`;
}

function toPublishInput(def: CanonicalGenreRoomDefinition): PublishLiveRoomInput {
  const presence = getLivePresenceSnapshot(def.roomId);
  const humanViewers = Math.max(0, presence.fanCount);
  const sideLabel = def.side === "FAN" ? "Fan Avatar Lobby" : "Performer Lobby";
  const joinRoute =
    def.side === "PERFORMER"
      ? resolvePerformerLobbyJoinHref(def.roomId, { from: "live-lobby-wall" })
      : resolveGenreLobbyJoinHref(def.roomId, { from: "live-lobby-wall" });

  return {
    roomId: def.roomId,
    title: `${def.label} ${sideLabel}`,
    hostName: buildStatusLine(def, humanViewers),
    hostUserId: PLATFORM_HOST_ID,
    countryCode: "ZZ",
    category: def.side === "FAN" ? "fan_lobby" : "performer_lobby",
    visibility: "public",
    humanViewerCount: humanViewers,
    accentColor: def.theme.accentColor,
    joinRoute,
    joinGate: "none",
    experienceId: `genre-lobby:${def.side.toLowerCase()}:${def.genreId}`,
    startedAt: getLiveRoom(def.roomId)?.createdAtMs ?? Date.now(),
    listed: def.publishesToWall,
    statusLine: buildStatusLine(def, humanViewers),
    isAnchor: true,
    anchorFamily: def.side === "FAN" ? "fan_genre_lobby" : "performer_lobby",
    featuredCategory: def.genreId,
  };
}

function seedSide(side?: GenreLobbySide): LiveRoom[] {
  const rooms: LiveRoom[] = [];
  for (const def of listGenreRoomDefinitions(side)) {
    const room = ensureLiveRoom({
      roomId: def.roomId,
      roomType: "venue",
      title: `${def.label} ${def.side === "FAN" ? "Fan Avatar Lobby" : "Performer Lobby"}`,
      hostUserId: PLATFORM_HOST_ID,
      description: `24/7 system-operated ${def.label} ${def.side === "FAN" ? "fan avatar" : "performer"} lobby`,
      genre: def.genreId,
      tags: [
        def.side === "FAN" ? "fan-avatar-lobby" : "performer-lobby",
        "genre",
        def.genreId.toLowerCase(),
        "always-on",
        "system-operated",
      ],
      forceLive: true,
      configOverrides: { maxCapacity: def.side === "FAN" ? 96 : 48 },
    });
    rooms.push(room);
  }
  return rooms;
}

export function ensurePerformerGenreRoomsSeeded(): LiveRoom[] {
  return ensureGenreRoomsSeeded("PERFORMER");
}

export function ensureFanGenreRoomsSeeded(): LiveRoom[] {
  return ensureGenreRoomsSeeded("FAN");
}

export function ensureGenreRoomsSeeded(side?: GenreLobbySide): LiveRoom[] {
  const rooms = seedSide(side);
  const defsToSeed = side ? listGenreRoomDefinitions(side) : listGenreRoomDefinitions();
  for (const def of defsToSeed) {
    assignGenreLobbyBots(def);
  }
  if (!side) botsAssigned = true;
  return rooms;
}

function discoveryForSide(side?: GenreLobbySide): LiveDiscoveryRecord[] {
  ensureGenreRoomsSeeded(side);
  const out: LiveDiscoveryRecord[] = [];
  for (const def of listGenreRoomDefinitions(side)) {
    const published = publishLiveRoom(toPublishInput(def));
    if (published) out.push(published);
  }
  return out;
}

export function getPerformerGenreDiscoveryRecords(): LiveDiscoveryRecord[] {
  return discoveryForSide("PERFORMER");
}

export function getFanGenreDiscoveryRecords(): LiveDiscoveryRecord[] {
  return discoveryForSide("FAN");
}

export function getAllGenreDiscoveryRecords(): LiveDiscoveryRecord[] {
  return discoveryForSide();
}

export function isPerformerGenreRoomId(roomId: string): boolean {
  return getGenreRoomByRoomId(roomId)?.side === "PERFORMER";
}

export function isFanGenreRoomId(roomId: string): boolean {
  return getGenreRoomByRoomId(roomId)?.side === "FAN";
}

export function getPerformerGenreRoomTheme(roomId: string): CanonicalGenreRoomDefinition["theme"] | null {
  const def = getGenreRoomByRoomId(roomId);
  return def?.side === "PERFORMER" ? def.theme : null;
}

export function getFanGenreRoomTheme(roomId: string): CanonicalGenreRoomDefinition["theme"] | null {
  const def = getGenreRoomByRoomId(roomId);
  return def?.side === "FAN" ? def.theme : null;
}

export function getGenreRoomTheme(roomId: string): CanonicalGenreRoomDefinition["theme"] | null {
  return getGenreRoomByRoomId(roomId)?.theme ?? null;
}
