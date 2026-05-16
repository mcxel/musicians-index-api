import { randomUUID } from 'crypto';

export interface MatchProfile {
  userId: string;
  skillScore: number;
  preferredGenre?: string;
  region?: string;
}

export interface MatchPairing {
  id: string;
  queueId: string;
  competitors: string[];
  scoreDelta: number;
  createdAt: string;
}

const QUEUE = new Map<string, MatchProfile[]>();
const PAIRINGS = new Map<string, MatchPairing>();

export class BattleMatchmakingEngine {
  static enqueue(queueId: string, profile: MatchProfile): void {
    if (!QUEUE.has(queueId)) QUEUE.set(queueId, []);
    QUEUE.get(queueId)!.push(profile);
  }

  static dequeue(queueId: string, userId: string): void {
    const current = QUEUE.get(queueId) || [];
    QUEUE.set(queueId, current.filter((p) => p.userId !== userId));
  }

  static match(queueId: string): MatchPairing | null {
    const current = (QUEUE.get(queueId) || []).slice().sort((a, b) => a.skillScore - b.skillScore);
    if (current.length < 2) return null;

    let bestA = current[0];
    let bestB = current[1];
    let bestDelta = Math.abs(bestA.skillScore - bestB.skillScore);

    for (let i = 0; i < current.length - 1; i += 1) {
      const delta = Math.abs(current[i].skillScore - current[i + 1].skillScore);
      if (delta < bestDelta) {
        bestDelta = delta;
        bestA = current[i];
        bestB = current[i + 1];
      }
    }

    const pairing: MatchPairing = {
      id: randomUUID(),
      queueId,
      competitors: [bestA.userId, bestB.userId],
      scoreDelta: bestDelta,
      createdAt: new Date().toISOString(),
    };

    PAIRINGS.set(pairing.id, pairing);
    this.dequeue(queueId, bestA.userId);
    this.dequeue(queueId, bestB.userId);
    return pairing;
  }

  static getPairing(pairingId: string): MatchPairing | null {
    return PAIRINGS.get(pairingId) || null;
  }

  static getQueue(queueId: string): MatchProfile[] {
    return QUEUE.get(queueId) || [];
  }
}

export default BattleMatchmakingEngine;
