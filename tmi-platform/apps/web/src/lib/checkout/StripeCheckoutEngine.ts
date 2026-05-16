/**
 * StripeCheckoutEngine
 * Stripe payload builders: checkout session + payment intent.
 */

import { buildCheckoutRoutes } from "./CheckoutRoutingEngine";

export type StripeSessionPayload = {
  mode: "payment";
  customer: string;
  line_items: Array<{
    quantity: number;
    price_data: {
      currency: "usd";
      product_data: { name: string };
      unit_amount: number;
    };
  }>;
  metadata: Record<string, string>;
  success_url: string;
  cancel_url: string;
};

export type StripePaymentIntentPayload = {
  amount: number;
  currency: "usd";
  customer?: string;
  metadata: Record<string, string>;
  payment_method_types: Array<"card">;
};

export function buildStripeCheckoutSessionPayload(input: {
  checkoutId: string;
  customerId: string;
  productTitle: string;
  productType: string;
  productId: string;
  unitAmountCents: number;
  quantity: number;
  metadata?: Record<string, string | number | boolean>;
}): StripeSessionPayload {
  const routes = buildCheckoutRoutes({
    productType: input.productType as any,
    productId: input.productId,
    customerId: input.customerId,
    checkoutId: input.checkoutId,
  });

  const metadata: Record<string, string> = {
    checkoutId: input.checkoutId,
    customerId: input.customerId,
    productType: input.productType,
    productId: input.productId,
  };

  Object.entries(input.metadata ?? {}).forEach(([k, v]) => {
    metadata[k] = String(v);
  });

  return {
    mode: "payment",
    customer: input.customerId,
    line_items: [
      {
        quantity: input.quantity,
        price_data: {
          currency: "usd",
          product_data: { name: input.productTitle },
          unit_amount: input.unitAmountCents,
        },
      },
    ],
    metadata,
    success_url: routes.successRoute,
    cancel_url: routes.cancelRoute,
  };
}

export function buildStripePaymentIntentPayload(input: {
  checkoutId: string;
  customerId?: string;
  amountCents: number;
  metadata?: Record<string, string | number | boolean>;
}): StripePaymentIntentPayload {
  const metadata: Record<string, string> = {
    checkoutId: input.checkoutId,
  };

  if (input.customerId) metadata.customerId = input.customerId;

  Object.entries(input.metadata ?? {}).forEach(([k, v]) => {
    metadata[k] = String(v);
  });

  return {
    amount: input.amountCents,
    currency: "usd",
    customer: input.customerId,
    metadata,
    payment_method_types: ["card"],
  };
}
