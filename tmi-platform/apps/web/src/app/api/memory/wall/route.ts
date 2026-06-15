import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { MemoryItem } from '@/lib/profiles/MemoryWallEngine';

const MEMORY_TYPE = 'MEMORY_WALL_ITEM';
const FAR_FUTURE = new Date('2040-01-01T00:00:00Z');

async function findUserIdBySlug(slug: string): Promise<string | null> {
  const profile = await prisma.userProfile.findUnique({
    where: { username: slug },
    select: { userId: true },
  });
  if (profile) return profile.userId;

  const user = await prisma.user.findFirst({
    where: { email: { startsWith: `${slug}@` } },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('entitySlug') ?? '';
  const entityType = req.nextUrl.searchParams.get('entityType') ?? 'fan';

  if (!slug) return NextResponse.json({ memories: [] });

  try {
    const userId = await findUserIdBySlug(slug);
    if (!userId) return NextResponse.json({ memories: [] });

    const feedItems = await prisma.feedItem.findMany({
      where: { userId, type: MEMORY_TYPE, entityType },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const memories: MemoryItem[] = feedItems.map((fi) => fi.data as unknown as MemoryItem);
    return NextResponse.json({ memories });
  } catch (err) {
    console.error('[memory/wall GET]', err);
    return NextResponse.json({ memories: [] });
  }
}

export async function POST(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json() as {
      entityId: string;
      entityType: string;
      contentType: MemoryItem['contentType'];
      contentUrl?: string;
      title: string;
      description?: string;
      tags?: string[];
      isPublic?: boolean;
      displayOrder?: number;
    };

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const memoryId = `mem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const memory: MemoryItem = {
      memoryId,
      entityId: body.entityId,
      entityType: body.entityType as MemoryItem['entityType'],
      contentType: body.contentType,
      contentUrl: body.contentUrl ?? '',
      title: body.title.trim(),
      description: body.description?.trim(),
      tags: body.tags ?? [],
      createdAt: Date.now(),
      source: 'user-uploaded',
      isPublic: body.isPublic ?? true,
      likes: 0,
      shares: 0,
      displayOrder: body.displayOrder ?? 0,
    };

    await prisma.feedItem.create({
      data: {
        userId: user.id,
        type: MEMORY_TYPE,
        entityId: body.entityId,
        entityType: body.entityType,
        data: memory as object,
        expiresAt: FAR_FUTURE,
      },
    });

    return NextResponse.json({ memory });
  } catch (err) {
    console.error('[memory/wall POST]', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}
