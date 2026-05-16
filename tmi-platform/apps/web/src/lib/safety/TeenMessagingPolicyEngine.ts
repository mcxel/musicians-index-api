import { logSafetyViolation } from "@/lib/safety/safetyViolationLogger";

export type SafetyAgeClass = "minor" | "adult" | "unknown" | "room_public" | "test_minor" | "test_adult";

export type ContactChannel =
  | "dm"
  | "room_chat"
  | "lobby_chat"
  | "voice"
  | "talkback"
  | "video_presence"
  | "friend_request"
  | "party_invite";

export type ContactActor = {
  userId: string;
  ageClass: SafetyAgeClass;
  familyVerified?: boolean;
  guardianApproved?: boolean;
  isModerator?: boolean;
};

export type ContactTarget = {
  userId: string;
  ageClass: SafetyAgeClass;
  familyMember?: boolean;
  guardianLink?: boolean;
};

export type ContactPolicyInput = {
  source: string;
  channel: ContactChannel;
  actor: ContactActor;
  target: ContactTarget;
};

export type ContactPolicyDecision = {
  allowed: boolean;
  reason: string;
  blocked: boolean;
  hardBlock: boolean;
};

function isMinor(ageClass: SafetyAgeClass): boolean {
  return ageClass === "minor" || ageClass === "test_minor";
}

function isAdult(ageClass: SafetyAgeClass): boolean {
  return ageClass === "adult" || ageClass === "test_adult";
}

function requiresHardFamilyVerification(channel: ContactChannel): boolean {
  return channel === "dm" || channel === "voice" || channel === "talkback" || channel === "friend_request" || channel === "party_invite" || channel === "video_presence";
}

export function evaluateTeenContactPolicy(input: ContactPolicyInput): ContactPolicyDecision {
  if (input.actor.ageClass === "room_public" || input.target.ageClass === "room_public") {
    return { allowed: true, reason: "allowed: public room channel bypasses DM policy", blocked: false, hardBlock: false };
  }

  const actorUnknown = input.actor.ageClass === "unknown";
  const targetUnknown = input.target.ageClass === "unknown";

  if (actorUnknown || targetUnknown) {
    const reason = "blocked: unknown age classification cannot initiate or receive teen contact";
    logSafetyViolation({
      source: input.source,
      actorId: input.actor.userId,
      actorAgeClass: input.actor.ageClass,
      action: input.channel,
      target: input.target.userId,
      reason,
      blocked: true,
    });
    return { allowed: false, reason, blocked: true, hardBlock: true };
  }

  const actorMinor = isMinor(input.actor.ageClass);
  const targetMinor = isMinor(input.target.ageClass);
  const actorAdult = isAdult(input.actor.ageClass);
  const targetAdult = isAdult(input.target.ageClass);

  const crossAgeContact = (actorMinor && targetAdult) || (actorAdult && targetMinor);
  if (crossAgeContact) {
    const familyVerified = Boolean(input.actor.familyVerified && input.target.familyMember);
    const guardianApproved = Boolean(input.actor.guardianApproved || input.target.guardianLink);

    if (!familyVerified || !guardianApproved) {
      const reason = "blocked: adult-teen contact requires verified family relationship and guardian approval";
      logSafetyViolation({
        source: input.source,
        actorId: input.actor.userId,
        actorAgeClass: input.actor.ageClass,
        action: input.channel,
        target: input.target.userId,
        reason,
        blocked: true,
      });
      return { allowed: false, reason, blocked: true, hardBlock: true };
    }

    if (requiresHardFamilyVerification(input.channel)) {
      return {
        allowed: true,
        reason: "allowed: verified family and guardian approval for protected cross-age contact",
        blocked: false,
        hardBlock: false,
      };
    }
  }

  if (input.channel === "dm" && actorMinor && targetMinor) {
    return { allowed: true, reason: "allowed: teen-to-teen direct message", blocked: false, hardBlock: false };
  }

  if (input.channel === "friend_request" && actorAdult && targetAdult) {
    return { allowed: true, reason: "allowed: adult-to-adult friend request", blocked: false, hardBlock: false };
  }

  return { allowed: true, reason: "allowed: policy check passed", blocked: false, hardBlock: false };
}
