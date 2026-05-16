import { resolveMotionPriority, type MotionSurface } from '@/lib/ai-motion/MotionPriorityEngine';
import {
  buildMotionSequence,
  type MotionSequenceRecord,
} from '@/lib/ai-motion/MotionSequenceEngine';
import type { MotionDurationKey } from '@/lib/ai-motion/MotionTimingEngine';

export type MotionDirective = {
  directiveId: string;
  surface: MotionSurface;
  durationKey: MotionDurationKey;
  priority: 'critical' | 'high' | 'medium' | 'low';
  sequence: MotionSequenceRecord;
  approved: boolean;
  createdAt: number;
};

const directives = new Map<string, MotionDirective>();

export function directMotion(input: {
  directiveId: string;
  surface: MotionSurface;
  durationKey: MotionDurationKey;
  emphasis: 'intro' | 'performance' | 'reaction';
}): MotionDirective {
  const priority = resolveMotionPriority(input.surface);
  const sequence = buildMotionSequence({
    sequenceId: input.directiveId,
    durationKey: input.durationKey,
    emphasis: input.emphasis,
  });

  const next: MotionDirective = {
    directiveId: input.directiveId,
    surface: input.surface,
    durationKey: input.durationKey,
    priority,
    sequence,
    approved: sequence.totalDurationMs > 0,
    createdAt: Date.now(),
  };

  directives.set(next.directiveId, next);
  return next;
}

export function listMotionDirectives(): MotionDirective[] {
  return [...directives.values()].sort((a, b) => b.createdAt - a.createdAt);
}
