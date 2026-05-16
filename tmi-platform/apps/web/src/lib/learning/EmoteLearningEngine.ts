import { platformLearningCore } from './PlatformLearningCore';

export interface EmoteSignal {
  emoteId: string;
  uses: number;
  positiveOutcomes: number;
  responseScore: number;
}

export class EmoteLearningEngine {
  getTopEmotes(limit = 25): EmoteSignal[] {
    const events = platformLearningCore.listEvents(20000);
    const map = new Map<string, EmoteSignal>();

    for (const event of events) {
      if (event.type !== 'emote') continue;

      const emoteId = event.targetId || event.context?.emoteId?.toString() || 'unknown-emote';
      const row = map.get(emoteId) || ({ emoteId, uses: 0, positiveOutcomes: 0, responseScore: 0 } as EmoteSignal);

      row.uses += 1;
      if (event.context?.result === 'positive' || event.context?.reacted === true) {
        row.positiveOutcomes += 1;
      }
      row.responseScore = Number(((row.positiveOutcomes / Math.max(row.uses, 1)) * 100).toFixed(2));
      map.set(emoteId, row);
    }

    return [...map.values()].sort((a, b) => b.responseScore - a.responseScore).slice(0, limit);
  }
}

export const emoteLearningEngine = new EmoteLearningEngine();
