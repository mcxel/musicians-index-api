import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Initialize Stripe SDK
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover' as const,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { beatId, licenseType, price } = body;
    
    // Extract user session
    const sessionId = req.cookies.get("tmi_session_id")?.value;
    const buyerId = sessionId ? sessionId.substring(0, 8) : 'guest';

    if (!beatId || !licenseType || !price) {
      return NextResponse.json({ ok: false, error: 'Missing beat purchasing parameters' }, { status: 400 });
    }

    const beat = await prisma.beat.findUnique({ where: { id: beatId } });
    if (!beat) {
      return NextResponse.json({ ok: false, error: 'Beat track not found in vault' }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Beat License: ${beat.title} (${licenseType.toUpperCase()})`,
            },
            unit_amount: price, // Handled in cents (e.g., 5000 = $50.00)
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'beat',
        beatId: beat.id,
        buyerId,
        licenseType,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/beats/marketplace?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/beats/marketplace?canceled=true`,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}