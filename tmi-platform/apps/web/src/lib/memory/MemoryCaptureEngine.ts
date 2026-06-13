import { MemoryWallEngine, type MemoryArtifact } from './MemoryWallEngine';
import { ActivityTimelineEngine } from '@/lib/timeline/ActivityTimelineEngine';
import type { CaptureType, MemoryContext } from '@/lib/capture/CaptureEngine';

export interface CapturePayload {
  userId: string;
  imageData: string;
  context: MemoryContext;
  performerName?: string;
  roomLabel?: string;
}

export interface CaptureResult {
  artifact: MemoryArtifact;
  xpEarned: number;
  timelineEventId: string;
  isFirstCollection: boolean;
}

const XP_MAP: Record<CaptureType, number> = {
  group_photo:  25,
  selfie:       15,
  stage_shot:   20,
  trophy_shot:  50,
  event_poster: 10,
};

export class MemoryCaptureEngine {
  static async saveCapture(payload: CapturePayload): Promise<CaptureResult> {
    const { userId, imageData, context, performerName, roomLabel } = payload;

    const title = [
      performerName ?? '',
      roomLabel ? `@ ${roomLabel}` : '',
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    ].filter(Boolean).join(' · ');

    const artifact = await MemoryWallEngine.captureLiveMoment(
      userId,
      context.eventId ?? context.roomId ?? 'room',
      imageData,
      title
    );

    const xpEarned = XP_MAP[context.captureType] ?? 25;

    const timelineEvent = ActivityTimelineEngine.addEvent({
      userId,
      type: 'PHOTO_CAPTURED',
      label: `📸 ${title}`,
      roomId: context.roomId,
      eventId: context.eventId,
      captureType: context.captureType,
      xpEarned,
      imagePreview: imageData.slice(0, 80),
    });

    // Trophy shot auto-grants first trophy collection
    const firstCollection = context.captureType === 'trophy_shot'
      ? ActivityTimelineEngine.checkAndGrantFirstCollection(userId, 'TROPHY_WON')
      : null;

    // Broadcast share event so MemoryShareToast picks it up
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('TMI_MEMORY_CAPTURED', {
        detail: { userId, title, captureType: context.captureType, xpEarned, imagePreview: imageData.slice(0, 200) },
      }));
    }

    return {
      artifact,
      xpEarned,
      timelineEventId: timelineEvent.id,
      isFirstCollection: !!firstCollection,
    };
  }

  static broadcastShare(userId: string, memoryId: string, userName?: string): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('TMI_MEMORY_SHARED', {
      detail: { userId, memoryId, userName: userName ?? 'Someone' },
    }));
    ActivityTimelineEngine.addEvent({
      userId,
      type: 'MEMORY_SHARED',
      label: '📤 Shared a memory to the room',
      xpEarned: 50,
    });
  }
}
