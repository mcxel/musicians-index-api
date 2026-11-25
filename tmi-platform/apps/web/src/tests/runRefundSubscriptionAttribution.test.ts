import { attributeRefundToSubscription } from "@/lib/stripe/refundSubscriptionAttribution";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("refund → subscription attribution", () => {
  it("unrelated fully-refunded charge without invoice subscription does NOT revoke", () => {
    const result = attributeRefundToSubscription({
      chargeId: "ch_tip_only",
      invoice: null,
      paymentIntent: "pi_tip",
      fullyRefunded: true,
      knownUserSubscriptionId: "sub_membership",
    });
    expect(result.action).toBe("NO_SUBSCRIPTION_REVOKE");
    expect(result.reason).toBe("no_invoice_subscription");
  });

  it("matching subscription invoice fully refunded → revoke that subscription", () => {
    const result = attributeRefundToSubscription({
      chargeId: "ch_sub",
      invoice: { id: "in_1", subscription: "sub_membership" },
      paymentIntent: "pi_sub",
      fullyRefunded: true,
      knownUserSubscriptionId: "sub_membership",
    });
    expect(result).toEqual({
      action: "REVOKE_SUBSCRIPTION",
      subscriptionId: "sub_membership",
      invoiceId: "in_1",
      paymentIntentId: "pi_sub",
      reason: "invoice_subscription_match",
    });
  });

  it("partial refund does not auto-revoke membership", () => {
    const result = attributeRefundToSubscription({
      chargeId: "ch_partial",
      invoice: { id: "in_1", subscription: "sub_membership" },
      paymentIntent: "pi_sub",
      fullyRefunded: false,
      knownUserSubscriptionId: "sub_membership",
    });
    expect(result.action).toBe("NO_SUBSCRIPTION_REVOKE");
    expect(result.reason).toBe("not_fully_refunded");
  });

  it("invoice subscription that mismatches known user subscription → no revoke", () => {
    const result = attributeRefundToSubscription({
      chargeId: "ch_other",
      invoice: { id: "in_2", subscription: "sub_other" },
      paymentIntent: "pi_other",
      fullyRefunded: true,
      knownUserSubscriptionId: "sub_membership",
    });
    expect(result.action).toBe("NO_SUBSCRIPTION_REVOKE");
    expect(result.reason).toBe("subscription_mismatch");
  });

  it("invoice with subscription but no stored user subscription match (knownUserSubscriptionId null/missing) → no revoke", () => {
    const result = attributeRefundToSubscription({
      chargeId: "ch_sponsor_sub",
      invoice: { id: "in_spons", subscription: "sub_sponsorship" },
      paymentIntent: "pi_spons",
      fullyRefunded: true,
      knownUserSubscriptionId: null,
    });
    expect(result.action).toBe("NO_SUBSCRIPTION_REVOKE");
    expect(result.reason).toBe("no_invoice_subscription");
  });

  it("invoice id string alone (unexpanded) does not revoke", () => {
    const result = attributeRefundToSubscription({
      chargeId: "ch_1",
      invoice: "in_unexpanded",
      paymentIntent: "pi_1",
      fullyRefunded: true,
    });
    expect(result.action).toBe("NO_SUBSCRIPTION_REVOKE");
    expect(result.reason).toBe("no_invoice_subscription");
  });

  it("webhook charge.refunded no longer revokes solely by customer email", () => {
    const source = readFileSync(
      resolve(__dirname, "../app/api/stripe/webhook/route.ts"),
      "utf8",
    );
    expect(source).toContain("attributeRefundToSubscription");
    expect(source).not.toMatch(
      /if \(customerEmail && charge\.refunded\) \{\s*console\.log\(`\[Stripe Webhook\] Charge refunded for \$\{customerEmail\}\. Revoking tier\.`\);\s*queueRevoke\(customerEmail\);\s*\}/,
    );
  });
});
