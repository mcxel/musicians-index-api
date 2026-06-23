export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { validateTicket } from '@/lib/tickets/ticketEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ticketId = typeof body?.ticketId === 'string' ? body.ticketId.trim() : '';
    if (!ticketId) {
      return NextResponse.json({ ok: false, error: 'ticketId_required' }, { status: 400 });
    }
    const result = validateTicket(ticketId);
    return NextResponse.json({ ok: true, ...result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'validation_error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}