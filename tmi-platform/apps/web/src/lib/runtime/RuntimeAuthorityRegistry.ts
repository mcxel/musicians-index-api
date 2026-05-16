import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

export type RuntimeAuthorityDomain =
  | 'runtime-conductor'
  | 'camera-control'
  | 'lighting-control'
  | 'fx-control'
  | 'crowd-authority'
  | 'room-authority'
  | 'performer-authority'
  | 'overlay-authority'
  | 'motion-authority'
  | 'visual-hydration-control'
  | 'image-generation-control'
  | 'motion-portrait-authority';

export interface RuntimeAuthorityClaim {
  roomId: ChatRoomId;
  domain: RuntimeAuthorityDomain;
  ownerId: string;
  claimedAtMs: number;
  expiresAtMs: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface RuntimeAuthorityConflict {
  roomId: ChatRoomId;
  domain: RuntimeAuthorityDomain;
  attemptedOwnerId: string;
  activeOwnerId: string;
  timestampMs: number;
  reason: string;
}

export interface RuntimeAuthorityClaimResult {
  granted: boolean;
  claim: RuntimeAuthorityClaim;
  activeClaim: RuntimeAuthorityClaim;
  conflict?: RuntimeAuthorityConflict;
}

const DEFAULT_TTL_MS = 12_000;
const claims = new Map<string, RuntimeAuthorityClaim>();
const conflicts: RuntimeAuthorityConflict[] = [];

function key(roomId: ChatRoomId, domain: RuntimeAuthorityDomain): string {
  return `${roomId}::${domain}`;
}

function cloneClaim(claim: RuntimeAuthorityClaim): RuntimeAuthorityClaim {
  return {
    ...claim,
    metadata: claim.metadata ? { ...claim.metadata } : undefined,
  };
}

function now(): number {
  return Date.now();
}

function isExpired(claim: RuntimeAuthorityClaim, ts = now()): boolean {
  return claim.expiresAtMs <= ts;
}

function upsertClaim(claim: RuntimeAuthorityClaim): RuntimeAuthorityClaim {
  claims.set(key(claim.roomId, claim.domain), claim);
  return claim;
}

export function claimRuntimeAuthority(input: {
  roomId: ChatRoomId;
  domain: RuntimeAuthorityDomain;
  ownerId: string;
  ttlMs?: number;
  metadata?: Record<string, string | number | boolean>;
}): RuntimeAuthorityClaimResult {
  const ts = now();
  const ttlMs = Math.max(500, input.ttlMs ?? DEFAULT_TTL_MS);
  const nextClaim: RuntimeAuthorityClaim = {
    roomId: input.roomId,
    domain: input.domain,
    ownerId: input.ownerId,
    claimedAtMs: ts,
    expiresAtMs: ts + ttlMs,
    metadata: input.metadata,
  };

  const existing = claims.get(key(input.roomId, input.domain));
  if (!existing || isExpired(existing, ts) || existing.ownerId === input.ownerId) {
    const activeClaim = upsertClaim(nextClaim);
    return {
      granted: true,
      claim: cloneClaim(activeClaim),
      activeClaim: cloneClaim(activeClaim),
    };
  }

  const conflict: RuntimeAuthorityConflict = {
    roomId: input.roomId,
    domain: input.domain,
    attemptedOwnerId: input.ownerId,
    activeOwnerId: existing.ownerId,
    timestampMs: ts,
    reason: 'authority-already-claimed',
  };
  conflicts.push(conflict);
  if (conflicts.length > 500) {
    conflicts.splice(0, conflicts.length - 500);
  }

  return {
    granted: false,
    claim: cloneClaim(nextClaim),
    activeClaim: cloneClaim(existing),
    conflict,
  };
}

export function heartbeatRuntimeAuthority(input: {
  roomId: ChatRoomId;
  domain: RuntimeAuthorityDomain;
  ownerId: string;
  ttlMs?: number;
}): RuntimeAuthorityClaimResult {
  return claimRuntimeAuthority({
    roomId: input.roomId,
    domain: input.domain,
    ownerId: input.ownerId,
    ttlMs: input.ttlMs ?? DEFAULT_TTL_MS,
    metadata: { heartbeat: true },
  });
}

export function releaseRuntimeAuthority(input: {
  roomId: ChatRoomId;
  domain: RuntimeAuthorityDomain;
  ownerId: string;
}): boolean {
  const existing = claims.get(key(input.roomId, input.domain));
  if (!existing || existing.ownerId !== input.ownerId) {
    return false;
  }
  claims.delete(key(input.roomId, input.domain));
  return true;
}

export function getRuntimeAuthorityClaim(
  roomId: ChatRoomId,
  domain: RuntimeAuthorityDomain,
): RuntimeAuthorityClaim | null {
  const existing = claims.get(key(roomId, domain));
  if (!existing || isExpired(existing)) {
    return null;
  }
  return cloneClaim(existing);
}

export function listRuntimeAuthorityClaims(roomId?: ChatRoomId): RuntimeAuthorityClaim[] {
  const ts = now();
  const all: RuntimeAuthorityClaim[] = [];
  for (const claim of claims.values()) {
    if (isExpired(claim, ts)) {
      continue;
    }
    if (!roomId || claim.roomId === roomId) {
      all.push(cloneClaim(claim));
    }
  }
  return all.sort((a, b) => b.claimedAtMs - a.claimedAtMs);
}

export function listRuntimeAuthorityConflicts(limit = 50, roomId?: ChatRoomId): RuntimeAuthorityConflict[] {
  const filtered = roomId ? conflicts.filter((c) => c.roomId === roomId) : conflicts;
  return filtered.slice(-Math.max(1, limit)).reverse();
}

export interface RuntimeAuthorityRoomSummary {
  roomId: ChatRoomId;
  activeOwners: RuntimeAuthorityClaim[];
  conflictCount: number;
  duplicateOrchestratorDetected: boolean;
}

export function getRuntimeAuthorityRoomSummary(roomId: ChatRoomId): RuntimeAuthorityRoomSummary {
  const activeOwners = listRuntimeAuthorityClaims(roomId);
  const roomConflicts = listRuntimeAuthorityConflicts(250, roomId);
  const duplicateOrchestratorDetected = roomConflicts.some(
    (item) => item.domain === 'runtime-conductor',
  );

  return {
    roomId,
    activeOwners,
    conflictCount: roomConflicts.length,
    duplicateOrchestratorDetected,
  };
}

export function clearExpiredRuntimeAuthorities(): number {
  const ts = now();
  let removed = 0;
  for (const [k, claim] of claims.entries()) {
    if (isExpired(claim, ts)) {
      claims.delete(k);
      removed += 1;
    }
  }
  return removed;
}
