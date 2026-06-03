export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { POST as stripeWebhookPost } from '@/app/api/stripe/webhook/route';

// Alias route so Stripe can target either:
// - /api/stripe/webhook
// - /api/webhooks/stripe
export async function POST(req: NextRequest) {
  return stripeWebhookPost(req);
}
