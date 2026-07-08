export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function getUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (email) {
    const u = await prisma.user.findUnique({ where: { email }, select: { id: true, displayName: true } }).catch(() => null);
    if (u?.id) return u.id;
  }
  return req.cookies.get('tmi_session_id')?.value ?? null;
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { participantIds: { has: userId }, isArchived: false },
    include: {
      messages: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

  const threads = conversations.map((c) => {
    const last = c.messages[0] ?? null;
    const unread = 0; // without full message list we skip unread count here
    return {
      threadId: c.id,
      kind: c.kind,
      participantIds: c.participantIds,
      lastMessage: last
        ? {
            messageId: last.id,
            senderId: last.senderId,
            senderName: last.senderName,
            body: last.body,
            type: last.messageType,
            createdAt: last.createdAt.getTime(),
          }
        : null,
      unreadCount: unread,
      createdAt: c.createdAt.getTime(),
      updatedAt: c.updatedAt.getTime(),
    };
  });

  return NextResponse.json({ threads, unreadTotal: 0 });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    recipientId: string;
    recipientName?: string;
    body: string;
    kind?: string;
  };

  if (!body.recipientId || !body.body?.trim()) {
    return NextResponse.json({ error: 'recipientId and body required' }, { status: 400 });
  }

  const kind = body.kind ?? 'fan-fan';
  const participants = [userId, body.recipientId].sort();

  // Find or create 1:1 conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      kind,
      participantIds: { hasEvery: participants },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        kind,
        participantIds: participants,
      },
    });
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { displayName: true },
  }).catch(() => null);

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: userId,
      senderName: userRecord?.displayName ?? 'User',
      body: body.body.trim(),
      messageType: 'text',
      readByIds: [userId],
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({
    threadId: conversation.id,
    message: { messageId: message.id, body: message.body, createdAt: message.createdAt.getTime() },
  });
}
