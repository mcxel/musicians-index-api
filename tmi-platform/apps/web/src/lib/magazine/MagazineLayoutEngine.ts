/**
 * MagazineLayoutEngine.ts
 * Single source of truth for tier-based performer article layouts.
 *
 * Rule 8: pages consume this, they do not invent their own tier logic.
 * Rule 20: gallerySlots drives how many real images are expected — empty
 *          slots must show an honest upload CTA, never a fake image.
 */

import type { PerformerTier } from '@/lib/performers/PerformerRegistry';

export type GalleryPattern =
  | 'hero-only'    // FREE  — 1 hero, full width
  | 'hero-2below'  // PRO   — hero + 2 mini below
  | 'spread-4'     // RUBY  — hero center, 2L + 2R
  | 'spread-5'     // SILVER — hero center, 2L + 2R + 1 bottom
  | 'spread-6'     // GOLD  — hero center, 3L + 3R
  | 'spread-8'     // PLATINUM — hero center, 4L + 4R + video panel
  | 'diamond-full';// DIAMOND — full magazine spread

export interface TierLayoutConfig {
  /** Extra photo slots beside the hero (0 for FREE) */
  gallerySlots: number;
  pattern: GalleryPattern;

  // ── Media modules ─────────────────────────────────────────────────
  hasVideoPanel: boolean;     // static or uploaded video embed
  hasLivePanel: boolean;      // live room panel (uses liveRoomRoute)
  hasHighlightReel: boolean;  // video highlights strip
  hasPhotoStrip: boolean;     // horizontal scrolling photo strip

  // ── Content modules ───────────────────────────────────────────────
  hasTourSection: boolean;
  hasPlaylist: boolean;
  hasFanWall: boolean;
  hasSponsorSection: boolean;
  hasBookingPanel: boolean;
  hasMerchandise: boolean;
  hasAwardsSection: boolean;
  hasTimeline: boolean;
  hasStatsPanel: boolean;

  // ── Presentation ──────────────────────────────────────────────────
  hasMagazineBadge: boolean;
  motionIntensity: 'none' | 'subtle' | 'standard' | 'cinematic' | 'premium' | 'diamond';
  customTheme: boolean;
  customAccent: boolean;
  tierLabel: string;
  tierColor: string;
}

const CONFIGS: Record<PerformerTier, TierLayoutConfig> = {
  FREE: {
    gallerySlots: 0,
    pattern: 'hero-only',
    hasVideoPanel: false, hasLivePanel: false, hasHighlightReel: false, hasPhotoStrip: false,
    hasTourSection: false, hasPlaylist: false, hasFanWall: false, hasSponsorSection: false,
    hasBookingPanel: false, hasMerchandise: false, hasAwardsSection: false, hasTimeline: false,
    hasStatsPanel: false, hasMagazineBadge: false,
    motionIntensity: 'none', customTheme: false, customAccent: false,
    tierLabel: 'ARTIST FEATURE', tierColor: '#888888',
  },
  PRO: {
    gallerySlots: 2,
    pattern: 'hero-2below',
    hasVideoPanel: false, hasLivePanel: false, hasHighlightReel: false, hasPhotoStrip: false,
    hasTourSection: false, hasPlaylist: true, hasFanWall: false, hasSponsorSection: false,
    hasBookingPanel: false, hasMerchandise: false, hasAwardsSection: false, hasTimeline: false,
    hasStatsPanel: false, hasMagazineBadge: false,
    motionIntensity: 'subtle', customTheme: true, customAccent: true,
    tierLabel: 'PRO ARTIST FEATURE', tierColor: '#3B82F6',
  },
  RUBY: {
    gallerySlots: 4,
    pattern: 'spread-4',
    hasVideoPanel: false, hasLivePanel: false, hasHighlightReel: false, hasPhotoStrip: false,
    hasTourSection: false, hasPlaylist: true, hasFanWall: false, hasSponsorSection: false,
    hasBookingPanel: false, hasMerchandise: false, hasAwardsSection: false, hasTimeline: false,
    hasStatsPanel: false, hasMagazineBadge: true,
    motionIntensity: 'standard', customTheme: true, customAccent: true,
    tierLabel: 'RUBY SPOTLIGHT', tierColor: '#E11D48',
  },
  Silver: {
    gallerySlots: 5,
    pattern: 'spread-5',
    hasVideoPanel: false, hasLivePanel: false, hasHighlightReel: false, hasPhotoStrip: false,
    hasTourSection: true, hasPlaylist: true, hasFanWall: false, hasSponsorSection: false,
    hasBookingPanel: false, hasMerchandise: true, hasAwardsSection: false, hasTimeline: false,
    hasStatsPanel: false, hasMagazineBadge: true,
    motionIntensity: 'standard', customTheme: true, customAccent: true,
    tierLabel: 'SILVER FEATURE', tierColor: '#94A3B8',
  },
  Gold: {
    gallerySlots: 6,
    pattern: 'spread-6',
    hasVideoPanel: false, hasLivePanel: true, hasHighlightReel: false, hasPhotoStrip: false,
    hasTourSection: true, hasPlaylist: true, hasFanWall: false, hasSponsorSection: true,
    hasBookingPanel: true, hasMerchandise: true, hasAwardsSection: false, hasTimeline: false,
    hasStatsPanel: false, hasMagazineBadge: true,
    motionIntensity: 'cinematic', customTheme: true, customAccent: true,
    tierLabel: 'GOLD COVER STORY', tierColor: '#FFD700',
  },
  Platinum: {
    gallerySlots: 8,
    pattern: 'spread-8',
    hasVideoPanel: true, hasLivePanel: true, hasHighlightReel: false, hasPhotoStrip: false,
    hasTourSection: true, hasPlaylist: true, hasFanWall: false, hasSponsorSection: true,
    hasBookingPanel: true, hasMerchandise: true, hasAwardsSection: true, hasTimeline: true,
    hasStatsPanel: true, hasMagazineBadge: true,
    motionIntensity: 'premium', customTheme: true, customAccent: true,
    tierLabel: 'PLATINUM EDITORIAL', tierColor: '#E2E8F0',
  },
  Diamond: {
    gallerySlots: 12,
    pattern: 'diamond-full',
    hasVideoPanel: true, hasLivePanel: true, hasHighlightReel: true, hasPhotoStrip: true,
    hasTourSection: true, hasPlaylist: true, hasFanWall: true, hasSponsorSection: true,
    hasBookingPanel: true, hasMerchandise: true, hasAwardsSection: true, hasTimeline: true,
    hasStatsPanel: true, hasMagazineBadge: true,
    motionIntensity: 'diamond', customTheme: true, customAccent: true,
    tierLabel: '💎 DIAMOND MAGAZINE FEATURE', tierColor: '#00FFFF',
  },
};

export function getLayoutConfig(tier: PerformerTier): TierLayoutConfig {
  return CONFIGS[tier] ?? CONFIGS.FREE;
}

/**
 * Resolve gallery slots from the available real images.
 * Returns an array of length `slots`:
 *   - string  → real image URL to render
 *   - null    → empty slot (show upload CTA or dash border)
 *
 * Rule 20: never repeat the hero as a gallery slot — gallery is additional content.
 */
export function resolveGallerySlots(
  heroImage: string,
  availableImages: string[],
  slots: number,
): Array<string | null> {
  // Exclude the hero image from gallery pool to avoid duplication
  const pool = availableImages.filter((img) => img && img !== heroImage);
  const result: Array<string | null> = [];
  for (let i = 0; i < slots; i++) {
    result.push(pool[i] ?? null);
  }
  return result;
}

/**
 * Build the image pool from a performer's available assets.
 * Order: coverImageUrl first (second-best image), then profileImageUrl.
 * Any additional uploaded gallery photos would extend this list.
 */
export function buildImagePool(performer: {
  profileImageUrl: string;
  coverImageUrl: string;
  motionPosterUrl?: string;
  introVideoUrl?: string;
}): string[] {
  // Priority: cover → profile → motion poster thumbnail (no duplication)
  const pool: string[] = [];
  if (performer.coverImageUrl)    pool.push(performer.coverImageUrl);
  if (performer.profileImageUrl)  pool.push(performer.profileImageUrl);
  if (performer.motionPosterUrl)  pool.push(performer.motionPosterUrl);
  return [...new Set(pool)]; // deduplicate
}
