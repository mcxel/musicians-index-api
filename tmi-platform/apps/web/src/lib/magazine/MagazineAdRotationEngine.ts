/**
 * MagazineAdRotationEngine
 * Sponsor and advertiser placement in magazine issues: slot filling, impression caps, rotation.
 */

export type AdSlot = "cover-back" | "full-page" | "half-page" | "sidebar" | "banner" | "inline" | "sponsor-bar";
export type AdStatus = "active" | "paused" | "exhausted" | "expired" | "pending-approval";

export interface MagazineAd {
  id: string;
  sponsorId: string;
  sponsorName: string;
  slot: AdSlot;
  imageUrl: string;
  linkUrl?: string;
  altText: string;
  maxImpressions: number;
  currentImpressions: number;
  maxClicks: number;
  currentClicks: number;
  status: AdStatus;
  startDate: string;
  endDate: string;
  issueIds?: string[];        // if null, runs in all issues
  priority: number;           // higher = shown first
  priceCentsPerImpression: number;
  totalSpendCents: number;
}

export interface SlotFill {
  slot: AdSlot;
  ad: MagazineAd | null;
  isFallback: boolean;
}

export interface AdRotationSnapshot {
  issueId: string;
  filledSlots: SlotFill[];
  totalImpressions: number;
  totalClicks: number;
  activeAds: number;
  revenue: number; // cents
}

const ALL_SLOTS: AdSlot[] = ["cover-back", "full-page", "half-page", "sidebar", "banner", "inline", "sponsor-bar"];

export class MagazineAdRotationEngine {
  private static _instance: MagazineAdRotationEngine | null = null;

  private _ads: Map<string, MagazineAd> = new Map();
  private _listeners: Set<(ad: MagazineAd) => void> = new Set();

  static getInstance(): MagazineAdRotationEngine {
    if (!MagazineAdRotationEngine._instance) {
      MagazineAdRotationEngine._instance = new MagazineAdRotationEngine();
    }
    return MagazineAdRotationEngine._instance;
  }

  // ── Ad management ──────────────────────────────────────────────────────────

  addAd(ad: Omit<MagazineAd, "id" | "currentImpressions" | "currentClicks" | "totalSpendCents">): MagazineAd {
    const full: MagazineAd = {
      ...ad,
      id: Math.random().toString(36).slice(2),
      currentImpressions: 0,
      currentClicks: 0,
      totalSpendCents: 0,
    };
    this._ads.set(full.id, full);
    return full;
  }

  pauseAd(adId: string): void {
    const ad = this._ads.get(adId);
    if (ad && ad.status === "active") { ad.status = "paused"; this._emit(ad); }
  }

  resumeAd(adId: string): void {
    const ad = this._ads.get(adId);
    if (ad && ad.status === "paused") { ad.status = "active"; this._emit(ad); }
  }

  // ── Slot filling ───────────────────────────────────────────────────────────

  fillSlots(issueId: string, requestedSlots?: AdSlot[]): SlotFill[] {
    const slots = requestedSlots ?? ALL_SLOTS;
    const today = new Date().toISOString().split("T")[0];

    return slots.map((slot) => {
      const eligible = [...this._ads.values()]
        .filter((ad) =>
          ad.status === "active" &&
          ad.slot === slot &&
          ad.startDate <= today &&
          ad.endDate >= today &&
          ad.currentImpressions < ad.maxImpressions &&
          (!ad.issueIds || ad.issueIds.includes(issueId))
        )
        .sort((a, b) => b.priority - a.priority);

      const ad = eligible[0] ?? null;
      if (ad) {
        ad.currentImpressions++;
        ad.totalSpendCents += ad.priceCentsPerImpression;
        if (ad.currentImpressions >= ad.maxImpressions) {
          ad.status = "exhausted";
        }
        this._emit(ad);
      }

      return { slot, ad, isFallback: !ad };
    });
  }

  // ── Click tracking ─────────────────────────────────────────────────────────

  recordClick(adId: string): void {
    const ad = this._ads.get(adId);
    if (!ad) return;
    ad.currentClicks++;
    if (ad.currentClicks >= ad.maxClicks) {
      ad.status = "exhausted";
    }
    this._emit(ad);
  }

  // ── Snapshot ──────────────────────────────────────────────────────────────

  getSnapshot(issueId: string): AdRotationSnapshot {
    const allAds = [...this._ads.values()];
    return {
      issueId,
      filledSlots: this.fillSlots(issueId),
      totalImpressions: allAds.reduce((s, a) => s + a.currentImpressions, 0),
      totalClicks: allAds.reduce((s, a) => s + a.currentClicks, 0),
      activeAds: allAds.filter((a) => a.status === "active").length,
      revenue: allAds.reduce((s, a) => s + a.totalSpendCents, 0),
    };
  }

  getAdsByStatus(status: AdStatus): MagazineAd[] {
    return [...this._ads.values()].filter((a) => a.status === status);
  }

  getAdsBySponsor(sponsorId: string): MagazineAd[] {
    return [...this._ads.values()].filter((a) => a.sponsorId === sponsorId);
  }

  getTotalRevenueCents(): number {
    return [...this._ads.values()].reduce((s, a) => s + a.totalSpendCents, 0);
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onAdChange(cb: (ad: MagazineAd) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(ad: MagazineAd): void {
    for (const cb of this._listeners) cb(ad);
  }
}

export const magazineAdRotationEngine = MagazineAdRotationEngine.getInstance();
