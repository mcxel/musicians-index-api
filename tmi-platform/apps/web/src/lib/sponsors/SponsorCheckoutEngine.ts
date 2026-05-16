import { activatePlacementAfterPurchase, type SponsorActivation } from "@/lib/sponsors/SponsorActivationEngine";
import { reservePlacementInventory } from "@/lib/sponsors/SponsorInventoryPurchaseEngine";
import { buildSponsorReceiptPayload, type SponsorReceiptPayload } from "@/lib/sponsors/SponsorReceiptEngine";
import { Analytics } from "@/lib/analytics/PersonaAnalyticsEngine";

export type SponsorCheckoutStatus = "draft" | "pending-payment" | "paid" | "failed";

export type SponsorPaymentIntentPayload = {
  intentId: string;
  amountCents: number;
  currency: "USD";
  clientSecret: string;
};

export type SponsorCheckoutSession = {
  checkoutId: string;
  selectedPlacementId: string;
  selectedSponsorId: string;
  selectedSponsorName: string;
  campaignId: string;
  quantity: number;
  checkoutAmountCents: number;
  checkoutStatus: SponsorCheckoutStatus;
  paymentIntent: SponsorPaymentIntentPayload;
  receiptId?: string;
};

export type SponsorCheckoutResult = {
  checkout: SponsorCheckoutSession;
  receipt: SponsorReceiptPayload;
  activation: SponsorActivation;
};

const sessions: SponsorCheckoutSession[] = [];
let checkoutCounter = 0;

function buildPaymentIntentPayload(amountCents: number, checkoutId: string): SponsorPaymentIntentPayload {
  return {
    intentId: `sp-intent-${checkoutId}`,
    amountCents,
    currency: "USD",
    clientSecret: `sp-secret-${checkoutId}-${Date.now()}`,
  };
}

export function createSponsorCheckout(input: {
  selectedPlacementId: string;
  selectedSponsorId: string;
  selectedSponsorName: string;
  campaignId: string;
  quantity: number;
}): SponsorCheckoutSession {
  const reservation = reservePlacementInventory(input.selectedPlacementId, input.quantity);
  const checkoutId = `sp-checkout-${++checkoutCounter}`;
  const checkoutAmountCents = reservation.priceCents * input.quantity;

  const session: SponsorCheckoutSession = {
    checkoutId,
    selectedPlacementId: input.selectedPlacementId,
    selectedSponsorId: input.selectedSponsorId,
    selectedSponsorName: input.selectedSponsorName,
    campaignId: input.campaignId,
    quantity: input.quantity,
    checkoutAmountCents,
    checkoutStatus: "pending-payment",
    paymentIntent: buildPaymentIntentPayload(checkoutAmountCents, checkoutId),
  };

  sessions.unshift(session);
  return session;
}

export function completeSponsorCheckout(input: {
  checkoutId: string;
  campaignStartDateIso: string;
  campaignEndDateIso: string;
  targetGenre: string;
  targetAudience: string;
}): SponsorCheckoutResult {
  const session = sessions.find((entry) => entry.checkoutId === input.checkoutId);
  if (!session) {
    throw new Error("Sponsor checkout session not found");
  }

  if (session.checkoutStatus !== "pending-payment") {
    throw new Error("Sponsor checkout is not payable in current state");
  }

  const unitPriceCents = Math.round(session.checkoutAmountCents / session.quantity);
  const receipt = buildSponsorReceiptPayload({
    sponsorId: session.selectedSponsorId,
    campaignId: session.campaignId,
    placementId: session.selectedPlacementId,
    quantity: session.quantity,
    unitPriceCents,
  });

  const activation = activatePlacementAfterPurchase({
    campaignId: session.campaignId,
    sponsorId: session.selectedSponsorId,
    sponsorProfileId: session.selectedSponsorId,
    placementId: session.selectedPlacementId,
    campaignStartDateIso: input.campaignStartDateIso,
    campaignEndDateIso: input.campaignEndDateIso,
    targetGenre: input.targetGenre,
    targetAudience: input.targetAudience,
  });

  session.checkoutStatus = "paid";
  session.receiptId = receipt.receiptId;

  Analytics.revenue({ userId: session.selectedSponsorId, amount: session.checkoutAmountCents / 100, currency: 'usd', product: 'sponsor-package', activePersona: 'sponsor' });
  Analytics.groupAction({ userId: session.selectedSponsorId, groupId: session.campaignId, action: 'campaign-activated', activePersona: 'sponsor' });

  return {
    checkout: session,
    receipt,
    activation,
  };
}

export function failSponsorCheckout(checkoutId: string): SponsorCheckoutSession {
  const session = sessions.find((entry) => entry.checkoutId === checkoutId);
  if (!session) {
    throw new Error("Sponsor checkout session not found");
  }
  session.checkoutStatus = "failed";
  return session;
}

export function listSponsorCheckoutSessions(): SponsorCheckoutSession[] {
  return [...sessions];
}
