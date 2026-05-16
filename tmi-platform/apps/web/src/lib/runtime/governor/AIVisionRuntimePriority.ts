export type AIVisionTier = 0 | 1 | 2 | 3;

export type AIVisionWorkload =
  | 'live-performer'
  | 'host'
  | 'home-1-orbit-face'
  | 'crown-center'
  | 'venue-screen'
  | 'sponsor'
  | 'advertiser'
  | 'ticket'
  | 'nft'
  | 'fan-upload'
  | 'gallery'
  | 'profile-image'
  | 'archive-pdf'
  | 'historical-magazine'
  | 'unused-environment';

const tierByWorkload: Record<AIVisionWorkload, AIVisionTier> = {
  'live-performer': 0,
  host: 0,
  'home-1-orbit-face': 0,
  'crown-center': 0,
  'venue-screen': 0,
  sponsor: 1,
  advertiser: 1,
  ticket: 1,
  nft: 1,
  'fan-upload': 2,
  gallery: 2,
  'profile-image': 2,
  'archive-pdf': 3,
  'historical-magazine': 3,
  'unused-environment': 3,
};

export function getAIVisionTier(workload: AIVisionWorkload): AIVisionTier {
  return tierByWorkload[workload];
}

export function sortAIVisionQueue<T extends { workload: AIVisionWorkload; enqueuedAtMs: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const tierDelta = getAIVisionTier(a.workload) - getAIVisionTier(b.workload);
    if (tierDelta !== 0) return tierDelta;
    return a.enqueuedAtMs - b.enqueuedAtMs;
  });
}

export function getAIVisionPriorityDiagnostics() {
  return {
    tier0: Object.entries(tierByWorkload).filter(([, tier]) => tier === 0).map(([w]) => w),
    tier1: Object.entries(tierByWorkload).filter(([, tier]) => tier === 1).map(([w]) => w),
    tier2: Object.entries(tierByWorkload).filter(([, tier]) => tier === 2).map(([w]) => w),
    tier3: Object.entries(tierByWorkload).filter(([, tier]) => tier === 3).map(([w]) => w),
  };
}
