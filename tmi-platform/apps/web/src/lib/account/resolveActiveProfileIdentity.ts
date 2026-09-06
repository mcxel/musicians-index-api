/**
 * resolveActiveProfileIdentity
 *
 * Compatibility resolver between the Universal Account header shell and the
 * database, per CLAUDE.md Rule 31 (Dual-Profile Account Architecture).
 * Today's real schema is a single `User` row with one `role`/`userRoles[]`/
 * `activeRole` and one shared name/photo -- there is no FanProfile/
 * PerformerProfile table yet. This resolver is the one seam where that
 * truth lives, so the header component never has to know which schema era
 * it's reading from:
 *
 *   UniversalAccountIdentityControl (React)
 *           |
 *   ActiveProfileIdentity (this file's stable contract)
 *           |
 *   CURRENT SCHEMA: User + activeRole + UserRole  -->  profileKind: "ACCOUNT_FALLBACK"
 *   FUTURE SCHEMA:  FanProfile / PerformerProfile  -->  profileKind: "FAN_PROFILE" | "PERFORMER_PROFILE"
 *
 * When the real per-role profile tables exist, only this file's
 * implementation changes (activeRole===FAN -> resolve FanProfile,
 * activeRole===PERFORMER -> resolve PerformerProfile) -- the header
 * component and its contract stay the same. Until then, this resolver must
 * be honest that no separate Fan/Performer name exists: it always reports
 * ACCOUNT_FALLBACK and uses the one real canonical User identity, never a
 * fabricated per-role name.
 */

import prisma from "@/lib/prisma";
import { getCanonicalInitials } from "@/lib/auth/resolveSessionIdentity";

export type ActiveProfileKind = "ACCOUNT_FALLBACK" | "FAN_PROFILE" | "PERFORMER_PROFILE";

export interface ActiveProfileIdentity {
  accountUserId: string;
  activeRole: string;

  publicDisplayName: string;
  publicHandle: string | null;
  publicImageUrl: string | null;
  canonicalInitials: string;

  profileKind: ActiveProfileKind;
  profileComplete: boolean;

  ownedRoles: string[];
}

/**
 * Resolves the identity the header/account shell should display for the
 * given authenticated user. Returns null only if the user no longer exists
 * (deleted between session issue and this call) -- callers should treat
 * that the same as "not authenticated."
 */
export async function resolveActiveProfileIdentity(
  userId: string,
): Promise<ActiveProfileIdentity | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      activeRole: true,
      displayName: true,
      name: true,
      userRoles: { select: { role: true } },
      // username/avatarUrl live on the related UserProfile, not on User itself.
      userProfile: { select: { username: true, avatarUrl: true } },
    },
  });

  if (!user) return null;

  const ownedRoles = Array.from(
    new Set(
      [user.role as string, ...user.userRoles.map((r: { role: string }) => r.role)].map((r) =>
        r.toUpperCase(),
      ),
    ),
  );

  const activeRole = ((user.activeRole as string | null) ?? (user.role as string)).toUpperCase();

  const username = user.userProfile?.username ?? null;
  const avatarUrl = user.userProfile?.avatarUrl ?? null;

  // No FanProfile/PerformerProfile row exists in this schema era -- the only
  // honest identity to show is the one real canonical User identity. Do not
  // fabricate a separate "Fan name" or "Performer stage name" from it.
  const publicDisplayName = user.displayName ?? user.name ?? username ?? "Member";

  return {
    accountUserId: user.id,
    activeRole,
    publicDisplayName,
    publicHandle: username,
    publicImageUrl: avatarUrl,
    canonicalInitials: getCanonicalInitials(publicDisplayName),
    profileKind: "ACCOUNT_FALLBACK",
    // Current schema has no per-role onboarding/completeness state -- the
    // only real, checkable field is whether a display name exists at all.
    profileComplete: Boolean(publicDisplayName && publicDisplayName !== "Member"),
    ownedRoles,
  };
}
