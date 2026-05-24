import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    moduleId: 'mini-ace',
    module: 'Mini Ace',
    status: 'healthy',
    timestamp: Date.now(),
  });
}
