export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/api/admin/_utils/require-admin';
import { recordStripeEvent } from '@/lib/stripe/stripe-telemetry-store';

type AllowedStream =
  | 'subscriptions'
  | 'founding_packs'
  | 'sponsors'
  | 'one_time'
  | 'payments'
  | 'charges'
  | 'other';

const ALLOWED_STREAMS = new Set<AllowedStream>([
  'subscriptions',
  'founding_packs',
  'sponsors',
  'one_time',
  'payments',
  'charges',
  'other',
]);

function toPositiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.round(parsed);
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    payload = {};
  }

  const requestedStream = String(payload.revenueStream ?? 'subscriptions') as AllowedStream;
  const revenueStream = ALLOWED_STREAMS.has(requestedStream) ? requestedStream : 'other';

  const amountCents = toPositiveInteger(payload.amountCents, 2500);
  const currency = String(payload.currency ?? 'usd').toLowerCase();
  const eventType = String(payload.eventType ?? 'checkout.session.completed');

  recordStripeEvent('webhook_verified', {
    fingerprint: `sim-${Date.now()}`,
    eventType,
    livemode: false,
    revenueStream,
    amountCents,
    currency,
    userUpgraded: true,
    payoutQueued: true,
    emailSent: true,
    simulated: true,
    source: 'admin/manual-simulation',
  });

  return NextResponse.json({
    ok: true,
    inserted: {
      kind: 'webhook_verified',
      revenueStream,
      amountCents,
      currency,
      eventType,
    },
  });
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  recordStripeEvent('webhook_verified', {
    fingerprint: `sim-${Date.now()}`,
    eventType: 'checkout.session.completed',
    livemode: false,
    revenueStream: 'subscriptions',
    amountCents: 2500,
    currency: 'usd',
    userUpgraded: true,
    payoutQueued: true,
    emailSent: true,
    simulated: true,
    source: 'admin/simulation-link',
  });

  return NextResponse.json({
    ok: true,
    inserted: {
      kind: 'webhook_verified',
      revenueStream: 'subscriptions',
      amountCents: 2500,
      currency: 'usd',
      eventType: 'checkout.session.completed',
    },
  });
}
