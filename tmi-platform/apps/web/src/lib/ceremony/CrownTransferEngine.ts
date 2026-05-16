/**
 * CrownTransferEngine
 * Tracks crown ownership across battles, cyphers, contests.
 * A crown is a symbolic rank token held by the current champion.
 *
 * Rules:
 * - Each context (battle, cypher-monday, dirty-dozens, etc.) has ONE active crown holder
 * - Winning transfers the crown from previous holder to new winner
 * - Upset wins generate an "upset crown" badge
 * - Crown streak tracked per userId
 * - Crown history preserved for magazine/article generation
 */

export type CrownContext =
  | "battle-1v1"
  | "cypher-monday"
  | "dirty-dozens"
  | "contest-weekly"
  | "battle-freestyle"
  | "arena-championship";

export interface CrownHolder {
  userId: string;
  displayName: string;
  avatarUrl: string;
  crownContext: CrownContext;
  wonAt: number;
  defenseCount: number;
  isUpsetWin: boolean;
  streak: number;
}

export interface CrownTransferRecord {
  transferId: string;
  context: CrownContext;
  fromHolder?: CrownHolder;
  toHolder: CrownHolder;
  battleId: string;
  transferredAt: number;
  isUpset: boolean;
}

let transferSeq = 0;

class CrownTransferEngine {
  /** context → current crown holder */
  private holders = new Map<CrownContext, CrownHolder>();
  /** userId → streak count */
  private streaks = new Map<string, number>();
  private history: CrownTransferRecord[] = [];

  /**
   * Transfer crown from previous holder to new winner.
   * Returns the transfer record.
   */
  transfer(params: {
    battleId: string;
    context: CrownContext;
    winner: { userId: string; displayName: string; avatarUrl: string };
    isUpset?: boolean;
  }): CrownTransferRecord {
    const prevHolder = this.holders.get(params.context);
    const prevStreak = this.streaks.get(params.winner.userId) ?? 0;
    const newStreak = prevHolder?.userId === params.winner.userId
      ? prevStreak + 1  // defending champion
      : 1;              // new champion

    this.streaks.set(params.winner.userId, newStreak);
    // Reset defender's streak if crown changes hands
    if (prevHolder && prevHolder.userId !== params.winner.userId) {
      this.streaks.set(prevHolder.userId, 0);
    }

    const newHolder: CrownHolder = {
      userId: params.winner.userId,
      displayName: params.winner.displayName,
      avatarUrl: params.winner.avatarUrl,
      crownContext: params.context,
      wonAt: Date.now(),
      defenseCount: newStreak - 1,
      isUpsetWin: params.isUpset ?? false,
      streak: newStreak,
    };

    this.holders.set(params.context, newHolder);

    const record: CrownTransferRecord = {
      transferId: `crown-${Date.now()}-${++transferSeq}`,
      context: params.context,
      fromHolder: prevHolder,
      toHolder: newHolder,
      battleId: params.battleId,
      transferredAt: Date.now(),
      isUpset: params.isUpset ?? false,
    };

    this.history.push(record);
    return record;
  }

  getCurrentHolder(context: CrownContext): CrownHolder | undefined {
    return this.holders.get(context);
  }

  getStreak(userId: string): number {
    return this.streaks.get(userId) ?? 0;
  }

  getHistory(context?: CrownContext, limit = 20): CrownTransferRecord[] {
    const filtered = context
      ? this.history.filter((r) => r.context === context)
      : this.history;
    return filtered.slice(-limit).reverse();
  }

  /**
   * Returns all contexts where userId is current crown holder.
   */
  getUserCrowns(userId: string): CrownHolder[] {
    return [...this.holders.values()].filter((h) => h.userId === userId);
  }

  /**
   * Check if userId is the current crown holder for a context.
   */
  isChampion(userId: string, context: CrownContext): boolean {
    return this.holders.get(context)?.userId === userId;
  }
}

export const crownTransferEngine = new CrownTransferEngine();
