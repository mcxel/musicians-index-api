import type { ComponentType } from 'react';

export type HomeSurfaceId = 1 | 2 | 3 | 4 | 5;

export type HomeBeltAccent = 'cyan' | 'pink' | 'purple' | 'gold';

export type HomeBeltComponentKey =
  | 'MAGAZINE_COVER_BELT'
  | 'HERO_BELT'
  | 'CROWN_BELT'
  | 'NEWS_BELT'
  | 'INTERVIEW_BELT'
  | 'CHART_BELT'
  | 'SPONSOR_BELT'
  | 'RELEASES_BELT'
  | 'LIVE_SHOWS_BELT'
  | 'STORE_BELT'
  | 'CYPHER_BELT';

export interface HomeBeltDefinition {
  id: string;
  componentKey: HomeBeltComponentKey;
  title?: string;
  subtitle?: string;
  badge?: string;
  accent?: HomeBeltAccent;
  chrome?: boolean;
}

export interface HomeSurfaceDefinition {
  id: HomeSurfaceId;
  belts: HomeBeltDefinition[];
  layoutOrder: string[];
  sceneId: string;
  background: string;
  audioTheme?: string;
  animationPreset?: string;
}

export type HomeBeltComponentMap = Record<HomeBeltComponentKey, ComponentType>;