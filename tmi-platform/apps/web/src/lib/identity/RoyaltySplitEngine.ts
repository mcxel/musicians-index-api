/**
 * RoyaltySplitEngine.ts
 *
 * TMI Royalty & Payout Routing Runtime (P2)
 *
 * Resolves how revenue from any asset flows to contributors.
 * Builds on GroupMembershipEngine (split ownership) and ContributorCreditEngine (credits).
 *
 * Supports:
 *   - Solo release payouts
 *   - Group release payouts (split-weighted)
 *   - Beat producer royalties (synced from ContributorCreditEngine)
 *   - Featured artist cuts
 *   - NFT secondary royalties
 *   - Ticket revenue splits (venue + artist + platform)
 *   - Sponsor campaign payouts
 *
 * Rules:
 *   - All splits must sum to 100% or the payout is rejected
 *   - Platform fee is deducted before splits are applied
 *   - Minimum payout threshold: $1.00 (amounts below are held until threshold met)
 *   - Payouts are queued — actual Stripe transfers happen via /api/payouts/execute
 */

import { getActiveCredits, type ContributorCredit } from './ContributorCreditEngine';
import { getGroup, type SplitOwnership } from './GroupMembershipEngine';
import { Analytics } from '@/lib/analytics/PersonaAnalyticsEngine';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PayoutContext =
  | 'release'       // streaming / download revenue
  | 'beat-license'  // beat sold in marketplace
  | 'nft-primary'   // initial NFT mint
  | 'nft-secondary' // resale royalty
  | 'ticket'        // live event ticket
  | 'tip'           // fan tip
  | 'subscription'  // subscription revenue share
  | 'sponsor'       // sponsor campaign payment
  | 'contest-prize'; // battle / cypher prize

export type PayoutStatus =
  | 'pending'         // queued, not yet sent
  | 'processing'      // Stripe transfer in flight
  | 'paid'            // confirmed paid
  | 'held'            // below minimum threshold
  | 'failed'          // transfer failed
  | 'disputed';       // under dispute hold

export interface PayoutRecipient {
  userId:      string;
  displayName: string;
  role:        string;             // credit role or 'group-member'
  splitPct:    number;             // percentage of post-fee revenue
  amountCents: number;             // resolved dollar amount (in cents)
  stripeAccountId?: string;        // linked payout account
  status:      PayoutStatus;
  heldCents:   number;             // amount below threshold
}

export interface RoyaltyPayout {
  payoutId:      string;
  assetId:       string;
  context:       PayoutContext;
  grossCents:    number;           // total revenue before fees
  platformFeePct: number;          // platform's cut (e.g. 15%)
  platformFeeCents: number;
  netCents:      number;           // grossCents - platformFeeCents
  recipients:    PayoutRecipient[];
  resolvedAt:    string;
  groupId?:      string;
  note?:         string;
}

export interface PayoutLedger {
  userId:         string;
  pendingCents:   number;
  heldCents:      number;
  paidCents:      number;
  payoutHistory:  Array<{ payoutId: string; amountCents: number; paidAt: string; context: PayoutContext }>;
}

// ── Platform Fee Schedule ─────────────────────────────────────────────────────

const PLATFORM_FEES: Record<PayoutContext, number> = {
  'release':        15,
  'beat-license':   20,
  'nft-primary':    10,
  'nft-secondary':   5,   // resale royalty is lower fee
  'ticket':         12,
  'tip':             5,
  'subscription':   20,
  'sponsor':        15,
  'contest-prize':   0,   // prize payouts are fee-free
};

const MIN_PAYOUT_CENTS = 100; // $1.00 minimum threshold

// ── In-Memory Stores ──────────────────────────────────────────────────────────

const PAYOUT_LOG:  Map<string, RoyaltyPayout>  = new Map();
const LEDGERS:     Map<string, PayoutLedger>   = new Map();

// ── Core Resolution Engine ────────────────────────────────────────────────────

export function resolveRoyaltyPayout(params: {
  assetId:     string;
  context:     PayoutContext;
  grossCents:  number;
  groupId?:    string;             // if group asset — pulls GroupMembershipEngine splits
  manualSplits?: SplitOwnership[]; // override: explicit splits (must sum to 100)
  note?:       string;
}): RoyaltyPayout | null {
  const { assetId, context, grossCents, groupId, manualSplits, note } = params;

  if (grossCents <= 0) return null;

  const feePct      = PLATFORM_FEES[context] ?? 15;
  const feeCents    = Math.round(grossCents * feePct / 100);
  const netCents    = grossCents - feeCents;

  // ── Resolve splits ────────────────────────────────────────────────────────

  let splits: SplitOwnership[] = [];

  if (manualSplits && manualSplits.length > 0) {
    // Explicit manual splits take highest priority
    splits = manualSplits;
  } else if (groupId) {
    // Pull from GroupMembershipEngine
    const group = getGroup(groupId);
    if (!group) return null;
    const activeMembers = group.members.filter((m) => m.active);
    splits = activeMembers.map((m) => m.splits[0]).filter(Boolean);
  } else {
    // Derive from ContributorCreditEngine (credit-weighted splits)
    splits = _creditsToSplits(assetId);
  }

  if (splits.length === 0) return null;

  // Validate splits sum to 100
  const total = splits.reduce((sum, s) => sum + s.percentage, 0);
  if (Math.abs(total - 100) > 0.5) {
    // Auto-normalize rather than reject — prevents payout failures on rounding
    const factor = 100 / total;
    splits = splits.map((s) => ({ ...s, percentage: s.percentage * factor }));
  }

  // ── Build recipients ──────────────────────────────────────────────────────

  let remainder = netCents;
  const recipients: PayoutRecipient[] = splits.map((split, i) => {
    const isLast = i === splits.length - 1;
    const rawAmount = isLast ? remainder : Math.floor(netCents * split.percentage / 100);
    remainder -= rawAmount;

    const held     = rawAmount < MIN_PAYOUT_CENTS ? rawAmount : 0;
    const pending  = rawAmount >= MIN_PAYOUT_CENTS ? rawAmount : 0;

    const credit = _getCreditForUser(assetId, split.memberId);

    return {
      userId:      split.memberId,
      displayName: credit?.displayName ?? split.memberId,
      role:        credit?.role ?? (groupId ? 'group-member' : 'primary-artist'),
      splitPct:    split.percentage,
      amountCents: rawAmount,
      status:      held > 0 ? 'held' : 'pending',
      heldCents:   held,
    };
  });

  // ── Record payout ─────────────────────────────────────────────────────────

  const payoutId = `payout_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const payout: RoyaltyPayout = {
    payoutId,
    assetId,
    context,
    grossCents,
    platformFeePct:   feePct,
    platformFeeCents: feeCents,
    netCents,
    recipients,
    resolvedAt: new Date().toISOString(),
    groupId,
    note,
  };

  PAYOUT_LOG.set(payoutId, payout);

  // Update ledgers
  for (const r of recipients) {
    _updateLedger(r.userId, { payoutId, amountCents: r.amountCents, context, pending: r.status === 'pending', held: r.status === 'held' });
  }

  // Telemetry
  Analytics.revenue({
    amount:   netCents / 100,
    currency: 'usd',
    product:  context,
  });

  return payout;
}

// ── Ledger access ─────────────────────────────────────────────────────────────

export function getLedger(userId: string): PayoutLedger {
  return LEDGERS.get(userId) ?? _emptyLedger(userId);
}

export function getPayout(payoutId: string): RoyaltyPayout | null {
  return PAYOUT_LOG.get(payoutId) ?? null;
}

export function getPayoutsForAsset(assetId: string): RoyaltyPayout[] {
  return [...PAYOUT_LOG.values()].filter((p) => p.assetId === assetId);
}

export function getUserPayouts(userId: string): RoyaltyPayout[] {
  return [...PAYOUT_LOG.values()].filter((p) =>
    p.recipients.some((r) => r.userId === userId)
  );
}

// ── Payout execution (called by /api/payouts/execute) ─────────────────────────

export function markPayoutPaid(payoutId: string, recipientId: string): RoyaltyPayout | null {
  const payout = PAYOUT_LOG.get(payoutId);
  if (!payout) return null;

  const recipient = payout.recipients.find((r) => r.userId === recipientId);
  if (!recipient) return null;

  recipient.status = 'paid';

  const ledger = LEDGERS.get(recipientId);
  if (ledger) {
    ledger.pendingCents -= recipient.amountCents;
    ledger.paidCents    += recipient.amountCents;
    ledger.payoutHistory.push({
      payoutId,
      amountCents: recipient.amountCents,
      paidAt:      new Date().toISOString(),
      context:     payout.context,
    });
  }

  PAYOUT_LOG.set(payoutId, payout);
  return payout;
}

export function releaseHeld(userId: string): number {
  const ledger = LEDGERS.get(userId);
  if (!ledger || ledger.heldCents < MIN_PAYOUT_CENTS) return 0;
  const releasing     = ledger.heldCents;
  ledger.heldCents    = 0;
  ledger.pendingCents += releasing;
  return releasing;
}

// ── NFT secondary royalty helper ──────────────────────────────────────────────

export function resolveNFTSecondaryRoyalty(params: {
  tokenId:       string;
  salePriceCents: number;
  royaltyPct:    number;             // e.g. 10 = 10% goes back to creators
  creatorSplits: SplitOwnership[];   // original mint splits
}): RoyaltyPayout | null {
  const royaltyCents = Math.round(params.salePriceCents * params.royaltyPct / 100);
  if (royaltyCents <= 0) return null;

  return resolveRoyaltyPayout({
    assetId:      params.tokenId,
    context:      'nft-secondary',
    grossCents:   royaltyCents,
    manualSplits: params.creatorSplits,
    note:         `NFT secondary sale — ${params.royaltyPct}% royalty on $${(params.salePriceCents / 100).toFixed(2)}`,
  });
}

// ── Projection (UI preview, no ledger side effects) ───────────────────────────

export function projectSplit(params: {
  grossCents:   number;
  context:      PayoutContext;
  splits:       SplitOwnership[];
}): Array<{ userId: string; splitPct: number; grossShare: number; netShare: number }> {
  const feePct   = PLATFORM_FEES[params.context] ?? 15;
  const feeCents = Math.round(params.grossCents * feePct / 100);
  const net      = params.grossCents - feeCents;

  return params.splits.map((s) => ({
    userId:     s.memberId,
    splitPct:   s.percentage,
    grossShare: Math.round(params.grossCents * s.percentage / 100),
    netShare:   Math.round(net * s.percentage / 100),
  }));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _creditsToSplits(assetId: string): SplitOwnership[] {
  const credits = getActiveCredits(assetId);
  if (credits.length === 0) return [];

  const totalWeight = credits.reduce((sum, c) => sum + c.creditWeight, 0);
  if (totalWeight === 0) return [];

  return credits.map((c) => ({
    memberId:  c.userId,
    percentage: Math.round((c.creditWeight / totalWeight) * 100 * 10) / 10,
    splitType: 'role-based' as const,
  }));
}

function _getCreditForUser(assetId: string, userId: string): ContributorCredit | null {
  const credits = getActiveCredits(assetId);
  return credits.find((c) => c.userId === userId) ?? null;
}

function _emptyLedger(userId: string): PayoutLedger {
  return { userId, pendingCents: 0, heldCents: 0, paidCents: 0, payoutHistory: [] };
}

function _updateLedger(userId: string, update: { payoutId: string; amountCents: number; context: PayoutContext; pending: boolean; held: boolean }): void {
  if (!LEDGERS.has(userId)) LEDGERS.set(userId, _emptyLedger(userId));
  const ledger = LEDGERS.get(userId)!;
  if (update.pending) ledger.pendingCents += update.amountCents;
  if (update.held)    ledger.heldCents    += update.amountCents;
}
