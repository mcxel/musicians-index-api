/**
 * Refund → subscription entitlement attribution.
 * Never revoke a membership solely because the refunded charge shares a customer email.
 */

export type RefundChargeAttributionInput = {
  /** Stripe Charge.id */
  chargeId: string;
  /** charge.invoice as string id, expanded object, or null */
  invoice:
    | string
    | { id?: string | null; subscription?: string | { id?: string | null } | null }
    | null
    | undefined;
  /** charge.payment_intent as string id or expanded object */
  paymentIntent?: string | { id?: string | null } | null;
  /** Fully refunded (charge.refunded === true). Partial refunds do not auto-revoke tiers. */
  fullyRefunded: boolean;
  /** Optional known User.stripeSubscriptionId for this customer (from durable DB). */
  knownUserSubscriptionId?: string | null;
};

export type RefundSubscriptionAttribution =
  | {
      action: "REVOKE_SUBSCRIPTION";
      subscriptionId: string;
      invoiceId: string | null;
      paymentIntentId: string | null;
      reason: "invoice_subscription_match" | "known_user_subscription_match";
    }
  | {
      action: "NO_SUBSCRIPTION_REVOKE";
      subscriptionId: null;
      invoiceId: string | null;
      paymentIntentId: string | null;
      reason:
        | "not_fully_refunded"
        | "no_invoice_subscription"
        | "subscription_mismatch"
        | "missing_charge_context";
    };

function asId(value: string | { id?: string | null } | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

function invoiceSubscriptionId(
  invoice: RefundChargeAttributionInput["invoice"],
): { invoiceId: string | null; subscriptionId: string | null } {
  if (!invoice) return { invoiceId: null, subscriptionId: null };
  if (typeof invoice === "string") {
    // Invoice id alone is not enough to prove subscription linkage without a retrieve.
    return { invoiceId: invoice, subscriptionId: null };
  }
  return {
    invoiceId: invoice.id ?? null,
    subscriptionId: asId(invoice.subscription ?? null),
  };
}

/**
 * Decide whether a charge.refunded event may revoke membership entitlements.
 * Requires an explicit subscription id on the charge's invoice (or a verified
 * match against the user's stored stripeSubscriptionId after invoice expansion).
 */
export function attributeRefundToSubscription(
  input: RefundChargeAttributionInput,
): RefundSubscriptionAttribution {
  const paymentIntentId = asId(input.paymentIntent ?? null);
  const { invoiceId, subscriptionId } = invoiceSubscriptionId(input.invoice);

  if (!input.fullyRefunded) {
    return {
      action: "NO_SUBSCRIPTION_REVOKE",
      subscriptionId: null,
      invoiceId,
      paymentIntentId,
      reason: "not_fully_refunded",
    };
  }

  if (!input.chargeId && !paymentIntentId && !invoiceId) {
    return {
      action: "NO_SUBSCRIPTION_REVOKE",
      subscriptionId: null,
      invoiceId,
      paymentIntentId,
      reason: "missing_charge_context",
    };
  }

  if (subscriptionId) {
    if (!input.knownUserSubscriptionId) {
      return {
        action: "NO_SUBSCRIPTION_REVOKE",
        subscriptionId: null,
        invoiceId,
        paymentIntentId,
        reason: "no_invoice_subscription",
      };
    }
    if (input.knownUserSubscriptionId !== subscriptionId) {
      return {
        action: "NO_SUBSCRIPTION_REVOKE",
        subscriptionId: null,
        invoiceId,
        paymentIntentId,
        reason: "subscription_mismatch",
      };
    }
    return {
      action: "REVOKE_SUBSCRIPTION",
      subscriptionId,
      invoiceId,
      paymentIntentId,
      reason: "invoice_subscription_match",
    };
  }

  // Invoice id present but subscription not expanded — caller must retrieve invoice
  // before revoking. Do not fall back to customer-email revoke.
  return {
    action: "NO_SUBSCRIPTION_REVOKE",
    subscriptionId: null,
    invoiceId,
    paymentIntentId,
    reason: "no_invoice_subscription",
  };
}
