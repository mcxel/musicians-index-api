import type { HomeBeltDefinition, HomeSurfaceDefinition, HomeSurfaceId } from './types';
import type {
  HomepageAdminSettings,
  HomepageBeltConfig,
  HomepageScheduleItem,
} from '@/lib/homepageAdmin/types';

const HOME_SURFACE_IDS: HomeSurfaceId[] = [1, 2, 3, 4, 5];

const HOME_1: HomeBeltDefinition[] = [
  { id: 'magazine-cover-belt', componentKey: 'MAGAZINE_COVER_BELT', chrome: false },
  { id: 'news-belt', componentKey: 'NEWS_BELT', chrome: false },
  { id: 'interview-belt', componentKey: 'INTERVIEW_BELT', chrome: false },
  { id: 'sponsor-belt-home-1', componentKey: 'SPONSOR_BELT', chrome: false },
];

const HOME_2: HomeBeltDefinition[] = [
  { id: 'crown-belt', componentKey: 'CROWN_BELT', chrome: false },
  { id: 'chart-belt', componentKey: 'CHART_BELT', chrome: false },
  { id: 'releases-belt', componentKey: 'RELEASES_BELT', chrome: false },
  { id: 'store-belt', componentKey: 'STORE_BELT', chrome: false },
];

const HOME_3: HomeBeltDefinition[] = [
  { id: 'live-shows-belt', componentKey: 'LIVE_SHOWS_BELT', chrome: false },
  { id: 'news-belt-home-3', componentKey: 'NEWS_BELT', chrome: false },
  { id: 'sponsor-belt-home-3', componentKey: 'SPONSOR_BELT', chrome: false },
];

const HOME_4: HomeBeltDefinition[] = [
  { id: 'sponsor-belt-home-4', componentKey: 'SPONSOR_BELT', chrome: false },
  { id: 'news-belt-home-4', componentKey: 'NEWS_BELT', chrome: false },
  { id: 'live-shows-belt-home-4', componentKey: 'LIVE_SHOWS_BELT', chrome: false },
  { id: 'interview-belt-home-4', componentKey: 'INTERVIEW_BELT', chrome: false },
];

const HOME_5: HomeBeltDefinition[] = [
  { id: 'cypher-belt-home-5', componentKey: 'CYPHER_BELT', chrome: false },
  { id: 'chart-belt-home-5', componentKey: 'CHART_BELT', chrome: false },
  { id: 'releases-belt-home-5', componentKey: 'RELEASES_BELT', chrome: false },
  { id: 'store-belt-home-5', componentKey: 'STORE_BELT', chrome: false },
  { id: 'crown-belt-home-5', componentKey: 'CROWN_BELT', chrome: false },
];

const HOME_SURFACES: Record<HomeSurfaceId, HomeSurfaceDefinition> = {
  1: {
    id: 1,
    belts: HOME_1,
    layoutOrder: HOME_1.map((belt) => belt.id),
    sceneId: 'magazine-cover',
    // Crown Cover — deep cosmic purple, cyan edge light, fuchsia floor bounce
    background: 'radial-gradient(ellipse at 50% 0%,   rgba(170,45,255,0.30) 0%, transparent 52%), radial-gradient(ellipse at 15% 20%,  rgba(170,45,255,0.18) 0%, transparent 42%), radial-gradient(ellipse at 85% 75%, rgba(0,255,255,0.16) 0%, transparent 45%), radial-gradient(ellipse at 50% 100%, rgba(255,45,170,0.12) 0%, transparent 38%), linear-gradient(160deg, #060212 0%, #0a0420 45%, #050210 100%)',
    audioTheme: 'home-1-editorial',
    animationPreset: 'magazine-glow',
  },
  2: {
    id: 2,
    belts: HOME_2,
    layoutOrder: HOME_2.map((belt) => belt.id),
    sceneId: 'dashboard-core',
    // Editorial Discovery — deep indigo press, crown purple overhead, ink-black depth
    background: 'radial-gradient(ellipse at 50% 0%,   rgba(100,0,255,0.22) 0%, transparent 50%), radial-gradient(ellipse at 90% 85%, rgba(0,200,255,0.14) 0%, transparent 45%), radial-gradient(ellipse at 10% 85%, rgba(255,45,170,0.10) 0%, transparent 40%), radial-gradient(ellipse at 50% 50%, rgba(60,0,120,0.12) 0%, transparent 60%), linear-gradient(170deg, #040118 0%, #080322 50%, #020012 100%)',
    audioTheme: 'home-2-dashboard',
    animationPreset: 'pulse-stagger',
  },
  3: {
    id: 3,
    belts: HOME_3,
    layoutOrder: HOME_3.map((belt) => belt.id),
    sceneId: 'live-world',
    // Live World — stage amber overhead, warm red side fill, heat rising from floor
    background: 'radial-gradient(ellipse at 50% 0%,   rgba(255,110,20,0.20) 0%, transparent 50%), radial-gradient(ellipse at 20% 60%, rgba(220,40,20,0.14) 0%, transparent 40%), radial-gradient(ellipse at 80% 60%, rgba(255,140,0,0.12) 0%, transparent 40%), radial-gradient(ellipse at 50% 100%, rgba(180,30,0,0.10) 0%, transparent 35%), linear-gradient(160deg, #080308 0%, #160708 50%, #060206 100%)',
    audioTheme: 'home-3-live',
    animationPreset: 'live-sweep',
  },
  4: {
    id: 4,
    belts: HOME_4,
    layoutOrder: HOME_4.map((belt) => belt.id),
    sceneId: 'sponsor-world',
    // Sponsor World — gold billboard wash, luxury amber columns, premium brand light
    background: 'radial-gradient(ellipse at 70% 0%,   rgba(255,210,0,0.18) 0%, transparent 48%), radial-gradient(ellipse at 30% 90%, rgba(180,120,0,0.14) 0%, transparent 42%), radial-gradient(ellipse at 0%  50%,  rgba(255,160,0,0.10) 0%, transparent 35%), radial-gradient(ellipse at 100% 50%, rgba(200,140,0,0.10) 0%, transparent 35%), linear-gradient(155deg, #07060a 0%, #0e0b04 50%, #040400 100%)',
    audioTheme: 'home-4-sponsor',
    animationPreset: 'ticker-drift',
  },
  5: {
    id: 5,
    belts: HOME_5,
    layoutOrder: HOME_5.map((belt) => belt.id),
    sceneId: 'charts-store',
    // Battle Arena — crimson arena light, purple side tunnels, fire from below
    background: 'radial-gradient(ellipse at 50% 0%,   rgba(200,0,50,0.26) 0%, transparent 52%), radial-gradient(ellipse at 10% 70%, rgba(140,0,220,0.14) 0%, transparent 40%), radial-gradient(ellipse at 90% 70%, rgba(220,40,0,0.14) 0%, transparent 40%), radial-gradient(ellipse at 50% 100%, rgba(160,0,30,0.18) 0%, transparent 38%), linear-gradient(165deg, #080209 0%, #100206 50%, #060108 100%)',
    audioTheme: 'home-5-charts-store',
    animationPreset: 'chart-rise',
  },
};

export function getHomeSurface(surfaceId: HomeSurfaceId): HomeSurfaceDefinition {
  return HOME_SURFACES[surfaceId] ?? HOME_SURFACES[1];
}

export function getHomeSurfaceBelts(surfaceId: HomeSurfaceId): HomeBeltDefinition[] {
  return getHomeSurface(surfaceId).belts;
}

export function getHomepageSurfaceIds(): HomeSurfaceId[] {
  return HOME_SURFACE_IDS;
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isLiveState(state: 'draft' | 'staged' | 'live' | undefined, now: Date, startDate?: string): boolean {
  if (state === 'draft') return false;
  if (state === 'staged') {
    const start = parseDate(startDate);
    return !!start && now >= start;
  }
  return true;
}

function isConfigActive(config: HomepageBeltConfig, now: Date): boolean {
  if (!isLiveState(config.publishState, now, config.startDate)) return false;
  const start = parseDate(config.startDate);
  const end = parseDate(config.endDate);
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

function isScheduleActive(item: HomepageScheduleItem, now: Date): boolean {
  if (!item.enabled) return false;
  if (!isLiveState(item.publishState, now, item.startDate)) return false;
  const start = parseDate(item.startDate);
  const end = parseDate(item.endDate);
  if (!start || !end) return false;
  return now >= start && now <= end;
}

export function applyHomepageBeltConfig(
  surface: HomeSurfaceDefinition,
  beltConfig: HomepageBeltConfig[],
  schedule: HomepageScheduleItem[],
  now: Date = new Date()
): HomeSurfaceDefinition {
  const configs = beltConfig.filter((config) => config.surfaceId === surface.id);
  const surfaceSchedule = schedule.filter((item) => item.surfaceId === surface.id);

  const configuredBelts = surface.belts
    .map((belt, index) => {
      const config = configs.find((item) => item.beltId === belt.id);
      const beltSchedule = surfaceSchedule
        .filter((item) => item.beltId === belt.id && isScheduleActive(item, now))
        .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))[0];

      if (!config) {
        return {
          belt,
          visible: true,
          order: beltSchedule?.priority ?? index + 1,
        };
      }

      const active = isConfigActive(config, now);
      return {
        belt,
        visible: (config.visible && active) || !!beltSchedule,
        order: beltSchedule?.priority ?? config.order,
      };
    })
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order)
    .map((item) => item.belt);

  return {
    ...surface,
    belts: configuredBelts,
    layoutOrder: configuredBelts.map((belt) => belt.id),
  };
}

export function applyHomepageSettings(
  surface: HomeSurfaceDefinition,
  settings: HomepageAdminSettings | null,
  schedule: HomepageScheduleItem[],
  now: Date = new Date()
): HomeSurfaceDefinition {
  const surfaceTheme = settings?.surfaceThemes.find((item) => item.surfaceId === surface.id);
  const activeSchedule = schedule
    .filter((item) => item.surfaceId === surface.id)
    .filter((item) => !item.beltId)
    .filter((item) => isScheduleActive(item, now))
    .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))[0];

  return {
    ...surface,
    sceneId: activeSchedule?.sceneId ?? surfaceTheme?.sceneId ?? surface.sceneId,
    background: surfaceTheme?.background ?? surface.background,
    audioTheme: surfaceTheme?.audioTheme ?? surface.audioTheme,
    animationPreset: surfaceTheme?.animationPreset ?? surface.animationPreset,
  };
}