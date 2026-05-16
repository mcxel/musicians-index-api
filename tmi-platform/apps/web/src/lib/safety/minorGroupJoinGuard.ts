import { checkAdultAccess, type AdultAccessCheckInput } from "./adultAccessGuard";

export type MinorGroupJoinAttempt = AdultAccessCheckInput;

export type MinorGroupJoinDecision = {
  allowed: boolean;
  reason: string;
  lockState: "none" | "warning" | "locked";
};

export function checkMinorGroupJoin(attempt: MinorGroupJoinAttempt): MinorGroupJoinDecision {
  const result = checkAdultAccess({
    ...attempt,
    action: "join",
    targetSpaceType: attempt.targetSpaceType,
  });

  return {
    allowed: result.allowed,
    reason: result.reason,
    lockState: result.lockState,
  };
}
