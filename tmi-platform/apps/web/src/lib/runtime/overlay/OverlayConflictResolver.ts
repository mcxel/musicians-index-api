import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

export type OverlaySurface =
  | 'home-1'
  | 'home-2'
  | 'home-3'
  | 'home-4'
  | 'home-5'
  | 'magazine'
  | 'lobby'
  | 'cypher-arena'
  | 'sponsor-takeover'
  | 'observatory-hud';

export interface RuntimeOverlay {
  overlayId: string;
  roomId: ChatRoomId;
  surface: OverlaySurface;
  priority: number;
  zIndex: number;
  ownerId: string;
  createdAtMs: number;
  updatedAtMs: number;
  expiresAtMs: number;
  stale: boolean;
  duplicateGroup?: string;
  payload?: Record<string, unknown>;
}

const overlaysByRoom = new Map<ChatRoomId, Map<string, RuntimeOverlay>>();

const surfaceBaseZ: Record<OverlaySurface, number> = {
  'home-1': 100,
  'home-2': 120,
  'home-3': 140,
  'home-4': 160,
  'home-5': 180,
  magazine: 200,
  lobby: 220,
  'cypher-arena': 260,
  'sponsor-takeover': 300,
  'observatory-hud': 320,
};

function roomMap(roomId: ChatRoomId): Map<string, RuntimeOverlay> {
  const existing = overlaysByRoom.get(roomId);
  if (existing) return existing;
  const next = new Map<string, RuntimeOverlay>();
  overlaysByRoom.set(roomId, next);
  return next;
}

export function registerRuntimeOverlay(input: {
  roomId: ChatRoomId;
  overlayId: string;
  surface: OverlaySurface;
  ownerId: string;
  priority: number;
  ttlMs?: number;
  duplicateGroup?: string;
  payload?: Record<string, unknown>;
}): RuntimeOverlay {
  const now = Date.now();
  const map = roomMap(input.roomId);
  const base = surfaceBaseZ[input.surface] ?? 100;

  const overlay: RuntimeOverlay = {
    overlayId: input.overlayId,
    roomId: input.roomId,
    surface: input.surface,
    priority: input.priority,
    zIndex: base + input.priority,
    ownerId: input.ownerId,
    createdAtMs: map.get(input.overlayId)?.createdAtMs ?? now,
    updatedAtMs: now,
    expiresAtMs: now + Math.max(500, input.ttlMs ?? 8000),
    stale: false,
    duplicateGroup: input.duplicateGroup,
    payload: input.payload,
  };

  map.set(input.overlayId, overlay);
  return overlay;
}

export function resolveOverlayPriorityGraph(roomId: ChatRoomId): RuntimeOverlay[] {
  const map = overlaysByRoom.get(roomId);
  if (!map) return [];

  const now = Date.now();
  const active = [...map.values()].filter((overlay) => overlay.expiresAtMs > now && !overlay.stale);

  active.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (b.zIndex !== a.zIndex) return b.zIndex - a.zIndex;
    return a.createdAtMs - b.createdAtMs;
  });

  return active;
}

export function arbitrateOverlayZIndex(roomId: ChatRoomId): RuntimeOverlay[] {
  const resolved = resolveOverlayPriorityGraph(roomId);
  const occupied = new Set<number>();

  for (const overlay of resolved) {
    let target = overlay.zIndex;
    while (occupied.has(target)) target += 1;
    occupied.add(target);

    overlay.zIndex = target;
    overlay.updatedAtMs = Date.now();
    roomMap(roomId).set(overlay.overlayId, overlay);
  }

  return resolved;
}

export function evictRuntimeOverlay(roomId: ChatRoomId, overlayId: string): boolean {
  const map = overlaysByRoom.get(roomId);
  if (!map) return false;
  return map.delete(overlayId);
}

export function sweepStaleOverlays(roomId?: ChatRoomId): {
  removed: number;
  markedStale: number;
  duplicateSuppressed: number;
} {
  const now = Date.now();
  let removed = 0;
  let markedStale = 0;
  let duplicateSuppressed = 0;

  const targets = roomId ? [roomId] : [...overlaysByRoom.keys()];
  for (const id of targets) {
    const map = overlaysByRoom.get(id);
    if (!map) continue;

    // First pass: expiration
    for (const [k, overlay] of map.entries()) {
      if (overlay.expiresAtMs <= now) {
        map.delete(k);
        removed += 1;
      }
    }

    // Second pass: duplicate suppression by duplicateGroup
    const byGroup = new Map<string, RuntimeOverlay[]>();
    for (const overlay of map.values()) {
      if (!overlay.duplicateGroup) continue;
      const list = byGroup.get(overlay.duplicateGroup) ?? [];
      list.push(overlay);
      byGroup.set(overlay.duplicateGroup, list);
    }

    for (const group of byGroup.values()) {
      if (group.length <= 1) continue;
      group.sort((a, b) => b.priority - a.priority || b.updatedAtMs - a.updatedAtMs);
      for (let i = 1; i < group.length; i++) {
        const stale = group[i];
        stale.stale = true;
        stale.updatedAtMs = now;
        map.set(stale.overlayId, stale);
        markedStale += 1;
        duplicateSuppressed += 1;
      }
    }
  }

  return { removed, markedStale, duplicateSuppressed };
}

export function listRoomOverlays(roomId: ChatRoomId): RuntimeOverlay[] {
  const map = overlaysByRoom.get(roomId);
  if (!map) return [];
  return [...map.values()].sort((a, b) => b.zIndex - a.zIndex);
}

export function getOverlayResolverDiagnostics(roomId?: ChatRoomId) {
  const targets = roomId ? [roomId] : [...overlaysByRoom.keys()];
  const rooms = targets.map((id) => {
    const overlays = listRoomOverlays(id);
    return {
      roomId: id,
      active: overlays.filter((o) => !o.stale).length,
      stale: overlays.filter((o) => o.stale).length,
      overlays,
    };
  });

  return {
    roomCount: rooms.length,
    totalOverlays: rooms.reduce((sum, room) => sum + room.overlays.length, 0),
    rooms,
  };
}
