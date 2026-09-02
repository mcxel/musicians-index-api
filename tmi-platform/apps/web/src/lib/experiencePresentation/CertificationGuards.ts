/**
 * CertificationGuards — green/debug surfaces cannot mark experienceCert PASS.
 */

import type { CertLaneStatus, ExperienceCertEvidence } from "./types";

export function isGreenOrDebugSurface(evidence: ExperienceCertEvidence): boolean {
  return (
    evidence.surfaceKind === "green_debug" ||
    evidence.surfaceKind === "observatory" ||
    evidence.surfaceKind === "storybook"
  );
}

/**
 * Helper flag: experienceCert PASS only when production surface + physical observe.
 * Green/debug/observatory/storybook → always false (status must stay OPEN).
 */
export function canMarkExperienceCertPass(evidence: ExperienceCertEvidence): boolean {
  if (isGreenOrDebugSurface(evidence)) return false;
  if (evidence.surfaceKind !== "production") return false;
  if (!evidence.physicalObserved) return false;
  return true;
}

export function resolveExperienceCertStatus(evidence: ExperienceCertEvidence): CertLaneStatus {
  return canMarkExperienceCertPass(evidence) ? "DONE" : "OPEN";
}
