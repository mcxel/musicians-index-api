export type MotionDurationSeconds = 2 | 4 | 5 | 6 | 7;

export function normalizeMotionDuration(input: number): MotionDurationSeconds {
  const allowed: MotionDurationSeconds[] = [2, 4, 5, 6, 7];
  let nearest = allowed[0];
  let diff = Math.abs(input - nearest);
  for (const value of allowed) {
    const nextDiff = Math.abs(input - value);
    if (nextDiff < diff) {
      nearest = value;
      diff = nextDiff;
    }
  }
  return nearest;
}

export function getFrameCount(duration: MotionDurationSeconds, fps = 30): number {
  return duration * fps;
}
