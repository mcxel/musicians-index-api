/**
 * GET /api/sponsor/profile — fetch sponsor's campaign stats and activities
 * Real implementation: queries Prisma for sponsor's campaigns, giveaways, partners
 * Launch version: returns honest empty state per Rule 20 (No Fake Data)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function resolveSponsorId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    }).catch(() => null);
    if (user?.id && user.role === 'SPONSOR') return user.id;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const sponsorId = await resolveSponsorId(req);

  if (!sponsorId) {
    return NextResponse.json({
      stats: [],
      campaigns: [],
      giveaways: [],
      partners: [],
      authenticated: false,
    });
  }

  // TODO: Replace with real queries once sponsorship schema is finalized
  // For now, return honest empty state (Rule 20)
  return NextResponse.json({
    stats: [
      { label: 'Active Campaigns', value: '0', color: '#FFD700', icon: '🎯' },
      { label: 'Total Impressions', value: '0', color: '#00FFFF', icon: '👁️' },
      { label: 'Artists Backed', value: '0', color: '#AA2DFF', icon: '🎤' },
      { label: 'Budget Deployed', value: '$0', color: '#FF2DAA', icon: '💰' },
      { label: 'Avg Engagement', value: '—', color: '#00FF88', icon: '📈' },
      { label: 'ROI', value: '—', color: '#FFD700', icon: '🏆' },
    ],
    campaigns: [],
    giveaways: [],
    partners: [],
    authenticated: true,
    sponsorId,
    message: 'No active campaigns yet. Create your first campaign to get started.',
  });
}
