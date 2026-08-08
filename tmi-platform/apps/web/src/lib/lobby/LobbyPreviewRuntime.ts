/**
 * LobbyPreviewRuntime — Continuous Live Lobby Wall Standard (global).
 *
 * Contract:
 * - Tiles are preview windows into the SAME room (preview publisher, not duplicate production)
 * - Continuous motion when live; honest animated ready state when empty — never fake humans
 * - Audio: all tiles muted by default; one focus audio max
 * - Adaptive quality + visibility subscribe/unsubscribe
 * - PreviewDirector for active speaker/performer/gauntlet camera
 */

import { getRoomPresence } from "@/lib/rooms/RoomPresenceEngine";
import { directLobbyPreview, type PreviewDirectorCue } from "@/lib/lobby/PreviewDirector";
import {
  resolveLobbyDestination,
  type LobbyWallKind,
  type ResolvedDestination,
} from "@/lib/lobby/DestinationResolver";
import { getWebRTCSubscriptionGovernor } from "@/lib/adaptiveWorldRuntime/WebRTCSubscriptionGovernor";
import { LIVE_LOBBY_WALL_CONTRACT_ID } from "@/lib/adaptiveWorldRuntime/qualityContracts/LIVE_LOBBY_WALL";

export type PreviewQuality = "off" | "thumb" | "low" | "medium";

export type LobbyPreviewTileState = {
  roomId: string;
  kind: LobbyWallKind;
  occupancy: number;
  isLive: boolean;
  /** Honest ready animation when not live — never presents fake humans. */
  readyState: "empty" | "waiting" | "live";
  muted: boolean;
  focused: boolean;
  subscribed: boolean;
  quality: PreviewQuality;
  camera: PreviewDirectorCue;
  destination: ResolvedDestination;
  /**
   * webrtc-preview = subscribed+visible live (client binds via LobbyPreviewBindRuntime).
   * composed-motion = live but not bound / no publisher yet — motion only, never frozen LIVE photo.
   * ready-animation = not live.
   */
  feedMode: "webrtc-preview" | "composed-motion" | "ready-animation";
};

export type LobbyPreviewWallState = {
  tiles: LobbyPreviewTileState[];
  focusRoomId: string | null;
  /** At most one tile may have audio. */
  audioFocusRoomId: string | null;
};

type VisibilitySub = {
  roomId: string;
  visible: boolean;
};

const visibility = new Map<string, boolean>();
let audioFocusRoomId: string | null = null;
let swipeFocusIndex = 0;

/** Legacy helper kept for LiveRoomRuntimeSpine presence occupancy reads. */
export function getLobbyPreviewRuntime(roomIds: string[]) {
  return roomIds.map((roomId) => getRoomPresence(roomId));
}

export function subscribePreviewVisibility(roomId: string, visible: boolean): VisibilitySub {
  visibility.set(roomId, visible);
  return { roomId, visible };
}

export function unsubscribePreview(roomId: string): void {
  visibility.delete(roomId);
  if (audioFocusRoomId === roomId) audioFocusRoomId = null;
}

export function setLobbyAudioFocus(roomId: string | null): string | null {
  audioFocusRoomId = roomId;
  return audioFocusRoomId;
}

export function getLobbyAudioFocus(): string | null {
  return audioFocusRoomId;
}

export function buildLobbyPreviewTile(input: {
  roomId: string;
  kind: LobbyWallKind;
  href?: string;
  isLive?: boolean;
  hasActivePerformer?: boolean;
  hasActiveSpeaker?: boolean;
  isGauntlet?: boolean;
  roomClass?: "PERSISTENT_GAUNTLET" | "TEMPORARY_BATTLE" | "PERMANENT_ANCHOR";
}): LobbyPreviewTileState {
  const presence = getRoomPresence(input.roomId);
  const isLive = Boolean(input.isLive);
  const visible = visibility.get(input.roomId) ?? true;
  const focused = audioFocusRoomId === input.roomId;
  const camera = directLobbyPreview({
    roomId: input.roomId,
    isLive,
    hasActivePerformer: Boolean(input.hasActivePerformer),
    hasActiveSpeaker: Boolean(input.hasActiveSpeaker),
    isGauntlet: Boolean(input.isGauntlet) || input.kind === "gauntlet",
  });
  const destination = resolveLobbyDestination({
    roomId: input.roomId,
    kind: input.kind,
    href: input.href,
    roomClass: input.roomClass,
  });

  const webrtcPolicy =
    typeof window !== "undefined"
      ? getWebRTCSubscriptionGovernor().resolveTile({
          roomId: input.roomId,
          visible,
          focused,
          isLive,
          contract: LIVE_LOBBY_WALL_CONTRACT_ID,
        })
      : {
          subscribed: visible && isLive,
          quality: (visible && isLive ? (focused ? "medium" : "low") : visible ? "thumb" : "off") as PreviewQuality,
          allowDailyBind: visible && isLive && focused,
          contractId: LIVE_LOBBY_WALL_CONTRACT_ID,
        };

  let feedMode: LobbyPreviewTileState["feedMode"] = "ready-animation";
  if (isLive && camera.hasLiveSignal) {
    feedMode =
      webrtcPolicy.subscribed && webrtcPolicy.quality !== "off"
        ? "webrtc-preview"
        : "composed-motion";
  }

  return {
    roomId: input.roomId,
    kind: input.kind,
    occupancy: presence.occupancy,
    isLive,
    readyState: isLive ? "live" : presence.occupancy > 0 ? "waiting" : "empty",
    muted: !focused || audioFocusRoomId !== input.roomId,
    focused,
    subscribed: webrtcPolicy.subscribed,
    quality: webrtcPolicy.quality,
    camera,
    destination,
    feedMode,
  };
}

export function buildLobbyPreviewWall(inputs: Array<{
  roomId: string;
  kind: LobbyWallKind;
  href?: string;
  isLive?: boolean;
  hasActivePerformer?: boolean;
  hasActiveSpeaker?: boolean;
  isGauntlet?: boolean;
  roomClass?: "PERSISTENT_GAUNTLET" | "TEMPORARY_BATTLE" | "PERMANENT_ANCHOR";
}>): LobbyPreviewWallState {
  const tiles = inputs.map((i) => buildLobbyPreviewTile(i));
  return {
    tiles,
    focusRoomId: audioFocusRoomId,
    audioFocusRoomId,
  };
}

/** Mobile: swipe focus to adjacent preview; audio follows focus (one max). */
export function swipeLobbyPreviewFocus(
  roomIds: string[],
  direction: "next" | "prev",
): string | null {
  if (roomIds.length === 0) return null;
  if (direction === "next") {
    swipeFocusIndex = (swipeFocusIndex + 1) % roomIds.length;
  } else {
    swipeFocusIndex = (swipeFocusIndex - 1 + roomIds.length) % roomIds.length;
  }
  const id = roomIds[swipeFocusIndex] ?? null;
  return setLobbyAudioFocus(id);
}
