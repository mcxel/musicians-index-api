/**
 * Server-only resolver: real Prisma age + family account ids.
 * Never invents family links. Unknown age stays unknown (fail closed).
 * Age from DOB/age column is SELF_DECLARED — never VERIFIED_ADULT/TEEN.
 * Band classification is YouthSocialGuard: 16–17 YOUTH, 18+ ADULT.
 */

import prisma from "@/lib/prisma";
import { getBotById } from "@/lib/bots/botDutyRegistry";
import { COMMUNITY_CONVERSATION_ID } from "@/lib/messaging/communityConversation";
import {
  ageYearsFromDateOfBirth,
  canPrivateInteract,
  isYouthSocialBlockedError,
  privateInteractContextFromMessageType,
  YouthSocialBlockedError,
  type OneToOneDecision,
  type PrivateInteractContext,
  type YouthSocialSubject,
} from "./YouthSocialGuard";
import { emitParentNoticeForPrivateDeny } from "./youthSafetyParentNotify";

type FamilySelect = {
  id: true;
};

const USER_SOCIAL_SELECT = {
  id: true,
  age: true,
  dateOfBirth: true,
  familyAccount: { select: { id: true } satisfies FamilySelect },
  childAccount: { select: { familyAccountId: true } },
} as const;

function familyAccountIdFromRow(row: {
  familyAccount: { id: string } | null;
  childAccount: { familyAccountId: string } | null;
}): string | null {
  const parentOwned = row.familyAccount?.id?.trim() || null;
  const asChild = row.childAccount?.familyAccountId?.trim() || null;
  return parentOwned || asChild || null;
}

function ageYearsFromRow(row: { age: number | null; dateOfBirth: Date | null }): number | null {
  if (typeof row.age === "number" && Number.isFinite(row.age) && row.age > 0) {
    return Math.floor(row.age);
  }
  if (row.dateOfBirth) return ageYearsFromDateOfBirth(row.dateOfBirth);
  return null;
}

export function unknownYouthSocialSubject(userId: string): YouthSocialSubject {
  return {
    userId,
    ageYears: null,
    band: "UNKNOWN",
    familyAccountId: null,
    isBot: Boolean(getBotById(userId)),
    ageAssurance: "UNVERIFIED",
  };
}

export async function resolveYouthSocialSubject(userId: string): Promise<YouthSocialSubject> {
  const id = userId.trim();
  if (!id) return unknownYouthSocialSubject("");

  const asBot = Boolean(getBotById(id));
  try {
    const row = await prisma.user.findUnique({
      where: { id },
      select: USER_SOCIAL_SELECT,
    });
    if (!row) {
      return {
        ...unknownYouthSocialSubject(id),
        isBot: asBot,
      };
    }
    const ageYears = ageYearsFromRow(row);
    return {
      userId: row.id,
      ageYears,
      familyAccountId: familyAccountIdFromRow(row),
      isBot: asBot,
      ageAssurance: ageYears != null ? "SELF_DECLARED" : "UNVERIFIED",
    };
  } catch {
    return {
      ...unknownYouthSocialSubject(id),
      isBot: asBot,
    };
  }
}

export async function evaluatePrivateInteractForUserIds(
  actorUserId: string,
  targetUserId: string,
  context: PrivateInteractContext = "DM",
): Promise<OneToOneDecision> {
  const [actor, target] = await Promise.all([
    resolveYouthSocialSubject(actorUserId),
    resolveYouthSocialSubject(targetUserId),
  ]);
  return canPrivateInteract(actor, target, context);
}

export async function evaluateOneToOneSocialForUserIds(
  actorUserId: string,
  targetUserId: string,
  context: PrivateInteractContext = "DM",
): Promise<OneToOneDecision> {
  return evaluatePrivateInteractForUserIds(actorUserId, targetUserId, context);
}

export async function assertPrivateInteractForUserIds(
  actorUserId: string,
  targetUserId: string,
  context: PrivateInteractContext = "DM",
): Promise<OneToOneDecision> {
  const [actor, target] = await Promise.all([
    resolveYouthSocialSubject(actorUserId),
    resolveYouthSocialSubject(targetUserId),
  ]);
  const decision = canPrivateInteract(actor, target, context);
  if (!decision.allowed) {
    void emitParentNoticeForPrivateDeny({ actor, target, decision }).catch(() => undefined);
    throw new YouthSocialBlockedError(decision.reason, decision);
  }
  return decision;
}

export async function assertOneToOneSocialForUserIds(
  actorUserId: string,
  targetUserId: string,
  context: PrivateInteractContext = "DM",
): Promise<OneToOneDecision> {
  return assertPrivateInteractForUserIds(actorUserId, targetUserId, context);
}

export async function assertDirectThreadOneToOne(opts: {
  conversationId: string;
  senderId: string;
  kind?: string | null;
  participantIds?: string[];
  context?: PrivateInteractContext;
  messageType?: string | null;
}): Promise<void> {
  if (opts.conversationId === COMMUNITY_CONVERSATION_ID) return;
  const kind = (opts.kind ?? "").toLowerCase();
  if (kind === "community") return;

  const context =
    opts.context ?? privateInteractContextFromMessageType(opts.messageType);

  let participantIds = opts.participantIds;
  if (!participantIds) {
    try {
      const convo = await prisma.conversation.findUnique({
        where: { id: opts.conversationId },
        select: { kind: true, participantIds: true },
      });
      if (!convo) {
        throw new YouthSocialBlockedError(
          "blocked: age unknown — private contact denied until age is on the account",
        );
      }
      if ((convo.kind ?? "").toLowerCase() === "community") return;
      participantIds = convo.participantIds;
    } catch (err) {
      if (err instanceof YouthSocialBlockedError) throw err;
      throw new YouthSocialBlockedError(
        "blocked: age unknown — private contact denied until age is on the account",
      );
    }
  }

  if (!participantIds || participantIds.length === 0) {
    throw new YouthSocialBlockedError(
      "blocked: private interaction requires two real account identities",
    );
  }

  const others = participantIds.filter((id) => id !== opts.senderId);
  if (others.length === 0) return;

  for (const other of others) {
    await assertPrivateInteractForUserIds(opts.senderId, other, context);
  }
}

export function youthSocialBlockPayload(err: unknown): {
  error: string;
  blocked: true;
  reason: string;
  code: string;
} | null {
  if (!isYouthSocialBlockedError(err)) return null;
  return {
    error: err.message,
    blocked: true,
    reason: err.message,
    code: err.decision?.code ?? "YOUTH_SOCIAL_BLOCKED",
  };
}
