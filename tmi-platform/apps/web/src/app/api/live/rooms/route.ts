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
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import { filterDatingExperiencesForUserId } from '@/lib/trustSafety/datingExperienceGuard';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') as LiveRoomType | null;
  const activeOnly = searchParams.get('active') === 'true';
  const anchorsOnly = searchParams.get('anchors') === 'true';

  // Always seed permanent 24/7 anchors into LiveRoomEngine + DiscoveryBus
  ensureAnchorRoomsSeeded();
  getAnchorDiscoveryRecords();

  const auth = await getTmiAuth();
  const userId = auth?.user?.id ?? null;

  if (anchorsOnly) {
    const rooms = await filterDatingExperiencesForUserId(userId, listAnchorLiveRoomRecords(), (r) => ({
      roomId: r.roomId,
      title: r.title,
    }));
    return NextResponse.json({
      ok: true,
      rooms,
      controls: getAnchorNetworkControlSnapshot(),
      capacityMatrix: listAnchorCapacityMatrix(),
    });
  }

  if (activeOnly) {
    const active = getActiveLiveRooms();
    const anchors = listAnchorLiveRoomRecords();
    const anchorIds = new Set(anchors.map((r) => r.roomId));
    const filteredAnchors = await filterDatingExperiencesForUserId(userId, anchors, (r) => ({
      roomId: r.roomId,
      title: r.title,
      roomType: r.roomType,
    }));
    const filteredActive = await filterDatingExperiencesForUserId(
      userId,
      active.filter((r) => !anchorIds.has(r.roomId)),
      (r) => ({
        roomId: r.roomId,
        title: r.title,
        roomType: r.roomType,
        tags: r.tags,
        experienceClass: r.experienceClass,
        minimumAge: r.minimumAge,
        ageVerificationRequired: r.ageVerificationRequired,
      }),
    );
    const rooms = [
      ...filteredAnchors,
      ...filteredActive.map((r) => ({
        roomId: r.roomId,
        roomType: r.roomType,
        title: r.title,
        status: r.status,
        genre: r.genre,
      })),
    ];
    return NextResponse.json({ ok: true, rooms });
  }

  const rooms = await filterDatingExperiencesForUserId(
    userId,
    listLiveRooms(type ? { roomType: type } : undefined),
    (r) => ({
      roomId: r.roomId,
      title: r.title,
      roomType: r.roomType,
      tags: r.tags,
      experienceClass: r.experienceClass,
      minimumAge: r.minimumAge,
      ageVerificationRequired: r.ageVerificationRequired,
    }),
  );
  return NextResponse.json({ ok: true, rooms });
}
