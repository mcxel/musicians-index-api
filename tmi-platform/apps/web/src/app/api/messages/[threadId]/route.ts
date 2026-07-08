export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function getUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (email) {
    const u = await prisma.user.findUnique({ where: { email }, select: { id: true } }).catch(() => null);
    if (u?.id) return u.id;
  }
  return req.cookies.get('tmi_session_id')?.value ?? null;
}

export async function GET(req: NextRequest, { params }: { params: { threadId: string } }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const conversation = await prisma.conversation.findUnique({ where: { id: params.threadId } });
  if (!conversation) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  if (!conversation.participantIds.includes(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { conversationId: params.threadId, isDeleted: false },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });

  // Mark all unread messages as read
  const unreadIds = messages.filter((m) => !m.readByIds.includes(userId)).map((m) => m.id);
  if (unreadIds.length > 0) {
    await Promise.all(
      unreadIds.map((id) =>
        prisma.message.update({
          where: { id },
          data: { readByIds: { push: userId } },
        })
      )
    );
  }

  return NextResponse.json({
    threadId: conversation.id,
    kind: conversation.kind,
    participantIds: conversation.participantIds,
    messages: messages.map((m) => ({
      messageId: m.id,
      senderId: m.senderId,
      senderName: m.senderName,
      body: m.body,
      type: m.messageType,
      valueUsdCents: m.valueUsdCents,
      mediaUrl: m.mediaUrl,
      createdAt: m.createdAt.getTime(),
      editedAt: m.editedAt?.getTime() ?? null,
      isOwn: m.senderId === userId,
    })),
  });
}

export async function POST(req: NextRequest, { params }: { params: { threadId: string } }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const conversation = await prisma.conversation.findUnique({ where: { id: params.threadId } });
  if (!conversation) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  if (!conversation.participantIds.includes(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json() as { body: string; type?: string };
  if (!body.body?.trim()) return NextResponse.json({ error: 'Message body required' }, { status: 400 });

  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { displayName: true },
  }).catch(() => null);

  const message = await prisma.message.create({
    data: {
      conversationId: params.threadId,
      senderId: userId,
      senderName: userRecord?.displayName ?? 'User',
      body: body.body.trim(),
      messageType: body.type ?? 'text',
      readByIds: [userId],
    },
  });

  await prisma.conversation.update({
    where: { id: params.threadId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({
    messageId: message.id,
    body: message.body,
    type: message.messageType,
    createdAt: message.createdAt.getTime(),
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { threadId: string } }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { messageId: string };
  if (!body.messageId) return NextResponse.json({ error: 'messageId required' }, { status: 400 });

  const message = await prisma.message.findUnique({ where: { id: body.messageId } });
  if (!message || message.senderId !== userId) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
  }

  await prisma.message.update({
    where: { id: body.messageId },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
