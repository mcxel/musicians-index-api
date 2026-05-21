import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    moduleId: 'hot-screens',
    module: 'Hot Screens',
    status: 'healthy',
    timestamp: Date.now(),
  });
}
