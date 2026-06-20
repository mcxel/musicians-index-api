import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function getAuthedUser(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  return prisma.user.findUnique({ where: { email }, select: { id: true } });
}

// DELETE — remove a specific song from a playlist
export async function DELETE(req: NextRequest, { params }: { params: { id: string; trackId: string } }) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const playlist = await prisma.playlist.findUnique({ where: { id: params.id }, select: { creatorId: true } });
    if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (playlist.creatorId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.playlistItem.delete({ where: { id: params.trackId } });

    // Re-sequence remaining items to close the gap
    const remaining = await prisma.playlistItem.findMany({
      where: { playlistId: params.id },
      orderBy: { position: 'asc' },
      select: { id: true },
    });
    await Promise.all(remaining.map((item, i) =>
      prisma.playlistItem.update({ where: { id: item.id }, data: { position: i } })
    ));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[playlists/[id]/tracks/[trackId] DELETE]', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

// PATCH — reorder a track (move to new position)
export async function PATCH(req: NextRequest, { params }: { params: { id: string; trackId: string } }) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const playlist = await prisma.playlist.findUnique({ where: { id: params.id }, select: { creatorId: true } });
    if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (playlist.creatorId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { position } = await req.json() as { position: number };
    await prisma.playlistItem.update({ where: { id: params.trackId }, data: { position } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[playlists/[id]/tracks/[trackId] PATCH]', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
