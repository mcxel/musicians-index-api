/**
 * SoftLaunchGateEngine
 * System readiness matrix, launch blockers, and launch approvals for PASS 24.
 */

import { runLaunchReadinessAudit, type LaunchDomain } from "./LaunchReadinessEngine";
import { buildLaunchProofReport } from "./LaunchProofEngine";

export type LaunchApprovalState = "approved" | "pending" | "blocked";

export type SoftLaunchGateResult = {
  readinessMatrix: Record<LaunchDomain, number>;
  launchBlockers: string[];
  launchApprovals: {
    engineering: LaunchApprovalState;
    product: LaunchApprovalState;
    operations: LaunchApprovalState;
  };
  softLaunchScore: number;
  launchProofSummary: string;
  launchReady: boolean;
  generatedAtMs: number;
};

function resolveApprovals(score: number, blockerCount: number): SoftLaunchGateResult["launchApprovals"] {
  if (blockerCount > 0) {
    return {
      engineering: "blocked",
      product: "blocked",
      operations: "blocked",
    };
  }

  if (score >= 90) {
    return {
      engineering: "approved",
      product: "approved",
      operations: "approved",
    };
  }

  return {
    engineering: "pending",
    product: "pending",
    operations: "pending",
  };
}

export function runSoftLaunchGate(): SoftLaunchGateResult {
  const readiness = runLaunchReadinessAudit();
  const proof = buildLaunchProofReport(readiness);
  const approvals = resolveApprovals(proof.launchScore, proof.blockerList.length);

  const launchReady =
    approvals.engineering === "approved" &&
    approvals.product === "approved" &&
    approvals.operations === "approved";

  return {
    readinessMatrix: readiness.domainScores,
    launchBlockers: proof.blockerList,
    launchApprovals: approvals,
    softLaunchScore: proof.launchScore,
    launchProofSummary: proof.summary,
    launchReady,
    generatedAtMs: Date.now(),
  };
}

export function listSoftLaunchBlockers(): string[] {
  return runSoftLaunchGate().launchBlockers;
}

export function isSoftLaunchReady(): boolean {
  return runSoftLaunchGate().launchReady;
}
