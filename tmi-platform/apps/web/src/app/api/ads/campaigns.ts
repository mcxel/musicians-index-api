// Mock campaigns API (in-memory)
import { NextResponse } from 'next/server';
import type { Campaign } from '@/components/ads/types';

let campaigns: Campaign[] = [
  {
    id: 'c1',
    advertiserId: 'a1',
    name: 'Spring Launch',
    budget: 10000,
    dailyBudget: 500,
    startDate: '2026-03-01',
    endDate: '2026-04-30',
    placements: ['homepage_banner', 'article_sidebar'],
    status: 'active',
    impressions: 12000,
    clicks: 320,
    ctr: 2.67,
    spend: 8000,
  },
];

export async function GET() {
  return NextResponse.json(campaigns);
}
