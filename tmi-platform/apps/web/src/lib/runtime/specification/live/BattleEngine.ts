export interface BattleEngine {
  startBattle(roomId: string): Promise<void>;
  submitBattleVote(roomId: string, voterId: string, targetId: string): Promise<void>;
}
