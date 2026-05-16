import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    moduleId: 'web',
    module: 'The Musicians Index',
    status: 'healthy',
    timestamp: Date.now(),
  });
}
