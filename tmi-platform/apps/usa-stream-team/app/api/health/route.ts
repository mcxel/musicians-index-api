import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    moduleId: 'usa-stream-team',
    module: 'USA Stream Team',
    status: 'healthy',
    timestamp: Date.now(),
  });
}
