import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import type { JuliusPointAction } from './actions';

export interface JuliusPointsSnapshot {
  userId: string;
  totalXp: number;
  totalRewardPoints: number;
  bonusPoints: number;
  seasonPoints: number;
  level: number;
  actionTotals: Partial<Record<JuliusPointAction, number>>;
  currentStreak: number;
  dailyStreak: number;
  weeklyStreak: number;
  rankMovement: number;
  nextUnlock: string | null;
  lastAwardedAt?: string;
  lastSnapshotAt: string;
}

@Injectable()
export class JuliusPointsSnapshots {
  private readonly logger = new Logger(JuliusPointsSnapshots.name);
  private readonly storageRoot = path.resolve(process.cwd(), 'data', 'julius', 'points', 'snapshots');

  private getSnapshotPath(userId: string) {
    return path.join(this.storageRoot, `${userId}.json`);
  }

  /**
   * Creates a hard snapshot of current balances to avoid having to re-sum 
   * millions of ledger rows on every profile load.
   */
  public async createSnapshot(
    userId: string,
    currentXp: number,
    currentRewardPoints: number,
    extras: Partial<Omit<JuliusPointsSnapshot, 'userId' | 'totalXp' | 'totalRewardPoints' | 'lastSnapshotAt'>> = {},
  ) {
    try {
      const snapshotPath = this.getSnapshotPath(userId);
      const snapshot: JuliusPointsSnapshot = {
        userId,
        totalXp: currentXp,
        totalRewardPoints: currentRewardPoints,
        bonusPoints: extras.bonusPoints ?? 0,
        seasonPoints: extras.seasonPoints ?? 0,
        level: extras.level ?? 1,
        actionTotals: extras.actionTotals ?? {},
        currentStreak: extras.currentStreak ?? 0,
        dailyStreak: extras.dailyStreak ?? 0,
        weeklyStreak: extras.weeklyStreak ?? 0,
        rankMovement: extras.rankMovement ?? 0,
        nextUnlock: extras.nextUnlock ?? null,
        lastAwardedAt: extras.lastAwardedAt,
        lastSnapshotAt: new Date().toISOString(),
      };

      await fs.mkdir(path.dirname(snapshotPath), { recursive: true });
      await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf8');
      this.logger.log(`[Snapshots] Snapshot saved for ${userId}`);
      return snapshot;
    } catch (error) {
      this.logger.error(`[Snapshots] Failed to create snapshot for ${userId}`, error);
      return null;
    }
  }

  /**
   * Restores balance from the latest snapshot if the server restarts or 
   * cache is cleared.
   */
  public async restoreFromSnapshot(userId: string) {
    try {
      const snapshotPath = this.getSnapshotPath(userId);
      const raw = await fs.readFile(snapshotPath, 'utf8');
      return JSON.parse(raw) as JuliusPointsSnapshot;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      this.logger.error(`[Snapshots] Failed to restore snapshot for ${userId}`, error);
      return null;
    }
  }
}