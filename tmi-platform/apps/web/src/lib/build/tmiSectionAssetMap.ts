/**
 * tmiSectionAssetMap.ts
 * Maps all 370 converted TMI assets to their sections and target systems.
 * Ensures no asset remains orphaned.
 * Generated from: Tmi PDF's/tmi_asset_manifest.json
 * Last updated: 2026-04-24
 */

export type TMISectionType = 
  | 'homepages'
  | 'profiles'
  | 'magazine'
  | 'hosts'
  | 'venues'
  | 'seating'
  | 'games'
  | 'ads'
  | 'booking'
  | 'admin'
  | 'huds'
  | 'avatars';

export interface AssetToSection {
  category: string;
  section: TMISectionType;
  route: string;
  component: string;
  buildTarget: string;
  forwardRoute: string;
  backRoute: string;
  interactive: boolean;
  requiresAnimation: boolean;
  tier: 'free' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

/**
 * SECTION MAPPINGS: Every category maps to one or more sections
 * and defines their build targets.
 */
export const SECTION_ASSET_MAP: Record<string, AssetToSection[]> = {
  // HOMEPAGES: 12 images
  // Maps to: /home/1 through /home/5 (looping belt)
  // Components: HomepageHero, DiscoveryBelt, AdMarketplace, AnalyticsPanel
  homepages: [
    {
      category: 'homepages',
      section: 'homepages',
      route: '/home/1',
      component: 'HomepageBelt1',
      buildTarget: 'src/app/home/[page]/page.tsx',
      forwardRoute: '/home/2',
      backRoute: '/',
      interactive: true,
      requiresAnimation: true,
      tier: 'free',
    },
    {
      category: 'homepages',
      section: 'homepages',
      route: '/home/2',
      component: 'HomepageBelt2',
      buildTarget: 'src/app/home/[page]/page.tsx',
      forwardRoute: '/home/3',
      backRoute: '/home/1',
      interactive: true,
      requiresAnimation: true,
      tier: 'free',
    },
    {
      category: 'homepages',
      section: 'homepages',
      route: '/home/3',
      component: 'HomepageBelt3',
      buildTarget: 'src/app/home/[page]/page.tsx',
      forwardRoute: '/home/4',
      backRoute: '/home/2',
      interactive: true,
      requiresAnimation: true,
      tier: 'free',
    },
    {
      category: 'homepages',
      section: 'homepages',
      route: '/home/4',
      component: 'HomepageBelt4',
      buildTarget: 'src/app/home/[page]/page.tsx',
      forwardRoute: '/home/5',
      backRoute: '/home/3',
      interactive: true,
      requiresAnimation: true,
      tier: 'free',
    },
    {
      category: 'homepages',
      section: 'homepages',
      route: '/home/5',
      component: 'HomepageBelt5',
      buildTarget: 'src/app/home/[page]/page.tsx',
      forwardRoute: '/home/1',
      backRoute: '/home/4',
      interactive: true,
      requiresAnimation: true,
      tier: 'free',
    },
  ],

  // PROFILES: 14 images
  // Maps to: /profiles/:id, /profiles/:id/settings, /profiles/:id/achievements
  // Components: ProfileCard, SettingsPanel, AchievementGrid
  profiles: [
    {
      category: 'profiles',
      section: 'profiles',
      route: '/profiles/[id]',
      component: 'ProfileHub',
      buildTarget: 'src/app/profiles/[id]/page.tsx',
      forwardRoute: '/profiles/[id]/settings',
      backRoute: '/',
      interactive: true,
      requiresAnimation: false,
      tier: 'free',
    },
  ],

  // MAGAZINE: 176 images
  // Maps to: /magazine, /magazine/[issue], /magazine/articles/[id]
  // Components: MagazineFrame, ArticleCard, IssueGrid
  magazine: [
    {
      category: 'magazine',
      section: 'magazine',
      route: '/magazine',
      component: 'MagazineHub',
      buildTarget: 'src/app/magazine/page.tsx',
      forwardRoute: '/magazine/[issue]',
      backRoute: '/',
      interactive: true,
      requiresAnimation: true,
      tier: 'free',
    },
    {
      category: 'magazine',
      section: 'magazine',
      route: '/magazine/[issue]',
      component: 'IssueViewer',
      buildTarget: 'src/app/magazine/[issue]/page.tsx',
      forwardRoute: '/magazine/articles/[id]',
      backRoute: '/magazine',
      interactive: true,
      requiresAnimation: true,
      tier: 'free',
    },
  ],

  // HOSTS/JULIUS: 22 images
  // Maps to: /hosts/:id, /streams/:id
  // Components: HostCard, StreamOverlay, JuliusBot
  hosts: [
    {
      category: 'hosts',
      section: 'hosts',
      route: '/hosts',
      component: 'HostsDirectory',
      buildTarget: 'src/app/hosts/page.tsx',
      forwardRoute: '/hosts/[id]',
      backRoute: '/admin',
      interactive: true,
      requiresAnimation: false,
      tier: 'free',
    },
  ],

  // VENUES: 72 images
  // Maps to: /venues, /venues/[id], /venues/[id]/book, /live-world/[venueId]
  // Components: VenueGrid, VenueDetail, VenueBooking, VenueEnvironment
  venues: [
    {
      category: 'venues',
      section: 'venues',
      route: '/venues',
      component: 'VenuesHub',
      buildTarget: 'src/app/venues/page.tsx',
      forwardRoute: '/venues/[id]',
      backRoute: '/',
      interactive: true,
      requiresAnimation: false,
      tier: 'free',
    },
    {
      category: 'venues',
      section: 'venues',
      route: '/venues/[id]',
      component: 'VenueDetail',
      buildTarget: 'src/app/venues/[id]/page.tsx',
      forwardRoute: '/live-world/[venueId]',
      backRoute: '/venues',
      interactive: true,
      requiresAnimation: true,
      tier: 'free',
    },
  ],

  // SEATING: 74 images
  // Maps to: /venues/[id]/seating, /live-world/[venueId]/audience
  // Components: SeatingGrid, SeatReserver, AudienceView
  seating: [
    {
      category: 'seating',
      section: 'seating',
      route: '/venues/[id]/seating',
      component: 'SeatingViewer',
      buildTarget: 'src/components/venues/SeatingGrid.tsx',
      forwardRoute: '/venues/[id]/book',
      backRoute: '/venues/[id]',
      interactive: true,
      requiresAnimation: true,
      tier: 'free',
    },
  ],
};

/**
 * Aggregated stats for build readiness
 */
export const SECTION_STATS = {
  homepages: { count: 12, routes: 5, interactive: true },
  profiles: { count: 14, routes: 3, interactive: true },
  magazine: { count: 176, routes: 3, interactive: true },
  hosts: { count: 22, routes: 2, interactive: true },
  venues: { count: 72, routes: 4, interactive: true },
  seating: { count: 74, routes: 2, interactive: true },
  totalAssets: 370,
  totalSections: 6,
  totalRoutes: 19,
  requiresAnimationCount: 200, // estimate
};

/**
 * Helper to find a section by route
 */
export function getAssetsBySection(section: TMISectionType): AssetToSection[] {
  return SECTION_ASSET_MAP[section] || [];
}

/**
 * Helper to find forward/back routes
 */
export function getForwardRoute(route: string): string | null {
  for (const assets of Object.values(SECTION_ASSET_MAP)) {
    const asset = assets.find(a => a.route === route);
    if (asset) return asset.forwardRoute;
  }
  return null;
}

export function getBackRoute(route: string): string | null {
  for (const assets of Object.values(SECTION_ASSET_MAP)) {
    const asset = assets.find(a => a.route === route);
    if (asset) return asset.backRoute;
  }
  return null;
}
