export type RealityModule =
  | 'venue'
  | 'avatar'
  | 'ui'
  | 'audio'
  | 'lighting'
  | 'animation'
  | 'camera'
  | 'performance';

export type RealityScorer = 'blackbox' | 'copilot' | 'claude' | 'gemini' | 'manual';

export interface RealityCertificationScorecard {
  id: string;
  module: RealityModule;
  targetId: string;
  targetLabel: string;
  scoredAt: number;
  scorer: RealityScorer;
  metrics: Record<string, number>;
  overall: number;
}

const DEFAULT_SCORECARDS: RealityCertificationScorecard[] = [
  {
    id: 'venue:thunder-dome',
    module: 'venue',
    targetId: 'thunder-dome',
    targetLabel: 'Thunder Dome',
    scoredAt: Date.now(),
    scorer: 'manual',
    metrics: {
      lighting: 98,
      materials: 91,
      avatarRealism: 88,
      audienceRealism: 83,
      stageRealism: 96,
      cameraRealism: 93,
      atmosphere: 95,
      performance: 89,
      lod: 86,
      shadowQuality: 90,
      audioAmbience: 92,
    },
    overall: 91,
  },
  {
    id: 'avatar:default-humanity',
    module: 'avatar',
    targetId: 'default-humanity',
    targetLabel: 'Avatar Humanity Baseline',
    scoredAt: Date.now(),
    scorer: 'manual',
    metrics: {
      skin: 85,
      hair: 79,
      eyes: 84,
      clothing: 88,
      animation: 80,
      lipSync: 72,
      idle: 86,
      props: 77,
      lighting: 83,
    },
    overall: 81,
  },
  {
    id: 'ui:home3',
    module: 'ui',
    targetId: 'home3',
    targetLabel: 'Home 3',
    scoredAt: Date.now(),
    scorer: 'manual',
    metrics: {
      legacyPanels: 74,
      glassConsistency: 90,
      spacing: 89,
      typography: 91,
      animation: 87,
      buttonIntegrity: 82,
      colorSystem: 88,
      iconConsistency: 84,
    },
    overall: 86,
  },
];

const scorecards = new Map<string, RealityCertificationScorecard>(
  DEFAULT_SCORECARDS.map((scorecard) => [scorecard.id, scorecard]),
);

function scorecardId(module: RealityModule, targetId: string): string {
  return `${module}:${targetId}`;
}

function computeOverall(metrics: Record<string, number>): number {
  const values = Object.values(metrics);
  if (values.length === 0) return 0;
  const average = values.reduce((sum, value) => sum + Math.max(0, Math.min(100, value)), 0) / values.length;
  return Math.round(average);
}

export function upsertRealityScorecard(input: {
  module: RealityModule;
  targetId: string;
  targetLabel: string;
  scorer: RealityScorer;
  metrics: Record<string, number>;
}): RealityCertificationScorecard {
  const id = scorecardId(input.module, input.targetId);
  const next: RealityCertificationScorecard = {
    id,
    module: input.module,
    targetId: input.targetId,
    targetLabel: input.targetLabel,
    scorer: input.scorer,
    scoredAt: Date.now(),
    metrics: { ...input.metrics },
    overall: computeOverall(input.metrics),
  };
  scorecards.set(id, next);
  return next;
}

export function listRealityScorecards(module?: RealityModule): RealityCertificationScorecard[] {
  const all = Array.from(scorecards.values());
  const filtered = module ? all.filter((scorecard) => scorecard.module === module) : all;
  return filtered.sort((a, b) => b.overall - a.overall);
}

export function getRealityScorecard(module: RealityModule, targetId: string): RealityCertificationScorecard | null {
  return scorecards.get(scorecardId(module, targetId)) ?? null;
}

export function getRealityCertificationSummary(): {
  updatedAtMs: number;
  totalScorecards: number;
  overallAverage: number;
  byModule: Record<RealityModule, { count: number; average: number; topTarget: string | null }>;
  ladder: RealityCertificationScorecard[];
} {
  const ladder = listRealityScorecards();
  const moduleKeys: RealityModule[] = ['venue', 'avatar', 'ui', 'audio', 'lighting', 'animation', 'camera', 'performance'];

  const byModule: Record<RealityModule, { count: number; average: number; topTarget: string | null }> = {
    venue: { count: 0, average: 0, topTarget: null },
    avatar: { count: 0, average: 0, topTarget: null },
    ui: { count: 0, average: 0, topTarget: null },
    audio: { count: 0, average: 0, topTarget: null },
    lighting: { count: 0, average: 0, topTarget: null },
    animation: { count: 0, average: 0, topTarget: null },
    camera: { count: 0, average: 0, topTarget: null },
    performance: { count: 0, average: 0, topTarget: null },
  };

  for (const module of moduleKeys) {
    const cards = ladder.filter((scorecard) => scorecard.module === module);
    byModule[module] = {
      count: cards.length,
      average: cards.length > 0
        ? Math.round(cards.reduce((sum, scorecard) => sum + scorecard.overall, 0) / cards.length)
        : 0,
      topTarget: cards[0]?.targetLabel ?? null,
    };
  }

  const overallAverage = ladder.length > 0
    ? Math.round(ladder.reduce((sum, scorecard) => sum + scorecard.overall, 0) / ladder.length)
    : 0;

  return {
    updatedAtMs: Date.now(),
    totalScorecards: ladder.length,
    overallAverage,
    byModule,
    ladder,
  };
}