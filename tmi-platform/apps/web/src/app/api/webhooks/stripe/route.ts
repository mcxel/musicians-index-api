import { NextRequest } from 'next/server';
import { POST as stripeWebhookPost, GET as stripeWebhookGet } from '@/app/api/stripe/webhook/route';

export const dynamic = 'force-dynamic';

// Alias route so Stripe can target either:
// - /api/stripe/webhook
// - /api/webhooks/stripe
export async function GET() {
  return stripeWebhookGet();
}

export async function POST(req: NextRequest) {
  return stripeWebhookPost(req as any);
}
