import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    moduleId: 'need-a-charge',
    module: 'Need A Charge',
    status: 'healthy',
    timestamp: Date.now(),
  });
}
