import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    moduleId: 'thunderworld',
    module: 'ThunderWorld',
    status: 'healthy',
    timestamp: Date.now(),
  });
}
