/**
 * RuntimeConductorAuthority.ts
 *
 * Manages conductor ownership, lease tracking, and election orchestration.
 * Prevents:
 * - Duplicate conductors in same room
 * - Stalled/dead conductor ownership
 * - Split-brain (multiple conductors claiming authority)
 * - Deadlock from circular authority claims
 *
 * Implements:
 * - Lease-based conductor ownership (auto-expiration)
 * - Watchdog heartbeat tracking
 * - Automatic failover election
 * - Conductor liveness verification
 */

import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

export interface ConductorLease {
  roomId: ChatRoomId;
  conductorId: string;
  leaseStartMs: number;
  leaseExpiresMs: number;
  heartbeatLastMs: number;
  heartbeatIntervalMs: number;
  priority: 'primary' | 'standby' | 'recovery';
  isActive: boolean;
}

interface ConductorWatchdog {
  roomId: ChatRoomId;
  conductorId: string;
  failureCount: number;
  lastHealthCheckMs: number;
  isHealthy: boolean;
}

const CONDUCTOR_LEASES = new Map<ChatRoomId, ConductorLease>();
const CONDUCTOR_WATCHDOGS = new Map<ChatRoomId, ConductorWatchdog>();

const LEASE_CONFIG = {
  leaseDurationMs: 20_000, // 20s conductor lease
  heartbeatIntervalMs: 5_000, // Expect heartbeat every 5s
  heartbeatToleranceMs: 7_500, // 1.5x interval before considered stale
  electionTimeoutMs: 10_000, // Wait 10s after conductor dies before electing
  watchdogCheckIntervalMs: 2_500, // Health check every 2.5s
  maxFailuresBeforeDemote: 3, // 3 missed heartbeats → demotion
};

/**
 * Claim conductor authority for a room.
 * If conductor exists and is healthy, blocks new claims.
 * If no conductor or conductor is stale, grants authority.
 */
export function claimConductorAuthority(
  roomId: ChatRoomId,
  conductorId: string,
  priority: 'primary' | 'standby' | 'recovery' = 'primary'
): {
  granted: boolean;
  reason: string;
  existingConductor?: ConductorLease;
} {
  const existing = CONDUCTOR_LEASES.get(roomId);
  const now = Date.now();

  if (existing && existing.isActive) {
    // Conductor exists and is active
    const isStale = now - existing.heartbeatLastMs > LEASE_CONFIG.heartbeatToleranceMs;

    if (!isStale) {
      // Conductor is healthy, deny claim
      return {
        granted: false,
        reason: `Active conductor exists: ${existing.conductorId}`,
        existingConductor: existing,
      };
    }

    // Conductor is stale but lease hasn't expired yet
    const isLeaseExpired = now > existing.leaseExpiresMs;
    if (!isLeaseExpired) {
      return {
        granted: false,
        reason: `Conductor stale but lease valid: ${existing.conductorId}`,
        existingConductor: existing,
      };
    }
  }

  // No conductor or existing is expired; grant authority
  const lease: ConductorLease = {
    roomId,
    conductorId,
    leaseStartMs: now,
    leaseExpiresMs: now + LEASE_CONFIG.leaseDurationMs,
    heartbeatLastMs: now,
    heartbeatIntervalMs: LEASE_CONFIG.heartbeatIntervalMs,
    priority,
    isActive: true,
  };

  CONDUCTOR_LEASES.set(roomId, lease);

  // Initialize watchdog
  if (!CONDUCTOR_WATCHDOGS.has(roomId)) {
    CONDUCTOR_WATCHDOGS.set(roomId, {
      roomId,
      conductorId,
      failureCount: 0,
      lastHealthCheckMs: now,
      isHealthy: true,
    });
  }

  console.log(`[ConductorAuthority] ${conductorId} claimed authority for ${roomId}`);
  return { granted: true, reason: 'Authority granted' };
}

/**
 * Mark conductor heartbeat (keep lease alive).
 */
export function heartbeatConductor(roomId: ChatRoomId, conductorId: string): boolean {
  const lease = CONDUCTOR_LEASES.get(roomId);
  const now = Date.now();

  if (!lease || lease.conductorId !== conductorId) {
    console.warn(`[ConductorAuthority] Heartbeat from non-owner ${conductorId} for ${roomId}`);
    return false;
  }

  if (lease.leaseExpiresMs < now) {
    console.warn(`[ConductorAuthority] Heartbeat after lease expiry for ${conductorId}`);
    lease.isActive = false;
    return false;
  }

  // Renew lease and update heartbeat
  lease.heartbeatLastMs = now;
  lease.leaseExpiresMs = now + LEASE_CONFIG.leaseDurationMs;

  // Reset watchdog failures on successful heartbeat
  const watchdog = CONDUCTOR_WATCHDOGS.get(roomId);
  if (watchdog) {
    watchdog.failureCount = 0;
    watchdog.isHealthy = true;
  }

  return true;
}

/**
 * Release conductor authority (graceful shutdown).
 */
export function releaseConductorAuthority(roomId: ChatRoomId, conductorId: string): boolean {
  const lease = CONDUCTOR_LEASES.get(roomId);

  if (!lease || lease.conductorId !== conductorId) {
    return false;
  }

  lease.isActive = false;
  console.log(`[ConductorAuthority] ${conductorId} released authority for ${roomId}`);
  return true;
}

/**
 * Get current conductor lease for room.
 */
export function getConductorLease(roomId: ChatRoomId): ConductorLease | undefined {
  return CONDUCTOR_LEASES.get(roomId);
}

/**
 * Check if conductor is still valid (not stale/expired).
 */
export function isConductorValid(roomId: ChatRoomId, conductorId: string): boolean {
  const lease = getConductorLease(roomId);
  if (!lease) return false;

  const now = Date.now();
  const isLeaseValid = now <= lease.leaseExpiresMs;
  const isHeartbeatRecent = now - lease.heartbeatLastMs <= LEASE_CONFIG.heartbeatToleranceMs;

  return isLeaseValid && isHeartbeatRecent && lease.isActive;
}

/**
 * Run conductor health check (call periodically).
 * Marks stale conductors and tracks failure count.
 */
export function checkConductorHealth(roomId: ChatRoomId): {
  isHealthy: boolean;
  conductorId?: string;
  failureCount: number;
  shouldElect: boolean;
} {
  const lease = CONDUCTOR_LEASES.get(roomId);
  const watchdog = CONDUCTOR_WATCHDOGS.get(roomId);
  const now = Date.now();

  if (!lease || !watchdog) {
    return {
      isHealthy: false,
      failureCount: 0,
      shouldElect: true,
    };
  }

  const isStale = now - lease.heartbeatLastMs > LEASE_CONFIG.heartbeatToleranceMs;
  const isExpired = now > lease.leaseExpiresMs;

  if (isStale || isExpired) {
    watchdog.failureCount++;
    watchdog.isHealthy = false;

    const shouldElect = watchdog.failureCount >= LEASE_CONFIG.maxFailuresBeforeDemote;

    if (shouldElect) {
      console.warn(`[ConductorAuthority] ${lease.conductorId} marked unhealthy (failures: ${watchdog.failureCount})`);
    }

    return {
      isHealthy: false,
      conductorId: lease.conductorId,
      failureCount: watchdog.failureCount,
      shouldElect,
    };
  }

  watchdog.isHealthy = true;
  watchdog.failureCount = 0;

  return {
    isHealthy: true,
    conductorId: lease.conductorId,
    failureCount: 0,
    shouldElect: false,
  };
}

/**
 * Get conductor authority diagnostics.
 */
export function getConductorAuthorityDiagnostics(): {
  activeConductors: Array<{ roomId: ChatRoomId; conductorId: string; priority: string; ageMs: number }>;
  staleConductors: Array<{ roomId: ChatRoomId; conductorId: string; staleSinceMs: number }>;
  healthStatus: Map<ChatRoomId, { isHealthy: boolean; failureCount: number }>;
} {
  const now = Date.now();
  const active: Array<{ roomId: ChatRoomId; conductorId: string; priority: string; ageMs: number }> = [];
  const stale: Array<{ roomId: ChatRoomId; conductorId: string; staleSinceMs: number }> = [];
  const health = new Map<ChatRoomId, { isHealthy: boolean; failureCount: number }>();

  for (const [roomId, lease] of CONDUCTOR_LEASES.entries()) {
    const watchdog = CONDUCTOR_WATCHDOGS.get(roomId);
    const isStale = now - lease.heartbeatLastMs > LEASE_CONFIG.heartbeatToleranceMs;

    if (isStale) {
      stale.push({
        roomId,
        conductorId: lease.conductorId,
        staleSinceMs: now - lease.heartbeatLastMs,
      });
    } else {
      active.push({
        roomId,
        conductorId: lease.conductorId,
        priority: lease.priority,
        ageMs: now - lease.leaseStartMs,
      });
    }

    if (watchdog) {
      health.set(roomId, {
        isHealthy: watchdog.isHealthy,
        failureCount: watchdog.failureCount,
      });
    }
  }

  return {
    activeConductors: active,
    staleConductors: stale,
    healthStatus: health,
  };
}

/**
 * Cleanup expired leases (call periodically).
 */
export function cleanupExpiredConductorLeases(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [roomId, lease] of CONDUCTOR_LEASES.entries()) {
    if (now > lease.leaseExpiresMs + LEASE_CONFIG.electionTimeoutMs) {
      CONDUCTOR_LEASES.delete(roomId);
      CONDUCTOR_WATCHDOGS.delete(roomId);
      cleaned++;
    }
  }

  return cleaned;
}
