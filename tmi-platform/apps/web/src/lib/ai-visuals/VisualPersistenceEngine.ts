/**
 * VisualPersistenceEngine
 * In-memory fallback persistence for visual failures/retries/deployments/worker-health.
 */

import type { VisualFailureRecord } from './VisualFailureMemoryEngine';
import type { WorkerHealthSnapshot } from './VisualWorkerHealthEngine';

export interface PersistedFailure {
  id: string;
  jobId: string;
  targetRoute: string;
  reason: string;
  retryCount: number;
  firstFailedAt: Date;
  lastFailedAt: Date;
  resolved: boolean;
  escalated: boolean;
}

export interface PersistedRetry {
  id: string;
  jobId: string;
  targetRoute: string;
  attemptNumber: number;
  reason: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  createdAt: Date;
  completedAt: Date | null;
}

export interface PersistedDeployment {
  id: string;
  assetId: string;
  routePath: string;
  componentTarget: string;
  workerId: string;
  assetUrl: string;
  approved: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}

export interface PersistedWorkerHealth {
  id: string;
  workerId: string;
  successfulJobs: number;
  failedJobs: number;
  averageTimeMs: number;
  fatigueLevel: number;
  healthStatus: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL_FAILURE';
  lastUpdatedAt: Date;
}

const failureTable = new Map<string, PersistedFailure>();
const retryTable = new Map<string, PersistedRetry>();
const deploymentTable = new Map<string, PersistedDeployment>();
const workerHealthTable = new Map<string, PersistedWorkerHealth>();

export class VisualPersistenceEngine {
  async persistFailure(record: VisualFailureRecord): Promise<PersistedFailure> {
    const existing = failureTable.get(record.jobId);
    const persisted: PersistedFailure = {
      id: existing?.id ?? `vf_${record.jobId}`,
      jobId: record.jobId,
      targetRoute: record.targetRoute,
      reason: record.reason,
      retryCount: record.retryCount,
      firstFailedAt: existing?.firstFailedAt ?? new Date(record.firstFailedAt),
      lastFailedAt: new Date(record.lastFailedAt),
      resolved: record.resolved,
      escalated: record.escalated,
    };
    failureTable.set(record.jobId, persisted);
    return persisted;
  }

  async loadUnresolvedFailures(): Promise<VisualFailureRecord[]> {
    return [...failureTable.values()]
      .filter((r) => !r.resolved)
      .map((r) => ({
        jobId: r.jobId,
        targetRoute: r.targetRoute,
        reason: r.reason,
        retryCount: r.retryCount,
        firstFailedAt: r.firstFailedAt.getTime(),
        lastFailedAt: r.lastFailedAt.getTime(),
        resolved: r.resolved,
        escalated: r.escalated,
      }));
  }

  async persistRetry(
    jobId: string,
    targetRoute: string,
    attemptNumber: number,
    reason: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED'
  ): Promise<PersistedRetry> {
    const id = `vr_${jobId}_${attemptNumber}`;
    const retry: PersistedRetry = {
      id,
      jobId,
      targetRoute,
      attemptNumber,
      reason,
      status,
      createdAt: new Date(),
      completedAt: status === 'SUCCESS' || status === 'FAILED' ? new Date() : null,
    };
    retryTable.set(id, retry);
    return retry;
  }

  async loadPendingRetries(): Promise<PersistedRetry[]> {
    return [...retryTable.values()].filter((r) => r.status === 'PENDING');
  }

  async persistDeployment(
    assetId: string,
    routePath: string,
    componentTarget: string,
    workerId: string,
    assetUrl: string
  ): Promise<PersistedDeployment> {
    const id = `vd_${assetId}_${Date.now()}`;
    const deployment: PersistedDeployment = {
      id,
      assetId,
      routePath,
      componentTarget,
      workerId,
      assetUrl,
      approved: false,
      publishedAt: null,
      createdAt: new Date(),
    };
    deploymentTable.set(id, deployment);
    return deployment;
  }

  async loadPendingDeployments(): Promise<PersistedDeployment[]> {
    return [...deploymentTable.values()].filter((d) => !d.approved && d.publishedAt === null);
  }

  async approveDeployment(deploymentId: string): Promise<void> {
    const existing = deploymentTable.get(deploymentId);
    if (!existing) return;
    deploymentTable.set(deploymentId, {
      ...existing,
      approved: true,
      publishedAt: new Date(),
    });
  }

  async persistWorkerHealth(snapshot: WorkerHealthSnapshot): Promise<PersistedWorkerHealth> {
    const id = `wh_${snapshot.workerId}`;
    const persisted: PersistedWorkerHealth = {
      id,
      workerId: snapshot.workerId,
      successfulJobs: snapshot.successfulJobs,
      failedJobs: snapshot.failedJobs,
      averageTimeMs: snapshot.averageTimeMs,
      fatigueLevel: snapshot.fatigueLevel,
      healthStatus: snapshot.healthStatus,
      lastUpdatedAt: new Date(),
    };
    workerHealthTable.set(snapshot.workerId, persisted);
    return persisted;
  }

  async loadWorkerHealth(workerId: string): Promise<PersistedWorkerHealth | null> {
    return workerHealthTable.get(workerId) ?? null;
  }
}

export const visualPersistenceEngine = new VisualPersistenceEngine();
