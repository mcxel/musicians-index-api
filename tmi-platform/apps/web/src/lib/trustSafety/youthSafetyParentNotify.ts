/**
 * Parent safety notices for verified Family Accounts (16–17).
 * Protection events only — never dumps ordinary teen chat contents.
 */

import prisma from "@/lib/prisma";
import type { OneToOneDecision, PrivateInteractContext, YouthSocialSubject } from "./YouthSocialGuard";

export type YouthSafetyParentEventType =
  | "blocked_adult_contact"
  | "private_invite_blocked"
  | "age_verification"
  | "restriction"
  | "report_filed";

const IMMEDIATE_CONTEXTS: ReadonlySet<PrivateInteractContext> = new Set([
  "CALL",
  "PRIVATE_VIDEO",
  "BREAKOUT_INVITE",
  "PRIVATE_MONITOR_ROUTE",
  "SCREEN_SHARE",
]);

function eventTypeForDecision(decision: OneToOneDecision): YouthSafetyParentEventType {
  if (decision.context === "BREAKOUT_INVITE" || decision.context === "PRIVATE_MONITOR_ROUTE") {
    return "private_invite_blocked";
  }
  if (decision.code === "ASSURANCE_REQUIRED") return "age_verification";
  return "blocked_adult_contact";
}

function noticeCopy(eventType: YouthSafetyParentEventType): { title: string; body: string } {
  switch (eventType) {
    case "private_invite_blocked":
      return {
        title: "Private invite blocked",
        body: "A private invite to a 16–17 family member was blocked. Ordinary chat contents are not included.",
      };
    case "age_verification":
      return {
        title: "Age verification needed",
        body: "Private contact with a 16–17 family member was restricted pending age verification.",
      };
    case "restriction":
      return {
        title: "Safety restriction",
        body: "A safety restriction was applied to a 16–17 family member's private contact.",
      };
    case "report_filed":
      return {
        title: "Safety report filed",
        body: "A safety report involving a 16–17 family member was filed. Message contents are not included.",
      };
    default:
      return {
        title: "Private contact blocked",
        body: "Private contact between a 16–17 family member and an unmatched adult was blocked. Chat contents are not included.",
      };
  }
}

async function parentIdForTeenFamily(familyAccountId: string | null | undefined): Promise<string | null> {
  const id = familyAccountId?.trim();
  if (!id) return null;
  try {
    const family = await prisma.familyAccount.findUnique({
      where: { id },
      select: { parentId: true },
    });
    return family?.parentId?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Immediate parent notice when a real FamilyAccount parent exists.
 * No-op (honest empty) when the teen has no verified family graph.
 */
export async function emitYouthSafetyParentNotice(input: {
  teen: YouthSocialSubject;
  eventType: YouthSafetyParentEventType;
  context?: PrivateInteractContext;
  decision?: OneToOneDecision;
  otherUserId?: string;
}): Promise<{ sent: boolean }> {
  const parentId = await parentIdForTeenFamily(input.teen.familyAccountId);
  if (!parentId || parentId === input.teen.userId) return { sent: false };

  const copy = noticeCopy(input.eventType);
  const immediate = !input.context || IMMEDIATE_CONTEXTS.has(input.context) || input.eventType !== "blocked_adult_contact";

  try {
    await prisma.notification.create({
      data: {
        userId: parentId,
        type: immediate ? "youth_safety_immediate" : "youth_safety_digest",
        title: copy.title,
        body: copy.body,
        href: "/account",
        metadata: {
          eventType: input.eventType,
          teenUserId: input.teen.userId,
          otherUserId: input.otherUserId ?? null,
          context: input.context ?? input.decision?.context ?? null,
          code: input.decision?.code ?? null,
          includesChat: false,
        },
      },
    });
    return { sent: true };
  } catch {
    return { sent: false };
  }
}

export async function emitParentNoticeForPrivateDeny(input: {
  actor: YouthSocialSubject;
  target: YouthSocialSubject;
  decision: OneToOneDecision;
}): Promise<void> {
  if (input.decision.allowed) return;
  const eventType = eventTypeForDecision(input.decision);
  const teens = [input.actor, input.target].filter((s) => {
    const band = s.band ?? (s.ageYears != null && s.ageYears >= 16 && s.ageYears <= 17 ? "YOUTH" : null);
    return band === "YOUTH" || (s.ageYears != null && s.ageYears >= 16 && s.ageYears <= 17);
  });
  for (const teen of teens) {
    const other = teen.userId === input.actor.userId ? input.target : input.actor;
    await emitYouthSafetyParentNotice({
      teen,
      eventType,
      context: input.decision.context,
      decision: input.decision,
      otherUserId: other.userId,
    });
  }
}
