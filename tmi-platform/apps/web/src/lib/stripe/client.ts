// src/lib/stripe/client.ts
import Stripe from 'stripe';

function isPlaceholderKey(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  return (
    normalized.endsWith('_xxx') ||
    normalized.includes('replace_me') ||
    normalized.includes('your_') ||
    normalized === 'sk_test_xxx' ||
    normalized === 'sk_live_xxx'
  );
}

export function getStripe(): Stripe | null {
  const raw = process.env.STRIPE_SECRET_KEY;
  if (!raw) return null;
  const key = raw.trim(); // guard against accidental whitespace in env var
  if (!key) return null;
  if (isPlaceholderKey(key)) return null;
  return new Stripe(key, {
    apiVersion: "2026-02-25.clover",
    appInfo: { name: 'BerntoutGlobal XXL', version: '0.1.0' },
  });
}
