export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/auth/UserStore';
import { messageThreadEngine } from '@/lib/messaging';

async function getUserFromRequest(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value ?? '';
  if (!email) return null;
  return getUserByEmail(email);
}

// GET /api/messages/conversations — returns real threads from messageThreadEngine
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const threads = messageThreadEngine.getUserThreads(user.id);
  const conversations = threads.map(t => {
    const other = t.participants.find(p => p.userId !== user.id);
    const unread = t.messages.filter(m => !m.readBy.has(user.id) && m.senderId !== user.id).length;
    return {
      id: t.threadId,
      threadId: t.threadId,
      kind: t.kind,
      name: other?.displayName ?? t.participants.map(p => p.displayName).join(', '),
      role: (other?.role ?? 'user').toUpperCase(),
      participants: t.participants.map(p => ({ userId: p.userId, displayName: p.displayName, avatarUrl: p.avatarUrl, role: p.role })),
      lastMessage: t.lastMessage?.body ?? '',
      lastMessageAt: t.lastMessage?.createdAt ?? t.updatedAt,
      unread,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  });

  return NextResponse.json({ conversations });
}

// POST /api/messages/conversations — create a new conversation (get-or-create)
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let body: { recipientId?: string; recipientName?: string; kind?: string } = {};
  try { body = await req.json() as typeof body; } catch { /* empty body */ }

  if (!body.recipientId) {
    return NextResponse.json({ error: 'recipientId required' }, { status: 400 });
  }

  const myParticipant = {
    userId: user.id,
    displayName: user.displayName ?? 'You',
    avatarUrl: '',
    role: (user.role as 'fan' | 'artist' | 'sponsor' | 'admin') ?? 'fan',
  };
  const recipientParticipant = {
    userId: body.recipientId,
    displayName: body.recipientName ?? body.recipientId,
    avatarUrl: '',
    role: 'fan' as const,
  };

  const kind = (body.kind as 'fan-fan' | 'fan-artist' | 'artist-artist' | 'sponsor-artist' | 'support') ?? 'fan-fan';
  const thread = messageThreadEngine.getOrCreateThread(myParticipant, recipientParticipant, kind);

  return NextResponse.json({ ok: true, threadId: thread.threadId, conversation: { id: thread.threadId } });
}

