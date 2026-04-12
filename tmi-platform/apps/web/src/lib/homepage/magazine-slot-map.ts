export interface MagazineSlot {
  slotId: string;
  zone: 'lead' | 'editorial' | 'discovery' | 'marketplace' | 'control';
  beltId: string;
  maxCards: number;
}

export const MAGAZINE_SLOT_MAP: MagazineSlot[] = [
  { slotId: 'lead-hero', zone: 'lead', beltId: 'hero-belt', maxCards: 1 },
  { slotId: 'editorial-news', zone: 'editorial', beltId: 'news-belt', maxCards: 3 },
  { slotId: 'editorial-interview', zone: 'editorial', beltId: 'interview-belt', maxCards: 2 },
  { slotId: 'discovery-live', zone: 'discovery', beltId: 'live-shows-belt', maxCards: 4 },
  { slotId: 'marketplace-store', zone: 'marketplace', beltId: 'store-belt', maxCards: 3 },
  { slotId: 'marketplace-sponsor', zone: 'marketplace', beltId: 'sponsor-belt-home-1', maxCards: 2 },
  { slotId: 'control-julius', zone: 'control', beltId: 'crown-belt-home-5', maxCards: 1 },
];
