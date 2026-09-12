/**
 * resolveCompanionProvisioningDecision
 *
 * Pure authorization decision for POST /api/account/companion-profile,
 * unit-testable without mocking cookies()/Prisma — mirrors
 * resolveRoleSwitchAuthorization.ts's split.
 *
 * Companion-profile provisioning ("Add Performer Free" / "Add Fan Free") is
 * a distinct operation from role switching (resolveRoleSwitchAuthorization):
 * it CREATES a missing UserRole row for a role the account does not yet
 * hold, rather than switching activeRole among roles already held. It must
 * never be reachable for privileged or not-yet-self-service roles — only
 * FAN and PERFORMER are offered as companion profiles today (Marcel
 * Dickens, 2026-09-06: "reject targetProfile = ADMIN/STAFF/WRITER/VENUE/
 * arbitrary string unless those roles have their own authorized
 * provisioning flow" — none currently do).
 */

const SELF_SERVICE_PROVISIONABLE_PROFILES = new Set(["FAN", "PERFORMER"]);

export interface CompanionProvisioningInput {
  /** False when there is no valid session at all. */
  authenticated: boolean;
  /** Upper-cased requested companion profile. */
  targetProfile: string;
  /** Upper-cased union of `User.role` + `UserRole[]` rows actually assigned to this account. */
  accountRealRoles: string[];
}

export interface CompanionProvisioningDecision {
  allowed: boolean;
  status: 200 | 401 | 403;
  /** True when the account already holds this role — the caller should skip writes and return success idempotently. */
  alreadyOwned: boolean;
  error?: string;
}

export function resolveCompanionProvisioningDecision(
  input: CompanionProvisioningInput,
): CompanionProvisioningDecision {
  if (!input.authenticated) {
    return { allowed: false, status: 401, alreadyOwned: false, error: "Not authenticated" };
  }

  if (!SELF_SERVICE_PROVISIONABLE_PROFILES.has(input.targetProfile)) {
    return {
      allowed: false,
      status: 403,
      alreadyOwned: false,
      error: `Companion profile provisioning is not available for ${input.targetProfile}`,
    };
  }

  const alreadyOwned = input.accountRealRoles.includes(input.targetProfile);
  return { allowed: true, status: 200, alreadyOwned };
}
