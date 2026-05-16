// BEAT MARKETPLACE ENGINE — Beat Sales & Monetization
// Purpose: Enable beat producers to upload, list, and sell beats
// Tracks inventory, sales history, and producer revenue

import { randomUUID } from 'crypto';
import { Analytics } from '@/lib/analytics/PersonaAnalyticsEngine';

export type BeatGenre = 'hip-hop' | 'trap' | 'drill' | 'lo-fi' | 'electronic' | 'r-and-b' | 'pop' | 'rock';
export type BeatLicense = 'exclusive' | 'non-exclusive' | 'lease';
export type BeatStatus = 'draft' | 'active' | 'inactive' | 'sold_exclusive';

export interface Beat {
  id: string;
  producerId: string;
  producerName: string;
  title: string;
  genre: BeatGenre;
  bpm: number;
  key: string;
  duration: number; // seconds
  description?: string;
  tags: string[];
  audioUrl?: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  status: BeatStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BeatListing {
  beatId: string;
  producerId: string;
  priceUSD: number;
  licenseType: BeatLicense;
  exclusivityDays?: number; // for exclusive licenses
  downloads: number;
  revenue: number;
  isActive: boolean;
  listedAt: string;
}

export interface BeatSale {
  id: string;
  beatId: string;
  buyerId: string;
  buyerName: string;
  producerId: string;
  licenseType: BeatLicense;
  priceUSD: number;
  purchasedAt: string;
  downloadCount: number;
}

export interface ProducerStats {
  producerId: string;
  producerName: string;
  totalBeats: number;
  totalSales: number;
  totalRevenue: number;
  avgPrice: number;
  topBeat?: string;
  lastSaleAt?: string;
}

// Beat registry
const BEATS = new Map<string, Beat>();

// Beat listings (beatId → listing)
const LISTINGS = new Map<string, BeatListing>();

// Sales log (saleId → sale)
const SALES = new Map<string, BeatSale>();

// Producer catalog (producerId → beatIds)
const PRODUCER_CATALOG = new Map<string, string[]>();

// Sales by producer (producerId → array of sales)
const PRODUCER_SALES = new Map<string, BeatSale[]>();

export class BeatMarketplaceEngine {
  /**
   * Upload beat
   */
  static async uploadBeat(
    producerId: string,
    producerName: string,
    title: string,
    genre: BeatGenre,
    bpm: number,
    key: string,
    duration: number,
    options?: {
      description?: string;
      tags?: string[];
      audioUrl?: string;
      previewUrl?: string;
      thumbnailUrl?: string;
    }
  ): Promise<Beat> {
    const beatId = randomUUID();

    const beat: Beat = {
      id: beatId,
      producerId,
      producerName,
      title,
      genre,
      bpm,
      key,
      duration,
      description: options?.description,
      tags: options?.tags || [],
      audioUrl: options?.audioUrl,
      previewUrl: options?.previewUrl,
      thumbnailUrl: options?.thumbnailUrl,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    BEATS.set(beatId, beat);

    // Add to producer catalog
    if (!PRODUCER_CATALOG.has(producerId)) {
      PRODUCER_CATALOG.set(producerId, []);
    }
    PRODUCER_CATALOG.get(producerId)!.push(beatId);

    return beat;
  }

  /**
   * List beat for sale
   */
  static async listBeat(
    beatId: string,
    priceUSD: number,
    licenseType: BeatLicense,
    exclusivityDays?: number
  ): Promise<BeatListing | null> {
    const beat = BEATS.get(beatId);
    if (!beat) return null;

    const listing: BeatListing = {
      beatId,
      producerId: beat.producerId,
      priceUSD,
      licenseType,
      exclusivityDays,
      downloads: 0,
      revenue: 0,
      isActive: true,
      listedAt: new Date().toISOString(),
    };

    LISTINGS.set(beatId, listing);

    // Update beat status
    beat.status = 'active';
    beat.updatedAt = new Date().toISOString();

    return listing;
  }

  /**
   * Purchase beat
   */
  static async purchaseBeat(
    beatId: string,
    buyerId: string,
    buyerName: string
  ): Promise<BeatSale | null> {
    const beat = BEATS.get(beatId);
    const listing = LISTINGS.get(beatId);

    if (!beat || !listing || !listing.isActive) {
      return null;
    }

    const sale: BeatSale = {
      id: randomUUID(),
      beatId,
      buyerId,
      buyerName,
      producerId: beat.producerId,
      licenseType: listing.licenseType,
      priceUSD: listing.priceUSD,
      purchasedAt: new Date().toISOString(),
      downloadCount: 0,
    };

    SALES.set(sale.id, sale);

    Analytics.revenue({ userId: buyerId, amount: sale.priceUSD, currency: 'usd', product: `beat-marketplace-${listing.licenseType}`, activePersona: 'fan' });
    Analytics.storefrontView({ userId: buyerId, assetId: beatId, assetType: 'beat-marketplace-purchase' });

    // Update listing
    listing.downloads += 1;
    listing.revenue += listing.priceUSD;

    // Update producer sales
    if (!PRODUCER_SALES.has(beat.producerId)) {
      PRODUCER_SALES.set(beat.producerId, []);
    }
    PRODUCER_SALES.get(beat.producerId)!.push(sale);

    // Check exclusivity: if exclusive and all exclusivity days covered, mark beat as sold_exclusive
    if (listing.licenseType === 'exclusive' && listing.downloads >= 1) {
      beat.status = 'sold_exclusive';
      listing.isActive = false; // No longer available
    }

    return sale;
  }

  /**
   * Get beat listing
   */
  static async getListing(beatId: string): Promise<BeatListing | null> {
    return LISTINGS.get(beatId) || null;
  }

  /**
   * Get beat details
   */
  static async getBeat(beatId: string): Promise<Beat | null> {
    return BEATS.get(beatId) || null;
  }

  /**
   * Browse marketplace (all active listings)
   */
  static async browse(
    genre?: BeatGenre,
    licenseType?: BeatLicense,
    limit: number = 50,
    offset: number = 0
  ): Promise<Array<Beat & { listing: BeatListing }>> {
    let results: Array<Beat & { listing: BeatListing }> = [];

    LISTINGS.forEach((listing) => {
      if (!listing.isActive) return;

      const beat = BEATS.get(listing.beatId);
      if (!beat) return;

      if (genre && beat.genre !== genre) return;
      if (licenseType && listing.licenseType !== licenseType) return;

      results.push({ ...beat, listing });
    });

    // Sort by newest first
    results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return results.slice(offset, offset + limit);
  }

  /**
   * Get producer's beats
   */
  static async getProducerBeats(producerId: string): Promise<Beat[]> {
    const beatIds = PRODUCER_CATALOG.get(producerId) || [];
    return beatIds.map((id) => BEATS.get(id)!).filter(Boolean);
  }

  /**
   * Get producer statistics
   */
  static async getProducerStats(producerId: string): Promise<ProducerStats> {
    const beats = await this.getProducerBeats(producerId);
    const sales = PRODUCER_SALES.get(producerId) || [];

    const totalRevenue = sales.reduce((sum, s) => sum + s.priceUSD, 0);
    const avgPrice = sales.length > 0 ? totalRevenue / sales.length : 0;

    // Find top beat by revenue
    const beatRevenue = new Map<string, number>();
    sales.forEach((s) => {
      beatRevenue.set(s.beatId, (beatRevenue.get(s.beatId) || 0) + s.priceUSD);
    });

    let topBeat: string | undefined;
    let maxRevenue = 0;
    beatRevenue.forEach((revenue, beatId) => {
      if (revenue > maxRevenue) {
        maxRevenue = revenue;
        topBeat = beatId;
      }
    });

    const producerName = beats[0]?.producerName || `Producer ${producerId}`;

    return {
      producerId,
      producerName,
      totalBeats: beats.length,
      totalSales: sales.length,
      totalRevenue,
      avgPrice: Math.round(avgPrice * 100) / 100,
      topBeat,
      lastSaleAt: sales.length > 0 ? sales[sales.length - 1].purchasedAt : undefined,
    };
  }

  /**
   * Search beats
   */
  static async search(query: string, limit: number = 20): Promise<Beat[]> {
    const lowerQuery = query.toLowerCase();

    return Array.from(BEATS.values())
      .filter((beat) => {
        if (beat.status !== 'active') return false;

        return (
          beat.title.toLowerCase().includes(lowerQuery) ||
          beat.producerName.toLowerCase().includes(lowerQuery) ||
          beat.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      })
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);
  }

  /**
   * Get featured beats (for homepage)
   */
  static async getFeatured(limit: number = 10): Promise<Array<Beat & { listing: BeatListing }>> {
    let featured: Array<Beat & { listing: BeatListing }> = [];

    LISTINGS.forEach((listing) => {
      if (!listing.isActive) return;

      const beat = BEATS.get(listing.beatId);
      if (!beat || beat.status !== 'active') return;

      featured.push({ ...beat, listing });
    });

    // Sort by downloads (most popular)
    featured.sort((a, b) => b.listing.downloads - a.listing.downloads);

    return featured.slice(0, limit);
  }

  /**
   * Get purchase history (buyer)
   */
  static async getPurchaseHistory(buyerId: string): Promise<BeatSale[]> {
    return Array.from(SALES.values()).filter((s) => s.buyerId === buyerId);
  }

  /**
   * Delist beat
   */
  static async delistBeat(beatId: string): Promise<void> {
    const listing = LISTINGS.get(beatId);
    if (listing) {
      listing.isActive = false;
    }

    const beat = BEATS.get(beatId);
    if (beat) {
      beat.status = 'inactive';
    }
  }

  /**
   * Get marketplace statistics (admin)
   */
  static async getMarketplaceStats(): Promise<{
    totalBeats: number;
    activeListing: number;
    totalSales: number;
    totalRevenue: number;
    topProducers: Array<{ producerId: string; revenue: number }>;
  }> {
    let totalSales = 0;
    let totalRevenue = 0;

    const producerRevenue = new Map<string, number>();

    SALES.forEach((sale) => {
      totalSales += 1;
      totalRevenue += sale.priceUSD;

      const current = producerRevenue.get(sale.producerId) || 0;
      producerRevenue.set(sale.producerId, current + sale.priceUSD);
    });

    const topProducers = Array.from(producerRevenue.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([producerId, revenue]) => ({ producerId, revenue }));

    return {
      totalBeats: BEATS.size,
      activeListing: Array.from(LISTINGS.values()).filter((l) => l.isActive).length,
      totalSales,
      totalRevenue,
      topProducers,
    };
  }
}

export default BeatMarketplaceEngine;
