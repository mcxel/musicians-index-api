/**
 * Source-scan: creator sponsorship wiring + ad_purchase durability preserved.
 */

import fs from "fs";
import path from "path";

const root = path.join(__dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

export function runCreatorSponsorshipWiringTest() {
  const results: Record<string, boolean> = {};
  const webhook = read("app/api/stripe/webhook/route.ts");
  const identity = read("lib/commerce/economicPaymentIdentity.ts");
  const ledger = read("lib/commerce/economicPaymentLedger.ts");
  const authority = read("lib/sponsors/CreatorSponsorshipCreditAuthority.ts");
  const fanReg = read("lib/registries/FanSponsorRegistry.ts");
  const fanPage = read("components/profile/FanPublicPage.tsx");
  const publicRoute = read("app/p/[username]/page.tsx");
  const plan = read("lib/subscriptions/SubscriptionPlanEngine.ts");
  const pricing = read("lib/sponsors/ArtistSponsorPricingEngine.ts");

  // ad_purchase durability MUST remain exactly wired (prior regression).
  results["ad_purchase_build_fields"] = /buildAdPurchaseOrderPersistFields/.test(webhook);
  results["ad_purchase_orderKind"] = /orderKind:\s*durable\.orderKind/.test(webhook);
  results["ad_purchase_adActivation"] = /adActivationStatus:\s*durable\.adActivationStatus/.test(
    webhook,
  );
  results["ad_purchase_idempotent"] =
    /updateMany/.test(webhook) && /updated\.count === 0/.test(webhook);
  results["ad_purchase_no_auto_live"] = /not auto-activated/.test(webhook);

  results["economic_type_creator_sponsorship"] =
    /CREATOR_SPONSORSHIP/.test(identity) && /SHOP.*TIP.*BEAT/.test(identity);
  results["ledger_credit_cycle"] = /creditCreatorSponsorshipCycle/.test(ledger);
  results["ledger_no_instant_payout"] =
    /InstantPayoutEngine is never called/.test(ledger) &&
    !/from ["']@\/lib\/.*InstantPayout/.test(ledger) &&
    !/require\(.*InstantPayout/.test(ledger);
  results["authority_no_fabricated_stripe_fee"] =
    /stripeProcessingFeeCents:\s*null/.test(authority);
  results["pricing_creator_alias"] = /calculateCreatorSponsorPayout/.test(pricing);
  results["webhook_initial_credit"] = /creditCreatorSponsorshipCycle/.test(webhook);
  results["webhook_renewal_invoice_id"] =
    /economicPaymentId:\s*invoice\.id/.test(webhook) &&
    /isCreatorSponsorshipMetadataType/.test(webhook);
  results["webhook_failed_marks_payment_failed"] = /payment_failed/.test(webhook);
  results["webhook_cancel_fan_registry"] = /FanSponsorRegistry\.markStatusBySubscription/.test(
    webhook,
  );
  results["membership_excludes_creator_spons"] =
    /!isCreatorSponsMeta\(metadata\.type\)/.test(webhook);
  results["fan_registry_exists"] = /FAN_SPONSOR/.test(fanReg);
  results["fan_registry_eligible_public"] = /listEligiblePublicPlacements/.test(fanReg);
  results["fan_page_shelf"] = /FanSponsorShelf/.test(fanPage);
  results["fan_public_route_fetches_registry"] =
    /FanSponsorRegistry\.listEligiblePublicPlacements/.test(publicRoute) &&
    /sponsors=\{sponsors\}/.test(publicRoute);
  results["fan_benefits_mention_sponsor_slots"] =
    /fan-page sponsor slots/.test(plan) && /\$25\/mo/.test(plan);

  const allPassed = Object.values(results).every(Boolean);
  console.log(
    "[CREATOR_SPONSORSHIP_WIRING_TEST_ASSERT]",
    JSON.stringify({ allPassed, results }, null, 2),
  );
  return { allPassed, results };
}

describe("Creator sponsorship wiring (source-scan)", () => {
  it("wires sponsorship credits and preserves ad_purchase durability", () => {
    const { allPassed, results } = runCreatorSponsorshipWiringTest();
    expect(results.ad_purchase_build_fields).toBe(true);
    expect(results.webhook_renewal_invoice_id).toBe(true);
    expect(allPassed).toBe(true);
  });
});
