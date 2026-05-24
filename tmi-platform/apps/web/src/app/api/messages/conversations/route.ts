export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

interface Conversation {
  id: string; name: string; role: string; icon: string;
  accentColor: string; lastMessage: string; timeAgo: string;
  unread: number; isOnline: boolean;
}

const SEED: Conversation[] = [
  { id: 'kreach', name: 'Kreach',      role: 'ARTIST',   icon: '🎵', accentColor: '#AA2DFF', lastMessage: "Yo, I'm live on the platform — let's run this", timeAgo: '2m',  unread: 2, isOnline: true  },
  { id: 'kg',     name: 'KG',          role: 'PRODUCER', icon: '🎹', accentColor: '#FFD700', lastMessage: 'New beat pack just dropped, check it out',       timeAgo: '9m',  unread: 1, isOnline: true  },
  { id: 'savage', name: 'Savage Guns', role: 'ARTIST',   icon: '🔥', accentColor: '#FF2DAA', lastMessage: 'Check the new freestyle I just posted',           timeAgo: '1h',  unread: 0, isOnline: false },
  { id: 'jason',  name: 'Jason Smith', role: 'PROMOTER', icon: '⭐', accentColor: '#00FF88', lastMessage: "Booking confirmed — let's get this locked in",    timeAgo: '3h',  unread: 0, isOnline: true  },
];

const convStore = new Map<string, Conversation>(SEED.map(c => [c.id, c]));

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return NextResponse.json({ conversations: Array.from(convStore.values()) });
}

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  let body: { recipientId?: string; name?: string; message?: string } = {};
  try { body = await req.json(); } catch { /* empty */ }
  const id = body.recipientId ?? `conv_${Date.now()}`;
  const conv: Conversation = {
    id, name: body.name ?? 'New Contact', role: 'USER', icon: '💬',
    accentColor: '#00FFFF', lastMessage: body.message ?? '', timeAgo: 'now', unread: 0, isOnline: false,
  };
  convStore.set(id, conv);
  return NextResponse.json({ ok: true, conversation: conv });
}
