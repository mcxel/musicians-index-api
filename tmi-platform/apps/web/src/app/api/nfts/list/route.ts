export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { NFTMintEngine } from '@/lib/nft/NFTMintEngine';

const engine = new NFTMintEngine();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get('ownerId');
  if (!ownerId) {
    return NextResponse.json({ ok: false, error: 'ownerId required' }, { status: 400 });
  }
  const nfts = engine.getNFTsForOwner(ownerId);
  return NextResponse.json({ ok: true, nfts });
}
