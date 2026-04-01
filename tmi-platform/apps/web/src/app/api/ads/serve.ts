// Serve API with basic rotation logic (mock)
import { NextResponse } from 'next/server';
import type { AdPlacement } from '@/components/placement/types';

// Mock placements for demo
const placements: Record<string, AdPlacement[]> = {
  homepage_banner: [
    { id: 'p1', title: 'Banner 1', image: '/ads/banner1.png', url: 'https://ad1.com', type: 'banner' },
    { id: 'p2', title: 'Banner 2', image: '/ads/banner2.png', url: 'https://ad2.com', type: 'banner' },
  ],
  article_sidebar: [
    { id: 'p3', title: 'Sidebar 1', image: '/ads/sidebar1.png', url: 'https://ad3.com', type: 'banner' },
  ],
};

let rotationIndex: Record<string, number> = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placement = searchParams.get('placement');
  if (!placement || !placements[placement]) {
    return NextResponse.json({ error: 'Invalid placement' }, { status: 400 });
  }
  const ads = placements[placement];
  if (!rotationIndex[placement]) rotationIndex[placement] = 0;
  const idx = rotationIndex[placement] % ads.length;
  rotationIndex[placement] = rotationIndex[placement] + 1;
  return NextResponse.json(ads[idx]);
}
