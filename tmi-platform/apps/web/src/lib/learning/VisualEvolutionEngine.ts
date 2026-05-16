import { platformLearningCore } from './PlatformLearningCore';

export interface VisualVariantSignal {
  variantId: string;
  clicks: number;
  watches: number;
  shares: number;
  dropoffs: number;
  performanceScore: number;
  recommendation: 'promote' | 'iterate' | 'retire';
}

export class VisualEvolutionEngine {
  analyzeVisualVariants(limit = 30): VisualVariantSignal[] {
    const events = platformLearningCore.listEvents(30000);
    const map = new Map<string, VisualVariantSignal>();

    for (const event of events) {
      const variantId =
        event.context?.visualVariantId?.toString() || event.targetId || event.route || 'unknown-visual';
      const row =
        map.get(variantId) ||
        ({
          variantId,
          clicks: 0,
          watches: 0,
          shares: 0,
          dropoffs: 0,
          performanceScore: 0,
          recommendation: 'iterate',
        } as VisualVariantSignal);

      if (event.type === 'click') row.clicks += 1;
      if (event.type === 'watch') row.watches += 1;
      if (event.type === 'share') row.shares += 1;
      if (event.type === 'dropoff' || event.type === 'exit') row.dropoffs += 1;

      row.performanceScore = Number((row.clicks * 1 + row.watches * 0.8 + row.shares * 1.6 - row.dropoffs * 1.4).toFixed(2));

      if (row.performanceScore > 25) row.recommendation = 'promote';
      else if (row.performanceScore < 0) row.recommendation = 'retire';
      else row.recommendation = 'iterate';

      map.set(variantId, row);
    }

    return [...map.values()].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, limit);
  }
}

export const visualEvolutionEngine = new VisualEvolutionEngine();
