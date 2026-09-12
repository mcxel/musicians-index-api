/**
 * Companion Profile Provisioning Test Suite
 *
 * Covers the Account Shell Integration assignment (Marcel Dickens,
 * 2026-09-06): "ADD PERFORMER FREE"/"ADD FAN FREE" must provision a missing
 * UserRole row through a dedicated endpoint, never call /api/auth/switch-role
 * for a role the account doesn't hold yet.
 *
 * Verifies (resolveCompanionProvisioningDecision):
 *   1. fan_only_can_add_performer: Fan-only account may provision PERFORMER
 *   2. performer_only_can_add_fan: Performer-only account may provision FAN
 *   3. duplicate_add_is_idempotent: already-owned target reports alreadyOwned, not an error
 *   4. unauthenticated_denied: no session -> 401
 *   5. admin_target_rejected: targetProfile=ADMIN -> 403
 *   6. staff_target_rejected: targetProfile=STAFF -> 403
 *   7. writer_target_rejected: targetProfile=WRITER -> 403 (no self-service provisioning flow exists for it)
 *   8. venue_target_rejected: targetProfile=VENUE -> 403
 *   9. arbitrary_string_target_rejected: nonsense target -> 403
 *
 * Verifies (resolveCompanionProfileOffer):
 *  10. offer_reports_free_with_real_source: current state genuinely has no
 *      priced companion-profile product, so isFree=true with a named,
 *      inspectable entitlementSource -- not a hardcoded UI string
 *  11. offer_shape_supports_future_paid_state: the contract carries
 *      price/currency fields a future paid offer would populate
 */

import { resolveCompanionProvisioningDecision } from "../lib/auth/resolveCompanionProvisioningDecision";
import { resolveCompanionProfileOffer } from "../lib/account/resolveCompanionProfileOffer";

export function runCompanionProfileProvisioningTest(): {
  allPassed: boolean;
  results: Record<string, boolean>;
} {
  const results: Record<string, boolean> = {};

  // 1. Fan-only adds Performer
  const fanAddsPerformer = resolveCompanionProvisioningDecision({
    authenticated: true,
    targetProfile: "PERFORMER",
    accountRealRoles: ["FAN"],
  });
  results["fan_only_can_add_performer"] = fanAddsPerformer.allowed && !fanAddsPerformer.alreadyOwned;

  // 2. Performer-only adds Fan
  const performerAddsFan = resolveCompanionProvisioningDecision({
    authenticated: true,
    targetProfile: "FAN",
    accountRealRoles: ["PERFORMER"],
  });
  results["performer_only_can_add_fan"] = performerAddsFan.allowed && !performerAddsFan.alreadyOwned;

  // 3. Already owns both -- duplicate add is idempotent, not an error
  const duplicateAdd = resolveCompanionProvisioningDecision({
    authenticated: true,
    targetProfile: "PERFORMER",
    accountRealRoles: ["FAN", "PERFORMER"],
  });
  results["duplicate_add_is_idempotent"] = duplicateAdd.allowed && duplicateAdd.alreadyOwned;

  // 4. No session
  const unauthenticated = resolveCompanionProvisioningDecision({
    authenticated: false,
    targetProfile: "FAN",
    accountRealRoles: [],
  });
  results["unauthenticated_denied"] = !unauthenticated.allowed && unauthenticated.status === 401;

  // 5-9. Privileged / unsupported targets rejected regardless of held roles
  const rejectedTargets = ["ADMIN", "STAFF", "WRITER", "VENUE", "NOT_A_REAL_ROLE"];
  const rejectionKeys = [
    "admin_target_rejected",
    "staff_target_rejected",
    "writer_target_rejected",
    "venue_target_rejected",
    "arbitrary_string_target_rejected",
  ];
  rejectedTargets.forEach((target, i) => {
    const decision = resolveCompanionProvisioningDecision({
      authenticated: true,
      targetProfile: target,
      accountRealRoles: ["FAN"],
    });
    results[rejectionKeys[i]] = !decision.allowed && decision.status === 403;
  });

  // 10. Offer resolver reports free with a real, named source (not a bare UI string)
  const fanOffer = resolveCompanionProfileOffer("FAN");
  results["offer_reports_free_with_real_source"] =
    fanOffer.isFree === true &&
    fanOffer.price === 0 &&
    typeof fanOffer.entitlementSource === "string" &&
    fanOffer.entitlementSource.length > 0;

  // 11. Contract shape supports a future paid state without a caller rewrite
  const performerOffer = resolveCompanionProfileOffer("PERFORMER");
  results["offer_shape_supports_future_paid_state"] =
    "price" in performerOffer && "currency" in performerOffer && "available" in performerOffer;

  const allPassed = Object.values(results).every(Boolean);

  console.log(
    `[COMPANION_PROFILE_PROVISIONING_TEST_ASSERT]`,
    JSON.stringify({ allPassed, results }, null, 2),
  );
  return { allPassed, results };
}

runCompanionProfileProvisioningTest();
