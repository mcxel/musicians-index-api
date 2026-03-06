// src/lib/stripe/client.ts
import Stripe from 'stripe';

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key as string, {
    apiVersion: "2026-02-25.clover",
    appInfo: { name: 'BerntoutGlobal XXL', version: '0.1.0' },
  });
}
