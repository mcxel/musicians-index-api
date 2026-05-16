/**
 * BeatLabEngine
 * Beat creation workflow, licensing, and purchase tracking.
 */

export type BeatStatus = "draft" | "processing" | "published" | "archived";

export type BeatLicenseType = "basic" | "premium" | "exclusive" | "free";

export type BeatLicense = {
  licenseId: string;
  type: BeatLicenseType;
  priceUsd: number;
  allowsCommercial: boolean;
  creditsRequired: boolean;
};

export type Beat = {
  beatId: string;
  producerId: string;
  producerName: string;
  title: string;
  genre: string;
  bpm: number;
  musicalKey: string;
  durationSec: number;
  previewUrl: string | null;
  fullTrackUrl: string | null;
  status: BeatStatus;
  tags: string[];
  licenses: BeatLicense[];
  createdAtMs: number;
  publishedAtMs: number | null;
  plays: number;
  purchases: number;
};

export type BeatPurchase = {
  purchaseId: string;
  beatId: string;
  buyerUserId: string;
  licenseType: BeatLicenseType;
  amountUsd: number;
  purchasedAtMs: number;
};

const DEFAULT_LICENSES: Omit<BeatLicense, "licenseId">[] = [
  { type: "basic", priceUsd: 29.99, allowsCommercial: false, creditsRequired: true },
  { type: "premium", priceUsd: 99.99, allowsCommercial: true, creditsRequired: true },
  { type: "exclusive", priceUsd: 499.99, allowsCommercial: true, creditsRequired: false },
];

let _beatSeq = 0;
let _purchaseSeq = 0;

export class BeatLabEngine {
  private readonly beats: Map<string, Beat> = new Map();
  private readonly purchases: BeatPurchase[] = [];

  createBeat(params: {
    producerId: string;
    producerName: string;
    title: string;
    genre: string;
    bpm: number;
    musicalKey: string;
    durationSec?: number;
    tags?: string[];
  }): Beat {
    const beatId = `beat-${Date.now()}-${++_beatSeq}`;
    const beat: Beat = {
      beatId,
      producerId: params.producerId,
      producerName: params.producerName,
      title: params.title,
      genre: params.genre,
      bpm: params.bpm,
      musicalKey: params.musicalKey,
      durationSec: params.durationSec ?? 0,
      previewUrl: null,
      fullTrackUrl: null,
      status: "draft",
      tags: params.tags ?? [],
      licenses: DEFAULT_LICENSES.map((license, index) => ({
        ...license,
        licenseId: `${beatId}-license-${index + 1}`,
      })),
      createdAtMs: Date.now(),
      publishedAtMs: null,
      plays: 0,
      purchases: 0,
    };

    this.beats.set(beatId, beat);
    return beat;
  }

  publish(beatId: string): void {
    const beat = this.beats.get(beatId);
    if (!beat || beat.status === "archived") return;
    beat.status = "published";
    beat.publishedAtMs = Date.now();
  }

  archive(beatId: string): void {
    const beat = this.beats.get(beatId);
    if (!beat) return;
    beat.status = "archived";
  }

  updateMedia(beatId: string, previewUrl: string | null, fullTrackUrl: string | null, durationSec: number): void {
    const beat = this.beats.get(beatId);
    if (!beat) return;
    beat.previewUrl = previewUrl;
    beat.fullTrackUrl = fullTrackUrl;
    beat.durationSec = durationSec;
  }

  incrementPlay(beatId: string): void {
    const beat = this.beats.get(beatId);
    if (!beat) return;
    beat.plays += 1;
  }

  purchaseBeat(beatId: string, buyerUserId: string, licenseType: BeatLicenseType): BeatPurchase | null {
    const beat = this.beats.get(beatId);
    if (!beat || beat.status !== "published") return null;

    const license = beat.licenses.find((item) => item.type === licenseType);
    if (!license) return null;

    beat.purchases += 1;
    const purchase: BeatPurchase = {
      purchaseId: `beat-purchase-${Date.now()}-${++_purchaseSeq}`,
      beatId,
      buyerUserId,
      licenseType,
      amountUsd: license.priceUsd,
      purchasedAtMs: Date.now(),
    };

    this.purchases.unshift(purchase);
    return purchase;
  }

  getBeat(beatId: string): Beat | null {
    return this.beats.get(beatId) ?? null;
  }

  getPublishedBeats(genre?: string): Beat[] {
    return [...this.beats.values()]
      .filter((beat) => beat.status === "published" && (!genre || beat.genre === genre))
      .sort((a, b) => (b.publishedAtMs ?? 0) - (a.publishedAtMs ?? 0));
  }

  getProducerBeats(producerId: string): Beat[] {
    return [...this.beats.values()].filter((beat) => beat.producerId === producerId);
  }

  getRecentPurchases(limit = 25): BeatPurchase[] {
    return this.purchases.slice(0, Math.max(1, limit));
  }
}

export const beatLabEngine = new BeatLabEngine();
