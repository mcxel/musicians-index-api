import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    moduleId: 'xxl',
    module: 'BerntoutGlobal XXL',
    status: 'healthy',
    timestamp: Date.now(),
  });
}
