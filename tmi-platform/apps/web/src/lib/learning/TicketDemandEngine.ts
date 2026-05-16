import { platformLearningCore } from './PlatformLearningCore';

export interface TicketDemandSignal {
  route: string;
  views: number;
  buys: number;
  conversionRate: number;
  demandScore: number;
}

export interface TicketPricingSuggestion {
  route: string;
  demandTier: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestedMultiplier: number;
  venueDemandIndicator: number;
}

export class TicketDemandEngine {
  getDemandSignals(limit = 20): TicketDemandSignal[] {
    const events = platformLearningCore.listEvents(25000);
    const views = new Map<string, number>();
    const buys = new Map<string, number>();

    for (const event of events) {
      const route = event.route || event.targetId || 'unknown-ticket-route';
      if (event.type === 'click' || event.type === 'watch' || event.type === 'venue_attend') {
        views.set(route, (views.get(route) ?? 0) + 1);
      }
      if (event.type === 'ticket_buy') {
        buys.set(route, (buys.get(route) ?? 0) + 1);
      }
    }

    return [...new Set([...views.keys(), ...buys.keys()])]
      .map((route) => {
        const viewCount = views.get(route) ?? 0;
        const buyCount = buys.get(route) ?? 0;
        const conversionRate = Number(((buyCount / Math.max(viewCount, 1)) * 100).toFixed(2));
        const demandScore = Number((buyCount * 2 + conversionRate * 0.6 + viewCount * 0.25).toFixed(2));
        return { route, views: viewCount, buys: buyCount, conversionRate, demandScore };
      })
      .sort((a, b) => b.demandScore - a.demandScore)
      .slice(0, limit);
  }

  getPricingSuggestions(limit = 10): TicketPricingSuggestion[] {
    return this.getDemandSignals(limit).map((signal) => {
      const demandTier: TicketPricingSuggestion['demandTier'] =
        signal.demandScore >= 40 ? 'HIGH' : signal.demandScore >= 16 ? 'MEDIUM' : 'LOW';
      const suggestedMultiplier = demandTier === 'HIGH' ? 1.18 : demandTier === 'MEDIUM' ? 1.05 : 0.95;
      return {
        route: signal.route,
        demandTier,
        suggestedMultiplier,
        venueDemandIndicator: Number(Math.min(100, signal.demandScore * 1.6).toFixed(2)),
      };
    });
  }
}

export const ticketDemandEngine = new TicketDemandEngine();
