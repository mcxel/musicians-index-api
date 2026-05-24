export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { sendEmail } from '@/lib/email/TMIEmailSystem';

const seen = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { sessionId: string; type?: string };
    const { sessionId, type = 'generic' } = body;

    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

    if (seen.has(sessionId)) return NextResponse.json({ sent: false, reason: 'already-sent' });
    seen.add(sessionId);
    setTimeout(() => seen.delete(sessionId), 24 * 60 * 60 * 1000);

    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ sent: false, reason: 'stripe-not-configured' });

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['customer', 'line_items'] });

    const email = typeof session.customer === 'object' && session.customer !== null
      ? (session.customer as { email?: string }).email
      : session.customer_email;

    if (!email) return NextResponse.json({ sent: false, reason: 'no-email' });

    const amountUsd = ((session.amount_total ?? 0) / 100).toFixed(2);
    const item = session.line_items?.data[0];
    const itemName = item?.description ?? 'TMI Purchase';
    const code = sessionId.slice(-8).toUpperCase();
    const seatInfo = (session.metadata?.seats ?? 'General Admission') as string;

    if (type === 'ticket') {
      await sendEmail({
        to: email,
        type: 'ticket_confirmation',
        data: {
          eventName: itemName,
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          venue: 'The Musician\'s Index',
          seat: seatInfo,
          confirmationCode: code,
          ticketId: sessionId,
        },
      });
    } else if (type === 'subscription') {
      await sendEmail({
        to: email,
        type: 'subscription_start',
        data: { plan: itemName },
      });
    } else {
      // NFT, beat, or generic — use nft_receipt
      await sendEmail({
        to: email,
        type: 'nft_receipt',
        data: {
          tokenName: itemName,
          tokenId: code,
          creatorName: 'TMI',
          edition: '1/1',
          priceUsd: amountUsd,
          priceCredits: 0,
        },
      });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error('[email/purchase-confirm]', err);
    return NextResponse.json({ sent: false, reason: 'error' }, { status: 500 });
  }
}
