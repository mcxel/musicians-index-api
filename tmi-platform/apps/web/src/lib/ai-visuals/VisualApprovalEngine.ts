/**
 * VisualApprovalEngine
 * Admin-side: approve, reject, requeue, promote visual assets.
 * Gate for publication.
 */

import type { PersistedDeployment } from './VisualPersistenceEngine';
import { visualPersistenceEngine } from './VisualPersistenceEngine';

export interface ApprovalDecision {
  deploymentId: string;
  decision: 'APPROVED' | 'REJECTED' | 'PROMOTED' | 'REQUEUED';
  approverUserId: string;
  reason?: string;
  timestamp: Date;
}

export interface ApprovalQueue {
  totalPending: number;
  byCriticality: Record<string, number>;
  oldestPendingAge: number; // ms
}

export class VisualApprovalEngine {
  private approvalHistory: ApprovalDecision[] = [];

  /**
   * Approve and publish a deployment.
   */
  async approveDeployment(
    deploymentId: string,
    approverUserId: string,
    reason?: string
  ): Promise<ApprovalDecision> {
    await visualPersistenceEngine.approveDeployment(deploymentId);

    const decision: ApprovalDecision = {
      deploymentId,
      decision: 'APPROVED',
      approverUserId,
      reason,
      timestamp: new Date(),
    };

    this.approvalHistory.push(decision);
    console.log(`[APPROVAL] ✓ Deployment ${deploymentId} approved by ${approverUserId}`);

    return decision;
  }

  /**
   * Reject a deployment (it cannot be published).
   */
  async rejectDeployment(
    deploymentId: string,
    approverUserId: string,
    reason: string
  ): Promise<ApprovalDecision> {
    // Mark in DB as rejected
    // In production, add rejected flag to VisualDeployment model

    const decision: ApprovalDecision = {
      deploymentId,
      decision: 'REJECTED',
      approverUserId,
      reason,
      timestamp: new Date(),
    };

    this.approvalHistory.push(decision);
    console.log(`[APPROVAL] ✗ Deployment ${deploymentId} rejected: ${reason}`);

    return decision;
  }

  /**
   * Promote deployment to critical queue (fast-track publishing).
   */
  async promoteDeployment(
    deploymentId: string,
    approverUserId: string,
    reason?: string
  ): Promise<ApprovalDecision> {
    // Move to fast-track approval queue
    // In production, set priority flag in VisualDeployment

    const decision: ApprovalDecision = {
      deploymentId,
      decision: 'PROMOTED',
      approverUserId,
      reason,
      timestamp: new Date(),
    };

    this.approvalHistory.push(decision);
    console.log(`[APPROVAL] ⬆️ Deployment ${deploymentId} promoted to critical queue`);

    return decision;
  }

  /**
   * Requeue a failed or stalled deployment.
   */
  async requeueDeployment(
    deploymentId: string,
    approverUserId: string,
    reason?: string
  ): Promise<ApprovalDecision> {
    // Reset status and requeue
    // In production, mark as PENDING in VisualDeployment

    const decision: ApprovalDecision = {
      deploymentId,
      decision: 'REQUEUED',
      approverUserId,
      reason,
      timestamp: new Date(),
    };

    this.approvalHistory.push(decision);
    console.log(`[APPROVAL] 🔄 Deployment ${deploymentId} requeued for regeneration`);

    return decision;
  }

  /**
   * Get pending approvals.
   */
  async getPendingApprovals(): Promise<PersistedDeployment[]> {
    return visualPersistenceEngine.loadPendingDeployments();
  }

  /**
   * Get approval queue stats.
   */
  async getApprovalQueueStats(): Promise<ApprovalQueue> {
    const pending = await this.getPendingApprovals();
    const now = Date.now();
    const oldestAge =
      pending.length > 0 ? Math.max(...pending.map((p) => now - p.createdAt.getTime())) : 0;

    return {
      totalPending: pending.length,
      byCriticality: {
        critical: pending.filter((p) => p.routePath.includes('/home')).length,
        high: pending.filter((p) => p.routePath.includes('/artist')).length,
        normal:
          pending.length -
          pending.filter((p) => p.routePath.includes('/home') || p.routePath.includes('/artist'))
            .length,
      },
      oldestPendingAge: oldestAge,
    };
  }

  /**
   * Get approval history.
   */
  getApprovalHistory(limit: number = 50): ApprovalDecision[] {
    return this.approvalHistory.slice(-limit);
  }

  /**
   * Batch approve multiple deployments.
   */
  async batchApprove(
    deploymentIds: string[],
    approverUserId: string,
    reason?: string
  ): Promise<ApprovalDecision[]> {
    const decisions: ApprovalDecision[] = [];
    for (const id of deploymentIds) {
      const decision = await this.approveDeployment(id, approverUserId, reason);
      decisions.push(decision);
    }
    console.log(`[APPROVAL] ✓ Batch approved ${decisions.length} deployments`);
    return decisions;
  }
}

export const visualApprovalEngine = new VisualApprovalEngine();
