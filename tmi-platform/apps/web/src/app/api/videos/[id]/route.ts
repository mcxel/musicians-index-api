import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function getAuthedUser(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  return prisma.user.findUnique({ where: { email }, select: { id: true } });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      include: { uploader: { select: { id: true, name: true, image: true } } },
    });
    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ video });
  } catch (err) {
    console.error('[videos/[id] GET]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const video = await prisma.video.findUnique({ where: { id: params.id }, select: { uploaderId: true } });
    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (video.uploaderId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json() as {
      title?: string;
      description?: string;
      thumbnailUrl?: string;
      genre?: string;
      isPublic?: boolean;
      status?: string;
    };

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.thumbnailUrl !== undefined) data.thumbnailUrl = body.thumbnailUrl;
    if (body.genre !== undefined) data.genre = body.genre;
    if (body.isPublic !== undefined) data.isPublic = body.isPublic;
    if (body.status !== undefined) data.status = body.status;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await prisma.video.update({ where: { id: params.id }, data: data as any, select: { id: true, title: true, status: true, updatedAt: true } });
    return NextResponse.json({ video: updated });
  } catch (err) {
    console.error('[videos/[id] PATCH]', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const video = await prisma.video.findUnique({ where: { id: params.id }, select: { uploaderId: true } });
    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (video.uploaderId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.video.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[videos/[id] DELETE]', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
