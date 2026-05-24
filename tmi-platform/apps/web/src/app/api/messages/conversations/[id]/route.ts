export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

type Msg = { id: string; from: string; text: string; mine: boolean; ts: number };
const threadStore = new Map<string, Msg[]>();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return NextResponse.json({ messages: threadStore.get(params.id) ?? [] });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  let body: { text?: string } = {};
  try { body = await req.json(); } catch { /* empty */ }
  const msg: Msg = { id: `msg_${Date.now()}`, from: 'You', text: body.text ?? '', mine: true, ts: Date.now() };
  const thread = threadStore.get(params.id) ?? [];
  thread.push(msg);
  threadStore.set(params.id, thread);
  return NextResponse.json({ ok: true, message: msg });
}
