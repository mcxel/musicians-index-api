import { NextRequest, NextResponse } from 'next/server';
import { adProviderRegistry, resolveAdProvider, shouldShowAd, type AdZone, type UserTier } from '@/lib/ads/AdProviderManager';
import { getAdSlotForZone } from '@/lib/commerce/SponsorRegistry';
import type { AdPlacement } from '@/components/placement/types';

export const dynamic = 'force-dynamic';

function toAdZone(placement: string): AdZone {
  const normalized = placement.toLowerCase();
  if (normalized.includes('mobile')) return 'mobile-banner';
  if (normalized.includes('sidebar')) return 'sidebar';
  if (normalized.includes('footer')) return 'footer-banner';
  if (normalized.includes('article') || normalized.includes('content')) return 'in-content';
  return 'leaderboard';
}

function toTier(value: string | null): UserTier {
  const normalized = (value ?? 'free').toLowerCase();
  if (
    normalized === 'free' ||
    normalized === 'pro' ||
    normalized === 'ruby' ||
    normalized === 'silver' ||
    normalized === 'gold' ||
    normalized === 'platinum' ||
    normalized === 'diamond'
  ) {
    return normalized;
  }
  return 'unknown';
}

function ctaPlacement(placement: string): AdPlacement {
  return {
    id: `ad-cta-${placement}`,
    title: 'Advertise On TMI',
    image: '/ads/house/default-banner.png',
    url: '/sponsors/advertise',
    type: 'banner',
  };
}

export async function GET(req: NextRequest) {
  const placement = req.nextUrl.searchParams.get('placement');
  const tier = toTier(req.nextUrl.searchParams.get('tier'));

  if (!placement) {
    return NextResponse.json({ error: 'placement is required' }, { status: 400 });
  }

  const zone = toAdZone(placement);
  if (!shouldShowAd(tier, zone)) {
    return NextResponse.json({
      id: `ad-hidden-${placement}`,
      title: 'Ad-Free Experience',
      image: '/ads/house/default-banner.png',
      url: '/pricing',
      type: 'banner',
      meta: {
        reason: 'tier_ad_free',
        tier,
      },
    });
  }

  const slot = getAdSlotForZone(placement);
  if (slot.type === 'paid' && slot.sponsor) {
    return NextResponse.json({
      id: `ad-paid-${slot.sponsor.sponsorId}`,
      title: slot.sponsor.name,
      image: slot.sponsor.logoUrl ?? '/ads/house/default-banner.png',
      url: slot.sponsor.ctaHref,
      type: 'banner',
      meta: {
        source: 'direct-sponsor',
        tagline: slot.sponsor.tagline,
      },
    });
  }

  if (slot.type === 'platform' && slot.platformPromo) {
    return NextResponse.json({
      id: `ad-platform-${placement}`,
      title: slot.platformPromo.headline,
      image: '/ads/house/default-banner.png',
      url: slot.platformPromo.ctaHref,
      type: 'banner',
      meta: {
        source: 'platform-promo',
        body: slot.platformPromo.body,
      },
    });
  }

  const decision = resolveAdProvider(zone, tier);
  if (decision) {
    return NextResponse.json({
      id: `ad-provider-${decision.provider.id}-${placement}`,
      title: decision.provider.displayName,
      image: '/ads/house/default-banner.png',
      url: '/home/4',
      type: 'banner',
      meta: {
        source: decision.provider.id,
        category: decision.provider.category,
        status: decision.provider.getStatus(),
        zone,
        tier,
      },
    });
  }

  const fallback = adProviderRegistry.getSorted().find((provider) => provider.id === 'cta-fallback');
  return NextResponse.json({
    ...ctaPlacement(placement),
    meta: {
      source: fallback?.id ?? 'cta-fallback',
      zone,
      tier,
    },
  });
}
