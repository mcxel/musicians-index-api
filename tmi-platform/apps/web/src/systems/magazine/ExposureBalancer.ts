import type { ExposureEntry } from './types';

export interface ExposureOrderInput {
  artistId: string;
  exposureCount: number;
  lastSeenAt?: number | null;
  fairnessBoost?: number;
}

export function computeExposureOrder(entries: ExposureOrderInput[]): string[] {
  return [...entries]
    .sort((a, b) => {
      const aScore = a.exposureCount - (a.fairnessBoost ?? 0);
      const bScore = b.exposureCount - (b.fairnessBoost ?? 0);

      if (aScore !== bScore) return aScore - bScore;

      const aSeen = a.lastSeenAt ?? 0;
      const bSeen = b.lastSeenAt ?? 0;
      return aSeen - bSeen;
    })
    .map((entry) => entry.artistId);
}

export function separateExposureFromPrestige<T extends ExposureEntry>(entries: T[]): T[] {
  return [...entries];
}
