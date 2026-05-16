/**
 * VisualAuthorityGateway.ts
 *
 * Central authority enforcement gateway for all visual generation and hydration.
 * Wraps 5 core visual generators:
 * - DynamicMagazineImageResolver (magazine slots)
 * - RuntimeImageHydrationQueue (image hydration)
 * - AIVisualReplacementRouter (routing hub)
 * - PerformerMotionPortraitEngine (performer visuals)
 * - VenueAssetReconstructionPipeline (venue visuals)
 *
 * No visual generator executes without authority.
 * Graceful degradation when blocked.
 * Automatic retry/recovery on failure.
 * Zero silent failures.
 */

import { getRuntimeAuthorityClaim, claimRuntimeAuthority } from '@/lib/runtime/RuntimeAuthorityRegistry';
import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

// Visual authority domains
const VISUAL_AUTHORITY_DOMAINS = {
  hydration: 'visual-hydration-control',
  generation: 'image-generation-control',
  portraits: 'motion-portrait-authority',
} as const;

export type VisualAuthorityDomain = (typeof VISUAL_AUTHORITY_DOMAINS)[keyof typeof VISUAL_AUTHORITY_DOMAINS];

interface VisualGenerationRequest {
  requestId: string;
  roomId?: ChatRoomId;
  generatorType: 'magazine' | 'hydration' | 'replacement' | 'portrait' | 'venue';
  entityId: string;
  priority: 'critical' | 'high' | 'normal' | 'deferred';
  context?: Record<string, any>;
  ownerId?: string;
}

interface VisualGenerationResult {
  success: boolean;
  requestId: string;
  blocked: boolean;
  blockedReason?: string;
  blockedBy?: string;
  fallbackUsed: boolean;
  fallbackType?: 'degraded-render' | 'cached' | 'placeholder';
  assetId?: string;
  generatedAt: number;
  recoveryAction?: 'retry' | 'escalate' | 'queue' | 'none';
}

interface VisualAuthorityState {
  domain: VisualAuthorityDomain;
  granted: boolean;
  grantedBy?: string;
  leaseIssuedAt: number;
  expiresAt: number;
  ttlMs: number;
  renewalCount: number;
  generatorHeartbeat: number;
}

interface GeneratorLeaseRecord {
  leaseId: string;
  roomId?: ChatRoomId;
  domain: VisualAuthorityDomain;
  generatorId: string;
  entityId?: string;
  leaseIssuedAt: number;
  leaseExpiresAt: number;
  renewalCount: number;
  generatorHeartbeat: number;
  forcedReclaimed: boolean;
}

// Blocked visual tracking (for recovery)
const BLOCKED_VISUALS = new Map<
  string,
  {
    timestamp: number;
    domain: VisualAuthorityDomain;
    blockedBy: string;
    retryCount: number;
    maxRetries: number;
  }
>();

// Cache for successful generations (fallback source)
const GENERATION_CACHE = new Map<string, { assetId: string; timestamp: number }>();

// Active generator leases (hardening: explicit lease lifecycle)
const GENERATOR_LEASES = new Map<string, GeneratorLeaseRecord>();

const DEFAULT_GENERATOR_LEASE_MS = 5_000;
const MAX_LEASE_IDLE_MS = 7_500;

function leaseKey(roomId: ChatRoomId | undefined, domain: VisualAuthorityDomain, generatorId: string): string {
  return `${roomId ?? 'global'}::${domain}::${generatorId}`;
}

function upsertGeneratorLease(input: {
  roomId?: ChatRoomId;
  domain: VisualAuthorityDomain;
  generatorId: string;
  entityId?: string;
  ttlMs: number;
}): GeneratorLeaseRecord {
  const key = leaseKey(input.roomId, input.domain, input.generatorId);
  const ts = Date.now();
  const existing = GENERATOR_LEASES.get(key);

  const lease: GeneratorLeaseRecord = {
    leaseId: existing?.leaseId ?? `${key}::${ts}`,
    roomId: input.roomId,
    domain: input.domain,
    generatorId: input.generatorId,
    entityId: input.entityId,
    leaseIssuedAt: existing?.leaseIssuedAt ?? ts,
    leaseExpiresAt: ts + input.ttlMs,
    renewalCount: (existing?.renewalCount ?? 0) + (existing ? 1 : 0),
    generatorHeartbeat: ts,
    forcedReclaimed: false,
  };

  GENERATOR_LEASES.set(key, lease);
  return lease;
}

export function heartbeatGeneratorLease(input: {
  roomId?: ChatRoomId;
  domain: VisualAuthorityDomain;
  generatorId: string;
  ttlMs?: number;
  entityId?: string;
}): GeneratorLeaseRecord {
  return upsertGeneratorLease({
    roomId: input.roomId,
    domain: input.domain,
    generatorId: input.generatorId,
    entityId: input.entityId,
    ttlMs: Math.max(500, input.ttlMs ?? DEFAULT_GENERATOR_LEASE_MS),
  });
}

export function renewGeneratorLease(input: {
  roomId?: ChatRoomId;
  domain: VisualAuthorityDomain;
  generatorId: string;
  ttlMs?: number;
}): GeneratorLeaseRecord | null {
  const key = leaseKey(input.roomId, input.domain, input.generatorId);
  const existing = GENERATOR_LEASES.get(key);
  if (!existing) {
    return null;
  }

  return heartbeatGeneratorLease({
    roomId: input.roomId,
    domain: input.domain,
    generatorId: input.generatorId,
    ttlMs: input.ttlMs,
    entityId: existing.entityId,
  });
}

export function forceReclaimGeneratorLease(input: {
  roomId?: ChatRoomId;
  domain: VisualAuthorityDomain;
  generatorId?: string;
  entityId?: string;
}): number {
  const now = Date.now();
  let reclaimed = 0;

  for (const [k, lease] of GENERATOR_LEASES.entries()) {
    if (input.roomId && lease.roomId !== input.roomId) continue;
    if (lease.domain !== input.domain) continue;
    if (input.generatorId && lease.generatorId !== input.generatorId) continue;
    if (input.entityId && lease.entityId !== input.entityId) continue;

    lease.forcedReclaimed = true;
    lease.leaseExpiresAt = now;
    GENERATOR_LEASES.set(k, lease);
    GENERATOR_LEASES.delete(k);
    reclaimed += 1;
  }

  return reclaimed;
}

export function sweepExpiredGeneratorLeases(): {
  expiredCount: number;
  staleHeartbeatCount: number;
} {
  const ts = Date.now();
  let expiredCount = 0;
  let staleHeartbeatCount = 0;

  for (const [k, lease] of GENERATOR_LEASES.entries()) {
    const expired = lease.leaseExpiresAt <= ts;
    const staleHeartbeat = ts - lease.generatorHeartbeat > MAX_LEASE_IDLE_MS;

    if (expired || staleHeartbeat) {
      GENERATOR_LEASES.delete(k);
      if (expired) expiredCount += 1;
      if (staleHeartbeat) staleHeartbeatCount += 1;
    }
  }

  return { expiredCount, staleHeartbeatCount };
}

export function listActiveGeneratorLeases(roomId?: ChatRoomId): GeneratorLeaseRecord[] {
  const ts = Date.now();
  return [...GENERATOR_LEASES.values()]
    .filter((lease) => (!roomId || lease.roomId === roomId) && lease.leaseExpiresAt > ts)
    .sort((a, b) => b.leaseIssuedAt - a.leaseIssuedAt)
    .map((lease) => ({ ...lease }));
}

/**
 * Claim visual authority for a generator operation.
 * Respects the authority tier and returns grant status.
 */
export function claimVisualAuthority(
  roomId: ChatRoomId | undefined,
  domain: VisualAuthorityDomain,
  generatorId: string,
  ttlMs: number = DEFAULT_GENERATOR_LEASE_MS,
  entityId?: string
): VisualAuthorityState {
  const ts = Date.now();
  const lease = heartbeatGeneratorLease({
    roomId,
    domain,
    generatorId,
    ttlMs,
    entityId,
  });

  if (!roomId) {
    // Single-instance or non-room-specific visuals don't need authority
    return {
      domain,
      granted: true,
      leaseIssuedAt: lease.leaseIssuedAt,
      expiresAt: lease.leaseExpiresAt,
      ttlMs,
      renewalCount: lease.renewalCount,
      generatorHeartbeat: lease.generatorHeartbeat,
    };
  }

  // Try to claim authority
  const claim = claimRuntimeAuthority({
    roomId,
    domain,
    ownerId: generatorId,
    ttlMs,
    metadata: { type: 'visual-generation', domain },
  });

  return {
    domain,
    granted: claim.granted,
    grantedBy: claim.claim?.ownerId,
    leaseIssuedAt: lease.leaseIssuedAt,
    expiresAt: lease.leaseExpiresAt,
    ttlMs,
    renewalCount: lease.renewalCount,
    generatorHeartbeat: lease.generatorHeartbeat,
  };
}

/**
 * Execute a visual generation request with authority protection.
 * Handles blocking, fallback, and recovery.
 */
export async function executeVisualGeneration(
  request: VisualGenerationRequest,
  generator: () => Promise<{ assetId: string } | null>
): Promise<VisualGenerationResult> {
  const startTime = Date.now();

  // Step 1: Claim authority
  const authority = claimVisualAuthority(
    request.roomId,
    getPrimaryDomain(request.generatorType),
    `gen-${request.generatorType}`,
    DEFAULT_GENERATOR_LEASE_MS,
    request.entityId
  );

  // Step 2: If blocked, check fallback options
  if (!authority.granted) {
    return handleBlockedVisual(request, authority);
  }

  // Step 3: Execute generation
  try {
    const result = await generator();

    if (result?.assetId) {
      // Cache successful generation
      GENERATION_CACHE.set(request.entityId, {
        assetId: result.assetId,
        timestamp: Date.now(),
      });

      // Clear any previous blocks
      BLOCKED_VISUALS.delete(request.entityId);

      return {
        success: true,
        requestId: request.requestId,
        blocked: false,
        fallbackUsed: false,
        assetId: result.assetId,
        generatedAt: startTime,
        recoveryAction: 'none',
      };
    }

    // Generator returned null (soft failure)
    return handleGenerationFailure(request, 'generator-returned-null', authority);
  } catch (error) {
    // Generator threw error (hard failure)
    return handleGenerationFailure(request, error instanceof Error ? error.message : 'unknown-error', authority);
  }
}

/**
 * Handle blocked visual requests.
 * Tries fallback options in order:
 * 1. Cached successful generation
 * 2. Degraded render (reduced quality)
 * 3. Escalate to priority queue
 */
function handleBlockedVisual(request: VisualGenerationRequest, authority: VisualAuthorityState): VisualGenerationResult {
  // Check for cached asset
  const cached = GENERATION_CACHE.get(request.entityId);
  if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) {
    // Cached within 1 hour
    return {
      success: true,
      requestId: request.requestId,
      blocked: true,
      blockedReason: `authority-held-by-${authority.grantedBy}`,
      blockedBy: authority.grantedBy,
      fallbackUsed: true,
      fallbackType: 'cached',
      assetId: cached.assetId,
      generatedAt: Date.now(),
      recoveryAction: 'retry',
    };
  }

  // Track blocked visual for recovery
  const blocked = BLOCKED_VISUALS.get(request.entityId) || {
    timestamp: Date.now(),
    domain: authority.domain,
    blockedBy: authority.grantedBy || 'unknown',
    retryCount: 0,
    maxRetries: 5,
  };

  blocked.retryCount++;
  BLOCKED_VISUALS.set(request.entityId, blocked);

  // Determine recovery action
  let recoveryAction: VisualGenerationResult['recoveryAction'] = 'retry';
  if (blocked.retryCount > blocked.maxRetries) {
    recoveryAction = 'escalate';
  }

  // Deferred priority requests get queued for retry
  if (request.priority === 'deferred' || blocked.retryCount > 2) {
    recoveryAction = 'queue';
  }

  return {
    success: false,
    requestId: request.requestId,
    blocked: true,
    blockedReason: `authority-conflict-${authority.domain}`,
    blockedBy: authority.grantedBy,
    fallbackUsed: true,
    fallbackType: 'degraded-render',
    generatedAt: Date.now(),
    recoveryAction,
  };
}

/**
 * Handle generation failures (generator threw or returned null).
 * Escalates based on priority and retry count.
 */
function handleGenerationFailure(
  request: VisualGenerationRequest,
  error: string,
  authority: VisualAuthorityState
): VisualGenerationResult {
  const blocked = BLOCKED_VISUALS.get(request.entityId) || {
    timestamp: Date.now(),
    domain: authority.domain,
    blockedBy: 'generation-failure',
    retryCount: 0,
    maxRetries: 3,
  };

  blocked.retryCount++;
  BLOCKED_VISUALS.set(request.entityId, blocked);

  // Check cache as fallback
  const cached = GENERATION_CACHE.get(request.entityId);
  if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
    // Cached within 24 hours (use for critical failures)
    return {
      success: false,
      requestId: request.requestId,
      blocked: false,
      blockedReason: error,
      fallbackUsed: true,
      fallbackType: 'cached',
      assetId: cached.assetId,
      generatedAt: Date.now(),
      recoveryAction: 'retry',
    };
  }

  // Determine escalation
  let recoveryAction: VisualGenerationResult['recoveryAction'] = 'retry';
  if (request.priority === 'critical' && blocked.retryCount <= 2) {
    recoveryAction = 'escalate';
  }

  return {
    success: false,
    requestId: request.requestId,
    blocked: false,
    blockedReason: error,
    fallbackUsed: false,
    generatedAt: Date.now(),
    recoveryAction,
  };
}

/**
 * Get primary authority domain for a generator type.
 */
function getPrimaryDomain(generatorType: VisualGenerationRequest['generatorType']): VisualAuthorityDomain {
  const domainMap: Record<VisualGenerationRequest['generatorType'], VisualAuthorityDomain> = {
    magazine: VISUAL_AUTHORITY_DOMAINS.generation,
    hydration: VISUAL_AUTHORITY_DOMAINS.hydration,
    replacement: VISUAL_AUTHORITY_DOMAINS.generation,
    portrait: VISUAL_AUTHORITY_DOMAINS.portraits,
    venue: VISUAL_AUTHORITY_DOMAINS.generation,
  };
  return domainMap[generatorType];
}

/**
 * Get blocked visual recovery candidates.
 * Returns visuals waiting to be retried.
 */
export function getBlockedVisualRecoveryCandidates(
  domain?: VisualAuthorityDomain
): Array<{
  entityId: string;
  domain: VisualAuthorityDomain;
  blockedBy: string;
  retryCount: number;
  blockedSince: number;
  shouldRetry: boolean;
}> {
  const now = Date.now();
  const candidates: ReturnType<typeof getBlockedVisualRecoveryCandidates> = [];

  for (const [entityId, block] of BLOCKED_VISUALS.entries()) {
    if (domain && block.domain !== domain) continue;

    const blockedDuration = now - block.timestamp;
    // Should retry if blocked for >2s or if retryCount is reasonable
    const shouldRetry =
      blockedDuration > 2000 || (block.retryCount < block.maxRetries && blockedDuration > 500);

    candidates.push({
      entityId,
      domain: block.domain,
      blockedBy: block.blockedBy,
      retryCount: block.retryCount,
      blockedSince: block.timestamp,
      shouldRetry,
    });
  }

  return candidates;
}

/**
 * Clear blocked visual (on successful retry or explicit resolution).
 */
export function resolveBlockedVisual(entityId: string): void {
  BLOCKED_VISUALS.delete(entityId);
}

/**
 * Get visual authority statistics.
 */
export function getVisualAuthorityStats(): {
  blockedCount: number;
  cachedCount: number;
  activeGeneratorLeases: number;
  domainBlockCounts: Record<VisualAuthorityDomain, number>;
} {
  const domainBlockCounts: Record<VisualAuthorityDomain, number> = {
    [VISUAL_AUTHORITY_DOMAINS.hydration]: 0,
    [VISUAL_AUTHORITY_DOMAINS.generation]: 0,
    [VISUAL_AUTHORITY_DOMAINS.portraits]: 0,
  };

  for (const block of BLOCKED_VISUALS.values()) {
    domainBlockCounts[block.domain]++;
  }

  return {
    blockedCount: BLOCKED_VISUALS.size,
    cachedCount: GENERATION_CACHE.size,
    activeGeneratorLeases: GENERATOR_LEASES.size,
    domainBlockCounts,
  };
}

/**
 * Cleanup old blocked visuals and cache entries (call periodically).
 */
export function cleanupVisualAuthorityState(): void {
  sweepExpiredGeneratorLeases();

  const now = Date.now();
  const maxBlockAge = 5 * 60 * 1000; // 5 minutes
  const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours

  // Clean blocked visuals
  for (const [entityId, block] of BLOCKED_VISUALS.entries()) {
    if (now - block.timestamp > maxBlockAge) {
      BLOCKED_VISUALS.delete(entityId);
    }
  }

  // Clean cache
  for (const [entityId, cached] of GENERATION_CACHE.entries()) {
    if (now - cached.timestamp > maxCacheAge) {
      GENERATION_CACHE.delete(entityId);
    }
  }
}

// Run cleanup every 10 minutes.
// unref() keeps Node proof scripts deterministic by not pinning process lifetime.
const cleanupInterval = setInterval(cleanupVisualAuthorityState, 10 * 60 * 1000);
if (typeof (cleanupInterval as NodeJS.Timeout).unref === 'function') {
  (cleanupInterval as NodeJS.Timeout).unref();
}
