import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Initialize Stripe with the locked API version for TMI stability
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function GET() {
  return NextResponse.json({ status: 'Stripe Webhook Endpoint Active' }, { status: 200 });
}

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

  let event;

  try {
    // Validate the event using the Stripe SDK to prevent spoofed revenue data
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error(`[STRIPE_ERR] Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Process the verified event for the TMI Economy Stack
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extract TMI-specific metadata (e.g., ticket purchase, beat lease, performer tip)
      const metadata = session.metadata || {};
      console.log(`[STRIPE_SUCCESS] Payment completed for session: ${session.id}`, metadata);
      
      // TODO: Connect to Prisma DB to update Admin Revenue Command Center
      // Example: 
      // if (metadata.type === 'TIP') await recordTip(metadata.artistId, session.amount_total);
      // if (metadata.type === 'TICKET') await issueTicketNFT(metadata.eventId, session.customer_email);
      
      break;
    }
    
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`[STRIPE_SUBSCRIPTION] Tier upgraded for customer: ${subscription.customer}`);
      break;
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true, status: 'Active' }, { status: 200 });
}