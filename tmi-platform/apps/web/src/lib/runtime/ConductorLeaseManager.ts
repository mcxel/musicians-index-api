/**
 * ConductorLeaseManager.ts
 *
 * Unified conductor lifecycle management:
 * - Heartbeat tracking and lease renewal
 * - Health monitoring and automatic failover
 * - Election orchestration
 * - Deadlock detection and recovery
 * - Metrics and observability
 *
 * Orchestrates:
 * - RuntimeConductorAuthority (lease ownership)
 * - RoomRuntimeElectionEngine (conductor election)
 * - DeadlockRecoveryCoordinator (deadlock prevention)
 */

import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';
import {
  claimConductorAuthority,
  heartbeatConductor,
  releaseConductorAuthority,
  getConductorLease,
  checkConductorHealth,
  cleanupExpiredConductorLeases,
} from '@/lib/runtime/RuntimeConductorAuthority';
import {
  registerElectionCandidate,
  startElection,
  voteInElection,
  finalizeElection,
  runAutomaticElection,
  cleanupOldElections,
} from '@/lib/runtime/RoomRuntimeElectionEngine';
import {
  detectDeadlock,
  executeDeadlockRecovery,
  getDeadlockDiagnostics,
  cleanupOldDeadlockRecords,
} from '@/lib/runtime/DeadlockRecoveryCoordinator';
import { getRuntimeAuthorityRoomSummary } from '@/lib/runtime/RuntimeAuthorityRegistry';

interface ConductorLifecycleEvent {
  timestamp: number;
  eventType: 'claim' | 'heartbeat' | 'release' | 'health-check' | 'election' | 'recovery';
  roomId: ChatRoomId;
  conductorId: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

const LIFECYCLE_EVENTS: ConductorLifecycleEvent[] = [];
const MAX_EVENTS = 1000; // Keep last 1000 events

const MANAGER_CONFIG = {
  heartbeatCheckIntervalMs: 2_500, // Check heartbeats every 2.5s
  deadlockCheckIntervalMs: 5_000, // Check for deadlock every 5s
  electionCheckIntervalMs: 3_000, // Check if election needed every 3s
  metricsRetentionMs: 300_000, // Keep metrics for 5 minutes
};

/**
 * Initialize conductor for a room.
 * Typically called once when room is created.
 */
export function initializeConductorForRoom(roomId: ChatRoomId, initialConductorId: string): boolean {
  const result = claimConductorAuthority(roomId, initialConductorId, 'primary');

  if (result.granted) {
    registerElectionCandidate(roomId, initialConductorId, 'standby');
    logLifecycleEvent({
      timestamp: Date.now(),
      eventType: 'claim',
      roomId,
      conductorId: initialConductorId,
      message: `Conductor initialized for room ${roomId}`,
      severity: 'info',
    });
    return true;
  }

  return false;
}

/**
 * Record conductor heartbeat (keep lease alive).
 */
export function recordConductorHeartbeat(roomId: ChatRoomId, conductorId: string): {
  leaseRenewed: boolean;
  leaseExpiresAtMs: number;
} {
  const renewed = heartbeatConductor(roomId, conductorId);
  const lease = getConductorLease(roomId);

  if (!lease) {
    return { leaseRenewed: false, leaseExpiresAtMs: 0 };
  }

  if (renewed) {
    logLifecycleEvent({
      timestamp: Date.now(),
      eventType: 'heartbeat',
      roomId,
      conductorId,
      message: `Heartbeat recorded; lease renewed until ${new Date(lease.leaseExpiresMs).toISOString()}`,
      severity: 'info',
    });
  }

  return {
    leaseRenewed: renewed,
    leaseExpiresAtMs: lease.leaseExpiresMs,
  };
}

/**
 * Gracefully release conductor.
 */
export function releaseConductor(roomId: ChatRoomId, conductorId: string): boolean {
  const released = releaseConductorAuthority(roomId, conductorId);

  if (released) {
    logLifecycleEvent({
      timestamp: Date.now(),
      eventType: 'release',
      roomId,
      conductorId,
      message: `Conductor released authority gracefully`,
      severity: 'info',
    });
  }

  return released;
}

/**
 * Run health check and trigger recovery if needed.
 */
export async function runConductorHealthCheck(roomId: ChatRoomId): Promise<{
  healthyCount: number;
  stalledCount: number;
  recoveryTriggered: boolean;
}> {
  const health = checkConductorHealth(roomId);
  const authority = getRuntimeAuthorityRoomSummary(roomId);

  let healthyCount = 0;
  let stalledCount = 0;
  let recoveryTriggered = false;

  if (health.isHealthy) {
    healthyCount = 1;
    logLifecycleEvent({
      timestamp: Date.now(),
      eventType: 'health-check',
      roomId,
      conductorId: health.conductorId || 'unknown',
      message: `Conductor healthy`,
      severity: 'info',
    });
  } else {
    stalledCount = 1;

    // Detect deadlock
    const deadlock = detectDeadlock(roomId, authority);

    if (deadlock) {
      recoveryTriggered = true;
      const actions = await executeDeadlockRecovery(roomId, deadlock);

      logLifecycleEvent({
        timestamp: Date.now(),
        eventType: 'recovery',
        roomId,
        conductorId: health.conductorId || 'unknown',
        message: `Deadlock detected (${deadlock.type}); ${actions.length} recovery actions executed`,
        severity: 'error',
      });
    }

    // Trigger election if conductor unhealthy
    if (health.shouldElect) {
      const electionResult = runAutomaticElection(roomId);

      if (electionResult.electionTriggered) {
        logLifecycleEvent({
          timestamp: Date.now(),
          eventType: 'election',
          roomId,
          conductorId: health.conductorId || 'unknown',
          message: `Election triggered: ${electionResult.reason}`,
          severity: 'warning',
        });
      }
    }
  }

  return { healthyCount, stalledCount, recoveryTriggered };
}

/**
 * Register a standby conductor candidate.
 */
export function registerStandby(roomId: ChatRoomId, standbyId: string): boolean {
  return registerElectionCandidate(roomId, standbyId, 'standby');
}

/**
 * Register a recovery conductor candidate.
 */
export function registerRecoveryCandidate(roomId: ChatRoomId, candidateId: string): boolean {
  return registerElectionCandidate(roomId, candidateId, 'recovery');
}

/**
 * Get current conductor status for room.
 */
export function getConductorStatus(roomId: ChatRoomId): {
  hasActiveConductor: boolean;
  conductorId?: string;
  leaseExpiresAtMs?: number;
  isHealthy: boolean;
  failureCount: number;
} {
  const lease = getConductorLease(roomId);
  const health = checkConductorHealth(roomId);

  return {
    hasActiveConductor: !!lease,
    conductorId: lease?.conductorId,
    leaseExpiresAtMs: lease?.leaseExpiresMs,
    isHealthy: health.isHealthy,
    failureCount: health.failureCount,
  };
}

/**
 * Get lifecycle events (for debugging/observability).
 */
export function getLifecycleEvents(roomId?: ChatRoomId, limit: number = 100): ConductorLifecycleEvent[] {
  let events = LIFECYCLE_EVENTS;

  if (roomId) {
    events = events.filter((e) => e.roomId === roomId);
  }

  return events.slice(-limit);
}

/**
 * Get comprehensive conductor diagnostics.
 */
export function getConductorDiagnostics(): {
  totalEvents: number;
  activeRooms: number;
  deadlockDiagnostics: ReturnType<typeof getDeadlockDiagnostics>;
  recentEvents: ConductorLifecycleEvent[];
} {
  const roomIds = new Set(LIFECYCLE_EVENTS.map((e) => e.roomId));

  return {
    totalEvents: LIFECYCLE_EVENTS.length,
    activeRooms: roomIds.size,
    deadlockDiagnostics: getDeadlockDiagnostics(),
    recentEvents: LIFECYCLE_EVENTS.slice(-50),
  };
}

/**
 * Cleanup old events and records (call periodically).
 */
export function runConductorMaintenance(): {
  eventsRemoved: number;
  leasesRemoved: number;
  electionsRemoved: number;
  deadlockRecordsRemoved: number;
} {
  // Keep max 1000 events
  while (LIFECYCLE_EVENTS.length > MAX_EVENTS) {
    LIFECYCLE_EVENTS.shift();
  }

  return {
    eventsRemoved: 0,
    leasesRemoved: cleanupExpiredConductorLeases(),
    electionsRemoved: cleanupOldElections(),
    deadlockRecordsRemoved: cleanupOldDeadlockRecords(),
  };
}

/**
 * Internal: Log lifecycle event.
 */
function logLifecycleEvent(event: ConductorLifecycleEvent): void {
  LIFECYCLE_EVENTS.push(event);

  // Keep max 1000 events
  if (LIFECYCLE_EVENTS.length > MAX_EVENTS) {
    LIFECYCLE_EVENTS.shift();
  }

  const logFn = event.severity === 'error' ? console.error : console.warn;
  logFn(`[ConductorMgr] ${event.eventType.toUpperCase()}: ${event.message}`);
}

/**
 * Periodic maintenance task (call every 10-15 seconds).
 * Note: In production, should iterate across all active room IDs.
 */
export async function runConductorMaintenanceCycle(roomIds?: ChatRoomId[]): Promise<{
  roomsChecked: number;
  recoveryTriggeredCount: number;
}> {
  // If no rooms provided, return early
  if (!roomIds || roomIds.length === 0) {
    runConductorMaintenance();
    return {
      roomsChecked: 0,
      recoveryTriggeredCount: 0,
    };
  }

  let recoveryTriggeredCount = 0;

  // Run health checks for each active room
  for (const roomId of roomIds) {
    const result = await runConductorHealthCheck(roomId);
    if (result.recoveryTriggered) {
      recoveryTriggeredCount++;
    }
  }

  // Run maintenance
  runConductorMaintenance();

  return {
    roomsChecked: roomIds.length,
    recoveryTriggeredCount,
  };
}
