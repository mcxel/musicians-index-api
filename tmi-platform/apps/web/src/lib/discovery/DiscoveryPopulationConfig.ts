import type { LiveSession } from '@/lib/broadcast/GlobalLiveSessionRegistry';

export type DiscoveryPopulationConfig = {
  enabled: boolean;
  realSessionThreshold: number;
  rotationIntervalSeconds: number;
  officialBotEnabled: boolean;
  maxBotCards: number;
  botCategoriesAllowed: string[];
  surfaceTargetCount: number;
};

const REAL_PUBLIC_SESSION_CATEGORIES = new Set([
  'live',
  'battle',
  'cypher',
  'challenge',
  'concert',
  'game',
  'session',
  'watch-party',
  'listening-party',
  'lounge',
  'venue',
]);

const DEFAULT_CONFIG: DiscoveryPopulationConfig = {
  enabled: true,
  realSessionThreshold: Number(process.env.DISCOVERY_REAL_SESSION_THRESHOLD ?? '100') || 100,
  rotationIntervalSeconds: Number(process.env.DISCOVERY_ROTATION_INTERVAL_SECONDS ?? '20') || 20,
  officialBotEnabled: (process.env.DISCOVERY_OFFICIAL_BOT_ENABLED ?? 'true').toLowerCase() !== 'false',
  maxBotCards: Number(process.env.DISCOVERY_MAX_BOT_CARDS ?? '6') || 6,
  botCategoriesAllowed: (process.env.DISCOVERY_BOT_CATEGORIES_ALLOWED ?? '').split(',').map((v) => v.trim()).filter(Boolean),
  surfaceTargetCount: Number(process.env.DISCOVERY_SURFACE_TARGET_COUNT ?? '12') || 12,
};

let runtimeConfig: DiscoveryPopulationConfig = { ...DEFAULT_CONFIG };

function clampInt(value: number, min: number, max: number): number {
  const rounded = Math.round(value);
  if (Number.isNaN(rounded)) return min;
  return Math.max(min, Math.min(max, rounded));
}

export function getDiscoveryPopulationConfig(): DiscoveryPopulationConfig {
  return { ...runtimeConfig };
}

export function updateDiscoveryPopulationConfig(patch: Partial<DiscoveryPopulationConfig>): DiscoveryPopulationConfig {
  runtimeConfig = {
    ...runtimeConfig,
    ...patch,
    realSessionThreshold: clampInt(patch.realSessionThreshold ?? runtimeConfig.realSessionThreshold, 0, 10000),
    rotationIntervalSeconds: clampInt(patch.rotationIntervalSeconds ?? runtimeConfig.rotationIntervalSeconds, 5, 120),
    maxBotCards: clampInt(patch.maxBotCards ?? runtimeConfig.maxBotCards, 0, 50),
    surfaceTargetCount: clampInt(patch.surfaceTargetCount ?? runtimeConfig.surfaceTargetCount, 1, 100),
    botCategoriesAllowed: Array.isArray(patch.botCategoriesAllowed)
      ? patch.botCategoriesAllowed.map((v) => String(v).trim()).filter(Boolean)
      : runtimeConfig.botCategoriesAllowed,
  };
  return getDiscoveryPopulationConfig();
}

export function isRealPublicDiscoverySession(session: LiveSession): boolean {
  if (session.privacy !== 'PUBLIC') return false;
  return REAL_PUBLIC_SESSION_CATEGORIES.has(session.category);
}

export function countRealPublicDiscoverySessions(sessions: LiveSession[]): number {
  return sessions.filter(isRealPublicDiscoverySession).length;
}

export function shouldUseOfficialBotPopulation(realPublicCount: number, config = getDiscoveryPopulationConfig()): boolean {
  if (!config.enabled) return false;
  if (!config.officialBotEnabled) return false;
  return realPublicCount < config.realSessionThreshold;
}
