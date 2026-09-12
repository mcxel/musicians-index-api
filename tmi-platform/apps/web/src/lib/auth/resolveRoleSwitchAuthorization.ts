/**
 * resolveRoleSwitchAuthorization
 *
 * Pure authorization decision for POST /api/auth/switch-role, extracted so
 * the security-critical logic is unit-testable without mocking Next.js
 * `cookies()`/Prisma.
 *
 * Two distinct operations, per Marcel Dickens' 2026-09-06 correction of the
 * 2026-07-24 rule:
 *
 *   FAN / PERFORMER (or any other non-privileged role the account genuinely
 *   holds a real UserRole row for) = SELF-SERVICE ACCOUNT MODE SWITCH.
 *   Any authenticated account may switch into a role it actually owns.
 *
 *   ADMIN / STAFF = PRIVILEGED PERSONA SWITCH. Never obtainable through
 *   self-service, regardless of what UserRole rows an account holds — only
 *   an account that is itself ADMIN/STAFF, or a named governance member,
 *   may switch into ADMIN/STAFF.
 *
 * "No privilege escalation" always holds: the target must be present in the
 * caller's own real roles (`accountRealRoles`) unless the governance triad
 * widening applies (admin/governance accounts only).
 */

const PRIVILEGED_TARGET_ROLES = new Set(["ADMIN", "STAFF"]);

export interface RoleSwitchAuthorizationInput {
  /** False when there is no valid session at all. */
  authenticated: boolean;
  /** Upper-cased requested target role. */
  targetRole: string;
  /** Upper-cased primary `User.role` from the DB (not the tmi_role cookie — that's what this endpoint mutates on every switch). */
  accountPrimaryRole: string;
  /** Upper-cased union of `User.role` + `UserRole[]` rows actually assigned to this account — no widening applied yet. */
  accountRealRoles: string[];
  /** True for named governance members (Marcel/Justin/Jay Paul) regardless of their current DB role. */
  isGovernanceMember: boolean;
  /** Additional roles a governance/admin account may switch into even without a real UserRole row (the triad). */
  governanceSwitchableRoles: readonly string[];
}

export interface RoleSwitchAuthorizationResult {
  allowed: boolean;
  status: 200 | 401 | 403;
  error?: string;
}

export function resolveRoleSwitchAuthorization(
  input: RoleSwitchAuthorizationInput,
): RoleSwitchAuthorizationResult {
  if (!input.authenticated) {
    return { allowed: false, status: 401, error: "Not authenticated" };
  }

  const isAdminAccount =
    input.accountPrimaryRole === "ADMIN" ||
    input.accountPrimaryRole === "STAFF" ||
    input.accountRealRoles.includes("ADMIN") ||
    input.accountRealRoles.includes("STAFF") ||
    input.isGovernanceMember;

  // Escalation into a privileged role is never self-service, no matter what
  // other non-privileged roles the caller genuinely holds.
  if (PRIVILEGED_TARGET_ROLES.has(input.targetRole) && !isAdminAccount) {
    return { allowed: false, status: 403, error: "Forbidden: dashboard switching is admin-only" };
  }

  const allowedRoles = new Set(input.accountRealRoles);
  if (isAdminAccount) {
    for (const r of input.governanceSwitchableRoles) allowedRoles.add(r);
  }

  if (!allowedRoles.has(input.targetRole)) {
    return {
      allowed: false,
      status: 403,
      error: `Role ${input.targetRole} not assigned to your account`,
    };
  }

  return { allowed: true, status: 200 };
}
