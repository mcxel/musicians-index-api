export type RandomPageType =
  | 'artist'
  | 'news'
  | 'venue-promo'
  | 'sponsor'
  | 'advertiser-premium'
  | 'live-lobby'
  | 'battle-cypher'
  | 'surprise-giveaway';

export interface RandomPageEntry {
  id: string;
  type: RandomPageType;
  title: string;
  route: string;
  weight: number;
  image: string;
}

export const DEFAULT_RANDOM_PAGE_POOL: RandomPageEntry[] = [
  { id: 'artist-spotlight', type: 'artist', title: 'Artist Spotlight', route: '/articles/artist/astra-nova', weight: 25, image: '/artists/artist-01.png' },
  { id: 'news-topline', type: 'news', title: 'Music News Flash', route: '/articles/news/tmi-weekly', weight: 20, image: '/tmi-curated/mag-66.jpg' },
  { id: 'venue-promo', type: 'venue-promo', title: 'Venue Promotion', route: '/venues/venue-10', weight: 10, image: '/tmi-curated/venue-10.jpg' },
  { id: 'sponsor-spotlight', type: 'sponsor', title: 'Sponsor Spotlight', route: '/sponsors/aether-tech', weight: 10, image: '/tmi-curated/venue-22.jpg' },
  { id: 'advertiser-premium', type: 'advertiser-premium', title: 'Premium Advertiser Slot', route: '/ads/create?placement=random-page', weight: 10, image: '/tmi-curated/gameshow-35.jpg' },
  { id: 'live-lobby', type: 'live-lobby', title: 'Live Lobby Injection', route: '/live/lobby/main-stage', weight: 10, image: '/tmi-curated/venue-14.jpg' },
  { id: 'battle-cypher', type: 'battle-cypher', title: 'Battle/Cypher Recap', route: '/battles/weekly', weight: 10, image: '/tmi-curated/gameshow-36.jpg' },
  { id: 'surprise-giveaway', type: 'surprise-giveaway', title: 'Surprise Giveaway', route: '/prizes', weight: 5, image: '/tmi-curated/home5.png' },
];

export function pickWeightedRandomPage(
  pool: RandomPageEntry[] = DEFAULT_RANDOM_PAGE_POOL,
  randomValue?: number,
): RandomPageEntry {
  const total = pool.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
  if (total <= 0) return pool[0]!;

  const roll = (randomValue ?? Math.random()) * total;
  let cursor = 0;
  for (const item of pool) {
    cursor += Math.max(0, item.weight);
    if (roll <= cursor) return item;
  }
  return pool[pool.length - 1]!;
}
