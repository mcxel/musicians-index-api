export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRecentEvents, getSummary } from '@/lib/stripe/stripe-telemetry-store';
import { getStripeIncidentStatus } from '@/lib/stripe/stripe-incident-engine';

function stripeModeFromKey(key: string | undefined): 'test' | 'live' | 'not_configured' | 'unknown' {
  if (!key) return 'not_configured';
  if (key.startsWith('sk_test_')) return 'test';
  if (key.startsWith('sk_live_')) return 'live';
  return 'unknown';
}

function isAdminOrStaff(role: string): boolean {
  const v = role.toUpperCase();
  return v === 'ADMIN' || v === 'STAFF';
}

export async function GET(req: NextRequest) {
  const role = req.cookies.get('tmi_role')?.value ?? '';
  if (!isAdminOrStaff(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const mode = stripeModeFromKey(process.env.STRIPE_SECRET_KEY);
  const webhookSecretConfigured = Boolean(process.env.STRIPE_WEBHOOK_SECRET);

  const recentEvents = getRecentEvents(120);
  const summary = getSummary();
  const incidents = getStripeIncidentStatus();

  const verified = recentEvents.filter((e) => e.kind === 'webhook_verified');
  const successCount = verified.length;

  const failedCount =
    (summary.byCategory.verification ?? 0) +
    (summary.byCategory.malformed ?? 0) +
    (summary.byCategory.upstream ?? 0) +
    (summary.byCategory.timeout ?? 0);

  const retryCount =
    (summary.byCategory.duplicate ?? 0) +
    (summary.byCategory.replay ?? 0);

  const seenEventTypes = new Set<string>(
    verified
      .map((e) => String(e.meta.eventType ?? ''))
      .filter(Boolean),
  );

  const lastVerified = verified[0] ?? null;

  return NextResponse.json({
    stripeMode: mode,
    webhookSecretConfigured,
    webhookConnected: webhookSecretConfigured,
    lastEventTs: summary.lastEventTs,
    lastVerifiedEvent: lastVerified
      ? {
          ts: lastVerified.ts,
          eventType: lastVerified.meta.eventType ?? null,
          livemode: lastVerified.meta.livemode ?? null,
        }
      : null,
    eventHealth: {
      checkoutSessionCompleted: seenEventTypes.has('checkout.session.completed'),
      invoicePaymentSucceeded: seenEventTypes.has('invoice.payment_succeeded'),
      paymentIntentSucceeded: seenEventTypes.has('payment_intent.succeeded'),
      customerSubscriptionCreated: seenEventTypes.has('customer.subscription.created'),
    },
    deliveryHealth: {
      ok200Count: successCount,
      failedDeliveries: failedCount,
      retryCount,
    },
    pipelineStatus: {
      userUpgraded: Boolean(lastVerified?.meta.userUpgraded),
      payoutQueued: Boolean(lastVerified?.meta.payoutQueued),
      emailSent: Boolean(lastVerified?.meta.emailSent),
    },
    incidentStatus: {
      payoutQueuePaused: incidents.payoutQueuePaused,
      payoutQueuePausedAt: incidents.payoutQueuePausedAt,
      payoutQueuePauseReason: incidents.payoutQueuePauseReason,
      recentIncidents: incidents.recentIncidents,
      recentResumeAudits: incidents.recentResumeAudits,
    },
    recentEvents: recentEvents.slice(0, 5).map((e) => ({
      ts: e.ts,
      kind: e.kind,
      category: e.category,
      meta: e.meta,
    })),
    webhookUrlOptions: [
      '/api/stripe/webhook',
      '/api/webhooks/stripe (deprecated alias)',
    ],
  });
}
