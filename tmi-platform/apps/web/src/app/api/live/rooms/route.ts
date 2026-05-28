export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { listLiveRooms, getActiveLiveRooms, type LiveRoomType } from '@/lib/live/LiveRoomEngine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') as LiveRoomType | null;
  const activeOnly = searchParams.get('active') === 'true';

  if (activeOnly) {
    return NextResponse.json({ ok: true, rooms: getActiveLiveRooms() });
  }

  const rooms = listLiveRooms(type ? { roomType: type } : undefined);
  return NextResponse.json({ ok: true, rooms });
}
