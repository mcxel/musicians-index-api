/**
 * BattleReplayVaultEngine
 * Archives completed battles for replay routes and profile/billboard recovery.
 */

export interface BattleReplayRecord {
  replayId: string;
  battleId: string;
  winnerId: string;
  loserId: string;
  winnerScore: number;
  loserScore: number;
  totalVotes: number;
  chatMessages: number;
  highlightClipRoute: string;
  replayRoute: string;
  createdAt: number;
}

export class BattleReplayVaultEngine {
  private records: Map<string, BattleReplayRecord> = new Map();

  archiveBattle(input: {
    battleId: string;
    winnerId: string;
    loserId: string;
    winnerScore: number;
    loserScore: number;
    totalVotes: number;
    chatMessages: number;
  }): BattleReplayRecord {
    const replayId = `replay-${input.battleId}`;
    const record: BattleReplayRecord = {
      replayId,
      battleId: input.battleId,
      winnerId: input.winnerId,
      loserId: input.loserId,
      winnerScore: input.winnerScore,
      loserScore: input.loserScore,
      totalVotes: input.totalVotes,
      chatMessages: input.chatMessages,
      highlightClipRoute: `/clips/${input.battleId}`,
      replayRoute: `/battles/replay/${input.battleId}`,
      createdAt: Date.now(),
    };
    this.records.set(input.battleId, record);
    return record;
  }

  getReplay(battleId: string): BattleReplayRecord | null {
    return this.records.get(battleId) ?? null;
  }

  listRecent(limit: number = 24): BattleReplayRecord[] {
    return [...this.records.values()]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }
}

export const battleReplayVaultEngine = new BattleReplayVaultEngine();
