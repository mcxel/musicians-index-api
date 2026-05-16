import { directMotion } from '@/lib/ai-motion/MotionDirectorEngine';
import type { MotionDurationKey } from '@/lib/ai-motion/MotionTimingEngine';

export type HostMotionRecord = {
  hostId: string;
  motionId: string;
  durationKey: MotionDurationKey;
  surface: 'host-intro' | 'venue-display' | 'billboard';
  directiveId: string;
  createdAt: number;
};

const hostMotionRecords = new Map<string, HostMotionRecord>();

export function createHostMotion(input: {
  hostId: string;
  motionId: string;
  durationKey: MotionDurationKey;
  surface: 'host-intro' | 'venue-display' | 'billboard';
}): HostMotionRecord {
  const directive = directMotion({
    directiveId: `${input.hostId}:${input.motionId}`,
    surface: input.surface,
    durationKey: input.durationKey,
    emphasis: input.surface === 'host-intro' ? 'intro' : 'performance',
  });

  const next: HostMotionRecord = {
    ...input,
    directiveId: directive.directiveId,
    createdAt: Date.now(),
  };

  hostMotionRecords.set(next.motionId, next);
  return next;
}

export function listHostMotions(): HostMotionRecord[] {
  return [...hostMotionRecords.values()].sort((a, b) => b.createdAt - a.createdAt);
}
