import type { HomeSurfaceId } from '@/components/home/system/types';

export interface HomepageSpotlightEntry {
  id: string;
  name: string;
  genre: string;
  scoreLabel: string;
  source: 'charts' | 'trending' | 'founding-seed';
}

export interface HomepageEngineOptions {
  activePage: HomeSurfaceId;
  onPageChange: (page: HomeSurfaceId) => void;
}

export interface HomepageEngineState {
  spotlight: HomepageSpotlightEntry;
  queue: HomepageSpotlightEntry[];
  genres: string[];
  activeGenre: string;
  autoplayPages: boolean;
  toggleAutoplayPages: () => void;
  cinematicMode: boolean;
  hiddenBotNames: boolean;
  layoutEditable: boolean;
  dataSourceLabel: string;
}
