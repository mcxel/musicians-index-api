// Mock API route for ad placements (per belt)
import { NextResponse } from 'next/server';

// Mock placement data
const placements = {
  A: [
    { id: 'a1', title: 'Sponsor Alpha', image: '/sponsors/alpha.png', url: 'https://sponsor-alpha.com', type: 'banner' },
    { id: 'a2', title: 'Advertiser Beta', image: '/ads/beta.png', url: 'https://advertiser-beta.com', type: 'video' },
  ],
  B: [
    { id: 'b1', title: 'Sponsor Gamma', image: '/sponsors/gamma.png', url: 'https://sponsor-gamma.com', type: 'banner' },
  ],
  C: [],
  D: [
    { id: 'd1', title: 'Advertiser Delta', image: '/ads/delta.png', url: 'https://advertiser-delta.com', type: 'banner' },
  ],
  E: [
    { id: 'e1', title: 'Sponsor Epsilon', image: '/sponsors/epsilon.png', url: 'https://sponsor-epsilon.com', type: 'banner' },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const belt = searchParams.get('belt');
  if (belt && placements[belt as keyof typeof placements]) {
    return NextResponse.json(placements[belt as keyof typeof placements]);
  }
  return NextResponse.json(placements);
}
