/**
 * Teen contact overlay for DM / call / invite channels.
 * Public room_chat and lobby_chat stay open.
 * Private 1:1 delegates to YouthSocialGuard: protected teens = 16–17, adults = 18+.
 */
import { logSafetyViolation } from "@/lib/safety/safetyViolationLogger";
import {
  canOneToOneSocial,
  isOneToOneSocialChannel,
  subjectFromLegacyAgeClass,
  type YouthSocialSubject,
} from "@/lib/trustSafety/YouthSocialGuard";

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
  ageYears?: number | null;
  familyAccountId?: string | null;
  isBot?: boolean;
  familyVerified?: boolean;
  guardianApproved?: boolean;
  isModerator?: boolean;
};

export type ContactTarget = {
  userId: string;
  ageClass: SafetyAgeClass;
  ageYears?: number | null;
  familyAccountId?: string | null;
  isBot?: boolean;
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

function toSubject(party: ContactActor | ContactTarget): YouthSocialSubject {
  return subjectFromLegacyAgeClass(party.userId, party.ageClass, {
    ageYears: party.ageYears,
    familyAccountId: party.familyAccountId,
    isBot: party.isBot,
  });
}

function logBlocked(input: ContactPolicyInput, reason: string): ContactPolicyDecision {
  logSafetyViolation({
    source: input.source,
    actorId: input.actor.userId,
    actorAgeClass: input.actor.ageClass === "room_public" ? "unknown" : input.actor.ageClass,
    action: input.channel,
    target: input.target.userId,
    reason,
    blocked: true,
  });
  return { allowed: false, reason, blocked: true, hardBlock: true };
}

export function evaluateTeenContactPolicy(input: ContactPolicyInput): ContactPolicyDecision {
  if (input.channel === "room_chat" || input.channel === "lobby_chat") {
    return { allowed: true, reason: "allowed: public room channel is not 1:1 social", blocked: false, hardBlock: false };
  }

  if (input.actor.ageClass === "room_public" || input.target.ageClass === "room_public") {
    return { allowed: true, reason: "allowed: public room channel bypasses 1:1 policy", blocked: false, hardBlock: false };
  }

  if (isOneToOneSocialChannel(input.channel) || input.channel === "dm" || input.channel === "voice" || input.channel === "talkback" || input.channel === "video_presence" || input.channel === "friend_request" || input.channel === "party_invite") {
    const decision = canOneToOneSocial(toSubject(input.actor), toSubject(input.target));
    if (!decision.allowed) return logBlocked(input, decision.reason);
    return { allowed: true, reason: decision.reason, blocked: false, hardBlock: false };
  }

  return { allowed: true, reason: "allowed: policy check passed", blocked: false, hardBlock: false };
}
