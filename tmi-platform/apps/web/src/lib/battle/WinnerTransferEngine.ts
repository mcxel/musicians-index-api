import { randomUUID } from 'crypto';

export interface WinnerTransferRecord {
  id: string;
  battleId: string;
  fromUserId: string;
  toUserId: string;
  reason: string;
  transferredAt: string;
}

const WINNER_BY_BATTLE = new Map<string, string>();
const TRANSFERS = new Map<string, WinnerTransferRecord>();

export class WinnerTransferEngine {
  static setWinner(battleId: string, winnerUserId: string): void {
    WINNER_BY_BATTLE.set(battleId, winnerUserId);
  }

  static transferWinner(battleId: string, toUserId: string, reason: string): WinnerTransferRecord | null {
    const current = WINNER_BY_BATTLE.get(battleId);
    if (!current) return null;

    const rec: WinnerTransferRecord = {
      id: randomUUID(),
      battleId,
      fromUserId: current,
      toUserId,
      reason,
      transferredAt: new Date().toISOString(),
    };

    WINNER_BY_BATTLE.set(battleId, toUserId);
    TRANSFERS.set(rec.id, rec);
    return rec;
  }

  static getWinner(battleId: string): string | null {
    return WINNER_BY_BATTLE.get(battleId) || null;
  }

  static getTransfers(battleId: string): WinnerTransferRecord[] {
    return Array.from(TRANSFERS.values()).filter((t) => t.battleId === battleId);
  }
}

export default WinnerTransferEngine;
