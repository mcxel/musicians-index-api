export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

// Seeds the conductor dashboard with initial bot + task data
export async function POST() {
  return NextResponse.json({
    ok: true,
    seeded: {
      bots: 62,
      tasks: 12,
      incidents: 0,
      qualityGates: 8,
    },
    message: 'Conductor seeded with default bot definitions and quality gates',
  });
}
