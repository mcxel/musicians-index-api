/**
 * Affected-account audit count for Google auto-FAN recovery eligibility.
 * Returns counts only — never emails or secrets.
 *
 * Rule (same as isGoogleAutoAssignedFanRecoveryEligible):
 *   role=FAN AND onboardingState=NO_ROLE_SELECTED AND no PERFORMER/ARTIST/BAND
 *   AND (Account.provider=google OR UserStore sha256 passwordHash)
 */

import prisma from "@/lib/prisma";
import {
  isBcryptPasswordHash,
  isUserStoreSha256PasswordHash,
} from "@/lib/auth/roleChoiceAuthority";

export type GoogleAutoFanAuditCounts = {
  scannedFansWithNoRoleSelected: number;
  eligibleByGoogleAccount: number;
  eligibleByLegacySha256Hash: number;
  eligibleTotal: number;
  alreadyHasCreatorCompanion: number;
  authorityField: "User.onboardingState";
  migrationApplied: false | string;
};

export async function countGoogleAutoAssignedFanRecoveryEligible(): Promise<GoogleAutoFanAuditCounts> {
  const candidates = await prisma.user.findMany({
    where: {
      role: "FAN",
      onboardingState: "NO_ROLE_SELECTED",
    },
    select: {
      id: true,
      passwordHash: true,
      userRoles: { select: { role: true } },
      accounts: { where: { provider: "google" }, select: { id: true }, take: 1 },
    },
  });

  let eligibleByGoogleAccount = 0;
  let eligibleByLegacySha256Hash = 0;
  let alreadyHasCreatorCompanion = 0;

  for (const u of candidates) {
    const owned = new Set(u.userRoles.map((r) => String(r.role).toUpperCase()));
    owned.add("FAN");
    if (owned.has("PERFORMER") || owned.has("ARTIST") || owned.has("BAND")) {
      alreadyHasCreatorCompanion += 1;
      continue;
    }
    const hasGoogle = (u.accounts?.length ?? 0) > 0;
    const legacySha =
      isUserStoreSha256PasswordHash(u.passwordHash) &&
      !isBcryptPasswordHash(u.passwordHash);
    if (hasGoogle) eligibleByGoogleAccount += 1;
    else if (legacySha) eligibleByLegacySha256Hash += 1;
  }

  return {
    scannedFansWithNoRoleSelected: candidates.length,
    eligibleByGoogleAccount,
    eligibleByLegacySha256Hash,
    eligibleTotal: eligibleByGoogleAccount + eligibleByLegacySha256Hash,
    alreadyHasCreatorCompanion,
    authorityField: "User.onboardingState",
    migrationApplied: false,
  };
}
