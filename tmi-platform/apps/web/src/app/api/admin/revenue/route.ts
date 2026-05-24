export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';

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

export async function GET(req: NextRequest) {
  const role = req.cookies.get('tmi_role')?.value;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ today: '$0', month: '$0', subscriptions: 0, note: 'stripe-not-configured' });
  }

  try {
    const [todayTxns, monthTxns, activeSubs] = await Promise.all([
      stripe.balanceTransactions.list({ created: { gte: startOfDayUnix() }, limit: 100, type: 'charge' }),
      stripe.balanceTransactions.list({ created: { gte: startOfMonthUnix() }, limit: 100, type: 'charge' }),
      stripe.subscriptions.list({ status: 'active', limit: 1 }),
    ]);

    const todayNet   = todayTxns.data.reduce((s, t) => s + t.net, 0);
    const monthNet   = monthTxns.data.reduce((s, t) => s + t.net, 0);

    return NextResponse.json({
      today: fmt(todayNet),
      month: fmt(monthNet),
      subscriptions: activeSubs.has_more ? '100+' : String(activeSubs.data.length),
      note: 'live',
    });
  } catch (err) {
    console.error('[admin/revenue]', err);
    return NextResponse.json({ today: 'N/A', month: 'N/A', subscriptions: 'N/A', note: 'error' });
  }
}
