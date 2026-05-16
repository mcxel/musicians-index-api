/**
 * AdRotationEngine
 * Ad slot rotation with impression tracking, frequency capping, and sponsor attribution.
 */

import { emitEvent } from '@/lib/analytics/PersonaAnalyticsEngine';

export type AdPlacement =
  | "lobby_billboard"
  | "pre_show_interstitial"
  | "show_lower_third"
  | "ticket_stub_banner"
  | "magazine_sidebar"
  | "fan_hub_banner"
  | "arena_scoreboard";

export type AdMedia = {
  mediaId: string;
  type: "image" | "video" | "html_embed";
  url: string;
  thumbnailUrl?: string;
  durationSec?: number;
};

export type Ad = {
  adId: string;
  sponsorId: string;
  sponsorName: string;
  title: string;
  placement: AdPlacement;
  media: AdMedia;
  targetUrl: string;
  active: boolean;
  priority: number;
  impressions: number;
  clicks: number;
  maxImpressions: number | null;
  startAtMs: number;
  endAtMs: number | null;
  frequencyCapPerUser: number | null;
};

export type ImpressionRecord = {
  adId: string;
  userId: string;
  placement: AdPlacement;
  seenAtMs: number;
};

export class AdRotationEngine {
  private readonly ads: Map<string, Ad> = new Map();
  private readonly userImpressions: Map<string, ImpressionRecord[]> = new Map();
  private readonly slotCursors: Map<AdPlacement, number> = new Map();

  registerAd(ad: Ad): void {
    this.ads.set(ad.adId, ad);
  }

  getNextAd(placement: AdPlacement, userId: string): Ad | null {
    const eligible = [...this.ads.values()].filter((a) => {
      if (!a.active) return false;
      if (a.placement !== placement) return false;
      if (a.endAtMs && Date.now() > a.endAtMs) return false;
      if (a.maxImpressions !== null && a.impressions >= a.maxImpressions) return false;

      if (a.frequencyCapPerUser !== null) {
        const userImp = this.userImpressions.get(userId) ?? [];
        const seen = userImp.filter((r) => r.adId === a.adId).length;
        if (seen >= a.frequencyCapPerUser) return false;
      }

      return true;
    }).sort((a, b) => b.priority - a.priority);

    if (eligible.length === 0) return null;

    const cursor = this.slotCursors.get(placement) ?? 0;
    const next = eligible[cursor % eligible.length];
    this.slotCursors.set(placement, (cursor + 1) % eligible.length);

    return next;
  }

  recordImpression(adId: string, userId: string, placement: AdPlacement): void {
    const ad = this.ads.get(adId);
    if (!ad) return;

    ad.impressions += 1;

    const userImp = this.userImpressions.get(userId) ?? [];
    userImp.push({ adId, userId, placement, seenAtMs: Date.now() });
    this.userImpressions.set(userId, userImp);

    emitEvent({ eventName: 'advertiser.impression', domain: 'advertiser', userId, assetId: adId, meta: { placement, sponsorId: ad.sponsorId } });
  }

  recordClick(adId: string): void {
    const ad = this.ads.get(adId);
    if (ad) {
      ad.clicks += 1;
      emitEvent({ eventName: 'advertiser.click', domain: 'advertiser', assetId: adId, meta: { sponsorId: ad.sponsorId } });
    }
  }

  deactivate(adId: string): void {
    const ad = this.ads.get(adId);
    if (ad) ad.active = false;
  }

  getStats(adId: string): { impressions: number; clicks: number; ctr: number } | null {
    const ad = this.ads.get(adId);
    if (!ad) return null;
    const ctr = ad.impressions === 0 ? 0 : Math.round((ad.clicks / ad.impressions) * 1000) / 10;
    return { impressions: ad.impressions, clicks: ad.clicks, ctr };
  }

  getActiveAds(placement?: AdPlacement): Ad[] {
    return [...this.ads.values()].filter(
      (a) => a.active && (!placement || a.placement === placement),
    );
  }
}

export const adRotationEngine = new AdRotationEngine();
