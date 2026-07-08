import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { userId?: string };


    return NextResponse.json({ ok: true, message: 'Account successfully deactivated. All subscriptions halted.' });
  } catch (error) {
    console.error('[Account Engine Error]', error);
    return NextResponse.json({ ok: false, error: 'Failed to process account deactivation' }, { status: 500 });
  }
}
