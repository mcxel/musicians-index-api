import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function getAuthedUser(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  return prisma.user.findUnique({ where: { email }, select: { id: true } });
}

// GET — fetch single playlist with tracks
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id },
      include: {
        items: { orderBy: { position: 'asc' }, include: { song: true } },
        creator: { select: { id: true, name: true, image: true } },
      },
    });
    if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ playlist });
  } catch (err) {
    console.error('[playlists/[id] GET]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// PATCH — rename, update cover, toggle privacy/mixtape
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const playlist = await prisma.playlist.findUnique({ where: { id: params.id }, select: { creatorId: true } });
    if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (playlist.creatorId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json() as {
      name?: string;
      description?: string;
      coverUrl?: string;
      isPublic?: boolean;
      isMixtape?: boolean;
    };

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.coverUrl !== undefined) data.coverUrl = body.coverUrl;
    if (body.isPublic !== undefined) data.isPublic = body.isPublic;
    if (body.isMixtape !== undefined) data.isMixtape = body.isMixtape;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await prisma.playlist.update({ where: { id: params.id }, data: data as any, select: { id: true, name: true, isPublic: true, isMixtape: true, updatedAt: true } });
    return NextResponse.json({ playlist: updated });
  } catch (err) {
    console.error('[playlists/[id] PATCH]', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// DELETE — remove playlist + all its items (Cascade handles items)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const playlist = await prisma.playlist.findUnique({ where: { id: params.id }, select: { creatorId: true } });
    if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (playlist.creatorId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.playlist.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[playlists/[id] DELETE]', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
