import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import type { JuliusPointAction } from './actions';

type JuliusPointsState = {
  userId: string;
  totalXp: number;
  rewardPoints: number;
  bonusPoints: number;
  seasonPoints: number;
  level: number;
  lastAwardedAt?: string;
  actionTotals: Partial<Record<JuliusPointAction, number>>;
};

export interface LedgerEntry {
  userId: string;
  action: JuliusPointAction;
  xpEarned: number;
  rewardPointsEarned: number;
  bonusPointsEarned?: number;
  seasonPointsEarned?: number;
  contextId?: string; // e.g., roomId, eventId, matchId
  metadata?: Record<string, unknown>;
  resultingLedger?: JuliusPointsState;
  timestamp: Date | string;
}

@Injectable()
export class JuliusPointsLedger {
  private readonly logger = new Logger(JuliusPointsLedger.name);
  private readonly storageRoot = path.resolve(process.cwd(), 'data', 'julius', 'points', 'ledger');

  private getLedgerPath(userId: string) {
    return path.join(this.storageRoot, `${userId}.json`);
  }

  private async readLedger(userId: string): Promise<LedgerEntry[]> {
    const ledgerPath = this.getLedgerPath(userId);
    try {
      const raw = await fs.readFile(ledgerPath, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      this.logger.error(`[Ledger] Failed to read ledger for ${userId}`, error);
      return [];
    }
  }

  public async getTransactions(userId: string, limit = 100): Promise<LedgerEntry[]> {
    const entries = await this.readLedger(userId);
    return entries.slice(0, Math.max(1, limit));
  }

  public async recordTransaction(entry: LedgerEntry): Promise<boolean> {
    try {
      const ledgerPath = this.getLedgerPath(entry.userId);
      const existing = await this.readLedger(entry.userId);
      const normalizedEntry: LedgerEntry = {
        ...entry,
        timestamp: entry.timestamp instanceof Date ? entry.timestamp.toISOString() : entry.timestamp,
      };

      await fs.mkdir(path.dirname(ledgerPath), { recursive: true });
      await fs.writeFile(ledgerPath, JSON.stringify([normalizedEntry, ...existing], null, 2), 'utf8');
      
      this.logger.log(`[Ledger] Recorded ${entry.action} for ${entry.userId} (+${entry.xpEarned} XP)`);
      return true;
    } catch (error) {
      this.logger.error(`[Ledger] Failed to record transaction for ${entry.userId}`, error);
      return false;
    }
  }
}