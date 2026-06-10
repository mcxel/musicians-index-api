export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { getRecentEvents } from '@/lib/stripe/stripe-telemetry-store';

function fmt(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function startOfDayUnix(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function startOfMonthUnix(): number {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function startOfDayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfMonthMs(): number {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return (
    normalized.endsWith('_xxx') ||
    normalized.includes('replace_me') ||
    normalized.includes('your_')
  );
}

type RevenueStreams = Record<string, { todayCents: number; monthCents: number; countToday: number; countMonth: number }>;

function makeEmptyStreams(): RevenueStreams {
  return {
    subscriptions: { todayCents: 0, monthCents: 0, countToday: 0, countMonth: 0 },
    founding_packs: { todayCents: 0, monthCents: 0, countToday: 0, countMonth: 0 },
    sponsors: { todayCents: 0, monthCents: 0, countToday: 0, countMonth: 0 },
    one_time: { todayCents: 0, monthCents: 0, countToday: 0, countMonth: 0 },
    payments: { todayCents: 0, monthCents: 0, countToday: 0, countMonth: 0 },
    charges: { todayCents: 0, monthCents: 0, countToday: 0, countMonth: 0 },
    other: { todayCents: 0, monthCents: 0, countToday: 0, countMonth: 0 },
  };
}

function aggregateWebhookRevenue(): { streams: RevenueStreams; totalTodayCents: number; totalMonthCents: number; verifiedEventsToday: number } {
  const streams = makeEmptyStreams();
  const dayStart = startOfDayMs();
  const monthStart = startOfMonthMs();

  let totalTodayCents = 0;
  let totalMonthCents = 0;
  let verifiedEventsToday = 0;

  const events = getRecentEvents(500);
  for (const event of events) {
    if (event.kind !== 'webhook_verified') continue;
    const amount = Number(event.meta.amountCents ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) continue;

    const rawStream = String(event.meta.revenueStream ?? 'other');
    const stream = streams[rawStream] ? rawStream : 'other';

    if (event.ts >= monthStart) {
      streams[stream].monthCents += amount;
      streams[stream].countMonth += 1;
      totalMonthCents += amount;
    }

    if (event.ts >= dayStart) {
      streams[stream].todayCents += amount;
      streams[stream].countToday += 1;
      totalTodayCents += amount;
      verifiedEventsToday += 1;
    }
  }

  return { streams, totalTodayCents, totalMonthCents, verifiedEventsToday };
}

export async function GET(req: NextRequest) {
  const role = req.cookies.get('tmi_role')?.value?.toUpperCase() ?? '';
  const email = req.cookies.get('tmi_email')?.value ?? '';
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? 'berntmusic33@gmail.com,bigace@berntoutglobal.com').split(',');
  const authorized = ['ADMIN', 'SUPERADMIN', 'OWNER'].includes(role) || ADMIN_EMAILS.includes(email);
  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const telemetry = aggregateWebhookRevenue();

  const config = {
    secretConfigured: !isPlaceholder(process.env.STRIPE_SECRET_KEY),
    publishableConfigured: !isPlaceholder(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    webhookConfigured: !isPlaceholder(process.env.STRIPE_WEBHOOK_SECRET),
  };

  const allConfigured = config.secretConfigured && config.publishableConfigured && config.webhookConfigured;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({
      mode: 'not_configured',
      note: allConfigured ? 'stripe-client-unavailable' : 'stripe-config-missing-or-placeholder',
      totals: {
        today: '$0',
        month: '$0',
        todayCents: 0,
        monthCents: 0,
      },
      subscriptions: {
        active: 0,
      },
      streams: telemetry.streams,
      telemetry: {
        verifiedEventsToday: telemetry.verifiedEventsToday,
      },
      config,
    });
  }

  try {
    const [todayTxns, monthTxns, activeSubs] = await Promise.all([
      stripe.balanceTransactions.list({ created: { gte: startOfDayUnix() }, limit: 100, type: 'charge' }),
      stripe.balanceTransactions.list({ created: { gte: startOfMonthUnix() }, limit: 100, type: 'charge' }),
      stripe.subscriptions.list({ status: 'active', limit: 100 }),
    ]);

    const todayNet = todayTxns.data.reduce((s, t) => s + t.net, 0);
    const monthNet = monthTxns.data.reduce((s, t) => s + t.net, 0);

    return NextResponse.json({
      mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test',
      note: allConfigured ? 'live' : 'live-with-config-warnings',
      totals: {
        today: fmt(todayNet),
        month: fmt(monthNet),
        todayCents: todayNet,
        monthCents: monthNet,
      },
      subscriptions: {
        active: activeSubs.has_more ? '100+' : activeSubs.data.length,
      },
      streams: telemetry.streams,
      telemetry: {
        verifiedEventsToday: telemetry.verifiedEventsToday,
      },
      config,
    });
  } catch (err) {
    console.error('[admin/revenue]', err);
    return NextResponse.json({
      mode: 'error',
      note: 'error',
      totals: {
        today: 'N/A',
        month: 'N/A',
        todayCents: 0,
        monthCents: 0,
      },
      subscriptions: {
        active: 'N/A',
      },
      streams: telemetry.streams,
      telemetry: {
        verifiedEventsToday: telemetry.verifiedEventsToday,
      },
      config,
    });
  }
}
