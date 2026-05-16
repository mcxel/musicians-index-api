/**
 * ReleaseXPEngine.ts
 *
 * Rewards new releases: songs, beats, instrumentals, albums, videos, comedy clips, specials, merchandise, NFTs.
 * Bonus for 24-hour milestone, 100 views, 100 shares, 10 tips, first conversion.
 * Purpose: Encourage creators to produce and ship regularly.
 */

export interface Release {
  releaseId: string;
  artistId: string;
  releaseType:
    | 'song'
    | 'beat'
    | 'instrumental'
    | 'album'
    | 'video'
    | 'comedy'
    | 'special'
    | 'merchandise'
    | 'nft';
  title: string;
  createdAt: number;
  releasedAt?: number;
  views: number;
  shares: number;
  tips: number;
  conversions: number; // sales/purchases
  xpEarned: number;
  milestone24HourAchieved: boolean;
  milestone100ViewsAchieved: boolean;
  milestone100SharesAchieved: boolean;
  milestone10TipsAchieved: boolean;
  milestone1stConversionAchieved: boolean;
}

// In-memory registry
const releases = new Map<string, Release>();
let releaseCounter = 0;

const RELEASE_XP_BASE: Record<Release['releaseType'], number> = {
  song: 30,
  beat: 25,
  instrumental: 25,
  album: 80,
  video: 50,
  comedy: 50,
  special: 75,
  merchandise: 40,
  nft: 60,
};

const MILESTONE_BONUSES = {
  hours24: 50,
  views100: 30,
  shares100: 50,
  tips10: 40,
  conversion1st: 60,
};

/**
 * Creates release.
 */
export function createRelease(input: {
  artistId: string;
  releaseType: Release['releaseType'];
  title: string;
}): string {
  const releaseId = `release-${releaseCounter++}`;

  const release: Release = {
    releaseId,
    artistId: input.artistId,
    releaseType: input.releaseType,
    title: input.title,
    createdAt: Date.now(),
    views: 0,
    shares: 0,
    tips: 0,
    conversions: 0,
    xpEarned: RELEASE_XP_BASE[input.releaseType],
    milestone24HourAchieved: false,
    milestone100ViewsAchieved: false,
    milestone100SharesAchieved: false,
    milestone10TipsAchieved: false,
    milestone1stConversionAchieved: false,
  };

  releases.set(releaseId, release);
  return releaseId;
}

/**
 * Records release went live.
 */
export function releaseWentLive(releaseId: string): void {
  const release = releases.get(releaseId);
  if (release) {
    release.releasedAt = Date.now();
  }
}

/**
 * Records engagement metric.
 */
export function recordReleaseEngagement(
  releaseId: string,
  engagementType: 'view' | 'share' | 'tip' | 'conversion'
): void {
  const release = releases.get(releaseId);
  if (!release) return;

  if (engagementType === 'view') {
    release.views += 1;
    if (release.views === 100 && !release.milestone100ViewsAchieved) {
      release.milestone100ViewsAchieved = true;
      release.xpEarned += MILESTONE_BONUSES.views100;
    }
  } else if (engagementType === 'share') {
    release.shares += 1;
    if (release.shares === 100 && !release.milestone100SharesAchieved) {
      release.milestone100SharesAchieved = true;
      release.xpEarned += MILESTONE_BONUSES.shares100;
    }
  } else if (engagementType === 'tip') {
    release.tips += 1;
    if (release.tips === 10 && !release.milestone10TipsAchieved) {
      release.milestone10TipsAchieved = true;
      release.xpEarned += MILESTONE_BONUSES.tips10;
    }
  } else if (engagementType === 'conversion') {
    release.conversions += 1;
    if (release.conversions === 1 && !release.milestone1stConversionAchieved) {
      release.milestone1stConversionAchieved = true;
      release.xpEarned += MILESTONE_BONUSES.conversion1st;
    }
  }
}

/**
 * Checks 24-hour milestone.
 */
export function check24HourMilestone(releaseId: string): void {
  const release = releases.get(releaseId);
  if (!release || !release.releasedAt) return;

  const now = Date.now();
  const elapsed = now - release.releasedAt;
  const hoursElapsed = elapsed / (60 * 60 * 1000);

  if (hoursElapsed >= 24 && !release.milestone24HourAchieved) {
    release.milestone24HourAchieved = true;
    release.xpEarned += MILESTONE_BONUSES.hours24;
  }
}

/**
 * Gets release (non-mutating).
 */
export function getRelease(releaseId: string): Release | null {
  return releases.get(releaseId) ?? null;
}

/**
 * Lists releases by artist.
 */
export function listReleasesByArtist(artistId: string): Release[] {
  return Array.from(releases.values()).filter((r) => r.artistId === artistId);
}

/**
 * Gets top release by engagement.
 */
export function getTopRelease(): Release | null {
  const all = Array.from(releases.values());
  if (all.length === 0) return null;
  return all.reduce((a, b) =>
    b.views * 0.5 + b.shares + b.tips * 2 + b.conversions * 5 >
    a.views * 0.5 + a.shares + a.tips * 2 + a.conversions * 5
      ? b
      : a
  );
}
