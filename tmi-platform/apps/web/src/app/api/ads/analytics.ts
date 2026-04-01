// Mock analytics API (in-memory)
import { NextResponse } from 'next/server';
import type { PlacementAnalytics } from '@/components/ads/types';

let analytics: PlacementAnalytics[] = [
  {
    placementId: 'homepage_banner',
    impressions: 5000,
    clicks: 120,
    ctr: 2.4,
    revenue: 200,
    lastUpdated: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(analytics);
}
