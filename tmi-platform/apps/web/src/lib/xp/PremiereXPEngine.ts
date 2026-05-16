/**
 * PremiereXPEngine.ts
 *
 * Rewards track/album/special premieres.
 * Bonus for: track premiere, single premiere, album premiere, music video premiere, comedy special, performance special, exclusive drop, world release event.
 * Purpose: Celebrate major releases and exclusive events.
 */

export interface Premiere {
  premiereId: string;
  artistId: string;
  premiereType:
    | 'track'
    | 'single'
    | 'album'
    | 'music-video'
    | 'comedy-special'
    | 'performance-special'
    | 'exclusive-drop'
    | 'world-release';
  title: string;
  createdAt: number;
  premieredAt?: number;
  views: number;
  shares: number;
  tips: number;
  xpEarned: number;
  chartContribution: 'country' | 'genre' | 'global'; // which chart it feeds
}

// In-memory registry
const premieres = new Map<string, Premiere>();
let premiereCounter = 0;

const PREMIERE_XP_BASE: Record<Premiere['premiereType'], number> = {
  track: 50,
  single: 75,
  album: 150,
  'music-video': 100,
  'comedy-special': 100,
  'performance-special': 75,
  'exclusive-drop': 60,
  'world-release': 200,
};

/**
 * Creates premiere event.
 */
export function createPremiere(input: {
  artistId: string;
  premiereType: Premiere['premiereType'];
  title: string;
  chartContribution: 'country' | 'genre' | 'global';
}): string {
  const premiereId = `premiere-${premiereCounter++}`;

  const premiere: Premiere = {
    premiereId,
    artistId: input.artistId,
    premiereType: input.premiereType,
    title: input.title,
    createdAt: Date.now(),
    views: 0,
    shares: 0,
    tips: 0,
    xpEarned: PREMIERE_XP_BASE[input.premiereType],
    chartContribution: input.chartContribution,
  };

  premieres.set(premiereId, premiere);
  return premiereId;
}

/**
 * Records premiere moment.
 */
export function recordPremiereWentLive(premiereId: string): void {
  const premiere = premieres.get(premiereId);
  if (premiere) {
    premiere.premieredAt = Date.now();
  }
}

/**
 * Records view/share/tip on premiere.
 */
export function recordPremiereEngagement(
  premiereId: string,
  engagementType: 'view' | 'share' | 'tip'
): void {
  const premiere = premieres.get(premiereId);
  if (!premiere) return;

  if (engagementType === 'view') {
    premiere.views += 1;
  } else if (engagementType === 'share') {
    premiere.shares += 1;
  } else if (engagementType === 'tip') {
    premiere.tips += 1;
  }

  // Recalculate XP with bonuses
  const baseXP = PREMIERE_XP_BASE[premiere.premiereType];
  const viewBonus = Math.min(premiere.views * 0.1, 200);
  const shareBonus = premiere.shares * 5;
  const tipBonus = premiere.tips * 10;

  premiere.xpEarned = baseXP + viewBonus + shareBonus + tipBonus;
}

/**
 * Gets premiere (non-mutating).
 */
export function getPremiere(premiereId: string): Premiere | null {
  return premieres.get(premiereId) ?? null;
}

/**
 * Lists premieres by artist.
 */
export function listPremieresByArtist(artistId: string): Premiere[] {
  return Array.from(premieres.values()).filter((p) => p.artistId === artistId);
}

/**
 * Gets most engaged premiere.
 */
export function getMostEngagedPremiere(): Premiere | null {
  const all = Array.from(premieres.values());
  if (all.length === 0) return null;
  return all.reduce((a, b) =>
    b.views + b.shares * 2 + b.tips * 5 > a.views + a.shares * 2 + a.tips * 5 ? b : a
  );
}
