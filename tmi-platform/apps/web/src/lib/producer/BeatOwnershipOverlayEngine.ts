// BEAT OWNERSHIP OVERLAY ENGINE — Producer Attribution & Credits
// Purpose: Render producer credits on videos/performances using beats
// Tracks beat usage in venues and provides visual overlay system

import { randomUUID } from 'crypto';

export interface OwnershipOverlay {
  id: string;
  beatId: string;
  producerId: string;
  producerName: string;
  style: 'corner' | 'bottom-center' | 'bottom-banner' | 'watermark';
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center';
  opacity: number; // 0-1
  fontSize: number;
  fontColor: string;
  backgroundColor?: string;
  includeProducerHandle: boolean;
  includeSocialLinks?: string[]; // instagram, twitter, etc.
  animated: boolean;
  animationType?: 'fade' | 'slide' | 'pulse';
  duration: number; // milliseconds to display
}

export interface BeatUsageRecord {
  id: string;
  beatId: string;
  producerId: string;
  usageType: 'venue-live' | 'video' | 'stream' | 'social-media';
  usageDate: string;
  venueOrPlatform?: string;
  impressions: number;
  duration: number; // seconds
  producerNotified: boolean;
}

export interface ProducerCreditStats {
  producerId: string;
  totalUsages: number;
  totalImpressions: number;
  topBeats: Array<{ beatId: string; usageCount: number }>;
  lastUsageAt?: string;
}

// Overlay templates registry
const OVERLAY_TEMPLATES = new Map<string, OwnershipOverlay>();

// Usage tracking (beatId → array of usages)
const USAGE_RECORDS = new Map<string, BeatUsageRecord[]>();

// Producer stats cache
const PRODUCER_STATS_CACHE = new Map<string, ProducerCreditStats>();

// Default overlay template
const DEFAULT_TEMPLATE: OwnershipOverlay = {
  id: randomUUID(),
  beatId: '',
  producerId: '',
  producerName: '',
  style: 'bottom-banner',
  position: 'bottom-center',
  opacity: 0.8,
  fontSize: 14,
  fontColor: '#FFFFFF',
  backgroundColor: 'rgba(0,0,0,0.6)',
  includeProducerHandle: true,
  animated: true,
  animationType: 'fade',
  duration: 5000,
};

export class BeatOwnershipOverlayEngine {
  /**
   * Create custom overlay for beat
   */
  static async createOverlay(
    beatId: string,
    producerId: string,
    producerName: string,
    options?: Partial<OwnershipOverlay>
  ): Promise<OwnershipOverlay> {
    const overlay: OwnershipOverlay = {
      ...DEFAULT_TEMPLATE,
      id: randomUUID(),
      beatId,
      producerId,
      producerName,
      ...options,
    };

    OVERLAY_TEMPLATES.set(overlay.id, overlay);

    return overlay;
  }

  /**
   * Get overlay for beat
   */
  static async getOverlay(beatId: string): Promise<OwnershipOverlay | null> {
    // Find overlay by beatId
    for (const overlay of OVERLAY_TEMPLATES.values()) {
      if (overlay.beatId === beatId) {
        return overlay;
      }
    }

    return null;
  }

  /**
   * Update overlay styling
   */
  static async updateOverlay(
    overlayId: string,
    updates: Partial<OwnershipOverlay>
  ): Promise<OwnershipOverlay | null> {
    const overlay = OVERLAY_TEMPLATES.get(overlayId);
    if (!overlay) return null;

    if (updates.style) overlay.style = updates.style;
    if (updates.position) overlay.position = updates.position;
    if (updates.opacity) overlay.opacity = updates.opacity;
    if (updates.fontSize) overlay.fontSize = updates.fontSize;
    if (updates.fontColor) overlay.fontColor = updates.fontColor;
    if (updates.backgroundColor) overlay.backgroundColor = updates.backgroundColor;
    if (updates.animated !== undefined) overlay.animated = updates.animated;
    if (updates.animationType) overlay.animationType = updates.animationType;
    if (updates.duration) overlay.duration = updates.duration;

    return overlay;
  }

  /**
   * Generate overlay HTML/CSS
   */
  static async renderOverlayHTML(overlayId: string): Promise<string> {
    const overlay = OVERLAY_TEMPLATES.get(overlayId);
    if (!overlay) return '';

    const positionMap: Record<string, string> = {
      'top-left': 'top: 10px; left: 10px;',
      'top-right': 'top: 10px; right: 10px;',
      'bottom-left': 'bottom: 10px; left: 10px;',
      'bottom-right': 'bottom: 10px; right: 10px;',
      'bottom-center': 'bottom: 10px; left: 50%; transform: translate(-50%, 0);',
      center: 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
    };

    const animationCSS = overlay.animated
      ? `animation: overlay-${overlay.animationType} ${overlay.duration}ms ease-in-out;`
      : '';

    const html = `
      <div class="beat-ownership-overlay" style="
        position: fixed;
        ${positionMap[overlay.position]}
        opacity: ${overlay.opacity};
        font-size: ${overlay.fontSize}px;
        color: ${overlay.fontColor};
        background-color: ${overlay.backgroundColor};
        padding: 12px 16px;
        border-radius: 6px;
        font-family: 'Arial', sans-serif;
        font-weight: bold;
        z-index: 9999;
        ${animationCSS}
      ">
        <div>Beat by: ${overlay.producerName}</div>
        ${
          overlay.includeProducerHandle
            ? `<div style="font-size: ${overlay.fontSize - 2}px; opacity: 0.9;">@${overlay.producerId}</div>`
            : ''
        }
        ${
          overlay.includeSocialLinks
            ? `<div style="font-size: ${overlay.fontSize - 2}px; margin-top: 4px;">
                ${overlay.includeSocialLinks.map((link) => `<span>${link}</span>`).join(' | ')}
              </div>`
            : ''
        }
      </div>

      <style>
        @keyframes overlay-fade {
          0% { opacity: 0; }
          10% { opacity: ${overlay.opacity}; }
          90% { opacity: ${overlay.opacity}; }
          100% { opacity: 0; }
        }

        @keyframes overlay-slide {
          0% { transform: translateY(50px); opacity: 0; }
          10% { transform: translateY(0); opacity: ${overlay.opacity}; }
          90% { opacity: ${overlay.opacity}; }
          100% { transform: translateY(-50px); opacity: 0; }
        }

        @keyframes overlay-pulse {
          0% { opacity: 0; }
          10% { opacity: ${overlay.opacity}; }
          50% { opacity: ${overlay.opacity * 0.7}; }
          90% { opacity: ${overlay.opacity}; }
          100% { opacity: 0; }
        }
      </style>
    `;

    return html;
  }

  /**
   * Record beat usage
   */
  static async recordUsage(
    beatId: string,
    producerId: string,
    usageType: 'venue-live' | 'video' | 'stream' | 'social-media',
    options?: {
      venueOrPlatform?: string;
      impressions?: number;
      duration?: number;
    }
  ): Promise<BeatUsageRecord> {
    const record: BeatUsageRecord = {
      id: randomUUID(),
      beatId,
      producerId,
      usageType,
      usageDate: new Date().toISOString(),
      venueOrPlatform: options?.venueOrPlatform,
      impressions: options?.impressions || 1,
      duration: options?.duration || 0,
      producerNotified: false,
    };

    if (!USAGE_RECORDS.has(beatId)) {
      USAGE_RECORDS.set(beatId, []);
    }
    USAGE_RECORDS.get(beatId)!.push(record);

    // Invalidate stats cache
    PRODUCER_STATS_CACHE.delete(producerId);

    return record;
  }

  /**
   * Get beat usage history
   */
  static async getUsageHistory(beatId: string): Promise<BeatUsageRecord[]> {
    return (USAGE_RECORDS.get(beatId) || []).sort(
      (a, b) => new Date(b.usageDate).getTime() - new Date(a.usageDate).getTime()
    );
  }

  /**
   * Get producer credit statistics
   */
  static async getProducerStats(producerId: string): Promise<ProducerCreditStats> {
    // Check cache
    if (PRODUCER_STATS_CACHE.has(producerId)) {
      return PRODUCER_STATS_CACHE.get(producerId)!;
    }

    let totalUsages = 0;
    let totalImpressions = 0;
    const beatUsage = new Map<string, number>();
    let lastUsageAt: string | undefined;

    USAGE_RECORDS.forEach((records) => {
      records.forEach((record) => {
        if (record.producerId === producerId) {
          totalUsages += 1;
          totalImpressions += record.impressions;

          const count = beatUsage.get(record.beatId) || 0;
          beatUsage.set(record.beatId, count + 1);

          if (!lastUsageAt || new Date(record.usageDate) > new Date(lastUsageAt)) {
            lastUsageAt = record.usageDate;
          }
        }
      });
    });

    const topBeats = Array.from(beatUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([beatId, count]) => ({ beatId, usageCount: count }));

    const stats: ProducerCreditStats = {
      producerId,
      totalUsages,
      totalImpressions,
      topBeats,
      lastUsageAt,
    };

    PRODUCER_STATS_CACHE.set(producerId, stats);

    return stats;
  }

  /**
   * Get overlay variants (design options)
   */
  static async getOverlayVariants(): Promise<Array<{ name: string; template: Partial<OwnershipOverlay> }>> {
    return [
      {
        name: 'Minimal Corner',
        template: {
          style: 'corner',
          position: 'top-right',
          opacity: 0.7,
          fontSize: 12,
          backgroundColor: 'transparent',
        },
      },
      {
        name: 'Bold Bottom Banner',
        template: {
          style: 'bottom-banner',
          position: 'bottom-center',
          opacity: 0.9,
          fontSize: 16,
          backgroundColor: 'rgba(0,0,0,0.8)',
        },
      },
      {
        name: 'Animated Watermark',
        template: {
          style: 'watermark',
          position: 'center',
          opacity: 0.5,
          animated: true,
          animationType: 'pulse',
          duration: 3000,
        },
      },
      {
        name: 'Social Media Slide',
        template: {
          style: 'bottom-banner',
          position: 'bottom-left',
          opacity: 0.85,
          animated: true,
          animationType: 'slide',
          duration: 4000,
        },
      },
    ];
  }

  /**
   * Notify producer of usage
   */
  static async notifyProducer(beatId: string, producerId: string): Promise<void> {
    const usages = USAGE_RECORDS.get(beatId) || [];
    usages.forEach((record) => {
      if (record.producerId === producerId && !record.producerNotified) {
        record.producerNotified = true;
        // In production: send email/notification
      }
    });
  }

  /**
   * Get trending beats (by usage)
   */
  static async getTrendingBeats(limit: number = 10): Promise<Array<{beatId: string; usageCount: number; impressions: number}>> {
    const beatStats = new Map<string, { count: number; impressions: number }>();

    USAGE_RECORDS.forEach((records) => {
      records.forEach((record) => {
        const current = beatStats.get(record.beatId) || { count: 0, impressions: 0 };
        beatStats.set(record.beatId, {
          count: current.count + 1,
          impressions: current.impressions + record.impressions,
        });
      });
    });

    return Array.from(beatStats.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([beatId, stats]) => ({
        beatId,
        usageCount: stats.count,
        impressions: stats.impressions,
      }));
  }
}

export default BeatOwnershipOverlayEngine;
