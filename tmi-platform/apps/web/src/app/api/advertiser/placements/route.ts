/**
 * GET /api/advertiser/placements — real campaign performance for the logged-in advertiser.
 * Reads AdCampaign/AdImpression/AdClick (Prisma) — never mock data (Rule 20).
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function resolveAdvertiserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (email) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } }).catch(() => null);
    if (user?.id) return user.id;
  }
  return req.cookies.get('tmi_session_id')?.value ?? null;
}

function mapStatus(status: string): 'live' | 'paused' | 'ended' | 'pending' {
  if (status === 'live') return 'live';
  if (status === 'paused') return 'paused';
  if (status === 'completed' || status === 'rejected') return 'ended';
  return 'pending'; // draft | pending_review | approved
}

export async function GET(req: NextRequest) {
  const advertiserId = await resolveAdvertiserId(req);
  if (!advertiserId) {
    return NextResponse.json({ placements: [], authenticated: false });
  }

  const campaigns = await prisma.adCampaign.findMany({
    where: { advertiserId },
    include: {
      creative: { select: { name: true } },
      _count: { select: { impressions: true, clicks: true } },
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  const placements = campaigns.map((c) => {
    const impressions = c._count.impressions;
    const clicks = c._count.clicks;
    return {
      id: c.id,
      name: c.name,
      location: c.slot,
      status: mapStatus(c.status),
      impressions,
      clicks,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      budgetCents: c.budgetCents,
      spentCents: c.spentCents,
    };
  });

  return NextResponse.json({ placements, authenticated: true });
}
