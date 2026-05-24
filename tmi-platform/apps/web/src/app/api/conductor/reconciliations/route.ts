export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const ITEMS = [
  { id: 'rec-001', subsystem: 'payments', check: 'Stripe balance vs. platform wallet', status: 'PASS', delta: '$0.00', runAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: 'rec-002', subsystem: 'tickets',  check: 'Issued tickets vs. confirmed purchases', status: 'PASS', delta: '0 tickets', runAt: new Date(Date.now() - 35 * 60 * 1000).toISOString() },
  { id: 'rec-003', subsystem: 'nft',      check: 'Minted NFTs vs. on-chain registry', status: 'PASS', delta: '0 tokens', runAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  { id: 'rec-004', subsystem: 'credits',  check: 'Wallet credits issued vs. redeemed', status: 'PASS', delta: '+12,400 credits', runAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
  { id: 'rec-005', subsystem: 'payouts',  check: 'Pending payouts vs. approved payouts', status: 'WARN', delta: '$1,750 pending approval', runAt: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
];

export async function GET() {
  return NextResponse.json({ items: ITEMS, lastRun: new Date().toISOString(), passCount: ITEMS.filter(i => i.status === 'PASS').length, warnCount: ITEMS.filter(i => i.status === 'WARN').length });
}
