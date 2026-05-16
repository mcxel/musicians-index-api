import { platformLearningCore } from './PlatformLearningCore';

export interface DropOffHotspot {
  route: string;
  dropoffs: number;
  entries: number;
  dropoffRate: number;
}

export class DropOffAnalysisEngine {
  getHotspots(limit = 10): DropOffHotspot[] {
    const events = platformLearningCore.listEvents(10000);
    const entries = new Map<string, number>();
    const drops = new Map<string, number>();

    for (const event of events) {
      const route = event.route || 'unknown-route';
      if (event.type === 'join' || event.type === 'click' || event.type === 'watch') {
        entries.set(route, (entries.get(route) ?? 0) + 1);
      }
      if (event.type === 'dropoff' || event.type === 'exit' || event.type === 'leave') {
        drops.set(route, (drops.get(route) ?? 0) + 1);
      }
    }

    return [...entries.entries()]
      .map(([route, entryCount]) => {
        const dropCount = drops.get(route) ?? 0;
        return {
          route,
          dropoffs: dropCount,
          entries: entryCount,
          dropoffRate: Number(((dropCount / Math.max(entryCount, 1)) * 100).toFixed(2)),
        };
      })
      .sort((a, b) => b.dropoffRate - a.dropoffRate)
      .slice(0, limit);
  }
}

export const dropOffAnalysisEngine = new DropOffAnalysisEngine();
