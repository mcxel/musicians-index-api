import { PrizeInventoryEngine } from "./PrizeInventoryEngine";

export type DropTriggerType = "listener_count" | "reaction_milestone" | "timed";
export type DropStatus = "armed" | "fired" | "claimed" | "expired";

interface AuditEntry {
  ts: number;
  action: "armed" | "fired" | "winner_selected" | "redeem_sent" | "fulfillment_sent";
  meta?: string;
}

export interface Drop {
  id: string;
  sponsorId: string;
  prizeId: string;
  triggerType: DropTriggerType;
  triggerValue: number;
  status: DropStatus;
  eligibleUserIds: string[];
  winnerId?: string;
  firedAt?: number;
  claimedAt?: number;
  auditLog: AuditEntry[];
}

interface ArmConfig {
  id: string;
  sponsorId: string;
  prizeId: string;
  triggerType: DropTriggerType;
  triggerValue: number;
}

interface RoomState {
  listenerCount: number;
  reactionCount: number;
  eligibleUserIds: string[];
}

const drops: Map<string, Drop> = new Map();
// Tracks how many prizes a user has won today: userId -> count
const dailyWins: Map<string, { count: number; date: string }> = new Map();
let enabled = true;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function canWin(userId: string): boolean {
  const rec = dailyWins.get(userId);
  if (!rec || rec.date !== todayStr()) return true;
  return rec.count < 2; // max 2 rewards/user/day
}

function recordWin(userId: string): void {
  const rec = dailyWins.get(userId);
  const today = todayStr();
  if (!rec || rec.date !== today) {
    dailyWins.set(userId, { count: 1, date: today });
  } else {
    rec.count += 1;
  }
}

export const DropEngine = {
  setEnabled(val: boolean): void {
    enabled = val;
  },

  isEnabled(): boolean {
    return enabled;
  },

  armDrop(config: ArmConfig): Drop {
    const drop: Drop = {
      ...config,
      status: "armed",
      eligibleUserIds: [],
      auditLog: [{ ts: Date.now(), action: "armed" }],
    };
    drops.set(config.id, drop);
    return drop;
  },

  checkTriggers(roomState: RoomState): Drop | null {
    if (!enabled) return null;
    for (const drop of drops.values()) {
      if (drop.status !== "armed") continue;
      const triggered =
        (drop.triggerType === "listener_count" && roomState.listenerCount >= drop.triggerValue) ||
        (drop.triggerType === "reaction_milestone" && roomState.reactionCount >= drop.triggerValue);
      if (triggered) {
        return this.fireDrop(drop.id, roomState.eligibleUserIds);
      }
    }
    return null;
  },

  fireDrop(dropId: string, eligibleUserIds: string[]): Drop | null {
    const drop = drops.get(dropId);
    if (!drop || drop.status !== "armed") return null;

    // Filter to users who haven't hit daily win cap
    const eligible = eligibleUserIds.filter(canWin);
    if (eligible.length === 0) {
      drop.status = "expired";
      drop.auditLog.push({ ts: Date.now(), action: "fired", meta: "no_eligible_users" });
      return drop;
    }

    const prize = PrizeInventoryEngine.getPrize(drop.prizeId);
    if (!prize || prize.remaining <= 0) {
      drop.status = "expired";
      drop.auditLog.push({ ts: Date.now(), action: "fired", meta: "out_of_stock" });
      return drop;
    }

    const winnerId = eligible[Math.floor(Math.random() * eligible.length)]!;
    drop.eligibleUserIds = eligible;
    drop.winnerId = winnerId;
    drop.firedAt = Date.now();
    drop.status = "fired";
    drop.auditLog.push({ ts: Date.now(), action: "fired", meta: `eligible:${eligible.length}` });
    drop.auditLog.push({ ts: Date.now(), action: "winner_selected", meta: winnerId });

    PrizeInventoryEngine.claimPrize(drop.prizeId, winnerId);
    recordWin(winnerId);

    drop.auditLog.push({ ts: Date.now(), action: "redeem_sent", meta: winnerId });
    drop.auditLog.push({ ts: Date.now(), action: "fulfillment_sent", meta: drop.sponsorId });

    return drop;
  },

  claimDrop(dropId: string, userId: string): { ok: boolean; redeemInstructions?: string; error?: string } {
    const drop = drops.get(dropId);
    if (!drop) return { ok: false, error: "drop_not_found" };
    if (drop.status !== "fired") return { ok: false, error: "drop_not_claimable" };
    if (drop.winnerId !== userId) return { ok: false, error: "not_winner" };
    drop.status = "claimed";
    drop.claimedAt = Date.now();
    return { ok: true, redeemInstructions: `Congrats! Your prize (${drop.prizeId}) will be fulfilled by sponsor ${drop.sponsorId}. Check your messages for delivery details.` };
  },

  getActiveDrop(): Drop | null {
    for (const drop of drops.values()) {
      if (drop.status === "armed" || drop.status === "fired") return drop;
    }
    return null;
  },

  getAuditLog(dropId: string): AuditEntry[] {
    return drops.get(dropId)?.auditLog ?? [];
  },

  getDrop(id: string): Drop | undefined {
    return drops.get(id);
  },
};
