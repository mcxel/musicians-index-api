import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json([
    { id: 'sp-RUBY',   name: 'RUBY Package',   price: 499,  perks: ['Logo on contest page', '1 sponsored slot'] },
    { id: 'sp-silver',   name: 'Silver Package',   price: 999,  perks: ['Banner placement', '3 sponsored slots', 'Email blast'] },
    { id: 'sp-gold',     name: 'Gold Package',     price: 2499, perks: ['Headline sponsor', '10 sponsored slots', 'Live shoutout', 'Billboard takeover'] },
    { id: 'sp-platinum', name: 'Platinum Package', price: 4999, perks: ['Title sponsor', 'Unlimited slots', 'Custom activation', 'Dedicated page'] },
  ]);
}
