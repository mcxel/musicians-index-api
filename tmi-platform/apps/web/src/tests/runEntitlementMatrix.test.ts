import { resolveEntitlement } from "../lib/subscriptions/SubscriptionEntitlementEngine";
import { computeAuthoritativeTier } from "../lib/auth/resolveAuthoritativeTier";
import type { AccountType, SubscriptionTier } from "../lib/subscriptions/SubscriptionPricingEngine";

const TIERS: SubscriptionTier[] = [
  "free",
  "pro",
  "RUBY",
  "silver",
  "gold",
  "platinum",
  "diamond",
];

const ACCOUNT_TYPES: AccountType[] = ["fan", "performer"];

function runEntitlementMatrixTest() {
  const results: Record<string, boolean> = {};

  // Every tier × fan/performer: createRoomEnabled only for platinum+
  for (const accountType of ACCOUNT_TYPES) {
    for (const tier of TIERS) {
      const e = resolveEntitlement(accountType, tier);
      const allowed = tier === "platinum" || tier === "diamond";
      const key = `${accountType}_${String(tier).toLowerCase()}_create_room_${allowed ? "allowed" : "denied"}`;
      results[key] = e.createRoomEnabled === allowed;
    }
  }

  // Explicit GOLD performer must NOT escalate via creator role
  const goldPerformer = resolveEntitlement("performer", "gold");
  results["gold_performer_cannot_create_room"] = goldPerformer.createRoomEnabled === false;

  const proPerformer = resolveEntitlement("performer", "pro");
  results["pro_performer_cannot_create_room"] = proPerformer.createRoomEnabled === false;

  // ADMIN role is not an entitlement input — resolveEntitlement has no role param
  results["resolver_has_no_role_parameter"] = resolveEntitlement.length === 2;

  // Founder authoritative tier → DIAMOND entitlement create allowed
  const founderTier = computeAuthoritativeTier("berntmusic33@gmail.com", "FREE");
  const founderEntitlement = resolveEntitlement(
    "fan",
    founderTier.tier.toLowerCase() as SubscriptionTier,
  );
  results["founder_authoritative_tier_is_diamond"] = founderTier.tier === "DIAMOND";
  results["founder_entitlement_create_room_enabled"] =
    founderEntitlement.createRoomEnabled === true;

  // Platinum vs diamond progressive fields (engine-local — not SubscriptionPlanEngine canon)
  const plat = resolveEntitlement("fan", "platinum");
  const diam = resolveEntitlement("fan", "diamond");
  results["platinum_max_rooms_3"] = plat.maxSimultaneousRooms === 3;
  results["diamond_max_rooms_10"] = diam.maxSimultaneousRooms === 10;
  results["gold_max_rooms_0"] = resolveEntitlement("fan", "gold").maxSimultaneousRooms === 0;

  const allPassed = Object.values(results).every(Boolean);
  console.log("[ENTITLEMENT_MATRIX_TEST_ASSERT]", { allPassed, results });
  if (!allPassed) {
    const failed = Object.entries(results)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    throw new Error(`[ENTITLEMENT_MATRIX_TEST] FAILED: ${failed.join(", ")}`);
  }
}

runEntitlementMatrixTest();
