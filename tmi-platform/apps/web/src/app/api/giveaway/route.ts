export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/auth/UserStore';

interface Giveaway {
  id: string;
  title: string;
  description: string;
  prize: string;
  prizeValue: number;
  sponsorId: string;
  sponsorName: string;
  endsAt: number;
  createdAt: number;
  entries: string[]; // userIds
  winnerId?: string;
  status: 'active' | 'ended' | 'cancelled';
}

const GIVEAWAYS = new Map<string, Giveaway>();
let _seq = 1;

function getUserFromRequest(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value ?? '';
  if (!email) return null;
  return getUserByEmail(email);
}

// Seed a sample active giveaway
const _seedId = 'giveaway-sample-001';
if (!GIVEAWAYS.has(_seedId)) {
  GIVEAWAYS.set(_seedId, {
    id: _seedId,
    title: 'Season 1 Diamond Pass Giveaway',
    description: 'Enter for a chance to win a 1-year Diamond membership — includes all premium rooms, unlimited beat downloads, and backstage access.',
    prize: '1-Year Diamond Membership',
    prizeValue: 9900,
    sponsorId: 'tmi-official',
    sponsorName: 'TMI Official',
    endsAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    entries: [],
    status: 'active',
  });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const user = getUserFromRequest(req);

  if (id) {
    const g = GIVEAWAYS.get(id);
    if (!g) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({
      ...g,
      entryCount: g.entries.length,
      hasEntered: user ? g.entries.includes(user.id) : false,
      entries: undefined,
    });
  }

  const active = Array.from(GIVEAWAYS.values())
    .filter(g => g.status === 'active' && g.endsAt > Date.now())
    .map(g => ({
      id: g.id, title: g.title, description: g.description, prize: g.prize,
      prizeValue: g.prizeValue, sponsorName: g.sponsorName, endsAt: g.endsAt,
      entryCount: g.entries.length,
      hasEntered: user ? g.entries.includes(user.id) : false,
      status: g.status,
    }));

  return NextResponse.json({ giveaways: active });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { action: 'enter' | 'create'; giveawayId?: string; title?: string; description?: string; prize?: string; prizeValue?: number; durationDays?: number };

  if (body.action === 'enter') {
    if (!body.giveawayId) return NextResponse.json({ error: 'giveawayId required' }, { status: 400 });
    const g = GIVEAWAYS.get(body.giveawayId);
    if (!g) return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
    if (g.status !== 'active' || g.endsAt < Date.now()) return NextResponse.json({ error: 'Giveaway ended' }, { status: 400 });
    if (g.entries.includes(user.id)) return NextResponse.json({ ok: true, alreadyEntered: true, entryCount: g.entries.length });
    g.entries.push(user.id);
    return NextResponse.json({ ok: true, alreadyEntered: false, entryCount: g.entries.length });
  }

  if (body.action === 'create') {
    if (!body.title || !body.prize) return NextResponse.json({ error: 'title and prize required' }, { status: 400 });
    const id = `giveaway-${Date.now()}-${_seq++}`;
    const g: Giveaway = {
      id, title: body.title, description: body.description ?? '',
      prize: body.prize, prizeValue: body.prizeValue ?? 0,
      sponsorId: user.id, sponsorName: user.displayName,
      endsAt: Date.now() + (body.durationDays ?? 7) * 24 * 60 * 60 * 1000,
      createdAt: Date.now(), entries: [], status: 'active',
    };
    GIVEAWAYS.set(id, g);
    return NextResponse.json({ ok: true, giveawayId: id });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
