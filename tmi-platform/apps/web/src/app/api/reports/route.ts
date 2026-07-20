export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { submitReport, type ReportCategory } from '@/lib/moderation/ModerationEngine';

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

const VALID_CATEGORIES = new Set<ReportCategory>([
  'violence', 'self_harm', 'csam', 'threats',
  'harassment', 'hate_speech', 'sexual_content',
  'spam', 'impersonation', 'scam', 'other',
]);

export async function POST(req: NextRequest) {
  const reporterId = await resolveUserId(req);
  if (!reporterId) return NextResponse.json({ error: 'Sign in required to report' }, { status: 401 });

  const body = await req.json() as {
    targetType?: string; targetId?: string; category?: string; detail?: string;
  };
  const { targetType, targetId, category, detail } = body;

  if (!targetType || !['user', 'room', 'content', 'message'].includes(targetType)) {
    return NextResponse.json({ error: 'Invalid targetType' }, { status: 400 });
  }
  if (!targetId) return NextResponse.json({ error: 'targetId required' }, { status: 400 });
  if (!category || !VALID_CATEGORIES.has(category as ReportCategory)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }
  if (targetType === 'user' && targetId === reporterId) {
    return NextResponse.json({ error: 'Cannot report yourself' }, { status: 400 });
  }

  const result = await submitReport({
    reporterId,
    targetType: targetType as 'user' | 'room' | 'content' | 'message',
    targetId,
    category: category as ReportCategory,
    detail: detail?.slice(0, 2000),
  });

  return NextResponse.json({ ok: true, ...result });
}
