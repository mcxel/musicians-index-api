/**
 * Lobby Wall free-panel allocator — Intelligent Free-Monitor Routing.
 *
 * WORKSPACE → MONITOR → COMPOSITION → PANEL → MEDIA SOURCE
 * Never auto-displace active media, WebRTC calls, recording, or protected panels.
 * Reuses CanonicalMediaPlayerRuntime frame/layout state (Rule 8 — no parallel engine).
 */

import {
  isFrameActiveInLayout,
  type FrameId,
  type FrameState,
  type LayoutMode,
  type MediaSource,
  useCanonicalMediaPlayerRuntime,
} from "@/lib/media/canonicalMediaPlayerRuntime";

/** Idle hub defaults that may yield to Lobby Wall when not otherwise protected. */
const YIELDABLE_IDLE_SOURCES: ReadonlySet<MediaSource> = new Set([
  null,
  "SELF_CAMERA",
  "AUDIENCE_VIEW",
  "VENUE_VIEW",
]);

const HARD_OCCUPIED_SOURCES: ReadonlySet<MediaSource> = new Set([
  "SCREEN_SHARE",
  "VIDEO_PLAYBACK",
  "JUKEBOX",
  "AVATAR_LOBBY",
  "MONITOR_FEED",
  "PERFORMER_FEED",
]);

export type LobbyWallPanelOccupancyHints = {
  /** Room IDs already routed into frames (remote-control destinations). */
  roomOverrides?: Partial<Record<FrameId, string | null | undefined>>;
  /** Frames with an active peer / WebRTC call surface. */
  callFrameIds?: readonly FrameId[];
  /** Frames currently presenting screen share. */
  shareFrameIds?: readonly FrameId[];
  /** Frames tied to an active go-live / published broadcast. */
  broadcastFrameIds?: readonly FrameId[];
  /** Explicit user / system reservations that must never be stolen. */
  protectedFrameIds?: readonly FrameId[];
  /** Layout to evaluate; defaults to runtime layout. */
  layout?: LayoutMode;
};

export type LobbyWallAllocationStatus =
  | "ASSIGNED"
  | "FOCUS_EXISTING"
  | "ALL_OCCUPIED"
  | "ALREADY_RESERVED";

export type LobbyWallAllocationResult = {
  status: LobbyWallAllocationStatus;
  frameId: FrameId | null;
  reason: string;
};

const FRAME_ORDER: readonly FrameId[] = ["a", "b", "c", "d", "e", "f", "g", "h"];

type ReservationState = {
  frameId: FrameId;
  reservedAt: number;
  owner: "LOBBY_WALL";
};

let activeReservation: ReservationState | null = null;

export function getLobbyWallPanelReservation(): ReservationState | null {
  return activeReservation;
}

export function releaseLobbyWallPanelReservation(frameId?: FrameId | null): void {
  if (!activeReservation) return;
  if (frameId && activeReservation.frameId !== frameId) return;
  activeReservation = null;
}

export function peekLobbyWallDestinationFrame(): FrameId | null {
  return activeReservation?.frameId ?? null;
}

export function isFrameOccupiedForLobbyWall(
  frame: FrameState,
  hints: LobbyWallPanelOccupancyHints = {},
): boolean {
  const id = frame.id;
  if (hints.protectedFrameIds?.includes(id)) return true;
  if (hints.callFrameIds?.includes(id)) return true;
  if (hints.shareFrameIds?.includes(id)) return true;
  if (hints.broadcastFrameIds?.includes(id)) return true;
  if (hints.roomOverrides?.[id]?.trim()) return true;
  if (frame.peerCallStream) return true;
  if (HARD_OCCUPIED_SOURCES.has(frame.source)) return true;
  if (YIELDABLE_IDLE_SOURCES.has(frame.source)) return false;
  return frame.source !== null;
}

/**
 * First free compatible panel in the current layout order (not merely lowest visible DOM).
 * Does not mutate runtime — caller must reserve atomically via reserveLobbyWallFreePanel.
 */
export function findFirstFreeLobbyWallPanel(
  frames: Record<FrameId, FrameState>,
  layout: LayoutMode,
  hints: LobbyWallPanelOccupancyHints = {},
): FrameId | null {
  for (const id of FRAME_ORDER) {
    if (!isFrameActiveInLayout(id, layout)) continue;
    const frame = frames[id];
    if (!frame) continue;
    if (!isFrameOccupiedForLobbyWall(frame, hints)) return id;
  }
  return null;
}

/**
 * Atomically reserve a free panel for Lobby Wall destination routing.
 * If a Lobby Wall reservation already exists, FOCUS that panel (no duplicate).
 */
export function reserveLobbyWallFreePanel(
  hints: LobbyWallPanelOccupancyHints = {},
): LobbyWallAllocationResult {
  if (activeReservation) {
    return {
      status: "FOCUS_EXISTING",
      frameId: activeReservation.frameId,
      reason: "Lobby Wall reservation already held — focus existing destination",
    };
  }

  const runtime = useCanonicalMediaPlayerRuntime.getState();
  const layout = hints.layout ?? runtime.layout;
  const free = findFirstFreeLobbyWallPanel(runtime.frames, layout, hints);

  if (!free) {
    return {
      status: "ALL_OCCUPIED",
      frameId: null,
      reason: "No free compatible panel — require explicit destination choice",
    };
  }

  activeReservation = {
    frameId: free,
    reservedAt: Date.now(),
    owner: "LOBBY_WALL",
  };

  return {
    status: "ASSIGNED",
    frameId: free,
    reason: `Assigned free panel ${free}`,
  };
}

/**
 * Resolve which frame a Lobby Wall tile should target.
 * Prefers an existing reservation; never invents a replacement of occupied media.
 */
export function resolveLobbyWallRouteFrame(
  preferred?: FrameId | null,
  hints: LobbyWallPanelOccupancyHints = {},
): FrameId | null {
  if (preferred) {
    const runtime = useCanonicalMediaPlayerRuntime.getState();
    const layout = hints.layout ?? runtime.layout;
    const frame = runtime.frames[preferred];
    if (
      frame &&
      isFrameActiveInLayout(preferred, layout) &&
      !isFrameOccupiedForLobbyWall(frame, {
        ...hints,
        // Preferred explicit send may target a reserved Lobby Wall panel even if reserved.
        protectedFrameIds: (hints.protectedFrameIds ?? []).filter((id) => id !== preferred),
      })
    ) {
      return preferred;
    }
    // Explicit monitor-send buttons may still target preferred when user chose it.
    if (frame && isFrameActiveInLayout(preferred, layout)) return preferred;
  }

  const reserved = activeReservation?.frameId;
  if (reserved) return reserved;

  const again = reserveLobbyWallFreePanel(hints);
  return again.frameId;
}
