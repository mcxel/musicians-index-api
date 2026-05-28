export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { POST as stripeWebhookPost, GET as stripeWebhookGet } from '@/app/api/stripe/webhook/route';

// Alias route so Stripe can target either:
// - /api/stripe/webhook
// - /api/webhooks/stripe
export async function POST(req: NextRequest) {
  return stripeWebhookPost(req);
}

export async function GET() {
  const res = await stripeWebhookGet();
  if (res instanceof NextResponse) return res;
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
