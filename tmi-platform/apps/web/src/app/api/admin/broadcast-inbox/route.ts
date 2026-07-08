export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

// POST /api/admin/broadcast-inbox
// Sends an in-app message to every user's inbox from "TMI Platform"
// Auth: Authorization: Bearer <ADMIN_API_KEY>
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const key = process.env.ADMIN_API_KEY ?? process.env.ADMIN_API_SECRET;
  if (!key || auth !== `Bearer ${key}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as {
    message?: string;
    targetRole?: string;
  };

  if (!body.message?.trim()) {
    return NextResponse.json({ error: 'message required' }, { status: 400 });
  }

  // Find or create the TMI Platform system user
  let systemUser = await prisma.user.findFirst({
    where: { email: 'platform@themusiciansindex.com' },
  });
  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: 'platform@themusiciansindex.com',
        displayName: 'TMI Platform',
        role: 'ADMIN',
        tier: 'DIAMOND',
      },
    });
  }

  // Build filter — target a specific role or all real users
  const userFilter: Prisma.UserWhereInput = {
    email: { not: 'platform@themusiciansindex.com' },
  };
  if (body.targetRole) {
    userFilter.role = body.targetRole as Prisma.EnumRoleFilter['equals'];
  }

  const users = await prisma.user.findMany({
    where: userFilter,
    select: { id: true, displayName: true, email: true },
    take: 5000,
  });

  if (users.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, note: 'No users found' });
  }

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const participants = [systemUser.id, user.id].sort();
      let conversation = await prisma.conversation.findFirst({
        where: {
          kind: 'platform-announcement',
          participantIds: { hasEvery: participants },
        },
      });
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { kind: 'platform-announcement', participantIds: participants },
        });
      }
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: systemUser.id,
          senderName: 'TMI Platform',
          body: body.message!.trim(),
          messageType: 'text',
          readByIds: [systemUser.id],
        },
      });
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ ok: true, sent, failed, total: users.length });
}
