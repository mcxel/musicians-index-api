export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { listLiveRooms, getActiveLiveRooms, type LiveRoomType } from '@/lib/live/LiveRoomEngine';
import {
  ensureAnchorRoomsSeeded,
  getAnchorDiscoveryRecords,
  listAnchorLiveRoomRecords,
  getAnchorNetworkControlSnapshot,
  listAnchorCapacityMatrix,
} from '@/lib/live/AnchorRoomNetwork';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') as LiveRoomType | null;
  const activeOnly = searchParams.get('active') === 'true';
  const anchorsOnly = searchParams.get('anchors') === 'true';

  // Always seed permanent 24/7 anchors into LiveRoomEngine + DiscoveryBus
  ensureAnchorRoomsSeeded();
  getAnchorDiscoveryRecords();

  if (anchorsOnly) {
    return NextResponse.json({
      ok: true,
      rooms: listAnchorLiveRoomRecords(),
      controls: getAnchorNetworkControlSnapshot(),
      capacityMatrix: listAnchorCapacityMatrix(),
    });
  }

  if (activeOnly) {
    const active = getActiveLiveRooms();
    const anchors = listAnchorLiveRoomRecords();
    const anchorIds = new Set(anchors.map((r) => r.roomId));
    const rooms = [
      ...anchors,
      ...active
        .filter((r) => !anchorIds.has(r.roomId))
        .map((r) => ({
          roomId: r.roomId,
          roomType: r.roomType,
          title: r.title,
          status: r.status,
          genre: r.genre,
        })),
    ];
    return NextResponse.json({ ok: true, rooms });
  }

  const rooms = listLiveRooms(type ? { roomType: type } : undefined);
  return NextResponse.json({ ok: true, rooms });
}
