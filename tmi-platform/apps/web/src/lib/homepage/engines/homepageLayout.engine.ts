import { HOMEPAGE_LAYOUT_MAP, type HomepageKey, type HomepageLayoutSlot } from '../homepage-layout-map';

export function getHomepageLayout(homepage: HomepageKey): HomepageLayoutSlot[] {
  return HOMEPAGE_LAYOUT_MAP[homepage] ?? [];
}

export function getHomepageBySurface(surfaceId: 1 | 2 | 3 | 4 | 5): HomepageKey {
  if (surfaceId === 1) return 'cover';
  if (surfaceId === 2) return 'magazine';
  if (surfaceId === 3) return 'live';
  if (surfaceId === 4) return 'social';
  return 'control';
}
