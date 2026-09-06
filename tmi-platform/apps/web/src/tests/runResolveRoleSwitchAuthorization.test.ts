/**
 * Role-Switch Authorization Test Suite
 *
 * Covers the Slice A.1 correction (Marcel Dickens, 2026-09-06): FAN<->PERFORMER
 * self-service switching for accounts that genuinely hold both roles, while
 * ADMIN/STAFF remains a privileged persona switch never obtainable through
 * self-service regardless of what other roles an account holds.
 *
 * Verifies:
 *   1. owner_fan_to_owned_performer_allowed: real FAN+PERFORMER account can switch either way
 *   2. owner_performer_to_owned_fan_allowed: reverse direction also allowed
 *   3. fan_to_unowned_target_denied: single-role account cannot switch to a role it doesn't hold
 *   4. normal_user_to_admin_denied: non-admin account cannot self-switch into ADMIN
 *   5. normal_user_to_staff_denied: non-admin account cannot self-switch into STAFF
 *   6. unauthenticated_switch_denied: no session -> 401
 *   7. admin_account_can_reach_governance_triad: real admin gets ADMIN/FAN/PERFORMER/ARTIST even without seeded UserRole rows
 *   8. governance_member_bypasses_role_check: named governance member reaches privileged roles via email, not DB role
 *
 * Note: "user A switches user B's profile" has no dedicated case here because
 * the endpoint has no client-suppliable target-user parameter — the acting
 * account is always resolved from the server-side session, so cross-account
 * targeting isn't structurally expressible through this function's inputs.
 * "Active role after switch is exactly one" is enforced by the schema
 * (`User.activeRole` is a single nullable scalar, not an array) rather than
 * by this authorization decision.
 */

import { resolveRoleSwitchAuthorization } from "../lib/auth/resolveRoleSwitchAuthorization";

const GOVERNANCE_SWITCHABLE_ROLES = ["ADMIN", "FAN", "PERFORMER", "ARTIST"] as const;

export function runResolveRoleSwitchAuthorizationTest(): {
  allPassed: boolean;
  results: Record<string, boolean>;
} {
  const results: Record<string, boolean> = {};

  // 1. Owner with real FAN+PERFORMER rows switches FAN -> PERFORMER
  const ownerFanToPerformer = resolveRoleSwitchAuthorization({
    authenticated: true,
    targetRole: "PERFORMER",
    accountPrimaryRole: "FAN",
    accountRealRoles: ["FAN", "PERFORMER"],
    isGovernanceMember: false,
    governanceSwitchableRoles: GOVERNANCE_SWITCHABLE_ROLES,
  });
  results["owner_fan_to_owned_performer_allowed"] = ownerFanToPerformer.allowed;

  // 2. Same account, reverse direction PERFORMER -> FAN
  const ownerPerformerToFan = resolveRoleSwitchAuthorization({
    authenticated: true,
    targetRole: "FAN",
    accountPrimaryRole: "PERFORMER",
    accountRealRoles: ["FAN", "PERFORMER"],
    isGovernanceMember: false,
    governanceSwitchableRoles: GOVERNANCE_SWITCHABLE_ROLES,
  });
  results["owner_performer_to_owned_fan_allowed"] = ownerPerformerToFan.allowed;

  // 3. Single-role FAN account tries to switch to PERFORMER it never activated
  const fanToUnowned = resolveRoleSwitchAuthorization({
    authenticated: true,
    targetRole: "PERFORMER",
    accountPrimaryRole: "FAN",
    accountRealRoles: ["FAN"],
    isGovernanceMember: false,
    governanceSwitchableRoles: GOVERNANCE_SWITCHABLE_ROLES,
  });
  results["fan_to_unowned_target_denied"] = !fanToUnowned.allowed && fanToUnowned.status === 403;

  // 4. Non-admin, dual-role (FAN+PERFORMER) account tries to escalate to ADMIN
  const normalToAdmin = resolveRoleSwitchAuthorization({
    authenticated: true,
    targetRole: "ADMIN",
    accountPrimaryRole: "FAN",
    accountRealRoles: ["FAN", "PERFORMER"],
    isGovernanceMember: false,
    governanceSwitchableRoles: GOVERNANCE_SWITCHABLE_ROLES,
  });
  results["normal_user_to_admin_denied"] = !normalToAdmin.allowed && normalToAdmin.status === 403;

  // 5. Same account tries STAFF instead
  const normalToStaff = resolveRoleSwitchAuthorization({
    authenticated: true,
    targetRole: "STAFF",
    accountPrimaryRole: "FAN",
    accountRealRoles: ["FAN", "PERFORMER"],
    isGovernanceMember: false,
    governanceSwitchableRoles: GOVERNANCE_SWITCHABLE_ROLES,
  });
  results["normal_user_to_staff_denied"] = !normalToStaff.allowed && normalToStaff.status === 403;

  // 6. No session at all
  const unauthenticated = resolveRoleSwitchAuthorization({
    authenticated: false,
    targetRole: "FAN",
    accountPrimaryRole: "",
    accountRealRoles: [],
    isGovernanceMember: false,
    governanceSwitchableRoles: GOVERNANCE_SWITCHABLE_ROLES,
  });
  results["unauthenticated_switch_denied"] = !unauthenticated.allowed && unauthenticated.status === 401;

  // 7. Real ADMIN account reaches the full triad even with no seeded UserRole rows
  const adminTriad = resolveRoleSwitchAuthorization({
    authenticated: true,
    targetRole: "PERFORMER",
    accountPrimaryRole: "ADMIN",
    accountRealRoles: ["ADMIN"],
    isGovernanceMember: false,
    governanceSwitchableRoles: GOVERNANCE_SWITCHABLE_ROLES,
  });
  results["admin_account_can_reach_governance_triad"] = adminTriad.allowed;

  // 8. Named governance member with a non-admin primary DB role still reaches ADMIN via email
  const governanceBypass = resolveRoleSwitchAuthorization({
    authenticated: true,
    targetRole: "ADMIN",
    accountPrimaryRole: "FAN",
    accountRealRoles: ["FAN"],
    isGovernanceMember: true,
    governanceSwitchableRoles: GOVERNANCE_SWITCHABLE_ROLES,
  });
  results["governance_member_bypasses_role_check"] = governanceBypass.allowed;

  const allPassed = Object.values(results).every(Boolean);

  console.log(
    `[RESOLVE_ROLE_SWITCH_AUTHORIZATION_TEST_ASSERT]`,
    JSON.stringify({ allPassed, results }, null, 2),
  );
  return { allPassed, results };
}

runResolveRoleSwitchAuthorizationTest();
