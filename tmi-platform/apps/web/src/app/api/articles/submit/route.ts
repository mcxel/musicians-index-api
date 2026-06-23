export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 96);
}

/**
 * POST /api/articles/submit
 * Writer submits a new article draft.
 * Status starts as DRAFT; admin/editors can promote to PUBLISHED.
 */
export async function POST(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId || !email) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  let body: { title?: string; subtitle?: string; content?: Record<string, unknown>; category?: string } = {};
  try { body = await req.json() as typeof body; } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ ok: false, error: 'Title is required.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });

    // Generate a unique slug
    const baseSlug = slugify(body.title.trim());
    const suffix   = Date.now().toString(36);
    const slug     = `${baseSlug}-${suffix}`;

    const article = await prisma.article.create({
      data: {
        title:     body.title.trim(),
        subtitle:  body.subtitle?.trim() ?? null,
        slug,
        content:   (body.content ?? { type: 'doc', content: [] }) as any,
        status:    'DRAFT',
        authorId:  user.id,
      },
      select: { id: true, title: true, slug: true, status: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, article });
  } catch (err) {
    console.error('[articles/submit] error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to create article.' }, { status: 500 });
  }
}
