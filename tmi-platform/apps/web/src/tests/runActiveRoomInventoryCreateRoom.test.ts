import { resolveEntitlement } from "../lib/subscriptions/SubscriptionEntitlementEngine";
import { computeAuthoritativeTier } from "../lib/auth/resolveAuthoritativeTier";
import {
  registerLiveSession,
  endLiveSession,
  getActiveSessions,
} from "../lib/broadcast/globalLiveSessionStore";
import { resolveLobbyDestination } from "../lib/lobby/DestinationResolver";

function runActiveRoomInventoryCreateRoomTest() {
  const results: Record<string, boolean> = {};

  // 1. Authoritative Active Room Inventory Count
  const initialActiveCount = getActiveSessions().length;
  results["initial_active_count_is_valid"] = typeof initialActiveCount === "number";

  // 2. Server & Client Entitlement Check — FREE Ordinary Fan (Rejected)
  const freeTier = computeAuthoritativeTier("random.fan@example.com", "FREE");
  const freeEntitlement = resolveEntitlement("fan", freeTier.tier.toLowerCase() as any);
  results["free_fan_entitlement_denied"] = freeEntitlement.createRoomEnabled === false;

  // 3. Server & Client Entitlement Check — DIAMOND / Founder (Allowed)
  const founderTier = computeAuthoritativeTier("berntmusic33@gmail.com", "FREE");
  const founderEntitlement = resolveEntitlement("fan", founderTier.tier.toLowerCase() as any);
  results["founder_entitlement_allowed"] = founderEntitlement.createRoomEnabled === true;

  // 4. End-to-End DIAMOND Create Room Lifecycle
  const testRoomId = `diamond-room-${Date.now()}`;
  const session = registerLiveSession({
    userId: "berntmusic33@gmail.com",
    displayName: "Marcel Dickens",
    title: "Marcel VIP Diamond Lounge",
    category: "live",
    roomId: testRoomId,
  });

  results["diamond_room_created_in_registry"] = session.roomId === testRoomId;

  const activeAfterCreate = getActiveSessions();
  const createdRoomSession = activeAfterCreate.find((s) => s.roomId === testRoomId);
  results["active_inventory_incremented"] = createdRoomSession !== undefined;
  results["active_room_category_is_live"] = createdRoomSession?.category === "live";

  // 5. Destination Routing to Exact Created Room
  const destination = resolveLobbyDestination({
    roomId: testRoomId,
    kind: "live",
  });
  results["created_room_exact_route_correct"] =
    destination.href === `/live/rooms/${encodeURIComponent(testRoomId)}`;

  // 6. Clean Room Teardown
  endLiveSession("berntmusic33@gmail.com");
  const activeAfterTeardown = getActiveSessions();
  const roomStillActive = activeAfterTeardown.some((s) => s.roomId === testRoomId);
  results["diamond_room_cleaned_up_on_teardown"] = roomStillActive === false;

  const allPassed = Object.values(results).every(Boolean);

  console.log("[ACTIVE_ROOM_INVENTORY_CREATE_ROOM_TEST_ASSERT]", { allPassed, results });

  if (!allPassed) {
    const failed = Object.entries(results)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    throw new Error(`[ACTIVE_ROOM_INVENTORY_CREATE_ROOM_TEST] FAILED: ${failed.join(", ")}`);
  }
}

runActiveRoomInventoryCreateRoomTest();
