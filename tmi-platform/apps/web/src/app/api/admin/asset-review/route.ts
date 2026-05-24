export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

type AssetStatus = 'PENDING' | 'FLAGGED' | 'REVIEW' | 'APPROVED' | 'REJECTED';
type Asset = { id: string; creator: string; asset: string; type: string; source: string; flags: number; status: AssetStatus; size: string };

const QUEUE: Asset[] = [
  { id: "ar1", creator: "BotBeats AI", asset: "Lo-Fi Groove Pack Vol.3", type: "BEAT", source: "BOT_GENERATED", flags: 0, status: "PENDING", size: "14.2MB" },
  { id: "ar2", creator: "Vault Bot", asset: "Trap Kit 808 Collection", type: "BEAT", source: "BOT_GENERATED", flags: 1, status: "FLAGGED", size: "22.8MB" },
  { id: "ar3", creator: "MerchBot v2", asset: "TMI Logo Hoodie — Black", type: "MERCH", source: "BOT_GENERATED", flags: 0, status: "PENDING", size: "N/A" },
  { id: "ar4", creator: "NFT Engine", asset: "Cyber Genesis NFT #018", type: "NFT", source: "BOT_GENERATED", flags: 2, status: "REVIEW", size: "3.1MB" },
  { id: "ar5", creator: "Wavetek", asset: "Midnight Bars (Exclusive)", type: "BEAT", source: "CREATOR_UPLOAD", flags: 0, status: "APPROVED", size: "8.4MB" },
  { id: "ar6", creator: "FlowBot", asset: "Cypher Instrumental Set", type: "INSTRUMENTAL", source: "BOT_GENERATED", flags: 0, status: "PENDING", size: "31.0MB" },
];

export async function GET() {
  return NextResponse.json(QUEUE);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { id?: string; action?: string };
  if (!body.id || !body.action) return NextResponse.json({ error: 'id and action required' }, { status: 400 });
  const item = QUEUE.find(a => a.id === body.id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  item.status = body.action === 'approve' ? 'APPROVED' : 'REJECTED';
  return NextResponse.json({ ok: true, item });
}
