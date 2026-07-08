/**
 * AdEngine — Universal Ad Provider Plugin System
 *
 * Architecture (Build Director approved 2026-07-04):
 *   AdEngine
 *     └── AdProviderRegistry  — plugins register here
 *           ├── Google AdSense
 *           ├── Amazon Publisher Services
 *           ├── Media.net
 *           ├── Direct Sponsors       (Rule 12 — highest priority)
 *           ├── Direct Advertisers    (Rule 12)
 *           ├── House Ads             (always fills — never empty)
 *           └── Future Providers      (register without touching engine)
 *
 * Adding a new ad network = implement AdProvider + call registry.register().
 * The engine and all consumers are never touched again.
 *
 * Rule 12 fallback chain is preserved:
 *   Paid Sponsor → Paid Advertiser → Ad Network → House Ad → Advertise Here CTA
 */

// ── Zone + tier types ────────────────────────────────────────────────────────

export type AdZone =
  | 'leaderboard'     // 728×90 top-of-page
  | 'sidebar'         // 300×250 right column
  | 'in-content'      // 320×100 mid-article
  | 'footer-banner'   // 468×60 bottom
  | 'mobile-banner';  // 320×50 mobile sticky

export type UserTier =
  | 'free' | 'pro' | 'ruby' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'unknown';

export type ProviderCategory =
  | 'direct-sponsor'      // paying TMI sponsor (highest priority)
  | 'direct-advertiser'   // paying TMI advertiser
  | 'programmatic'        // third-party ad network (AdSense, Amazon, etc.)
  | 'house-ad'            // TMI-owned promotional content
  | 'affiliate'           // affiliate/CPA networks
  | 'cta-fallback';       // "Advertise Here" CTA (last resort, never empty)

export type ProviderStatus = 'active' | 'pending-approval' | 'disabled' | 'error';

// ── Core plugin interface ────────────────────────────────────────────────────

export interface AdProvider {
  /** Unique machine ID — never changes once registered */
  readonly id: string;
  /** Human-readable name shown in admin UI */
  readonly displayName: string;
  /** Category determines priority bucket */
  readonly category: ProviderCategory;
  /**
   * Lower number = higher priority within the same category.
   * direct-sponsor always beats programmatic regardless of priority value.
   */
  readonly priority: number;
  /** Whether this provider should be active */
  isEnabled(): boolean;
  /** Whether this provider can fill the given zone for the given tier */
  canFill(zone: AdZone, tier: UserTier): boolean;
  /** Current operational status */
  getStatus(): ProviderStatus;
  /** Arbitrary metadata for admin UI (publisher IDs, notes, env var names, etc.) */
  getMeta(): AdProviderMeta;
}

export interface AdProviderMeta {
  publisherId?: string;
  envVarName?: string;
  notes?: string;
  dashboardUrl?: string;
  isVerified?: boolean;
  /** Set to true when provider has received a real fill in the last 24h */
  hasRecentFill?: boolean;
}

// ── Category priority ordering ───────────────────────────────────────────────

const CATEGORY_ORDER: Record<ProviderCategory, number> = {
  'direct-sponsor':    0,
  'direct-advertiser': 1,
  'programmatic':      2,
  'affiliate':         3,
  'house-ad':          4,
  'cta-fallback':      5,
};

// ── Registry ─────────────────────────────────────────────────────────────────

class AdProviderRegistry {
  private readonly providers = new Map<string, AdProvider>();

  register(provider: AdProvider): void {
    this.providers.set(provider.id, provider);
  }

  unregister(id: string): void {
    this.providers.delete(id);
  }

  getAll(): AdProvider[] {
    return [...this.providers.values()];
  }

  getEnabled(): AdProvider[] {
    return this.getSorted().filter((p) => p.isEnabled());
  }

  /** Returns providers sorted by category priority, then internal priority. */
  getSorted(): AdProvider[] {
    return [...this.providers.values()].sort((a, b) => {
      const catDiff = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
      if (catDiff !== 0) return catDiff;
      return a.priority - b.priority;
    });
  }
}

export const adProviderRegistry = new AdProviderRegistry();

// ── Decision engine ───────────────────────────────────────────────────────────

export interface AdDecision {
  provider: AdProvider;
  zone: AdZone;
  tier: UserTier;
}

export function resolveAdProvider(zone: AdZone, tier: UserTier): AdDecision | null {
  const candidate = adProviderRegistry.getEnabled().find((p) => p.canFill(zone, tier));
  if (!candidate) return null;
  return { provider: candidate, zone, tier };
}

// ── Tier → ad visibility rules ────────────────────────────────────────────────

export function shouldShowAd(tier: UserTier, zone: AdZone): boolean {
  if (tier === 'diamond' || tier === 'platinum') return false;
  if (tier === 'gold') return zone === 'sidebar' || zone === 'leaderboard';
  if (tier === 'silver') return zone !== 'mobile-banner';
  if (tier === 'pro' || tier === 'ruby') return zone === 'leaderboard' || zone === 'sidebar' || zone === 'in-content';
  return true; // free / unknown → all zones
}

// ── Built-in provider registrations ──────────────────────────────────────────
// Adding a new provider = add one block below. Engine never changes.

adProviderRegistry.register({
  id: 'direct-sponsor',
  displayName: 'TMI Direct Sponsors',
  category: 'direct-sponsor',
  priority: 1,
  isEnabled: () => true,
  canFill: (_zone, _tier) => true,
  getStatus: () => 'active',
  getMeta: () => ({
    notes: 'Paying sponsors from SponsorRegistry. Rule 12 — always checked first.',
    dashboardUrl: '/admin/sponsors',
    isVerified: true,
  }),
});

adProviderRegistry.register({
  id: 'direct-advertiser',
  displayName: 'TMI Direct Advertisers',
  category: 'direct-advertiser',
  priority: 1,
  isEnabled: () => true,
  canFill: (_zone, _tier) => true,
  getStatus: () => 'active',
  getMeta: () => ({
    notes: 'Paying advertisers from advertiser dashboard. Second priority after sponsors.',
    dashboardUrl: '/hub/advertiser',
    isVerified: true,
  }),
});

adProviderRegistry.register({
  id: 'google-adsense',
  displayName: 'Google AdSense',
  category: 'programmatic',
  priority: 1,
  isEnabled: () => true, // script always loaded; approval gates actual fill
  canFill: (zone, tier) => shouldShowAd(tier, zone),
  getStatus: () => 'active',
  getMeta: () => ({
    publisherId: 'ca-pub-4088577529436039',
    notes: 'Primary programmatic network. Create ad units in AdSense dashboard → set NEXT_PUBLIC_ADSENSE_SLOT_* in Vercel.',
    dashboardUrl: 'https://adsense.google.com',
    isVerified: true,
    envVarName: 'NEXT_PUBLIC_ADSENSE_SLOT_*',
  }),
});

adProviderRegistry.register({
  id: 'amazon-aps',
  displayName: 'Amazon Publisher Services',
  category: 'programmatic',
  priority: 2,
  isEnabled: () => Boolean(process.env.NEXT_PUBLIC_AMAZON_PUB_ID),
  canFill: (zone, tier) => shouldShowAd(tier, zone),
  getStatus: () => (process.env.NEXT_PUBLIC_AMAZON_PUB_ID ? 'active' : 'disabled'),
  getMeta: () => ({
    publisherId: process.env.NEXT_PUBLIC_AMAZON_PUB_ID ?? undefined,
    notes: 'High CPM for electronics/books categories. Set NEXT_PUBLIC_AMAZON_PUB_ID in Vercel to activate.',
    dashboardUrl: 'https://aps.amazon.com',
    envVarName: 'NEXT_PUBLIC_AMAZON_PUB_ID',
  }),
});

adProviderRegistry.register({
  id: 'medianet',
  displayName: 'Media.net (Yahoo / Bing)',
  category: 'programmatic',
  priority: 3,
  isEnabled: () => Boolean(process.env.NEXT_PUBLIC_MEDIANET_CID),
  canFill: (zone, tier) => shouldShowAd(tier, zone),
  getStatus: () => (process.env.NEXT_PUBLIC_MEDIANET_CID ? 'active' : 'disabled'),
  getMeta: () => ({
    publisherId: process.env.NEXT_PUBLIC_MEDIANET_CID ?? undefined,
    notes: 'Contextual ads — strong for music/entertainment content. Set NEXT_PUBLIC_MEDIANET_CID in Vercel.',
    dashboardUrl: 'https://media.net',
    envVarName: 'NEXT_PUBLIC_MEDIANET_CID',
  }),
});

adProviderRegistry.register({
  id: 'infolinks',
  displayName: 'Infolinks',
  category: 'affiliate',
  priority: 1,
  isEnabled: () => true,
  canFill: (_zone, tier) => tier !== 'diamond' && tier !== 'platinum',
  getStatus: () => 'active',
  getMeta: () => ({
    publisherId: '3445854',
    notes: 'In-text and in-fold units. Script loaded in layout. No additional setup needed.',
    dashboardUrl: 'https://www.infolinks.com',
    isVerified: true,
  }),
});

adProviderRegistry.register({
  id: 'bidvertiser',
  displayName: 'BidVertiser',
  category: 'affiliate',
  priority: 2,
  isEnabled: () => Boolean(process.env.NEXT_PUBLIC_BIDVERTISER_ENABLED),
  canFill: (_zone, tier) => tier !== 'diamond' && tier !== 'platinum',
  getStatus: () => (process.env.NEXT_PUBLIC_BIDVERTISER_ENABLED ? 'active' : 'pending-approval'),
  getMeta: () => ({
    publisherId: 'Bidvertiser2104976',
    notes: 'Site verified in page source. Set NEXT_PUBLIC_BIDVERTISER_ENABLED=1 in Vercel to serve display ads.',
    envVarName: 'NEXT_PUBLIC_BIDVERTISER_ENABLED',
  }),
});

adProviderRegistry.register({
  id: 'house-ads',
  displayName: 'TMI House Ads',
  category: 'house-ad',
  priority: 1,
  isEnabled: () => true,
  canFill: (_zone, _tier) => true, // always fills — never empty (Rule 12 + Rule 14)
  getStatus: () => 'active',
  getMeta: () => ({
    notes: 'Internal TMI promotions: membership upgrades, new features, events. Fills any slot with no paying content.',
    dashboardUrl: '/admin/ad-networks',
    isVerified: true,
  }),
});

adProviderRegistry.register({
  id: 'cta-fallback',
  displayName: '"Advertise Here" CTA',
  category: 'cta-fallback',
  priority: 1,
  isEnabled: () => true,
  canFill: (_zone, _tier) => true,
  getStatus: () => 'active',
  getMeta: () => ({
    notes: 'Last resort — links to /sponsors/advertise. Rule 12 final step. Never shows an empty box.',
    dashboardUrl: '/sponsors/advertise',
    isVerified: true,
  }),
});

// ── AdSense slot IDs (set in Vercel env vars) ────────────────────────────────

export const ADSENSE_SLOTS = {
  homepageBanner:       process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOMEPAGE_BANNER      ?? '',
  homepageMid:          process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOMEPAGE_MID         ?? '',
  dashboardSidebar:     process.env.NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD_SIDEBAR    ?? '',
  liveLobbyBanner:      process.env.NEXT_PUBLIC_ADSENSE_SLOT_LIVE_LOBBY_BANNER    ?? '',
  articleInline:        process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_INLINE       ?? '',
  magazineLeaderboard:  process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAGAZINE_LEADERBOARD ?? '',
  magazineInline:       process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAGAZINE_INLINE      ?? '',
  magazineArticleEnd:   process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAGAZINE_ARTICLE_END ?? '',
  gameShowBanner:       process.env.NEXT_PUBLIC_ADSENSE_SLOT_GAME_SHOW_BANNER     ?? '',
  roomLeaderboard:      process.env.NEXT_PUBLIC_ADSENSE_SLOT_ROOM_LEADERBOARD     ?? '',
  sponsorFallback:      process.env.NEXT_PUBLIC_ADSENSE_SLOT_SPONSOR_FALLBACK     ?? '',
} as const;

export type AdSenseSlotKey = keyof typeof ADSENSE_SLOTS;
