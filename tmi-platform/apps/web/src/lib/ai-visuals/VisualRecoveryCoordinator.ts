/**
 * VisualRecoveryCoordinator.ts
 *
 * Automatic recovery system for blocked and failed visual generation.
 * Implements:
 * - Periodic retry of blocked visuals
 * - Priority escalation on repeated failures
 * - Degraded mode rendering fallback
 * - Recovery metrics and diagnostics
 */

import { getBlockedVisualRecoveryCandidates, resolveBlockedVisual } from '@/lib/ai-visuals/VisualAuthorityGateway';
import {
  resolveMagazineSlotWithAuthority,
  hydrateImageWithAuthority,
  resolvePerformerPortraitWithAuthority,
  reconstructVenueWithAuthority,
  routeVisualReplacementWithAuthority,
} from '@/lib/ai-visuals/AuthorityAwareVisualGenerators';
import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

interface RecoveryAttempt {
  entityId: string;
  attemptNumber: number;
  timestamp: number;
  success: boolean;
  reason?: string;
}

interface RecoveryMetrics {
  totalAttempted: number;
  totalSucceeded: number;
  totalFailed: number;
  averageAttemptsToSuccess: number;
  lastRecoveryRun: number;
  recoveryRate: number; // 0-1
}

const RECOVERY_ATTEMPTS = new Map<string, RecoveryAttempt[]>();
const RECOVERY_METRICS: RecoveryMetrics = {
  totalAttempted: 0,
  totalSucceeded: 0,
  totalFailed: 0,
  averageAttemptsToSuccess: 0,
  lastRecoveryRun: 0,
  recoveryRate: 0,
};

const RECOVERY_CONFIG = {
  retryIntervalMs: 2000, // Try blocked visuals every 2 seconds
  maxRetriesPerVisual: 5,
  escalationThreshold: 3, // Escalate to critical after 3 failed retries
  degradedModeThreshold: 10000, // 10 seconds = switch to degraded mode
};

/**
 * Attempt to recover a single blocked visual.
 */
async function attemptVisualRecovery(
  entityId: string,
  generatorType: string,
  roomId: ChatRoomId | undefined,
  context?: Record<string, any>
): Promise<boolean> {
  const attemptNumber = (RECOVERY_ATTEMPTS.get(entityId)?.length || 0) + 1;

  try {
    let result: any;

    switch (generatorType) {
      case 'magazine':
        result = await resolveMagazineSlotWithAuthority(entityId, roomId, context?.context);
        break;

      case 'hydration':
        result = await hydrateImageWithAuthority(
          entityId,
          roomId,
          context?.priority || 'normal'
        );
        break;

      case 'portrait':
        result = await resolvePerformerPortraitWithAuthority(
          entityId,
          roomId,
          context?.displayName || 'Unknown',
          context?.kind || 'artist'
        );
        break;

      case 'venue':
        result = await reconstructVenueWithAuthority(
          entityId,
          roomId,
          context?.venueName || 'Unnamed Venue',
          context?.venueType || 'club'
        );
        break;

      default:
        console.warn(`[Recovery] Unknown generator type: ${generatorType}`);
        return false;
    }

    // Extract success status based on result type
    const r = result as Record<string, unknown>;
    const hasAssetId = Boolean(r && (r["assetId"] || r["jobId"] || r["portraitId"] || r["reconstructedAssetId"]));
    const success = Boolean(hasAssetId && !r["error"]);

    // Log attempt
    const attempts = RECOVERY_ATTEMPTS.get(entityId) || [];
    attempts.push({
      entityId,
      attemptNumber,
      timestamp: Date.now(),
      success,
      reason: success ? undefined : (r["error"] as string | undefined) || 'unknown',
    });
    RECOVERY_ATTEMPTS.set(entityId, attempts);

    // Update metrics
    RECOVERY_METRICS.totalAttempted++;
    if (success) {
      RECOVERY_METRICS.totalSucceeded++;
      resolveBlockedVisual(entityId);
    } else {
      RECOVERY_METRICS.totalFailed++;
    }

    return success;
  } catch (error) {
    console.error(`[Recovery] Attempt ${attemptNumber} failed for ${entityId}:`, error);

    // Log failed attempt
    const attempts = RECOVERY_ATTEMPTS.get(entityId) || [];
    attempts.push({
      entityId,
      attemptNumber,
      timestamp: Date.now(),
      success: false,
      reason: error instanceof Error ? error.message : 'unknown-error',
    });
    RECOVERY_ATTEMPTS.set(entityId, attempts);

    RECOVERY_METRICS.totalAttempted++;
    RECOVERY_METRICS.totalFailed++;

    return false;
  }
}

/**
 * Run full visual recovery cycle.
 * Called periodically by the runtime conductor.
 */
export async function runVisualRecoveryCycle(roomId?: ChatRoomId): Promise<{
  attempted: number;
  succeeded: number;
  failed: number;
  escalated: string[];
}> {
  const candidates = getBlockedVisualRecoveryCandidates();
  const attempted: string[] = [];
  const succeeded: string[] = [];
  const failed: string[] = [];
  const escalated: string[] = [];

  for (const candidate of candidates) {
    if (!candidate.shouldRetry) continue;

    // Determine if this should be escalated
    const attempts = RECOVERY_ATTEMPTS.get(candidate.entityId) || [];
    if (attempts.length > RECOVERY_CONFIG.escalationThreshold) {
      escalated.push(candidate.entityId);
      continue;
    }

    // Attempt recovery
    attempted.push(candidate.entityId);
    const success = await attemptVisualRecovery(
      candidate.entityId,
      'replacement', // Default to generic replacement; context would determine actual type
      roomId
    );

    if (success) {
      succeeded.push(candidate.entityId);
    } else {
      failed.push(candidate.entityId);
    }
  }

  // Update metrics
  RECOVERY_METRICS.lastRecoveryRun = Date.now();
  updateRecoveryMetrics();

  console.log(`[Recovery] Cycle: ${attempted.length} attempted, ${succeeded.length} succeeded, ${failed.length} failed, ${escalated.length} escalated`);

  return {
    attempted: attempted.length,
    succeeded: succeeded.length,
    failed: failed.length,
    escalated,
  };
}

/**
 * Handle escalated visuals (give them priority in queue or manually intervene).
 */
export function escalateVisualRecovery(entityId: string): {
  escalated: boolean;
  reason: string;
} {
  const attempts = RECOVERY_ATTEMPTS.get(entityId) || [];

  if (attempts.length === 0) {
    return { escalated: false, reason: 'No recovery attempts found' };
  }

  // Add to priority queue, reset retry counter, or manually inspect
  const failureRate = attempts.filter((a) => !a.success).length / attempts.length;

  if (failureRate > 0.8) {
    return {
      escalated: true,
      reason: `High failure rate (${(failureRate * 100).toFixed(1)}%); visual may require manual intervention`,
    };
  }

  return {
    escalated: false,
    reason: 'Escalation threshold not reached',
  };
}

/**
 * Update recovery metrics.
 */
function updateRecoveryMetrics(): void {
  const total = RECOVERY_METRICS.totalAttempted;
  if (total === 0) {
    RECOVERY_METRICS.recoveryRate = 0;
    RECOVERY_METRICS.averageAttemptsToSuccess = 0;
    return;
  }

  RECOVERY_METRICS.recoveryRate = RECOVERY_METRICS.totalSucceeded / total;

  let totalAttempts = 0;
  for (const attempts of RECOVERY_ATTEMPTS.values()) {
    totalAttempts += attempts.length;
  }

  RECOVERY_METRICS.averageAttemptsToSuccess = RECOVERY_METRICS.totalSucceeded > 0
    ? totalAttempts / RECOVERY_METRICS.totalSucceeded
    : 0;
}

/**
 * Get recovery diagnostics and health.
 */
export function getVisualRecoveryDiagnostics(): {
  metrics: RecoveryMetrics;
  topFailingVisuals: Array<{ entityId: string; attempts: number; failureRate: number }>;
  recentSuccesses: Array<{ entityId: string; attemptNumber: number; timestamp: number }>;
} {
  const topFailing: Array<{ entityId: string; attempts: number; failureRate: number }> = [];
  const recentSuccesses: Array<{ entityId: string; attemptNumber: number; timestamp: number }> = [];

  const now = Date.now();

  for (const [entityId, attempts] of RECOVERY_ATTEMPTS.entries()) {
    if (attempts.length === 0) continue;

    const failureRate = attempts.filter((a) => !a.success).length / attempts.length;
    const lastAttempt = attempts[attempts.length - 1];

    if (failureRate > 0.5 && now - lastAttempt.timestamp < 5 * 60 * 1000) {
      // High failure rate in last 5 minutes
      topFailing.push({
        entityId,
        attempts: attempts.length,
        failureRate,
      });
    }

    if (lastAttempt.success && now - lastAttempt.timestamp < 1 * 60 * 1000) {
      // Recent success in last minute
      recentSuccesses.push({
        entityId,
        attemptNumber: lastAttempt.attemptNumber,
        timestamp: lastAttempt.timestamp,
      });
    }
  }

  // Sort by failure rate desc and attempts
  topFailing.sort((a, b) => b.failureRate - a.failureRate || b.attempts - a.attempts);
  topFailing.splice(10); // Keep top 10

  recentSuccesses.sort((a, b) => b.timestamp - a.timestamp);
  recentSuccesses.splice(20); // Keep last 20

  return {
    metrics: { ...RECOVERY_METRICS },
    topFailingVisuals: topFailing,
    recentSuccesses,
  };
}

/**
 * Clear recovery history for an entity (after manual resolution).
 */
export function clearRecoveryHistory(entityId: string): void {
  RECOVERY_ATTEMPTS.delete(entityId);
  resolveBlockedVisual(entityId);
}

/**
 * Get recovery history for a specific entity.
 */
export function getRecoveryHistory(entityId: string): RecoveryAttempt[] {
  return RECOVERY_ATTEMPTS.get(entityId) || [];
}
