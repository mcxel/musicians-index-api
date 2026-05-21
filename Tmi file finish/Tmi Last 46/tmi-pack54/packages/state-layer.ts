// packages/state/src/state-layer.ts
// Platform-wide shared state for user, room, wallet, and presence.
// Client: uses Zustand. Server: uses Redis + BullMQ.

// ── USER STATE ─────────────────────────────────────────────────
export interface UserState {
  userId: string | null;
  displayName: string | null;
  tier: string;
  isPermanentDiamond: boolean;
  prestige: number;     // 0-33
  points: number;       // current balance
  dailyPoints: number;  // today's earned (max 500)
  activeRoomId: string | null;
  activeWorld: "1" | "2" | "3" | "4" | "5";
  crownHeld: boolean;
  sponsorSlotsLocal: number;
  sponsorSlotsPlatform: number;
  sponsorSlotsUsed: number;
  featureFlags: Record<string, boolean>;
  isOnboarded: boolean;
  role: "ADMIN" | "MEMBER" | "MODERATOR";
  deviceType: string;
  session: { expiresAt: string | null; refreshedAt: string | null };
}

// ── ROOM STATE ────────────────────────────────────────────────
export interface RoomState {
  roomId: string;
  viewerCount: number;
  isLive: boolean;
  hostId: string | null;
  scene: string;
  lighting: string;
  activeGame: string | null;
  hypePercent: number;     // 0-100
  adBreakActive: boolean;
  sponsorId: string | null;
  activePromptId: string | null;
}

// ── WALLET STATE ──────────────────────────────────────────────
export interface WalletState {
  balanceCents: number;
  pendingCents: number;
  lifetimeEarnedCents: number;
  pointsBalance: number;
  transactions: Array<{ id:string; type:string; amountCents:number; createdAt:string }>;
  requiresBigAce: boolean;   // Platform Law #5
}

// ── INITIAL STATES ────────────────────────────────────────────
export const INITIAL_USER_STATE: UserState = {
  userId: null, displayName: null, tier: "FREE", isPermanentDiamond: false,
  prestige: 0, points: 0, dailyPoints: 0, activeRoomId: null,
  activeWorld: "1", crownHeld: false,
  sponsorSlotsLocal: 6, sponsorSlotsPlatform: 4, sponsorSlotsUsed: 0,
  featureFlags: {}, isOnboarded: false, role: "MEMBER", deviceType: "DESKTOP",
  session: { expiresAt: null, refreshedAt: null },
};

// ── SPONSOR SLOT CAPACITY TABLE ───────────────────────────────
// Platform Law: Free = 10 (6 local + 4 platform), scales by tier
export const SPONSOR_SLOT_CAPACITY = {
  FREE:     { local:  6, platform:  4, total: 10  },
  STARTER:  { local: 12, platform:  8, total: 20  },
  PRO:      { local: 22, platform: 18, total: 40  },
  GOLD:     { local: 35, platform: 40, total: 75  },
  PLATINUM: { local: 50, platform: 75, total: 125 },
  DIAMOND:  { local: 90, platform:160, total: 250 },
} as const;

export type TierKey = keyof typeof SPONSOR_SLOT_CAPACITY;
export function getSponsorCapacity(tier: TierKey) {
  return SPONSOR_SLOT_CAPACITY[tier] || SPONSOR_SLOT_CAPACITY.FREE;
}
