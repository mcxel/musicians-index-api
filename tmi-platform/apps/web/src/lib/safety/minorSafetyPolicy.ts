import type { AgeClass } from "./ageGateEngine";

export type SafetyActorType =
  | "account"
  | "adult_bot"
  | "minor_bot"
  | "advertiser_bot"
  | "sponsor_bot"
  | "venue_bot"
  | "performer_bot"
  | "maintenance_bot";

export type MinorSafetyRequest = {
  actorId: string;
  actorType: SafetyActorType;
  actorAgeClass: AgeClass;
  action:
    | "join"
    | "message"
    | "follow"
    | "book"
    | "invite"
    | "enter-room"
    | "support-test";
  targetSpaceType: "minor-only" | "private-minor" | "public" | "adult-only";
  adminApproved: boolean;
  safeModeApproved: boolean;
};

export type MinorSafetyDecision = {
  allowed: boolean;
  reason: string;
  hardGate: boolean;
};

export function enforceMinorSafetyPolicy(request: MinorSafetyRequest): MinorSafetyDecision {
  const isMinorSpace = request.targetSpaceType === "minor-only" || request.targetSpaceType === "private-minor";

  if (!isMinorSpace) {
    return { allowed: true, reason: "target is not minor-only", hardGate: false };
  }

  if (request.actorAgeClass === "unknown") {
    return { allowed: false, reason: "unknown age blocked from minor spaces", hardGate: true };
  }

  if (request.actorType === "advertiser_bot" || request.actorType === "sponsor_bot" || request.actorType === "venue_bot") {
    return { allowed: false, reason: `${request.actorType} cannot directly contact or target minors`, hardGate: true };
  }

  if (request.actorType === "maintenance_bot") {
    return { allowed: false, reason: "maintenance bots cannot enter private/minor spaces", hardGate: true };
  }

  if (request.actorType === "performer_bot" && !request.safeModeApproved) {
    return { allowed: false, reason: "performer bot blocked unless approved safe mode", hardGate: true };
  }

  if ((request.actorAgeClass === "adult" || request.actorAgeClass === "test_adult") && !request.adminApproved) {
    return { allowed: false, reason: "adult actors blocked from minor spaces without explicit safety approval", hardGate: true };
  }

  if (request.targetSpaceType === "private-minor") {
    return { allowed: false, reason: "private minor spaces are never exposed to non-minor test actors", hardGate: true };
  }

  return { allowed: true, reason: "minor-safe policy passed", hardGate: false };
}
