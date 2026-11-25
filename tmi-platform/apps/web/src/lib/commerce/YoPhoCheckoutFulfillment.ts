import type Stripe from 'stripe';
import { grantDurableYoPhoEntitlement } from '@/lib/yopho/YoPhoSkinRegistry';
import {
  assertFulfillmentAllowed,
  evaluateCheckoutSettlement,
  resolveYoPhoCatalogBinding,
} from '@/lib/commerce/CheckoutSettlementAuthority';

export async function fulfillYoPhoCheckoutSession(
  eventType: string,
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  const metadata = (session.metadata || {}) as Record<string, string | undefined>;
  if (!['yopho_commerce', 'yopho_skin', 'yopho_prop_pack'].includes(metadata.type || '')) {
    return false;
  }

  const settlement = await evaluateCheckoutSettlement({
    eventType,
    session,
    requireModePayment: true,
  });
  if (!settlement.ok) return false;

  const binding = resolveYoPhoCatalogBinding({
    metadata,
    amountTotal: session.amount_total,
    currency: session.currency,
  });
  if (!binding.ok || !binding.itemId || !binding.itemKind || !binding.purchaserUserId) {
    return false;
  }

  const gate = await assertFulfillmentAllowed({
    checkoutSessionId: settlement.checkoutSessionId,
    paymentIntentId: settlement.paymentIntentId,
  });
  if (!gate.ok) return false;

  const paymentIntentId = settlement.paymentIntentId;
  if (!paymentIntentId || !settlement.checkoutSessionId) return false;

  const granted = await grantDurableYoPhoEntitlement({
    userId: binding.purchaserUserId,
    itemId: binding.itemId,
    itemKind: binding.itemKind,
    priceCents: binding.expectedPriceCents ?? undefined,
    stripeSessionId: settlement.checkoutSessionId,
    paymentIntentId,
  });

  const after = await assertFulfillmentAllowed({
    checkoutSessionId: settlement.checkoutSessionId,
    paymentIntentId,
  });
  if (!after.ok) return false;

  return granted.status === 'ACTIVE';
}
