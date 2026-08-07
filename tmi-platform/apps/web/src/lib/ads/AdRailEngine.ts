import { getAdSensePublisherId, getAdSenseSlotId } from '@/lib/ads/adConfig';

export type AdRailSlotId =
  | 'home1-lower-lobby-rail'
  | 'home1-discovery-sidebar'
  | 'magazine-article-rail'
  | 'magazine-footer-block'
  | 'billboard-rail-fallback'
  | 'lobby-wall-featured';

export type SponsorPlacement = {
  id: string;
  brand: string;
  headline: string;
  ctaLabel: string;
  href: string;
  accentColor: string;
};

export type AdvertiserPlacement = {
  id: string;
  company: string;
  campaign: string;
  ctaLabel: string;
  href: string;
  accentColor: string;
};

export type AdRailSelection =
  | { type: 'sponsor'; slotId: AdRailSlotId; payload: SponsorPlacement }
  | { type: 'advertiser'; slotId: AdRailSlotId; payload: AdvertiserPlacement }
  | { type: 'adsense'; slotId: AdRailSlotId; payload: { client: string; slot: string; format: 'auto' | 'rectangle' | 'horizontal' } };

const ADSENSE_CLIENT = getAdSensePublisherId();

const SPONSOR_INVENTORY: Partial<Record<AdRailSlotId, SponsorPlacement>> = {
  'billboard-rail-fallback': {
    id: 'sponsor-billboard-1',
    brand: 'SoundWave Audio',
    headline: 'Headline Sponsor Placement',
    ctaLabel: 'View Sponsor',
    href: '/sponsors',
    accentColor: '#FFD700',
  },
};

const ADVERTISER_INVENTORY: Partial<Record<AdRailSlotId, AdvertiserPlacement>> = {
  'home1-lower-lobby-rail': {
    id: 'adv-lower-lobby-1',
    company: 'Founding Advertiser',
    campaign: 'Lower Lobby Discovery Banner',
    ctaLabel: 'Advertise Here',
    href: '/hub/advertiser',
    accentColor: '#FF6B35',
  },
  'home1-discovery-sidebar': {
    id: 'adv-discovery-1',
    company: 'Founding Advertiser',
    campaign: 'Discovery Rail Feature',
    ctaLabel: 'Claim Discovery Slot',
    href: '/hub/advertiser',
    accentColor: '#00C8FF',
  },
};

/** Slot IDs from ENV only — empty until NEXT_PUBLIC_ADSENSE_SLOT_* is set (no fake IDs). */
const ADSENSE_SLOT_MAP: Record<AdRailSlotId, { slot: string; format: 'auto' | 'rectangle' | 'horizontal' }> = {
  'home1-lower-lobby-rail':   { slot: getAdSenseSlotId('homepageBanner') || getAdSenseSlotId('homepageMid'), format: 'horizontal' },
  'home1-discovery-sidebar':  { slot: getAdSenseSlotId('dashboardSidebar') || getAdSenseSlotId('sidebar'), format: 'rectangle'  },
  'magazine-article-rail':    { slot: getAdSenseSlotId('magazineInline') || getAdSenseSlotId('articleInline'), format: 'rectangle'  },
  'magazine-footer-block':    { slot: getAdSenseSlotId('magazineLeaderboard') || getAdSenseSlotId('footer-banner'), format: 'horizontal' },
  'billboard-rail-fallback':  { slot: getAdSenseSlotId('sponsorFallback') || getAdSenseSlotId('homepageBanner'), format: 'horizontal' },
  'lobby-wall-featured':      { slot: getAdSenseSlotId('liveLobbyBanner') || getAdSenseSlotId('homepageMid'), format: 'rectangle'  },
};

export function resolveAdRailSlot(params: {
  slotId: AdRailSlotId;
  hasSponsor?: boolean;
  hasAdvertiser?: boolean;
}): AdRailSelection {
  const { slotId, hasSponsor, hasAdvertiser } = params;

  const sponsor = SPONSOR_INVENTORY[slotId];
  if ((hasSponsor ?? true) && sponsor) {
    return { type: 'sponsor', slotId, payload: sponsor };
  }

  const advertiser = ADVERTISER_INVENTORY[slotId];
  if ((hasAdvertiser ?? true) && advertiser) {
    return { type: 'advertiser', slotId, payload: advertiser };
  }

  const adsense = ADSENSE_SLOT_MAP[slotId];
  return {
    type: 'adsense',
    slotId,
    payload: {
      client: ADSENSE_CLIENT,
      slot: adsense.slot,
      format: adsense.format,
    },
  };
}
