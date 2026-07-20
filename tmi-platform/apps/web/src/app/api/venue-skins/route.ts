export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { VENUE_SKINS } from '@/lib/venue/venueSkinEngine';
import { listOwnedVenueSkins, hasVenueSkinAccess } from '@/lib/venue/VenueSkinCommerce';

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req);

  const skins = Object.values(VENUE_SKINS).map((skin) => ({
    id: skin.id,
    name: skin.name,
    description: skin.description,
    backgroundImage: skin.backgroundImage,
    defaultColors: skin.colorPalette,
    tags: skin.tags,
  }));

  if (!userId) {
    return NextResponse.json({ skins, ownership: {}, authenticated: false });
  }

  const owned = await listOwnedVenueSkins(userId);
  const ownership = Object.fromEntries(owned.map((o) => [o.skinId, o]));
  return NextResponse.json({ skins, ownership, authenticated: true });
}

// Save custom color overrides for an owned skin.
export async function PATCH(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json() as { skinId?: string; customColors?: Record<string, string> };
  const { skinId, customColors } = body;
  if (!skinId || !VENUE_SKINS[skinId]) return NextResponse.json({ error: 'Unknown skin' }, { status: 400 });
  if (!customColors || typeof customColors !== 'object') {
    return NextResponse.json({ error: 'customColors required' }, { status: 400 });
  }

  const access = await hasVenueSkinAccess(userId, skinId);
  if (!access.owned) return NextResponse.json({ error: 'You do not own this skin' }, { status: 403 });

  const updated = await prisma.venueSkinOwnership.upsert({
    where: { userId_skinId: { userId, skinId } },
    create: { userId, skinId, customColors, unlockedVia: access.unlockedVia ?? 'season_pass' },
    update: { customColors },
  });

  return NextResponse.json({ ok: true, customColors: updated.customColors });
}
