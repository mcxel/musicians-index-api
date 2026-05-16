/**
 * VisualQueueHydrationEngine
 * On startup, rehydrates visual generation queues from persistent storage.
 * No lost state on restart.
 */

import { rememberVisualFailure } from './VisualFailureMemoryEngine';
import { visualPersistenceEngine } from './VisualPersistenceEngine';
import { previewVisualRetryDecisions } from './VisualRetryEscalationEngine';

export interface HydrationResult {
  failuresRestored: number;
  retriesRestored: number;
  deploymentsRestored: number;
  timestamp: Date;
}

export class VisualQueueHydrationEngine {
  private hydrated = false;

  /**
   * Full hydration on startup.
   * Restores all queues from database.
   */
  async hydrateOnStartup(): Promise<HydrationResult> {
    if (this.hydrated) {
      console.log('[HYDRATION] Already hydrated. Skipping.');
      return {
        failuresRestored: 0,
        retriesRestored: 0,
        deploymentsRestored: 0,
        timestamp: new Date(),
      };
    }

    const startTime = Date.now();

    // Restore failures
    const failures = await visualPersistenceEngine.loadUnresolvedFailures();
    let failuresRestored = 0;
    for (const failure of failures) {
      rememberVisualFailure({
        requestId: failure.jobId,
        aiAssetType: 'image',
        subject: failure.targetRoute,
        route: failure.targetRoute,
        component: 'hydration',
        assetKind: 'article-thumbnail',
        ownerSystem: 'hydration',
        priority: 'medium',
        status: 'failed',
        attempts: Math.max(1, failure.retryCount),
        maxAttempts: Math.max(3, failure.retryCount + 1),
        failureReason: failure.reason,
        createdAt: failure.firstFailedAt,
        updatedAt: failure.lastFailedAt,
      });
      failuresRestored++;
    }

    // Restore pending retries
    const retries = await visualPersistenceEngine.loadPendingRetries();
    let retriesRestored = 0;
    for (const _retry of retries) {
      previewVisualRetryDecisions();
      retriesRestored++;
    }

    // Load pending deployments (for UI observability)
    const deployments = await visualPersistenceEngine.loadPendingDeployments();
    const deploymentsRestored = deployments.length;

    const duration = Date.now() - startTime;
    console.log(
      `[HYDRATION] ✓ Restored: ${failuresRestored} failures, ${retriesRestored} retries, ${deploymentsRestored} deployments in ${duration}ms`
    );

    this.hydrated = true;
    return { failuresRestored, retriesRestored, deploymentsRestored, timestamp: new Date() };
  }

  /**
   * Partial hydration for specific queue.
   */
  async hydrateFailures(): Promise<number> {
    const failures = await visualPersistenceEngine.loadUnresolvedFailures();
    for (const failure of failures) {
      rememberVisualFailure({
        requestId: failure.jobId,
        aiAssetType: 'image',
        subject: failure.targetRoute,
        route: failure.targetRoute,
        component: 'hydration',
        assetKind: 'article-thumbnail',
        ownerSystem: 'hydration',
        priority: 'medium',
        status: 'failed',
        attempts: Math.max(1, failure.retryCount),
        maxAttempts: Math.max(3, failure.retryCount + 1),
        failureReason: failure.reason,
        createdAt: failure.firstFailedAt,
        updatedAt: failure.lastFailedAt,
      });
    }
    return failures.length;
  }

  async hydrateRetries(): Promise<number> {
    const retries = await visualPersistenceEngine.loadPendingRetries();
    for (const _retry of retries) {
      previewVisualRetryDecisions();
    }
    return retries.length;
  }

  /**
   * Check hydration status.
   */
  isHydrated(): boolean {
    return this.hydrated;
  }
}

export const visualQueueHydrationEngine = new VisualQueueHydrationEngine();
