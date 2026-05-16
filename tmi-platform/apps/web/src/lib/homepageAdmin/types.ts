export type HomepageRuntimeOverrides = {
  chartItemIds?: string[]
  trendingItemIds?: string[]
  featuredArtistId?: string
  featuredArticleId?: string
  sponsorPlacementId?: string
  eventItemIds?: string[]
}

export type HomepagePublishState = "draft" | "staged" | "live";

export interface HomepageBeltConfig {
  surfaceId: 1 | 2 | 3 | 4 | 5;
  beltId: string;
  order: number;
  visible: boolean;
  publishState?: HomepagePublishState;
  startDate?: string;
  endDate?: string;
}

export interface HomepageScheduleItem {
  surfaceId: 1 | 2 | 3 | 4 | 5;
  beltId?: string;
  enabled: boolean;
  publishState?: HomepagePublishState;
  startDate?: string;
  endDate?: string;
  priority?: number;
  sceneId?: string;
}

export interface HomepageSurfaceTheme {
  surfaceId: 1 | 2 | 3 | 4 | 5;
  sceneId?: string;
  background?: string;
  audioTheme?: string;
  animationPreset?: string;
}

export interface HomepageAutomationSettings {
  enabled: boolean;
  logResolutions?: boolean;
}

export interface HomepageAdminSettings {
  previewAt?: string;
  automation?: HomepageAutomationSettings;
  surfaceThemes: HomepageSurfaceTheme[];
}
