import { platformLearningCore } from './PlatformLearningCore';

export interface ContentInterestSignal {
  contentId: string;
  reads: number;
  listens: number;
  shares: number;
  conversions: number;
  score: number;
}

export class ContentInterestEngine {
  getTopContent(limit = 20): ContentInterestSignal[] {
    const events = platformLearningCore.listEvents(20000);
    const map = new Map<string, ContentInterestSignal>();

    for (const event of events) {
      const id = event.targetId || event.route || 'unknown-content';
      const row =
        map.get(id) ||
        ({ contentId: id, reads: 0, listens: 0, shares: 0, conversions: 0, score: 0 } as ContentInterestSignal);

      if (event.type === 'article_read') row.reads += 1;
      if (event.type === 'music_listen') row.listens += 1;
      if (event.type === 'share') row.shares += 1;
      if (event.type === 'beat_purchase' || event.type === 'nft_purchase' || event.type === 'subscription_upgrade') {
        row.conversions += 1;
      }

      row.score = Number((row.reads * 1 + row.listens * 0.7 + row.shares * 1.2 + row.conversions * 2.4).toFixed(2));
      map.set(id, row);
    }

    return [...map.values()].sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

export const contentInterestEngine = new ContentInterestEngine();
