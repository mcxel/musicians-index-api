import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    moduleId: 'bernoutglobal-llc',
    module: 'BerntoutGlobal LLC',
    status: 'healthy',
    timestamp: Date.now(),
  });
}
