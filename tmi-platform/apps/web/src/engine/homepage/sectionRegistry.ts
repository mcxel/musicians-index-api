/**
 * Section Registry & Visibility Engine
 * Central registry for all homepage sections with metadata.
 * Controls which sections are visible, their order defaults, and admin control.
 */

export interface SectionMeta {
  id: string;
  label: string;
  description: string;
  defaultVisible: boolean;
  adminOnly?: boolean;
  /** Display color accent used for edit-mode labels */
  accent: "cyan" | "pink" | "purple" | "gold";
}

export const SECTION_REGISTRY: SectionMeta[] = [
  {
    id: "MagazineCarousel",
    label: "Magazine Carousel",
    description: "Editorial magazine covers and featured articles",
    defaultVisible: true,
    accent: "pink",
  },
  {
    id: "FeaturedArtist",
    label: "Featured Artist",
    description: "Spotlight on the current featured artist",
    defaultVisible: true,
    accent: "cyan",
  },
  {
    id: "Top10Chart",
    label: "Top 10 Chart",
    description: "Platform-wide top 10 chart this week",
    defaultVisible: true,
    accent: "purple",
  },
  {
    id: "NewsStrip",
    label: "News Strip",
    description: "Latest music industry news and platform updates",
    defaultVisible: true,
    accent: "cyan",
  },
  {
    id: "SponsorStrip",
    label: "Sponsor Strip",
    description: "Official platform sponsors marquee",
    defaultVisible: true,
    accent: "gold",
  },
  {
    id: "NewReleases",
    label: "New Releases",
    description: "Fresh drops this week from the platform",
    defaultVisible: true,
    accent: "purple",
  },
  {
    id: "TrendingArtists",
    label: "Trending Artists",
    description: "Artists trending by streams and engagement",
    defaultVisible: true,
    accent: "cyan",
  },
  {
    id: "Interviews",
    label: "Interviews",
    description: "Artist interviews and deep dives",
    defaultVisible: true,
    accent: "pink",
  },
  {
    id: "LiveShows",
    label: "Live Shows",
    description: "Currently active live rooms on the platform",
    defaultVisible: true,
    accent: "pink",
  },
  {
    id: "ContestBanner",
    label: "Contest Banner",
    description: "Weekly Crown Contest with countdown timer",
    defaultVisible: true,
    accent: "gold",
  },
  {
    id: "AdvertiserStrip",
    label: "Advertiser Strip",
    description: "Rotating sponsored content slots",
    defaultVisible: true,
    accent: "cyan",
  },
];

/** Map for O(1) lookup */
export const SECTION_MAP = new Map<string, SectionMeta>(
  SECTION_REGISTRY.map((s) => [s.id, s])
);

export function getSectionMeta(id: string): SectionMeta | undefined {
  return SECTION_MAP.get(id);
}

export function getVisibleSections(
  order: string[],
  hidden: Set<string>
): string[] {
  return order.filter((id) => !hidden.has(id));
}

export function getDefaultVisibleSections(): string[] {
  return SECTION_REGISTRY.filter((s) => s.defaultVisible).map((s) => s.id);
}
