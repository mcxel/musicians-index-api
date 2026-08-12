/**
 * Target 3 — CREATE ROOM chain unit evidence (no mocked guest HTTP).
 * Proves entitlement gate + registry register/discover/route/cleanup.
 * Full two-account browser join remains a separate acceptance criterion.
 */

import { resolveEntitlement } from "../lib/subscriptions/SubscriptionEntitlementEngine";
import { computeAuthoritativeTier } from "../lib/auth/resolveAuthoritativeTier";
import {
  registerLiveSession,
  endLiveSession,
  getActiveSessions,
  getSession,
  getSessionsByCategory,
} from "../lib/broadcast/globalLiveSessionStore";
import { resolveLobbyDestination } from "../lib/lobby/DestinationResolver";
import type { SubscriptionTier } from "../lib/subscriptions/SubscriptionPricingEngine";

function runCreateRoomE2EChainTest() {
  const results: Record<string, boolean> = {};

  const tiers: SubscriptionTier[] = [
    "free",
    "pro",
    "RUBY",
    "silver",
    "gold",
    "platinum",
    "diamond",
  ];
  for (const tier of tiers) {
    const fan = resolveEntitlement("fan", tier);
    const performer = resolveEntitlement("performer", tier);
    const allowed = tier === "platinum" || tier === "diamond";
    results[`fan_${tier}_gate`] = fan.createRoomEnabled === allowed;
    results[`performer_${tier}_gate`] = performer.createRoomEnabled === allowed;
  }

  const founder = computeAuthoritativeTier("berntmusic33@gmail.com", "FREE");
  results["founder_is_diamond"] = founder.tier === "DIAMOND";

  const hostUserId = "host-user-create-room-e2e";
  const guestUserId = "guest-user-create-room-e2e";
  const roomId = `room-e2e-${Date.now()}`;

  // Cleanup any prior
  endLiveSession(hostUserId);
  endLiveSession(guestUserId);

  const session = registerLiveSession({
    userId: hostUserId,
    displayName: "Host Diamond",
    title: "E2E Create Room Lounge",
    category: "live",
    roomId,
  });
  results["host_session_roomId"] = session.roomId === roomId;
  results["host_in_getSession"] = getSession(hostUserId)?.roomId === roomId;
  results["host_in_category"] = getSessionsByCategory("live").some(
    (s) => s.roomId === roomId && s.userId === hostUserId,
  );
  results["host_in_active"] = getActiveSessions().some((s) => s.roomId === roomId);

  const dest = resolveLobbyDestination({ roomId, kind: "live" });
  results["exact_room_href"] =
    dest.href === `/live/rooms/${encodeURIComponent(roomId)}`;

  // Guest "sees" same room via active inventory (same registry SoT)
  const visibleToGuest = getActiveSessions().find((s) => s.roomId === roomId);
  results["guest_sees_same_roomId"] = visibleToGuest?.roomId === roomId;
  results["guest_sees_same_host"] = visibleToGuest?.userId === hostUserId;

  endLiveSession(hostUserId);
  results["cleanup_removes_from_active"] = !getActiveSessions().some((s) => s.roomId === roomId);

  const allPassed = Object.values(results).every(Boolean);
  console.log("[CREATE_ROOM_E2E_CHAIN_TEST_ASSERT]", { allPassed, results, roomId });
  if (!allPassed) {
    const failed = Object.entries(results)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    throw new Error(`[CREATE_ROOM_E2E_CHAIN_TEST] FAILED: ${failed.join(", ")}`);
  }
}

runCreateRoomE2EChainTest();
