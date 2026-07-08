export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function getAuthorId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (email) {
    const u = await prisma.user.findUnique({ where: { email }, select: { id: true } }).catch(() => null);
    if (u?.id) return u.id;
  }
  return null;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

// GET — list published articles from DB
export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 50,
      select: { id: true, title: true, slug: true, subtitle: true, status: true, publishedAt: true, createdAt: true },
    });
    return NextResponse.json({ articles });
  } catch (err) {
    console.error('[magazine/articles GET]', err);
    return NextResponse.json({ articles: [] });
  }
}

// POST — create or update article draft, optionally publish
export async function POST(req: NextRequest) {
  const authorId = await getAuthorId(req);
  if (!authorId) return NextResponse.json({ error: 'Unauthorized — log in to publish articles' }, { status: 401 });

  const body = await req.json() as {
    title: string;
    subtitle?: string;
    content: string;
    publish?: boolean;
    slug?: string;
  };

  if (!body.title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  if (!body.content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

  const baseSlug = body.slug?.trim() || slugify(body.title);

  // Ensure slug is unique — append suffix if needed
  let slug = baseSlug;
  let attempt = 0;
  while (attempt < 10) {
    const existing = await prisma.article.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const status = body.publish ? 'PUBLISHED' : 'DRAFT';
  const publishedAt = body.publish ? new Date() : null;

  const article = await prisma.article.create({
    data: {
      title: body.title.trim(),
      slug,
      subtitle: body.subtitle?.trim() ?? null,
      content: { body: body.content.trim() },
      status,
      authorId,
      publishedAt,
    },
  });

  return NextResponse.json({
    ok: true,
    articleId: article.id,
    slug: article.slug,
    status: article.status,
    url: `/editorial/${article.slug}`,
  });
}
