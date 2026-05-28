export type CinematicBudget = 'high' | 'balanced' | 'safe';

export function resolveCinematicBudget(input: {
  reducedMotion: boolean;
  hardwareConcurrency?: number;
  deviceMemory?: number;
}): CinematicBudget {
  if (input.reducedMotion) return 'safe';

  const cores = input.hardwareConcurrency ?? 4;
  const memory = input.deviceMemory ?? 4;

  if (cores >= 8 && memory >= 8) return 'high';
  if (cores <= 2 || memory <= 2) return 'safe';
  return 'balanced';
}
