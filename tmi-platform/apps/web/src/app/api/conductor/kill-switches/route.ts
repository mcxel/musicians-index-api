export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const SWITCHES = [
  { key: 'checkout',      label: 'Checkout / Payments',   enabled: true,  description: 'Stripe checkout sessions and payment processing' },
  { key: 'rewards',       label: 'Reward Engine',         enabled: true,  description: 'Prize drops, giveaways, and claim processing' },
  { key: 'wallet',        label: 'Wallet & Credits',      enabled: true,  description: 'Credit purchases, transfers, and spending' },
  { key: 'tickets',       label: 'Ticket Sales',          enabled: true,  description: 'Event ticket sales and QR code generation' },
  { key: 'passes',        label: 'Season Passes',         enabled: true,  description: 'Season pass subscriptions via Stripe' },
  { key: 'subscriptions', label: 'Subscriptions',         enabled: true,  description: 'All recurring subscription management' },
  { key: 'store',         label: 'Avatar Store',          enabled: true,  description: 'Avatar item purchases via Stripe checkout' },
  { key: 'payout',        label: 'Payouts',               enabled: true,  description: 'Artist and creator payout processing' },
  { key: 'live-rooms',    label: 'Live Rooms',            enabled: true,  description: 'Room creation and joining' },
  { key: 'bots',          label: 'Bot System',            enabled: true,  description: 'All 62 platform automation bots' },
  { key: 'email',         label: 'Transactional Email',   enabled: true,  description: 'All outbound email via Resend' },
  { key: 'nft-mint',      label: 'NFT Minting',           enabled: true,  description: 'New NFT creation and minting' },
];

const switches = SWITCHES.map(s => ({ ...s }));

export async function GET() {
  return NextResponse.json({ switches, enabledCount: switches.filter(s => s.enabled).length });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json() as { key?: string; enabled?: boolean };
  const sw = switches.find(s => s.key === body.key);
  if (!sw) return NextResponse.json({ error: 'Switch not found' }, { status: 404 });
  if (typeof body.enabled !== 'boolean') return NextResponse.json({ error: 'enabled must be boolean' }, { status: 400 });
  sw.enabled = body.enabled;
  return NextResponse.json({ ok: true, switch: sw });
}
