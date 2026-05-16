import type { TeenConsentStatus } from "@/lib/auth/TeenAccountEngine";

export type TeenRoomType = "teen_only" | "mixed" | "adult_only";

export type TeenRoomAccessInput = {
  userId: string;
  ageClass: "minor" | "adult" | "unknown";
  roomType: TeenRoomType;
  guardianConsentStatus?: TeenConsentStatus;
  familyVerified?: boolean;
};

export type TeenRoomAccessDecision = {
  allowed: boolean;
  reason: string;
};

export function canEnterTeenRoom(input: TeenRoomAccessInput): TeenRoomAccessDecision {
  if (input.ageClass === "unknown") {
    return { allowed: false, reason: "age unknown: blocked from room access" };
  }

  if (input.roomType === "teen_only") {
    if (input.ageClass !== "minor") {
      return { allowed: false, reason: "adult accounts cannot enter teen-only rooms" };
    }

    if (input.guardianConsentStatus !== "approved") {
      return { allowed: false, reason: "guardian consent must be approved for teen-only room access" };
    }

    return { allowed: true, reason: "teen room access granted" };
  }

  if (input.roomType === "adult_only" && input.ageClass === "minor") {
    return { allowed: false, reason: "teens cannot access adult-only rooms" };
  }

  if (input.roomType === "mixed" && input.ageClass === "minor" && !input.familyVerified) {
    return { allowed: false, reason: "teens in mixed rooms require verified family safety profile" };
  }

  return { allowed: true, reason: "room access granted" };
}
