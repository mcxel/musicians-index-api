/**
 * Lobby Wall → Media Player routing law.
 *
 * Default: MEDIA PLAYER 1 (mon-a / frame "a").
 * Preserve active video chats / protected sessions — never auto-disconnect.
 * Ordinary watch feeds on Player 1 may be replaced instantly.
 * Both players protected → requiresUserChoice (never silent call drop).
 *
 * Reuses DisplayTargetDirector occupancy model — no second media authority.
 */

import {
  DisplayTargetDirector,
  type CastRoutingDecision,
  type MonitorSlotOccupancy,
} from "@/lib/monitors/DisplayTargetDirector";
import type { FrameId, FrameState, MediaSource } from "@/lib/media/canonicalMediaPlayerRuntime";

const FRAME_ORDER: FrameId[] = ["a", "b", "c", "d", "e", "f", "g", "h"];

/** Sources that must not be silently overwritten by Lobby Wall watch. */
const PROTECTED_SOURCES = new Set<MediaSource>(["SELF_CAMERA", "SCREEN_SHARE"]);

export function isProtectedLobbyMediaSource(source: MediaSource): boolean {
  return source !== null && PROTECTED_SOURCES.has(source);
}

export function frameIdToMonitorSlotId(frameId: FrameId): string {
  return `mon-${frameId}`;
}

export function monitorSlotIdToFrameId(slotId: string): FrameId | null {
  const m = /^mon-([a-h])$/i.exec(slotId.trim());
  if (m?.[1]) return m[1].toLowerCase() as FrameId;
  const bare = slotId.trim().toLowerCase();
  if ((FRAME_ORDER as string[]).includes(bare)) return bare as FrameId;
  return null;
}

export function framesToLobbyMonitorSlots(
  frames: Record<FrameId, FrameState>,
  opts?: {
    /** Explicit protected frame ids (e.g. active PRIVATE_VIDEO_CHAT binding). */
    protectedFrameIds?: readonly FrameId[];
    /** Room overrides count as occupied ordinary watch feeds. */
    roomOverrides?: Partial<Record<FrameId, string | null | undefined>>;
  },
): MonitorSlotOccupancy[] {
  const protectedSet = new Set(opts?.protectedFrameIds ?? []);
  return FRAME_ORDER.map((id) => {
    const frame = frames[id];
    const source = frame?.source ?? null;
    const overrideRoom = opts?.roomOverrides?.[id]?.trim();
    const isProtected =
      protectedSet.has(id) || isProtectedLobbyMediaSource(source);
    const isOccupied =
      Boolean(overrideRoom) || (source !== null && !frame?.parked);
    let contentType: MonitorSlotOccupancy["contentType"] = "IDLE";
    if (isProtected) contentType = "PRIVATE_CALL";
    else if (source === "SELF_CAMERA" || source === "PERFORMER_FEED") contentType = "CAMERA";
    else if (isOccupied) contentType = "LIVE_SOURCE";
    return {
      slotId: frameIdToMonitorSlotId(id),
      label: frame?.label ?? `Player ${id.toUpperCase()}`,
      isOccupied,
      contentType,
      isProtectedProgram: isProtected,
      isPinned: Boolean(frame?.focused && isProtected),
    };
  });
}

/**
 * Lobby Wall watch routing:
 * 1) Player 1 free → Player 1
 * 2) Player 1 ordinary watch → replace Player 1
 * 3) Player 1 protected call → next free / non-protected sibling
 * 4) All protected → require explicit choice (preserve calls)
 */
export function resolveLobbyWallWatchTarget(
  slots: MonitorSlotOccupancy[],
  preferredFrameId?: FrameId,
): CastRoutingDecision & { frameId: FrameId | null } {
  if (preferredFrameId) {
    const preferred = DisplayTargetDirector.resolveBestDisplayTarget(
      "LIVE_SOURCE",
      slots,
      frameIdToMonitorSlotId(preferredFrameId),
    );
    return {
      ...preferred,
      frameId: monitorSlotIdToFrameId(preferred.targetSlotId),
    };
  }

  const monA = slots.find((s) => s.slotId === "mon-a") ?? slots[0];
  if (monA) {
    const protectedA =
      monA.isProtectedProgram ||
      monA.isPinned ||
      monA.contentType === "PRIVATE_CALL";
    if (!protectedA) {
      return {
        success: true,
        targetSlotId: monA.slotId,
        previousContentPreserved: !monA.isOccupied || monA.contentType === "IDLE",
        reason: monA.isOccupied
          ? "Replaced ordinary watch feed on Media Player 1"
          : "Routed Lobby Wall selection to Media Player 1",
        requiresUserChoice: false,
        candidateSlots: [monA.slotId],
        frameId: monitorSlotIdToFrameId(monA.slotId),
      };
    }
  }

  const next = DisplayTargetDirector.resolveBestDisplayTarget("LIVE_SOURCE", slots);
  return {
    ...next,
    frameId: monitorSlotIdToFrameId(next.targetSlotId),
  };
}
