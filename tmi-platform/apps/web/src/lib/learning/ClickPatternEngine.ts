import { platformLearningCore } from './PlatformLearningCore';

export interface ClickPattern {
  key: string;
  clicks: number;
  ctrSignal: number;
}

export class ClickPatternEngine {
  getTopClickTargets(limit = 10): ClickPattern[] {
    const clicks = platformLearningCore.queryEvents({ type: 'click' });
    const grouped = new Map<string, number>();

    for (const click of clicks) {
      const key = click.targetId || click.route || 'unknown-target';
      grouped.set(key, (grouped.get(key) ?? 0) + 1);
    }

    const total = clicks.length || 1;
    return [...grouped.entries()]
      .map(([key, count]) => ({
        key,
        clicks: count,
        ctrSignal: Number(((count / total) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);
  }

  getWeakTargets(limit = 10): ClickPattern[] {
    return this.getTopClickTargets(200)
      .filter((target) => target.ctrSignal < 1)
      .sort((a, b) => a.ctrSignal - b.ctrSignal)
      .slice(0, limit);
  }
}

export const clickPatternEngine = new ClickPatternEngine();
