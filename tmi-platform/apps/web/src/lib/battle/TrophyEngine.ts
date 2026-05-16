import { randomUUID } from 'crypto';

export type TrophyType = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface TrophyRecord {
  id: string;
  battleId: string;
  winnerUserId: string;
  trophyType: TrophyType;
  awardedAt: string;
}

const TROPHIES = new Map<string, TrophyRecord>();
const TROPHIES_BY_USER = new Map<string, string[]>();

export class TrophyEngine {
  static award(battleId: string, winnerUserId: string, trophyType: TrophyType): TrophyRecord {
    const trophy: TrophyRecord = {
      id: randomUUID(),
      battleId,
      winnerUserId,
      trophyType,
      awardedAt: new Date().toISOString(),
    };

    TROPHIES.set(trophy.id, trophy);
    if (!TROPHIES_BY_USER.has(winnerUserId)) TROPHIES_BY_USER.set(winnerUserId, []);
    TROPHIES_BY_USER.get(winnerUserId)!.push(trophy.id);
    return trophy;
  }

  static getById(trophyId: string): TrophyRecord | null {
    return TROPHIES.get(trophyId) || null;
  }

  static getForUser(userId: string): TrophyRecord[] {
    const ids = TROPHIES_BY_USER.get(userId) || [];
    return ids.map((id) => TROPHIES.get(id)).filter(Boolean) as TrophyRecord[];
  }

  static countByType(userId: string): Record<TrophyType, number> {
    const base: Record<TrophyType, number> = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
      diamond: 0,
    };
    this.getForUser(userId).forEach((t) => {
      base[t.trophyType] += 1;
    });
    return base;
  }
}

export default TrophyEngine;
