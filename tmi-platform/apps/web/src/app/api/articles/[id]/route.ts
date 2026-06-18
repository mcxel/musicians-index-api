import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function getAuthedUser(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  return prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, slug: true, subtitle: true, content: true, status: true, publishedAt: true, authorId: true, createdAt: true, updatedAt: true },
    });
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ article });
  } catch (err) {
    console.error('[articles/[id] GET]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const article = await prisma.article.findUnique({ where: { id: params.id }, select: { authorId: true } });
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const isAdmin = (user as { role?: string }).role === 'ADMIN';
    if (article.authorId !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json() as {
      title?: string;
      subtitle?: string;
      content?: Record<string, unknown>;
      status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    };

    // Build update payload explicitly to satisfy Prisma strict types
    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.subtitle !== undefined) data.subtitle = body.subtitle;
    if (body.content !== undefined) data.content = body.content;
    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === 'PUBLISHED') data.publishedAt = new Date();
    }

    const updated = await prisma.article.update({
      where: { id: params.id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as any,
      select: { id: true, title: true, slug: true, status: true, updatedAt: true },
    });

    return NextResponse.json({ article: updated });
  } catch (err) {
    console.error('[articles/[id] PATCH]', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const article = await prisma.article.findUnique({ where: { id: params.id }, select: { authorId: true } });
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const isAdmin = (user as { role?: string }).role === 'ADMIN';
    if (article.authorId !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.article.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[articles/[id] DELETE]', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
