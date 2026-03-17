/**
 * AdEngine.ts
 * Purpose: Single source of truth for ad placement, frequency caps, pacing, and session tracking.
 * Placement: packages/engines/src/AdEngine.ts
 *            Import via @tmi/engines/AdEngine
 * Depends on: TierEngine
 */

import { Tier, getAdConfig, AdFrequencyConfig, resolvePriority } from './TierEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdFormat = 'PRE_ROLL' | 'MID_ROLL' | 'BANNER' | 'INTERSTITIAL' | 'SPONSOR_BUMPER' | 'OVERLAY';

export type AdContext = 'LIVE_EVENT' | 'MAGAZINE' | 'PROFILE' | 'REPLAY' | 'NAVIGATION';

export interface Ad {
  id: string;
  sponsorId: string;
  format: AdFormat;
  creativeUrl: string;        // video URL or image URL
  clickThroughUrl: string;
  durationSeconds?: number;   // for video ads
  allowedContexts: AdContext[];
  tierMinimum: Tier;          // only show to this tier and above
  priority: number;           // 1–100 higher = shown first
  campaignId: string;
  impressionsCap?: number;    // total campaign cap
  impressionsDelivered: number;
  isActive: boolean;
}

export interface AdSession {
  userId: string;
  tier: Tier;
  sessionStartAt: Date;
  adsShownCount: number;
  lastAdShownAt?: Date;
  preRollEventCount: number;  // how many events seen since last pre-roll
  midRollMinutesSinceLastAd: number;
  adsDismissed: string[];     // ad IDs
}

export interface AdDecision {
  shouldShowAd: boolean;
  ad: Ad | null;
  reason: string;
  nextEligibleAt?: Date;
}

// ─── Critical Event Protection ────────────────────────────────────────────────

/** Events during which ads are NEVER shown */
export const AD_BLACKOUT_EVENTS = [
  'VOTING_ACTIVE',
  'BATTLE_ACTIVE',
  'DOOR_REVEAL',
  'WINNER_ANNOUNCEMENT',
  'JUDGE_DELIBERATION',
] as const;
export type AdBlackoutEvent = typeof AD_BLACKOUT_EVENTS[number];

// ─── Pure Functions ───────────────────────────────────────────────────────────

/** Determine whether an ad should play given current session state */
export function shouldShowAd(
  session: AdSession,
  format: AdFormat,
  context: AdContext,
  currentBlackout?: AdBlackoutEvent,
): AdDecision {
  // NEVER show during critical events
  if (currentBlackout && AD_BLACKOUT_EVENTS.includes(currentBlackout)) {
    return { shouldShowAd: false, ad: null, reason: `AD_BLACKOUT: ${currentBlackout}` };
  }

  const config = getAdConfig(session.tier);

  // DIAMOND tier — no ads
  if (session.tier === 'DIAMOND') {
    return { shouldShowAd: false, ad: null, reason: 'TIER_DIAMOND_NO_ADS' };
  }

  // Check session cap
  if (session.adsShownCount >= config.maxAdsPerSession) {
    return { shouldShowAd: false, ad: null, reason: 'SESSION_CAP_REACHED' };
  }

  if (format === 'PRE_ROLL') {
    if (config.preRollFrequency === 0) return { shouldShowAd: false, ad: null, reason: 'PRE_ROLL_DISABLED' };
    const eligible = session.preRollEventCount >= config.preRollFrequency;
    return {
      shouldShowAd: eligible,
      ad: null,
      reason: eligible ? 'PRE_ROLL_ELIGIBLE' : 'PRE_ROLL_FREQUENCY_NOT_MET',
    };
  }

  if (format === 'MID_ROLL') {
    if (!config.midRollEnabled) return { shouldShowAd: false, ad: null, reason: 'MID_ROLL_DISABLED' };
    const eligible = session.midRollMinutesSinceLastAd >= config.midRollFrequency;
    return {
      shouldShowAd: eligible,
      ad: null,
      reason: eligible ? 'MID_ROLL_ELIGIBLE' : 'MID_ROLL_FREQUENCY_NOT_MET',
    };
  }

  if (format === 'BANNER') {
    if (!config.bannerEnabled) return { shouldShowAd: false, ad: null, reason: 'BANNER_DISABLED' };
    return { shouldShowAd: true, ad: null, reason: 'BANNER_ELIGIBLE' };
  }

  if (format === 'INTERSTITIAL') {
    if (!config.interstitialEnabled) return { shouldShowAd: false, ad: null, reason: 'INTERSTITIAL_DISABLED' };
    return { shouldShowAd: true, ad: null, reason: 'INTERSTITIAL_ELIGIBLE' };
  }

  return { shouldShowAd: false, ad: null, reason: 'FORMAT_NOT_HANDLED' };
}

/** Select the best ad from inventory for a user */
export function selectAd(
  ads: Ad[],
  tier: Tier,
  format: AdFormat,
  context: AdContext,
): Ad | null {
  const eligible = ads
    .filter(ad =>
      ad.isActive &&
      ad.format === format &&
      ad.allowedContexts.includes(context) &&
      (!ad.impressionsCap || ad.impressionsDelivered < ad.impressionsCap)
    )
    .sort((a, b) => b.priority - a.priority);

  return eligible[0] ?? null;
}

/** Update session after showing an ad */
export function recordAdImpression(session: AdSession, format: AdFormat): AdSession {
  return {
    ...session,
    adsShownCount: session.adsShownCount + 1,
    lastAdShownAt: new Date(),
    preRollEventCount: format === 'PRE_ROLL' ? 0 : session.preRollEventCount,
    midRollMinutesSinceLastAd: format === 'MID_ROLL' ? 0 : session.midRollMinutesSinceLastAd,
  };
}

/** Increment event count (call when user enters a new event/page) */
export function incrementEventCount(session: AdSession): AdSession {
  return { ...session, preRollEventCount: session.preRollEventCount + 1 };
}

/** Increment live watch time (call every minute during live) */
export function incrementLiveMinutes(session: AdSession, minutes: number = 1): AdSession {
  return {
    ...session,
    midRollMinutesSinceLastAd: session.midRollMinutesSinceLastAd + minutes,
  };
}

/** Track ad feedback for density adjustment */
export interface AdFeedbackMetrics {
  sessionDropOffRate: number;   // 0–1, higher = more drop-off after ads
  avgSessionDuration: number;   // minutes
  tierUpgradeAfterAd: number;   // 0–1, probability of upgrading after seeing ad
}

/** Recommend density adjustment based on feedback */
export function recommendDensityAdjustment(metrics: AdFeedbackMetrics): 'INCREASE' | 'MAINTAIN' | 'DECREASE' {
  if (metrics.sessionDropOffRate > 0.3) return 'DECREASE';
  if (metrics.sessionDropOffRate < 0.1 && metrics.tierUpgradeAfterAd > 0.05) return 'INCREASE';
  return 'MAINTAIN';
}
