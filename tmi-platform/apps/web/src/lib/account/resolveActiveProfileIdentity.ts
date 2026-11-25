/**
 * resolveActiveProfileIdentity — Prisma-backed identity lookup (server only).
 * Client components must import types/builders from ActiveProfileIdentity.ts.
 */

import prisma from "@/lib/prisma";
import {
  buildActiveProfileIdentityFromAccount,
  decideIdentityLookupOutcome,
  type AccountIdentitySource,
  type IdentityLookupResult,
  type IdentityQueryOutcome,
} from "@/lib/account/ActiveProfileIdentity";

export type {
  ActiveProfileIdentity,
  ActiveProfileKind,
  AccountIdentitySource,
  IdentityLookupResult,
  IdentityLookupStatus,
  IdentityQueryOutcome,
} from "@/lib/account/ActiveProfileIdentity";

export {
  buildActiveProfileIdentityFromAccount,
  decideIdentityLookupOutcome,
} from "@/lib/account/ActiveProfileIdentity";

/**
 * Resolves the identity the header/account shell should display for the
 * given authenticated user. Thin Prisma-touching wrapper around the pure
 * decideIdentityLookupOutcome().
 */
export async function resolveActiveProfileIdentity(
  userId: string,
  degradedSessionSource?: Partial<AccountIdentitySource>,
): Promise<IdentityLookupResult> {
  let outcome: IdentityQueryOutcome;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        activeRole: true,
        displayName: true,
        name: true,
        userRoles: { select: { role: true } },
        userProfile: { select: { username: true, avatarUrl: true } },
      },
    });

    outcome = user
      ? {
          kind: "found",
          account: {
            id: user.id,
            email: user.email,
            role: user.role as string,
            activeRole: user.activeRole as string | null,
            displayName: user.displayName,
            name: user.name,
            userRoles: user.userRoles.map((r: { role: string }) => ({ role: r.role })),
            username: user.userProfile?.username ?? null,
            avatarUrl: user.userProfile?.avatarUrl ?? null,
          },
        }
      : { kind: "not_found" };
  } catch {
    outcome = { kind: "error" };
  }

  return decideIdentityLookupOutcome(outcome, degradedSessionSource);
}
