/**
 * /api/giveaway/sponsor — Sponsor giveaway management
 * GET                   — list sponsor's giveaways
 * POST { action: 'create', ...params }    — create new giveaway
 * POST { action: 'open', giveawayId }     — open for entries
 * POST { action: 'close', giveawayId }    — close entries
 * POST { action: 'pick', giveawayId, count } — pick winners
 */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { sponsorGiveawayEngine } from '@/lib/giveaway/SponsorGiveawayEngine';
import type { GiveawayPrize } from '@/lib/giveaway/SponsorGiveawayEngine';

function getSponsorId(req: NextRequest): string | null {
  const email = req.cookies.get('tmi_user_email')?.value ?? '';
  const role  = req.cookies.get('tmi_role')?.value ?? '';
  if (!email) return null;
  const allowedRoles = ['sponsor', 'admin', 'superadmin', 'owner'];
  if (!allowedRoles.includes(role.toLowerCase())) return null;
  return email;
}

export async function GET(req: NextRequest) {
  const sponsorId = getSponsorId(req);
  if (!sponsorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const all = sponsorGiveawayEngine.getActiveGiveaways().filter(g => g.sponsorId === sponsorId);
  return NextResponse.json({ giveaways: all });
}

export async function POST(req: NextRequest) {
  const sponsorId = getSponsorId(req);
  if (!sponsorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const { action } = body;

  if (action === 'create') {
    const { title, description, prizes, maxEntries, sponsorName } = body;
    if (!title || !prizes || !Array.isArray(prizes) || prizes.length === 0) {
      return NextResponse.json({ error: 'title and prizes[] required' }, { status: 400 });
    }
    const giveaway = sponsorGiveawayEngine.createGiveaway({
      sponsorId,
      sponsorName: (sponsorName as string) || sponsorId,
      title: title as string,
      description: (description as string) || '',
      prizes: prizes as GiveawayPrize[],
      maxEntries: typeof maxEntries === 'number' ? maxEntries : 10000,
    });
    return NextResponse.json({ ok: true, giveaway });
  }

  if (action === 'open') {
    const { giveawayId } = body;
    if (!giveawayId) return NextResponse.json({ error: 'giveawayId required' }, { status: 400 });
    sponsorGiveawayEngine.open(giveawayId as string);
    return NextResponse.json({ ok: true, giveawayId });
  }

  if (action === 'close') {
    const { giveawayId } = body;
    if (!giveawayId) return NextResponse.json({ error: 'giveawayId required' }, { status: 400 });
    sponsorGiveawayEngine.close(giveawayId as string);
    return NextResponse.json({ ok: true, giveawayId });
  }

  if (action === 'pick') {
    const { giveawayId, count } = body;
    if (!giveawayId) return NextResponse.json({ error: 'giveawayId required' }, { status: 400 });
    const winners = sponsorGiveawayEngine.pickWinners(
      giveawayId as string,
      typeof count === 'number' ? count : 1,
    );
    return NextResponse.json({ ok: true, giveawayId, winners });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
