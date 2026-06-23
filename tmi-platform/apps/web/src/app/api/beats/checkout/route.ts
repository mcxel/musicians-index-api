import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { beatId, licenseType, price } = body;

    // Resolve buyer from the authenticated user cookie (email → DB user)
    const fanEmail = req.cookies.get('tmi_user_email')?.value ?? '';
    const buyerUser = fanEmail
      ? await prisma.user.findFirst({ where: { email: fanEmail.toLowerCase() } })
      : null;
    const buyerId = buyerUser?.id ?? 'guest';

    if (!beatId || !licenseType || !price) {
      return NextResponse.json({ ok: false, error: 'Missing beat purchasing parameters' }, { status: 400 });
    }

    const beat = await prisma.beat.findUnique({ where: { id: beatId } });
    if (!beat) {
      return NextResponse.json({ ok: false, error: 'Beat track not found in vault' }, { status: 404 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ ok: false, error: 'Payments not configured' }, { status: 503 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3001';

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
            unit_amount: price, // in cents (e.g., 5000 = $50.00)
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
      success_url: `${appUrl}/beats/marketplace?success=true`,
      cancel_url: `${appUrl}/beats/marketplace?canceled=true`,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Stripe Beat Checkout Error:', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}