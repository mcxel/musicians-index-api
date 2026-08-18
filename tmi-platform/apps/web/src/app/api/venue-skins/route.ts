export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { VENUE_SKINS } from '@/lib/venue/venueSkinEngine';
import { listOwnedVenueSkins, hasVenueSkinAccess } from '@/lib/venue/VenueSkinCommerce';
import { resolveTierFromDb } from '@/lib/auth/resolveAuthoritativeTier';
import { resolveBaseVenueSkin } from '@/lib/venues/TierBaseVenueSkin';

async function resolveUser(req: NextRequest): Promise<{ id: string; email: string; tier: string | null } | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, tier: true } });
  if (!user) return null;
  return { id: user.id, email: user.email ?? email, tier: user.tier };
}

export async function GET(req: NextRequest) {
  const skins = Object.values(VENUE_SKINS).map((skin) => ({
    id: skin.id,
    name: skin.name,
    description: skin.description,
    backgroundImage: skin.backgroundImage,
    defaultColors: skin.colorPalette,
    tags: skin.tags,
  }));

  const user = await resolveUser(req);
  if (!user) {
    return NextResponse.json({
      skins,
      ownership: {},
      authenticated: false,
      accountTier: 'FREE',
      baseSkin: resolveBaseVenueSkin('FREE'),
    });
  }

  const accountTier = resolveTierFromDb(user.email, user.tier);
  const owned = await listOwnedVenueSkins(user.id);
  const ownership = Object.fromEntries(owned.map((o) => [o.skinId, o]));
  return NextResponse.json({
    skins,
    ownership,
    authenticated: true,
    accountTier,
    baseSkin: resolveBaseVenueSkin(accountTier),
  });
}

export async function PATCH(req: NextRequest) {
  const user = await resolveUser(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json() as { skinId?: string; customColors?: Record<string, string> };
  const { skinId, customColors } = body;
  if (!skinId || !VENUE_SKINS[skinId]) return NextResponse.json({ error: 'Unknown skin' }, { status: 400 });
  if (!customColors || typeof customColors !== 'object') {
    return NextResponse.json({ error: 'customColors required' }, { status: 400 });
  }

  const access = await hasVenueSkinAccess(user.id, skinId);
  if (!access.owned) return NextResponse.json({ error: 'You do not own this skin' }, { status: 403 });
  if (access.unlockedVia === 'tier_base') {
    return NextResponse.json({ error: 'Tier base skins are not recolored here. Equip a purchased skin.' }, { status: 403 });
  }

  const updated = await prisma.venueSkinOwnership.upsert({
    where: { userId_skinId: { userId: user.id, skinId } },
    create: {
      userId: user.id,
      skinId,
      customColors,
      unlockedVia: access.unlockedVia === 'purchase' ? 'purchase' : 'season_pass',
    },
    update: { customColors },
  });

  return NextResponse.json({ ok: true, customColors: updated.customColors });
}
