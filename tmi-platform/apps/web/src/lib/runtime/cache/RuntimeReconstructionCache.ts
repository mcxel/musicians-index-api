import { createHash } from 'node:crypto';
import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';
import type { RuntimeAuthorityDomain } from '@/lib/runtime/RuntimeAuthorityRegistry';

export type ReconstructionCacheKind =
  | 'decomposition'
  | 'reconstruction'
  | 'motion'
  | 'mask'
  | 'authority-snapshot';

export interface ReconstructionCacheEntry<T = unknown> {
  key: string;
  roomId?: ChatRoomId;
  kind: ReconstructionCacheKind;
  payload: T;
  checksum: string;
  createdAtMs: number;
  updatedAtMs: number;
  expiresAtMs: number;
  sourceAssetId?: string;
  authorityDomain?: RuntimeAuthorityDomain;
  staleRecovered: boolean;
}

const cache = new Map<string, ReconstructionCacheEntry>();

function checksumFor(payload: unknown): string {
  const raw = JSON.stringify(payload);
  return createHash('sha256').update(raw).digest('hex');
}

function makeKey(kind: ReconstructionCacheKind, roomId: ChatRoomId | undefined, entityId: string): string {
  return `${kind}::${roomId ?? 'global'}::${entityId}`;
}

export function putReconstructionCache<T>(input: {
  kind: ReconstructionCacheKind;
  entityId: string;
  payload: T;
  ttlMs: number;
  roomId?: ChatRoomId;
  sourceAssetId?: string;
  authorityDomain?: RuntimeAuthorityDomain;
}): ReconstructionCacheEntry<T> {
  const now = Date.now();
  const key = makeKey(input.kind, input.roomId, input.entityId);
  const existing = cache.get(key);
  const entry: ReconstructionCacheEntry<T> = {
    key,
    roomId: input.roomId,
    kind: input.kind,
    payload: input.payload,
    checksum: checksumFor(input.payload),
    createdAtMs: existing?.createdAtMs ?? now,
    updatedAtMs: now,
    expiresAtMs: now + Math.max(500, input.ttlMs),
    sourceAssetId: input.sourceAssetId,
    authorityDomain: input.authorityDomain,
    staleRecovered: false,
  };

  cache.set(key, entry);
  return entry;
}

export function getReconstructionCache<T>(input: {
  kind: ReconstructionCacheKind;
  entityId: string;
  roomId?: ChatRoomId;
  allowStaleRecovery?: boolean;
}): ReconstructionCacheEntry<T> | null {
  const key = makeKey(input.kind, input.roomId, input.entityId);
  const entry = cache.get(key) as ReconstructionCacheEntry<T> | undefined;
  if (!entry) return null;

  const now = Date.now();
  if (entry.expiresAtMs > now) {
    return { ...entry };
  }

  if (!input.allowStaleRecovery) {
    cache.delete(key);
    return null;
  }

  const recovered: ReconstructionCacheEntry<T> = {
    ...entry,
    staleRecovered: true,
    updatedAtMs: now,
    expiresAtMs: now + 30_000,
  };
  cache.set(key, recovered);
  return recovered;
}

export function verifyReconstructionChecksum<T>(entry: ReconstructionCacheEntry<T>): boolean {
  return checksumFor(entry.payload) === entry.checksum;
}

export function invalidateAuthorityBoundCache(input: {
  roomId?: ChatRoomId;
  domain: RuntimeAuthorityDomain;
}): number {
  let removed = 0;
  for (const [k, entry] of cache.entries()) {
    if (entry.authorityDomain !== input.domain) continue;
    if (input.roomId && entry.roomId !== input.roomId) continue;
    cache.delete(k);
    removed += 1;
  }
  return removed;
}

export function recoverStaleReconstruction(input: {
  kind: ReconstructionCacheKind;
  entityId: string;
  roomId?: ChatRoomId;
}): ReconstructionCacheEntry | null {
  return getReconstructionCache({
    kind: input.kind,
    entityId: input.entityId,
    roomId: input.roomId,
    allowStaleRecovery: true,
  });
}

export function cleanupReconstructionCache(maxAgeMs = 24 * 60 * 60 * 1000): number {
  const now = Date.now();
  let removed = 0;
  for (const [k, entry] of cache.entries()) {
    const hardExpired = now - entry.updatedAtMs > maxAgeMs;
    const expired = entry.expiresAtMs <= now;
    if (hardExpired || expired) {
      cache.delete(k);
      removed += 1;
    }
  }
  return removed;
}

export function getReconstructionCacheDiagnostics() {
  const now = Date.now();
  let stale = 0;
  let corrupted = 0;

  for (const entry of cache.values()) {
    if (entry.expiresAtMs <= now) stale += 1;
    if (!verifyReconstructionChecksum(entry)) corrupted += 1;
  }

  return {
    totalEntries: cache.size,
    staleEntries: stale,
    checksumMismatches: corrupted,
    byKind: [...cache.values()].reduce<Record<ReconstructionCacheKind, number>>(
      (acc, entry) => {
        acc[entry.kind] += 1;
        return acc;
      },
      {
        decomposition: 0,
        reconstruction: 0,
        motion: 0,
        mask: 0,
        'authority-snapshot': 0,
      }
    ),
  };
}
