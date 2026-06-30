/**
 * GET /api/debug/runtime-certify
 *
 * Runs the Runtime Certification Suite
 * and returns a technical report with pass/fail status.
 *
 * Level 1 Certification: Technical correctness only
 */

import { NextResponse } from 'next/server';
import { runtimeCertificationSuite } from '@/lib/live/RuntimeCertificationSuite';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const report = await runtimeCertificationSuite.runAllTests();
    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Runtime certification failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
