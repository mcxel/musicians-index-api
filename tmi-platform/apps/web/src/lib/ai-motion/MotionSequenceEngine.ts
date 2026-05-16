import { getMotionTiming, type MotionDurationKey } from '@/lib/ai-motion/MotionTimingEngine';

export type MotionSequenceStep = {
  stepId: string;
  name: string;
  durationMs: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
};

export type MotionSequenceRecord = {
  sequenceId: string;
  durationKey: MotionDurationKey;
  totalDurationMs: number;
  steps: MotionSequenceStep[];
};

export function buildMotionSequence(input: {
  sequenceId: string;
  durationKey: MotionDurationKey;
  emphasis: 'intro' | 'performance' | 'reaction';
}): MotionSequenceRecord {
  const timing = getMotionTiming(input.durationKey);
  const base = Math.round(timing.durationMs / 4);

  const steps: MotionSequenceStep[] = [
    {
      stepId: `${input.sequenceId}-phase-1`,
      name: 'establish',
      durationMs: base,
      easing: 'ease-in',
    },
    {
      stepId: `${input.sequenceId}-phase-2`,
      name: input.emphasis,
      durationMs: base * 2,
      easing: 'linear',
    },
    {
      stepId: `${input.sequenceId}-phase-3`,
      name: 'resolve',
      durationMs: timing.durationMs - base * 3,
      easing: 'ease-out',
    },
  ];

  return {
    sequenceId: input.sequenceId,
    durationKey: input.durationKey,
    totalDurationMs: timing.durationMs,
    steps,
  };
}
