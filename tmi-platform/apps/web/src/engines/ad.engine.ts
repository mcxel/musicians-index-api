/**
 * Ad Engine — Client-Side
 * Handles ad placement, targeting, impression tracking, click tracking,
 * frequency capping, and sponsor ad rendering for the TMI Platform.
 *
 * Connects to: /api/ads/* REST endpoints
 * Integrates with: SponsorsModule, AnalyticsModule
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AdFormat = 'BANNER' | 'SIDEBAR' | 'INTERSTITIAL' | 'NATIVE' | 'VIDEO' | 'OVERLAY' | 'SPONSOR_STRIP';
export type AdPlacement =
  | 'HOME_TOP' | 'HOME_MID' | 'HOME_BOTTOM'
  | 'MAGAZINE_SIDEBAR' | 'MAGAZINE_INLINE' | 'ARTICLE_TOP' | 'ARTICLE_BOTTOM'
  | 'ROOM_OVERLAY' | 'LOBBY_BANNER' | 'LOBBY_SIDEBAR'
  | 'LEADERBOARD_TOP' | 'EVENTS_SIDEBAR' | 'STORE_BANNER'
  | 'MOBILE_STICKY' | 'DESKTOP_RAIL';

export type AdStatus = 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'PENDING';
export type AdTargetingType = 'BROAD' | 'GENRE' | 'LOCATION' | 'TIER' | 'BEHAVIOR';

export interface AdTargeting {
  genres?: string[];
  locations?: string[];
  tiers?: Array<'FREE' | 'SUPPORTER' | 'PRO' | 'ELITE'>;
  ageRange?: { min: number; max: number };
  interests?: string[];
  excludeOwned?: boolean;
}

export interface Ad {
  id: string;
  sponsorId: string;
  sponsorName: string;
  sponsorLogoUrl?: string;
  title: string;
  body?: string;
  imageUrl?: string;
  videoUrl?: string;
  ctaText: string;
  ctaUrl: string;
  format: AdFormat;
  placement: AdPlacement;
  targeting: AdTargeting;
  status: AdStatus;
  priority: number;
  startDate: number;
  endDate: number;
  impressionGoal?: number;
  clickGoal?: number;
  impressionCount: number;
  clickCount: number;
  ctr: number;
}

export interface AdSlotConfig {
  placement: AdPlacement;
  format: AdFormat;
  width?: number;
  height?: number;
  maxAds?: number;
  refreshIntervalMs?: number;
  fallbackAd?: Partial<Ad>;
}

export interface ImpressionRecord {
  adId: string;
  placement: AdPlacement;
  timestamp: number;
  sessionId: string;
}

export interface ClickRecord {
  adId: string;
  placement: AdPlacement;
  timestamp: number;
  sessionId: string;
}

// ─── Ad Engine ─────────────────────────────────────────────────────────────────

export class AdEngine {
  private baseUrl: string;
  private sessionId: string;
  private impressions: Map<string, ImpressionRecord[]> = new Map();
  private clicks: Map<string, ClickRecord[]> = new Map();
  private frequencyCap: Map<string, number> = new Map();
  private loadedAds: Map<AdPlacement, Ad[]> = new Map();
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private refreshTimers: Map<AdPlacement, ReturnType<typeof setInterval>> = new Map();
  private userContext: { tier?: string; genres?: string[]; location?: string } = {};

  // Max impressions per ad per session
  private readonly MAX_IMPRESSIONS_PER_SESSION = 5;
  // Min ms between same-ad impressions
  private readonly MIN_IMPRESSION_INTERVAL_MS = 30_000;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  // ─── Event Bus ─────────────────────────────────────────────────────────────

  on(event: string, listener: (...args: unknown[]) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  private fire(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }

  // ─── User Context ───────────────────────────────────────────────────────────

  setUserContext(ctx: { tier?: string; genres?: string[]; location?: string }): void {
    this.userContext = { ...this.userContext, ...ctx };
  }

  // ─── Frequency Capping ──────────────────────────────────────────────────────

  private canShowAd(adId: string): boolean {
    const count = this.frequencyCap.get(adId) ?? 0;
    if (count >= this.MAX_IMPRESSIONS_PER_SESSION) return false;

    const records = this.impressions.get(adId) ?? [];
    if (records.length > 0) {
      const lastImpression = records[records.length - 1];
      if (Date.now() - lastImpression.timestamp < this.MIN_IMPRESSION_INTERVAL_MS) return false;
    }
    return true;
  }

  private recordImpression(adId: string, placement: AdPlacement): void {
    const record: ImpressionRecord = { adId, placement, timestamp: Date.now(), sessionId: this.sessionId };
    if (!this.impressions.has(adId)) this.impressions.set(adId, []);
    this.impressions.get(adId)!.push(record);
    this.frequencyCap.set(adId, (this.frequencyCap.get(adId) ?? 0) + 1);

    // Fire-and-forget impression ping
    this.pingImpression(adId, placement).catch(() => null);
    this.fire('impression', record);
  }

  // ─── Ad Selection ───────────────────────────────────────────────────────────

  getAdsForPlacement(placement: AdPlacement, limit = 1): Ad[] {
    const ads = this.loadedAds.get(placement) ?? [];
    return ads
      .filter(ad => ad.status === 'ACTIVE' && this.canShowAd(ad.id))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }

  getBestAd(placement: AdPlacement): Ad | null {
    const ads = this.getAdsForPlacement(placement, 1);
    return ads[0] ?? null;
  }

  markAdShown(adId: string, placement: AdPlacement): void {
    this.recordImpression(adId, placement);
  }

  handleAdClick(adId: string, placement: AdPlacement): void {
    const record: ClickRecord = { adId, placement, timestamp: Date.now(), sessionId: this.sessionId };
    if (!this.clicks.has(adId)) this.clicks.set(adId, []);
    this.clicks.get(adId)!.push(record);

    this.pingClick(adId, placement).catch(() => null);
    this.fire('click', record);
  }

  // ─── Slot Management ────────────────────────────────────────────────────────

  registerSlot(config: AdSlotConfig): () => void {
    // Load ads for this placement
    this.loadAdsForPlacement(config.placement).catch(() => null);

    // Set up refresh if configured
    if (config.refreshIntervalMs && config.refreshIntervalMs > 0) {
      const timer = setInterval(() => {
        this.loadAdsForPlacement(config.placement).catch(() => null);
      }, config.refreshIntervalMs);
      this.refreshTimers.set(config.placement, timer);
    }

    // Return cleanup function
    return () => {
      const timer = this.refreshTimers.get(config.placement);
      if (timer) {
        clearInterval(timer);
        this.refreshTimers.delete(config.placement);
      }
    };
  }

  destroyAllSlots(): void {
    this.refreshTimers.forEach(timer => clearInterval(timer));
    this.refreshTimers.clear();
    this.loadedAds.clear();
  }

  // ─── Analytics Accessors ────────────────────────────────────────────────────

  getImpressionCount(adId: string): number {
    return this.impressions.get(adId)?.length ?? 0;
  }

  getClickCount(adId: string): number {
    return this.clicks.get(adId)?.length ?? 0;
  }

  getSessionCTR(): number {
    let totalImpressions = 0;
    let totalClicks = 0;
    this.impressions.forEach(records => { totalImpressions += records.length; });
    this.clicks.forEach(records => { totalClicks += records.length; });
    return totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  }

  // ─── REST API ───────────────────────────────────────────────────────────────

  async loadAdsForPlacement(placement: AdPlacement): Promise<Ad[]> {
    try {
      const params = new URLSearchParams({ placement });
      if (this.userContext.tier) params.set('tier', this.userContext.tier);
      if (this.userContext.location) params.set('location', this.userContext.location);
      if (this.userContext.genres?.length) params.set('genres', this.userContext.genres.join(','));

      const res = await fetch(`${this.baseUrl}/ads?${params}`, { credentials: 'include' });
      if (!res.ok) return [];

      const ads = await res.json() as Ad[];
      this.loadedAds.set(placement, ads);
      this.fire('ads_loaded', { placement, count: ads.length });
      return ads;
    } catch {
      return [];
    }
  }

  async loadAllPlacements(placements: AdPlacement[]): Promise<void> {
    await Promise.allSettled(placements.map(p => this.loadAdsForPlacement(p)));
  }

  private async pingImpression(adId: string, placement: AdPlacement): Promise<void> {
    await fetch(`${this.baseUrl}/ads/${adId}/impression`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placement, sessionId: this.sessionId }),
    });
  }

  private async pingClick(adId: string, placement: AdPlacement): Promise<void> {
    await fetch(`${this.baseUrl}/ads/${adId}/click`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placement, sessionId: this.sessionId }),
    });
  }

  async fetchSponsorAds(sponsorId: string): Promise<Ad[]> {
    const res = await fetch(`${this.baseUrl}/ads/sponsor/${sponsorId}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Sponsor ads fetch failed: ${res.status}`);
    return res.json() as Promise<Ad[]>;
  }

  async fetchAdStats(adId: string): Promise<{ impressions: number; clicks: number; ctr: number }> {
    const res = await fetch(`${this.baseUrl}/ads/${adId}/stats`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Ad stats fetch failed: ${res.status}`);
    return res.json();
  }
}

// ─── Singleton Export ──────────────────────────────────────────────────────────

export const adEngine = new AdEngine();

export function useAdEngine(): AdEngine {
  return adEngine;
}
