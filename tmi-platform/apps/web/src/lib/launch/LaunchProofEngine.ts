/**
 * LaunchProofEngine
 * Produces launch score, proof report, blocker list, and launch-ready list.
 */

import type { LaunchCheck, LaunchReadinessReport } from "./LaunchReadinessEngine";

export type LaunchProofReport = {
  launchScore: number;
  summary: string;
  blockerList: string[];
  launchReadyList: string[];
  domainBreakdown: LaunchReadinessReport["domainScores"];
  generatedAtMs: number;
};

function toLine(check: LaunchCheck): string {
  return `${check.label} [${check.domain}] - ${check.detail}`;
}

export function buildLaunchProofReport(readiness: LaunchReadinessReport): LaunchProofReport {
  const blockerList = readiness.launchBlockers.map(toLine);
  const launchReadyList = readiness.launchReadyList.map(toLine);

  const summary =
    blockerList.length === 0
      ? `Soft launch candidate ready at ${readiness.softLaunchScore} score.`
      : `Soft launch blocked by ${blockerList.length} critical checks at ${readiness.softLaunchScore} score.`;

  return {
    launchScore: readiness.softLaunchScore,
    summary,
    blockerList,
    launchReadyList,
    domainBreakdown: readiness.domainScores,
    generatedAtMs: Date.now(),
  };
}
