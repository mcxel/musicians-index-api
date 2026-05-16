export type MotionDurationKey = '2s' | '4s' | '5s' | '6s' | '7s';

export type MotionTimingRecord = {
  durationKey: MotionDurationKey;
  durationMs: number;
  loop: boolean;
  intendedUse: string[];
};

const MOTION_TIMINGS: Record<MotionDurationKey, MotionTimingRecord> = {
  '2s': {
    durationKey: '2s',
    durationMs: 2000,
    loop: true,
    intendedUse: ['reaction avatars', 'quick billboards'],
  },
  '4s': {
    durationKey: '4s',
    durationMs: 4000,
    loop: true,
    intendedUse: ['host intros', 'room loops'],
  },
  '5s': {
    durationKey: '5s',
    durationMs: 5000,
    loop: true,
    intendedUse: ['artist reels', 'event promos'],
  },
  '6s': {
    durationKey: '6s',
    durationMs: 6000,
    loop: true,
    intendedUse: ['venue displays', 'sponsor loops'],
  },
  '7s': {
    durationKey: '7s',
    durationMs: 7000,
    loop: true,
    intendedUse: ['crown orbit', 'top 10 orbit'],
  },
};

export function getMotionTiming(durationKey: MotionDurationKey): MotionTimingRecord {
  return MOTION_TIMINGS[durationKey];
}

export function listMotionTimings(): MotionTimingRecord[] {
  return Object.values(MOTION_TIMINGS);
}
