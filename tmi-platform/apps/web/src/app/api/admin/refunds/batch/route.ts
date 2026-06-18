import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStripe } from '@/lib/stripe/client';

type BatchRow = {
  id: string;
  chargeId?: string;
  amountCents: number;
};

export async function POST(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  if (!user || (user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json() as { rows: BatchRow[] };
  const rows = body.rows ?? [];
  if (!rows.length) return NextResponse.json({ results: [] });

  const stripe = getStripe();

  const results = await Promise.all(
    rows.map(async (row) => {
      if (!row.chargeId || row.chargeId.startsWith('rf_demo')) {
        return { id: row.id, status: 'SUCCEEDED', note: 'demo-passthrough' };
      }
      if (!stripe) {
        return { id: row.id, status: 'FAILED', note: 'Stripe not configured' };
      }
      try {
        const refund = await stripe.refunds.create({
          charge: row.chargeId,
          amount: row.amountCents,
          metadata: { tmi_batch_id: row.id },
        });
        return {
          id: row.id,
          status: refund.status === 'succeeded' ? 'SUCCEEDED' : 'PROCESSING',
          stripeRefundId: refund.id,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Stripe error';
        return { id: row.id, status: 'FAILED', note: msg };
      }
    })
  );

  return NextResponse.json({ results });
}
