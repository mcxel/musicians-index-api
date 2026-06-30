/**
 * GET /api/debug/integration-certify
 *
 * Runs the Integration Certification Suite
 * Verifies that GO LIVE → Live Registry → Homepage → Discovery → ... → Venue
 *
 * Level 2 Certification: Signal flow across all systems
 */

import { NextResponse } from 'next/server';
import { integrationCertificationSuite } from '@/lib/live/IntegrationCertificationSuite';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const report = await integrationCertificationSuite.runAllTests();
    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Integration certification failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
