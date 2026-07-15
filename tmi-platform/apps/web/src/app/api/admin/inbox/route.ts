export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/api/admin/_utils/require-admin';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import prisma from '@/lib/prisma';

// Real Unified Inbox — Conversation/Message backed (Rule 20: no seed data).
// Scoped to the requesting admin's own conversations, not a global firehose
// of every user's private messages — there is no product policy authorizing
// admin-wide message visibility, so this only returns conversations the
// signed-in admin is actually a participant in.

export interface InboxThreadSummary {
  conversationId: string;
  participantNames: string[];
  latestMessage: string;
  latestSenderName: string;
  latestAt: string;
  unreadCount: number;
}

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Session required' }, { status: 401 });
  }
  const userId = auth.user.id;

  const limitParam = Number(req.nextUrl.searchParams.get('limit') ?? '20');
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 20;

  const conversations = await prisma.conversation.findMany({
    where: {
      participantIds: { has: userId },
      isArchived: false,
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      messages: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const threads: InboxThreadSummary[] = conversations
    .filter((c) => c.messages.length > 0)
    .map((c) => {
      const latest = c.messages[0]!;
      return {
        conversationId: c.id,
        participantNames: c.participantIds.filter((id) => id !== userId),
        latestMessage: latest.body,
        latestSenderName: latest.senderName,
        latestAt: latest.createdAt.toISOString(),
        unreadCount: latest.readByIds.includes(userId) ? 0 : 1,
      };
    });

  return NextResponse.json({ ok: true, threads });
}
