export type AgeClass = "minor" | "adult" | "unknown" | "test_minor" | "test_adult";

export type AgeGateContext = {
  spaceId: string;
  spaceType: "minor-only" | "adult-only" | "public" | "private-minor";
  requiresGuardian: boolean;
  sandboxMode: boolean;
};

export type AgeGateDecision = {
  allowed: boolean;
  reason: string;
  requiresManualReview: boolean;
};

export function evaluateAgeGate(ageClass: AgeClass, context: AgeGateContext): AgeGateDecision {
  if (context.spaceType === "minor-only" || context.spaceType === "private-minor") {
    if (ageClass === "minor" || ageClass === "test_minor") {
      return { allowed: true, reason: "minor-safe access granted", requiresManualReview: false };
    }
    return { allowed: false, reason: "non-minor blocked from minor space", requiresManualReview: true };
  }

  if (context.spaceType === "adult-only") {
    if (ageClass === "adult" || ageClass === "test_adult") {
      return { allowed: true, reason: "adult access granted", requiresManualReview: false };
    }
    return { allowed: false, reason: "minor/unknown blocked from adult-only space", requiresManualReview: true };
  }

  if (ageClass === "unknown") {
    return { allowed: false, reason: "unknown age requires verification", requiresManualReview: true };
  }

  return { allowed: true, reason: "public access granted", requiresManualReview: false };
}
