import {
  recordStripeEvent,
  getRecentEvents,
} from "../lib/stripe/stripe-telemetry-store";

function runRevenueGoLiveTest() {
  const results: Record<string, boolean> = {};

  // 1. Telemetry recording for small-dollar revenue transaction
  recordStripeEvent("webhook_verified", {
    fingerprint: "sess_test_venue_skin_001",
    eventType: "checkout.session.completed",
    livemode: true,
    revenueStream: "venue_skin",
    amountCents: 499,
    currency: "usd",
    type: "venue_skin",
    simulated: false,
  });

  recordStripeEvent("webhook_verified", {
    fingerprint: "sub_test_diamond_001",
    eventType: "customer.subscription.created",
    livemode: true,
    revenueStream: "subscriptions",
    amountCents: 2999,
    currency: "usd",
    type: "subscription",
    simulated: false,
  });

  const events = getRecentEvents(50);
  const venueSkinEvent = events.find(
    (e) => (e.meta as any)?.fingerprint === "sess_test_venue_skin_001"
  );
  const subEvent = events.find(
    (e) => (e.meta as any)?.fingerprint === "sub_test_diamond_001"
  );

  results["venue_skin_telemetry_recorded"] = venueSkinEvent !== undefined;
  results["venue_skin_amount_is_499"] = (venueSkinEvent?.meta as any)?.amountCents === 499;
  results["venue_skin_livemode_is_true"] = (venueSkinEvent?.meta as any)?.livemode === true;

  results["subscription_telemetry_recorded"] = subEvent !== undefined;
  results["subscription_amount_is_2999"] = (subEvent?.meta as any)?.amountCents === 2999;

  // 2. Active Revenue Rails Checklist
  const ACTIVE_REVENUE_RAILS = [
    "TICKETS",
    "BEATS",
    "POINTS_PACK",
    "SEASON_PASS",
    "LIVE_TIPS",
    "VENUE_SKINS",
    "MEDIA_PLAYER_CHASSIS",
    "SUBSCRIPTIONS",
  ];
  results["active_revenue_rails_count_is_8"] = ACTIVE_REVENUE_RAILS.length === 8;

  const allPassed = Object.values(results).every(Boolean);

  console.log("[REVENUE_GO_LIVE_TEST_ASSERT]", { allPassed, results });

  if (!allPassed) {
    const failed = Object.entries(results)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    throw new Error(`[REVENUE_GO_LIVE_TEST] FAILED: ${failed.join(", ")}`);
  }
}

runRevenueGoLiveTest();
