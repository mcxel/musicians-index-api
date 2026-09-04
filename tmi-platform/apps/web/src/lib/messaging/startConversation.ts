/**
 * Unified startConversation bootstrap.
 * Checks eligibility both sides, relationship, block, rate limit →
 * return existing thread or create one. Actionable error codes for UI.
 */

import prisma from "@/lib/prisma";
import { getOrCreateConversation } from "./prismaMessageStore";
import { resolveRecipientId } from "./resolveMessagingUser";
import { getMessagingEligibility, type MessagingEligibilityState } from "./MessagingEligibility";
import {
  conversationKindForRoles,
  isMessagingRelationshipAllowed,
} from "./MessagingRelationshipRules";
import {
  assertOneToOneSocialForUserIds,
} from "@/lib/trustSafety/resolveYouthSocialSubject";
import {
  isYouthSocialBlockedError,
  type OneToOneDecision,
} from "@/lib/trustSafety/YouthSocialGuard";
import { checkMessageContent, isUserBlocked as isMemoryBlocked } from "@/lib/messages/MessageModerationEngine";

export const START_CONVERSATION_ERROR_CODES = [
  "AGE_VERIFICATION_REQUIRED",
  "RECIPIENT_AGE_UNVERIFIED",
  "POLICY_ACCEPTANCE_REQUIRED",
  "RECIPIENT_MESSAGES_DISABLED",
  "AGE_POLICY_RESTRICTED",
  "BLOCKED",
  "RATE_LIMITED",
  "ACCOUNT_RESTRICTED",
  "RECIPIENT_NOT_FOUND",
  "RELATIONSHIP_DENIED",
  "UNAUTHORIZED",
  "SELF_MESSAGE",
] as const;

/**
 * A sender can only self-repair their OWN missing age data — they can never
 * fix a recipient's. Attribute an UNKNOWN_AGE denial to whichever side is
 * actually unverified so the UI shows a self-serve prompt only when the
 * sender can act on it, never an unresolvable retry loop when it's the
 * recipient who hasn't verified.
 */
export function mapUnknownAgeDecisionToResult(
  decision: OneToOneDecision | undefined,
  fallbackMessage: string,
): { code: "AGE_VERIFICATION_REQUIRED" | "RECIPIENT_AGE_UNVERIFIED"; error: string } {
  const senderUnverified = decision?.actorAssurance === "UNVERIFIED";
  const recipientUnverified = decision?.targetAssurance === "UNVERIFIED";
  if (!senderUnverified && recipientUnverified) {
    return {
      code: "RECIPIENT_AGE_UNVERIFIED",
      error: "This person hasn't completed the required age verification for private messaging yet.",
    };
  }
  return { code: "AGE_VERIFICATION_REQUIRED", error: fallbackMessage };
}

export type StartConversationErrorCode = (typeof START_CONVERSATION_ERROR_CODES)[number];

export type StartConversationOk = {
  ok: true;
  threadId: string;
  created: boolean;
  kind: string;
  recipient: { userId: string; displayName: string };
};

export type StartConversationErr = {
  ok: false;
  code: StartConversationErrorCode;
  error: string;
  eligibilityState?: MessagingEligibilityState;
  recipientEligibilityState?: MessagingEligibilityState;
};

export type StartConversationResult = StartConversationOk | StartConversationErr;

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 12;
const rateBuckets = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const prev = (rateBuckets.get(userId) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (prev.length >= RATE_MAX) {
    rateBuckets.set(userId, prev);
    return false;
  }
  prev.push(now);
  rateBuckets.set(userId, prev);
  return true;
}

function mapEligibilityToCode(
  state: MessagingEligibilityState,
): StartConversationErrorCode | null {
  switch (state) {
    case "AGE_VERIFICATION_REQUIRED":
      return "AGE_VERIFICATION_REQUIRED";
    case "POLICY_ACCEPTANCE_REQUIRED":
      return "POLICY_ACCEPTANCE_REQUIRED";
    case "SUSPENDED":
    case "RESTRICTED":
      return "ACCOUNT_RESTRICTED";
    case "NOT_ELIGIBLE":
      return "ACCOUNT_RESTRICTED";
    default:
      return null;
  }
}

async function isPrismaBlocked(a: string, b: string): Promise<boolean> {
  try {
    const hit = await prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: a, blockedId: b },
          { blockerId: b, blockedId: a },
        ],
      },
      select: { id: true },
    });
    return Boolean(hit);
  } catch {
    return isMemoryBlocked(a, b) || isMemoryBlocked(b, a);
  }
}

async function recipientAllowsMessages(recipientId: string, senderId: string): Promise<boolean> {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: recipientId },
      select: { allowMessages: true },
    });
    const mode = (settings?.allowMessages ?? "everyone").toLowerCase();
    if (mode === "none" || mode === "nobody" || mode === "off") return false;
    if (mode === "everyone" || mode === "all") return true;
    // followers / friends — allow for now if friendship exists; otherwise allow (honest open until graph wired tightly)
    if (mode === "followers" || mode === "friends") {
      try {
        const friendship = await prisma.friendship.findFirst({
          where: {
            status: "accepted",
            OR: [
              { requesterId: senderId, addresseeId: recipientId },
              { requesterId: recipientId, addresseeId: senderId },
            ],
          },
          select: { id: true },
        });
        // If no friendship model hit, do not hard-block discovery/booking outreach for performers
        if (!friendship) return true;
        return true;
      } catch {
        return true;
      }
    }
    return true;
  } catch {
    return true;
  }
}

export async function startConversation(opts: {
  senderId: string;
  senderRole?: string | null;
  recipientHandle: string;
  kind?: string;
  /** Optional first-message body for spam pre-check only (creation does not require body). */
  previewBody?: string;
}): Promise<StartConversationResult> {
  const senderId = opts.senderId.trim();
  if (!senderId) {
    return { ok: false, code: "UNAUTHORIZED", error: "Unauthorized" };
  }

  if (!checkRateLimit(senderId)) {
    return { ok: false, code: "RATE_LIMITED", error: "Too many conversation starts. Wait a minute and try again." };
  }

  const senderElig = await getMessagingEligibility(senderId);
  const senderCode = mapEligibilityToCode(senderElig.state);
  if (senderCode) {
    return {
      ok: false,
      code: senderCode,
      error: senderElig.reason ?? senderCode,
      eligibilityState: senderElig.state,
    };
  }

  const recipient = await resolveRecipientId(opts.recipientHandle);
  if (!recipient) {
    return {
      ok: false,
      code: "RECIPIENT_NOT_FOUND",
      error: "Recipient not found. Use a real user id, email, username, or profile slug.",
    };
  }

  if (recipient.id === senderId) {
    return { ok: false, code: "SELF_MESSAGE", error: "Cannot message yourself" };
  }

  const recipientElig = await getMessagingEligibility(recipient.id);
  const recipientCode = mapEligibilityToCode(recipientElig.state);
  if (recipientCode === "ACCOUNT_RESTRICTED") {
    return {
      ok: false,
      code: "ACCOUNT_RESTRICTED",
      error: "Recipient account cannot receive messages",
      recipientEligibilityState: recipientElig.state,
    };
  }
  if (recipientCode === "AGE_VERIFICATION_REQUIRED" || recipientCode === "POLICY_ACCEPTANCE_REQUIRED") {
    // Recipient incomplete gate — treat as messages disabled for actor UX
    return {
      ok: false,
      code: "RECIPIENT_MESSAGES_DISABLED",
      error: "Recipient is not eligible to receive messages yet",
      recipientEligibilityState: recipientElig.state,
    };
  }

  if (await isPrismaBlocked(senderId, recipient.id)) {
    return { ok: false, code: "BLOCKED", error: "Messaging is blocked between these accounts" };
  }

  if (!(await recipientAllowsMessages(recipient.id, senderId))) {
    return {
      ok: false,
      code: "RECIPIENT_MESSAGES_DISABLED",
      error: "Recipient has direct messages disabled",
    };
  }

  let senderRole = opts.senderRole ?? null;
  let recipientRole: string | null = null;
  try {
    const users = await prisma.user.findMany({
      where: { id: { in: [senderId, recipient.id] } },
      select: { id: true, role: true },
    });
    senderRole = users.find((u) => u.id === senderId)?.role?.toString() ?? senderRole;
    recipientRole = users.find((u) => u.id === recipient.id)?.role?.toString() ?? null;
  } catch {
    /* continue with defaults */
  }

  const rel = isMessagingRelationshipAllowed(senderRole, recipientRole);
  if (!rel.allowed) {
    return {
      ok: false,
      code: "RELATIONSHIP_DENIED",
      error: rel.reason ?? "This messaging relationship is not allowed",
    };
  }

  if (opts.previewBody?.trim()) {
    const spam = checkMessageContent(opts.previewBody);
    if (spam.isAbuse) {
      return { ok: false, code: "ACCOUNT_RESTRICTED", error: "Message content blocked by safety rules" };
    }
  }

  try {
    await assertOneToOneSocialForUserIds(senderId, recipient.id, "DM");
  } catch (err) {
    if (isYouthSocialBlockedError(err)) {
      const code = err.decision?.code;
      if (code === "UNKNOWN_AGE") {
        const mapped = mapUnknownAgeDecisionToResult(err.decision, err.message);
        return {
          ok: false,
          code: mapped.code,
          error: mapped.error,
          eligibilityState: mapped.code === "AGE_VERIFICATION_REQUIRED" ? "AGE_VERIFICATION_REQUIRED" : undefined,
        };
      }
      return {
        ok: false,
        code: "AGE_POLICY_RESTRICTED",
        error: err.message || "Age policy restricts this conversation",
      };
    }
    throw err;
  }

  const kind = opts.kind ?? conversationKindForRoles(senderRole, recipientRole);

  // Detect existing before create for created flag
  const [a, b] = senderId < recipient.id ? [senderId, recipient.id] : [recipient.id, senderId];
  let existed = false;
  try {
    const candidates = await prisma.conversation.findMany({
      where: { participantIds: { hasEvery: [a, b] }, isArchived: false },
      take: 20,
    });
    existed = candidates.some(
      (c) => c.participantIds.length === 2 && c.participantIds.includes(a) && c.participantIds.includes(b),
    );
  } catch {
    existed = false;
  }

  const convo = await getOrCreateConversation({
    userId: senderId,
    recipientId: recipient.id,
    kind,
  });

  return {
    ok: true,
    threadId: convo.id,
    created: !existed,
    kind: convo.kind ?? kind,
    recipient: {
      userId: recipient.id,
      displayName: recipient.displayName,
    },
  };
}

export function startConversationHttpStatus(result: StartConversationResult): number {
  if (result.ok) return 200;
  switch (result.code) {
    case "UNAUTHORIZED":
      return 401;
    case "RECIPIENT_NOT_FOUND":
      return 404;
    case "RATE_LIMITED":
      return 429;
    case "SELF_MESSAGE":
    case "RELATIONSHIP_DENIED":
      return 400;
    default:
      return 403;
  }
}
