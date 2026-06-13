import { NextRequest, NextResponse } from 'next/server';
import { MemoryCaptureEngine } from '@/lib/memory/MemoryCaptureEngine';
import type { CaptureType, MemoryContext } from '@/lib/capture/CaptureEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      userId?: string;
      imageData: string;
      captureType: CaptureType;
      roomId?: string;
      eventId?: string;
      playlistId?: string;
      performerIds?: string[];
      venueId?: string;
      performerName?: string;
      roomLabel?: string;
    };

    if (!body.imageData) {
      return NextResponse.json({ error: 'imageData is required' }, { status: 400 });
    }

    const context: MemoryContext = {
      captureType: body.captureType ?? 'group_photo',
      roomId: body.roomId,
      eventId: body.eventId,
      playlistId: body.playlistId,
      performerIds: body.performerIds,
      venueId: body.venueId,
      timestamp: new Date().toISOString(),
    };

    const result = await MemoryCaptureEngine.saveCapture({
      userId: body.userId ?? 'guest',
      imageData: body.imageData,
      context,
      performerName: body.performerName,
      roomLabel: body.roomLabel,
    });

    return NextResponse.json({
      success: true,
      memoryId: result.artifact.id,
      xpEarned: result.xpEarned,
      timelineEventId: result.timelineEventId,
      isFirstCollection: result.isFirstCollection,
    });
  } catch (err) {
    console.error('[memory/capture]', err);
    return NextResponse.json({ error: 'Capture failed' }, { status: 500 });
  }
}
