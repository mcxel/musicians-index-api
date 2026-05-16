/**
 * FanPointsWalletEngine.ts
 *
 * Manages fan points wallet balance and limits.
 * Points are earned through attendance, voting, tips, participation.
 * Points can be spent in store, redeemed for tickets, or donated to causes.
 * Purpose: Lightweight currency system for fan engagement.
 */

export interface FanPointsWallet {
  fanId: string;
  pointsBalance: number;
  pointsLifetime: number;
  pointsSpent: number;
  lastActivityAt: number;
  walletStatus: 'active' | 'suspended' | 'locked';
  dailyPointsLimit: number;
  monthlyPointsLimit: number;
  pointsEarnedThisDay: number;
  pointsEarnedThisMonth: number;
  resetDayAt?: number; // timestamp for day reset
  resetMonthAt?: number; // timestamp for month reset
}

// In-memory registry
const fanPointsWallets = new Map<string, FanPointsWallet>();

const DAILY_POINTS_LIMIT = 500;
const MONTHLY_POINTS_LIMIT = 10000;

/**
 * Creates or gets fan points wallet.
 */
export function getOrCreateFanPointsWallet(fanId: string): FanPointsWallet {
  let wallet = fanPointsWallets.get(fanId);
  if (!wallet) {
    const now = Date.now();
    wallet = {
      fanId,
      pointsBalance: 0,
      pointsLifetime: 0,
      pointsSpent: 0,
      lastActivityAt: now,
      walletStatus: 'active',
      dailyPointsLimit: DAILY_POINTS_LIMIT,
      monthlyPointsLimit: MONTHLY_POINTS_LIMIT,
      pointsEarnedThisDay: 0,
      pointsEarnedThisMonth: 0,
      resetDayAt: now + 24 * 60 * 60 * 1000,
      resetMonthAt: now + 30 * 24 * 60 * 60 * 1000,
    };
    fanPointsWallets.set(fanId, wallet);
  }

  // Check if daily or monthly reset needed
  const now = Date.now();
  if (wallet.resetDayAt && now >= wallet.resetDayAt) {
    wallet.pointsEarnedThisDay = 0;
    wallet.resetDayAt = now + 24 * 60 * 60 * 1000;
  }
  if (wallet.resetMonthAt && now >= wallet.resetMonthAt) {
    wallet.pointsEarnedThisMonth = 0;
    wallet.resetMonthAt = now + 30 * 24 * 60 * 60 * 1000;
  }

  return wallet;
}

/**
 * Adds points to wallet.
 */
export function addPointsToWallet(fanId: string, pointsAmount: number): boolean {
  const wallet = getOrCreateFanPointsWallet(fanId);

  if (wallet.walletStatus !== 'active') return false;
  if (wallet.pointsEarnedThisDay + pointsAmount > wallet.dailyPointsLimit) return false;
  if (wallet.pointsEarnedThisMonth + pointsAmount > wallet.monthlyPointsLimit) return false;

  wallet.pointsBalance += pointsAmount;
  wallet.pointsLifetime += pointsAmount;
  wallet.pointsEarnedThisDay += pointsAmount;
  wallet.pointsEarnedThisMonth += pointsAmount;
  wallet.lastActivityAt = Date.now();

  return true;
}

/**
 * Deducts points from wallet.
 */
export function deductPointsFromWallet(fanId: string, pointsAmount: number): boolean {
  const wallet = getOrCreateFanPointsWallet(fanId);

  if (wallet.pointsBalance < pointsAmount) return false;

  wallet.pointsBalance -= pointsAmount;
  wallet.pointsSpent += pointsAmount;
  wallet.lastActivityAt = Date.now();

  return true;
}

/**
 * Gets wallet balance.
 */
export function getFanPointsWallet(fanId: string): FanPointsWallet {
  return getOrCreateFanPointsWallet(fanId);
}

/**
 * Suspends wallet.
 */
export function suspendFanPointsWallet(fanId: string): void {
  const wallet = getOrCreateFanPointsWallet(fanId);
  wallet.walletStatus = 'suspended';
}

/**
 * Locks wallet (fraud).
 */
export function lockFanPointsWallet(fanId: string): void {
  const wallet = getOrCreateFanPointsWallet(fanId);
  wallet.walletStatus = 'locked';
}

/**
 * Reactivates wallet.
 */
export function reactivateFanPointsWallet(fanId: string): void {
  const wallet = getOrCreateFanPointsWallet(fanId);
  wallet.walletStatus = 'active';
}

/**
 * Gets wallet report (admin).
 */
export function getFanPointsWalletReport(): {
  totalWallets: number;
  totalPointsOutstanding: number;
  totalPointsLifetime: number;
  totalPointsSpent: number;
  activeWallets: number;
  suspendedWallets: number;
  lockedWallets: number;
} {
  const wallets = Array.from(fanPointsWallets.values());

  return {
    totalWallets: wallets.length,
    totalPointsOutstanding: wallets.reduce((sum, w) => sum + w.pointsBalance, 0),
    totalPointsLifetime: wallets.reduce((sum, w) => sum + w.pointsLifetime, 0),
    totalPointsSpent: wallets.reduce((sum, w) => sum + w.pointsSpent, 0),
    activeWallets: wallets.filter((w) => w.walletStatus === 'active').length,
    suspendedWallets: wallets.filter((w) => w.walletStatus === 'suspended').length,
    lockedWallets: wallets.filter((w) => w.walletStatus === 'locked').length,
  };
}
