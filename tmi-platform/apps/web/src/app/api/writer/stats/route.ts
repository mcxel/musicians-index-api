export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/writer/stats
 * Returns real article stats for the authenticated writer.
 */
export async function GET(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId || !email) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });

    const articles = await prisma.article.findMany({
      where: { authorId: user.id },
      select: { id: true, status: true, title: true, slug: true, publishedAt: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    const published = articles.filter(a => a.status === 'PUBLISHED');
    const drafts    = articles.filter(a => a.status === 'DRAFT');
    const archived  = articles.filter(a => a.status === 'ARCHIVED');

    return NextResponse.json({
      ok: true,
      stats: {
        published:  published.length,
        drafts:     drafts.length,
        archived:   archived.length,
        total:      articles.length,
      },
      recentArticles: articles.slice(0, 10).map(a => ({
        id:         a.id,
        title:      a.title,
        slug:       a.slug,
        status:     a.status.toLowerCase(),
        updatedAt:  a.updatedAt.toISOString(),
        publishedAt: a.publishedAt?.toISOString() ?? null,
      })),
    });
  } catch (err) {
    console.error('[api/writer/stats] error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to load stats.' }, { status: 500 });
  }
}
