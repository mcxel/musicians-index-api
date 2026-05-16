export type HomepageKey = 'cover' | 'magazine' | 'live' | 'social' | 'control';

export interface HomepageLayoutSlot {
  id: string;
  beltId: string;
  colSpan: number;
  rowSpan: number;
  priority: number;
}

export const HOMEPAGE_LAYOUT_MAP: Record<HomepageKey, HomepageLayoutSlot[]> = {
  cover: [
    { id: 'hero-feature', beltId: 'hero-belt', colSpan: 8, rowSpan: 2, priority: 10 },
    { id: 'news-cluster', beltId: 'news-belt', colSpan: 4, rowSpan: 2, priority: 20 },
    { id: 'interview-strip', beltId: 'interview-belt', colSpan: 12, rowSpan: 1, priority: 30 },
    { id: 'sponsor-spotlight', beltId: 'sponsor-belt-home-1', colSpan: 12, rowSpan: 1, priority: 40 },
  ],
  magazine: [
    { id: 'crown-story', beltId: 'crown-belt', colSpan: 6, rowSpan: 2, priority: 10 },
    { id: 'chart-stack', beltId: 'chart-belt', colSpan: 6, rowSpan: 2, priority: 20 },
    { id: 'release-ribbon', beltId: 'releases-belt', colSpan: 8, rowSpan: 1, priority: 30 },
    { id: 'store-ribbon', beltId: 'store-belt', colSpan: 4, rowSpan: 1, priority: 40 },
  ],
  live: [
    { id: 'live-hero', beltId: 'live-shows-belt', colSpan: 8, rowSpan: 2, priority: 10 },
    { id: 'live-news', beltId: 'news-belt-home-3', colSpan: 4, rowSpan: 2, priority: 20 },
    { id: 'live-sponsor', beltId: 'sponsor-belt-home-3', colSpan: 12, rowSpan: 1, priority: 30 },
  ],
  social: [
    { id: 'social-sponsor', beltId: 'sponsor-belt-home-4', colSpan: 12, rowSpan: 1, priority: 10 },
    { id: 'social-news', beltId: 'news-belt-home-4', colSpan: 7, rowSpan: 2, priority: 20 },
    { id: 'social-live', beltId: 'live-shows-belt-home-4', colSpan: 5, rowSpan: 2, priority: 30 },
    { id: 'social-interview', beltId: 'interview-belt-home-4', colSpan: 12, rowSpan: 1, priority: 40 },
  ],
  control: [
    { id: 'control-chart', beltId: 'chart-belt-home-5', colSpan: 5, rowSpan: 2, priority: 10 },
    { id: 'control-release', beltId: 'releases-belt-home-5', colSpan: 7, rowSpan: 2, priority: 20 },
    { id: 'control-store', beltId: 'store-belt-home-5', colSpan: 6, rowSpan: 1, priority: 30 },
    { id: 'control-crown', beltId: 'crown-belt-home-5', colSpan: 6, rowSpan: 1, priority: 40 },
  ],
};
