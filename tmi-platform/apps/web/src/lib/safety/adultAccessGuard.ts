import { evaluateAgeGate, type AgeClass } from "./ageGateEngine";
import { enforceMinorSafetyPolicy, type SafetyActorType } from "./minorSafetyPolicy";
import { logSafetyViolation } from "./safetyViolationLogger";

const repeatedAttempts = new Map<string, number>();

export type AdultAccessCheckInput = {
  actorId: string;
  actorType: SafetyActorType;
  actorAgeClass: AgeClass;
  targetSpaceId: string;
  targetSpaceType: "minor-only" | "private-minor" | "public" | "adult-only";
  action: "join" | "message" | "follow" | "book" | "invite" | "enter-room" | "support-test";
  adminApproved?: boolean;
  safeModeApproved?: boolean;
};

export type AdultAccessCheckOutput = {
  allowed: boolean;
  lockState: "none" | "warning" | "locked";
  reason: string;
};

export function checkAdultAccess(input: AdultAccessCheckInput): AdultAccessCheckOutput {
  const ageGate = evaluateAgeGate(input.actorAgeClass, {
    spaceId: input.targetSpaceId,
    spaceType: input.targetSpaceType,
    requiresGuardian: input.targetSpaceType === "minor-only" || input.targetSpaceType === "private-minor",
    sandboxMode: true,
  });

  const policy = enforceMinorSafetyPolicy({
    actorId: input.actorId,
    actorType: input.actorType,
    actorAgeClass: input.actorAgeClass,
    action: input.action,
    targetSpaceType: input.targetSpaceType,
    adminApproved: Boolean(input.adminApproved),
    safeModeApproved: Boolean(input.safeModeApproved),
  });

  const allowed = ageGate.allowed && policy.allowed;
  if (allowed) {
    return { allowed: true, lockState: "none", reason: "access allowed" };
  }

  const attempts = (repeatedAttempts.get(input.actorId) ?? 0) + 1;
  repeatedAttempts.set(input.actorId, attempts);

  const lockState: "warning" | "locked" = attempts >= 3 ? "locked" : "warning";

  logSafetyViolation({
    source: "adultAccessGuard",
    actorId: input.actorId,
    actorAgeClass: input.actorAgeClass,
    action: input.action,
    target: `${input.targetSpaceType}:${input.targetSpaceId}`,
    reason: `${ageGate.reason}; ${policy.reason}; lock=${lockState}`,
    blocked: true,
  });

  return {
    allowed: false,
    lockState,
    reason: `${ageGate.reason}; ${policy.reason}`,
  };
}

export function getActorLockState(actorId: string): "none" | "warning" | "locked" {
  const attempts = repeatedAttempts.get(actorId) ?? 0;
  if (attempts >= 3) return "locked";
  if (attempts > 0) return "warning";
  return "none";
}
