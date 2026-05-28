import { NextRequest, NextResponse } from 'next/server';
import { NFTMintEngine, type MintRequest } from '@/lib/nft/NFTMintEngine';

const engine = new NFTMintEngine();

export async function POST(req: NextRequest) {
  let body: Partial<MintRequest> & { userId?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  const { type, name, ownerId, metadata, transferable, venueRedeemable } = body;
  if (!type || !name || !ownerId || !metadata) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 422 });
  }

  const nft = engine.mint({ type, name, ownerId, metadata, transferable, venueRedeemable });
  return NextResponse.json({ ok: true, nft });
}
