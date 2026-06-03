export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/auth/UserStore';
import { messageThreadEngine } from '@/lib/messaging';

function getUserFromRequest(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value ?? '';
  if (!email) return null;
  return getUserByEmail(email);
}

export async function GET(req: NextRequest, { params }: { params: { threadId: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const thread = messageThreadEngine.getThread(params.threadId);
  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

  const isParticipant = thread.participants.some(p => p.userId === user.id);
  if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  messageThreadEngine.markRead(params.threadId, user.id);

  return NextResponse.json({
    threadId: thread.threadId,
    kind: thread.kind,
    participants: thread.participants.map(p => ({
      userId: p.userId,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      role: p.role,
    })),
    messages: thread.messages
      .filter(m => !m.deletedAt)
      .map(m => ({
        messageId: m.messageId,
        senderId: m.senderId,
        senderName: m.senderName,
        body: m.body,
        type: m.type,
        valueUsdCents: m.valueUsdCents,
        mediaUrl: m.mediaUrl,
        createdAt: m.createdAt,
        editedAt: m.editedAt,
        isOwn: m.senderId === user.id,
      })),
  });
}

export async function POST(req: NextRequest, { params }: { params: { threadId: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const thread = messageThreadEngine.getThread(params.threadId);
  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

  const isParticipant = thread.participants.some(p => p.userId === user.id);
  if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json() as { body: string; type?: string };
  if (!body.body?.trim()) return NextResponse.json({ error: 'Message body required' }, { status: 400 });

  const message = messageThreadEngine.sendMessage({
    threadId: params.threadId,
    senderId: user.id,
    senderName: user.displayName,
    body: body.body.trim(),
    type: (body.type as 'text' | 'image' | 'audio' | 'tip' | 'gift' | 'system') ?? 'text',
  });

  if (!message) return NextResponse.json({ error: 'Could not send message' }, { status: 500 });

  return NextResponse.json({
    messageId: message.messageId,
    body: message.body,
    type: message.type,
    createdAt: message.createdAt,
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { threadId: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { messageId: string };
  if (!body.messageId) return NextResponse.json({ error: 'messageId required' }, { status: 400 });

  messageThreadEngine.deleteMessage(params.threadId, body.messageId, user.id);
  return NextResponse.json({ ok: true });
}
