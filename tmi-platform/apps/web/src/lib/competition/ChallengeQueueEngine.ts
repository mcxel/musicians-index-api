/**
 * ChallengeQueueEngine — eligibility + queue for Winner-Stays CHALLENGER_CALL window.
 * Complements BattleQueueEngine (mid-match minute-8 paid queue); this engine is
 * specifically for the post-result "IS THERE ANOTHER CHALLENGER?" call.
 */

import {
  type BattleActor,
  battleEligibilityEngine,
} from "@/lib/competition/BattleEligibilityEngine";

export type ChallengeQueueEntry = {
  queueEntryId: string;
  battleId: string;
  challenger: BattleActor;
  requestedAt: number;
  priorityScore: number;
};

export type ChallengeWindow = {
  battleId: string;
  championId: string;
  open: boolean;
  opensAt: number;
  closesAt: number;
};

export class ChallengeQueueEngine {
  private windows = new Map<string, ChallengeWindow>();
  private queues = new Map<string, ChallengeQueueEntry[]>();

  openWindow(battleId: string, championId: string, durationMs: number): ChallengeWindow {
    const now = Date.now();
    const window: ChallengeWindow = {
      battleId,
      championId,
      open: true,
      opensAt: now,
      closesAt: now + durationMs,
    };
    this.windows.set(battleId, window);
    if (!this.queues.has(battleId)) this.queues.set(battleId, []);
    return window;
  }

  closeWindow(battleId: string): void {
    const w = this.windows.get(battleId);
    if (w) w.open = false;
  }

  isWindowOpen(battleId: string): boolean {
    const w = this.windows.get(battleId);
    if (!w || !w.open) return false;
    if (Date.now() > w.closesAt) {
      w.open = false;
      return false;
    }
    return true;
  }

  enqueue(input: {
    battleId: string;
    challenger: BattleActor;
  }): { ok: boolean; entry?: ChallengeQueueEntry; reason?: string } {
    if (!this.isWindowOpen(input.battleId)) {
      return { ok: false, reason: "challenger-window-closed" };
    }
    const window = this.windows.get(input.battleId)!;
    if (input.challenger.userId === window.championId) {
      return { ok: false, reason: "champion-cannot-challenge-self" };
    }
    const eligibility = battleEligibilityEngine.checkActorEligibility(input.challenger);
    if (!eligibility.eligible) {
      return { ok: false, reason: eligibility.reason ?? "not-eligible" };
    }
    const queue = this.queues.get(input.battleId) ?? [];
    if (queue.some((e) => e.challenger.userId === input.challenger.userId)) {
      return { ok: false, reason: "already-queued" };
    }
    const tierWeight =
      input.challenger.tier === "diamond"
        ? 60
        : input.challenger.tier === "platinum"
          ? 50
          : input.challenger.tier === "gold"
            ? 40
            : 20;
    const entry: ChallengeQueueEntry = {
      queueEntryId: `cq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      battleId: input.battleId,
      challenger: input.challenger,
      requestedAt: Date.now(),
      priorityScore: tierWeight + Date.now() / 1e12,
    };
    queue.push(entry);
    queue.sort((a, b) => b.priorityScore - a.priorityScore);
    this.queues.set(input.battleId, queue);
    return { ok: true, entry };
  }

  claimChallenger(
    battleId: string,
    challengerId: string,
  ): { ok: boolean; entry?: ChallengeQueueEntry; reason?: string } {
    const queue = this.queues.get(battleId) ?? [];
    const idx = queue.findIndex((e) => e.challenger.userId === challengerId);
    if (idx < 0) return { ok: false, reason: "not-in-queue" };
    const [entry] = queue.splice(idx, 1);
    this.queues.set(battleId, queue);
    this.closeWindow(battleId);
    return { ok: true, entry };
  }

  popNext(battleId: string): ChallengeQueueEntry | null {
    const queue = this.queues.get(battleId) ?? [];
    if (queue.length === 0) return null;
    const next = queue.shift() ?? null;
    this.queues.set(battleId, queue);
    this.closeWindow(battleId);
    return next;
  }

  getQueue(battleId: string): ChallengeQueueEntry[] {
    return [...(this.queues.get(battleId) ?? [])];
  }

  getWindow(battleId: string): ChallengeWindow | null {
    return this.windows.get(battleId) ?? null;
  }
}

export const challengeQueueEngine = new ChallengeQueueEngine();
