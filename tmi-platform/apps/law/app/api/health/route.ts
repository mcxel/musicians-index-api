import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    moduleId: 'law',
    module: 'Danika Law',
    status: 'healthy',
    timestamp: Date.now(),
  });
}
