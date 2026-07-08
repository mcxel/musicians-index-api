export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/auth/UserStore';
import { messageThreadEngine } from '@/lib/messaging';

async function getUserFromRequest(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value ?? '';
  if (!email) return null;
  return getUserByEmail(email);
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const threads = messageThreadEngine.getUserThreads(user.id);
  return NextResponse.json({
    threads: threads.map(t => ({
      threadId: t.threadId,
      kind: t.kind,
      participants: t.participants.map(p => ({
        userId: p.userId,
        displayName: p.displayName,
        avatarUrl: p.avatarUrl,
        role: p.role,
      })),
      lastMessage: t.lastMessage
        ? {
            messageId: t.lastMessage.messageId,
            senderId: t.lastMessage.senderId,
            senderName: t.lastMessage.senderName,
            body: t.lastMessage.body,
            type: t.lastMessage.type,
            createdAt: t.lastMessage.createdAt,
          }
        : null,
      unreadCount: t.messages.filter(m => !m.readBy.has(user.id) && m.senderId !== user.id).length,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
    unreadTotal: messageThreadEngine.getUnreadCount(user.id),
  });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    recipientId: string;
    recipientName: string;
    recipientRole?: string;
    body: string;
    kind?: string;
  };

  if (!body.recipientId || !body.body?.trim()) {
    return NextResponse.json({ error: 'recipientId and body required' }, { status: 400 });
  }

  const myParticipant = {
    userId: user.id,
    displayName: user.displayName,
    avatarUrl: '',
    role: (user.role as 'fan' | 'artist' | 'sponsor' | 'admin') ?? 'fan',
  };
  const recipientParticipant = {
    userId: body.recipientId,
    displayName: body.recipientName,
    avatarUrl: '',
    role: (body.recipientRole as 'fan' | 'artist' | 'sponsor' | 'admin') ?? 'fan',
  };

  const kind = (body.kind as 'fan-fan' | 'fan-artist' | 'artist-artist' | 'sponsor-artist' | 'support') ?? 'fan-fan';
  const thread = messageThreadEngine.getOrCreateThread(myParticipant, recipientParticipant, kind);

  const message = messageThreadEngine.sendMessage({
    threadId: thread.threadId,
    senderId: user.id,
    senderName: user.displayName,
    body: body.body.trim(),
    type: 'text',
  });

  return NextResponse.json({
    threadId: thread.threadId,
    message: message ? { messageId: message.messageId, body: message.body, createdAt: message.createdAt } : null,
  });
}
