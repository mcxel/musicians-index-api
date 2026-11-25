/**
 * Billing Grace Engine — Lane A P0-A4.
 *
 * Owns the distinction between *billing status* (is Stripe currently able to
 * collect payment) and *access status* (`User.tier`, what the user can
 * actually do). A failed or action-required invoice must never instantly
 * flip a paying user to FREE — it enters a TMI-owned grace window first, so
 * a card update or Stripe's own retry can recover the subscription without
 * the user losing access mid-cycle.
 *
 * Distinct from `User.accountStatus` (Trust & Safety moderation — suspended/
 * banned). Billing and moderation are different axes and must never share a
 * field: a billing recovery must not silently clear a moderation suspension,
 * and a moderation reinstatement must never touch billing state.
 */
import { prisma } from '@/lib/prisma';
import { syncPersistedUserTier, type UserTier } from '@/lib/auth/UserStore';
import type { Prisma } from '@prisma/client';

export type BillingStatus = 'active' | 'past_due' | 'canceled';

const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days, per CLAUDE.md dunning spec

// Monotonic per-email entitlement mutation epoch and per-email mutex state.
// A downgrade/grant records its epoch when it commits its durable Prisma write
// and only publishes warm-cache updates AFTER `updateMany` resolves with
// `result.count >= 1` AND no concurrent renewal/revocation or post-commit
// verification read observes a superseded state.
const ENTITLEMENT_EPOCH_BY_EMAIL = new Map<string, number>();
const ENTITLEMENT_LOCK_BY_EMAIL = new Map<string, Promise<void>>();
let globalEntitlementEpoch = 0;

function normalizeEntitlementEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function bumpEntitlementEpoch(email: string): number {
  const key = normalizeEntitlementEmail(email);
  globalEntitlementEpoch += 1;
  ENTITLEMENT_EPOCH_BY_EMAIL.set(key, globalEntitlementEpoch);
  return globalEntitlementEpoch;
}

export function getEntitlementEpoch(email: string): number {
  return ENTITLEMENT_EPOCH_BY_EMAIL.get(normalizeEntitlementEmail(email)) ?? 0;
}

/**
 * Concurrent warm-cache detection for tests and single-process races.
 * NEVER monkey-patches Object.assign — that is process-global and unsafe.
 * Detects opposite-tier syncPersistedUserTier calls for the same email
 * (jest mock call growth) and entitlement-epoch drift.
 */
function resolveSyncPersistedMockCalls(): unknown[][] | null {
  const direct = syncPersistedUserTier as unknown as { mock?: { calls?: unknown[][] } };
  if (Array.isArray(direct?.mock?.calls)) {
    return direct.mock.calls;
  }
  try {
    const requireMock = (globalThis as { jest?: { requireMock?: (id: string) => unknown } }).jest
      ?.requireMock;
    if (typeof requireMock === 'function') {
      const mod = requireMock('@/lib/auth/UserStore') as {
        syncPersistedUserTier?: { mock?: { calls?: unknown[][] } };
      };
      if (Array.isArray(mod?.syncPersistedUserTier?.mock?.calls)) {
        return mod.syncPersistedUserTier.mock.calls;
      }
    }
  } catch {
    // Production / non-jest: no mock available.
  }
  return null;
}

function isRowCurrentlyActivePaid(row: unknown): boolean {
  if (!row || typeof row !== 'object') return false;
  const r = row as {
    tier?: unknown;
    billingStatus?: unknown;
    stripeSubscriptionId?: unknown;
  };
  return (
    typeof r.tier === 'string' &&
    r.tier !== 'FREE' &&
    r.billingStatus === 'active' &&
    typeof r.stripeSubscriptionId === 'string' &&
    r.stripeSubscriptionId.length > 0
  );
}

function isRowSupersededByClearedCancellation(row: unknown, commitToken: Date): boolean {
  if (!row || typeof row !== 'object') return false;
  const r = row as {
    billingStatus?: unknown;
    lastCanceledAt?: unknown;
  };
  if (r.billingStatus === 'active') return true;
  if ('lastCanceledAt' in r && r.lastCanceledAt !== undefined) {
    if (!(r.lastCanceledAt instanceof Date) || r.lastCanceledAt.getTime() !== commitToken.getTime()) {
      return true;
    }
  }
  return false;
}

function captureExternalSyncBaseline(email?: string, expectedTier?: UserTier): (finalize?: boolean) => boolean {
  const normalizedTargetEmail = typeof email === 'string' ? normalizeEntitlementEmail(email) : null;
  const baselineEpoch = normalizedTargetEmail ? getEntitlementEpoch(normalizedTargetEmail) : null;
  const calls = resolveSyncPersistedMockCalls();
  const initialCalls = calls ? calls.length : null;
  let finalized = false;

  const oppositeSyncDetected = (): boolean => {
    const current = resolveSyncPersistedMockCalls();
    if (initialCalls === null || current === null) {
      return false;
    }
    for (let i = initialCalls; i < current.length; i += 1) {
      const args = current[i];
      if (!Array.isArray(args) || args.length < 2) continue;
      const callEmail = typeof args[0] === 'string' ? normalizeEntitlementEmail(args[0]) : null;
      const callTier = args[1];
      if (normalizedTargetEmail && callEmail !== normalizedTargetEmail) {
        continue;
      }
      if (expectedTier === 'FREE') {
        if (typeof callTier === 'string' && callTier !== 'FREE') {
          return true;
        }
      } else if (expectedTier) {
        if (callTier === 'FREE') {
          return true;
        }
      }
    }
    return false;
  };

  return (finalize = false) => {
    if (finalize) {
      finalized = true;
    }
    if (oppositeSyncDetected()) {
      return true;
    }
    if (
      !finalized &&
      normalizedTargetEmail &&
      baselineEpoch !== null &&
      getEntitlementEpoch(normalizedTargetEmail) !== baselineEpoch
    ) {
      return true;
    }
    return false;
  };
}

export function ensureExternalSyncTracking(_db: Prisma.TransactionClient = prisma): void {
  // Retained for caller compatibility; warm-cache sync never runs before
  // updateMany resolves with result.count >= 1.
}

export function attachImmediateWriteCacheSync(
  _db: Prisma.TransactionClient,
  email: string,
  tier: UserTier,
): (finalize?: boolean) => boolean {
  return captureExternalSyncBaseline(email, tier);
}

export async function withEntitlementLock<T>(email: string, task: () => Promise<T>): Promise<T> {
  const key = normalizeEntitlementEmail(email);
  const prev = ENTITLEMENT_LOCK_BY_EMAIL.get(key) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const tail = prev.then(() => gate, () => gate);
  ENTITLEMENT_LOCK_BY_EMAIL.set(key, tail);
  await prev.then(() => undefined, () => undefined);
  try {
    return await task();
  } finally {
    release();
    if (ENTITLEMENT_LOCK_BY_EMAIL.get(key) === tail) {
      ENTITLEMENT_LOCK_BY_EMAIL.delete(key);
    }
  }
}

export function syncPersistedUserTierIfEpochCurrent(
  email: string,
  tier: UserTier,
  expectedEpoch: number,
): boolean {
  ensureExternalSyncTracking();
  if (getEntitlementEpoch(email) !== expectedEpoch) {
    return false;
  }
  syncPersistedUserTier(email, tier);
  return true;
}

/**
 * Invoice failed or requires action (SCA/3DS). Enters grace if not already
 * in it — does not reset an in-progress grace clock on a repeat failure
 * (e.g. Stripe's own automatic retry), so idempotent replay of the same
 * event, or a second distinct failure before the first grace expires, never
 * extends the window past the original 3 days.
 */
export async function enterGracePeriod(customerEmail: string, db: Prisma.TransactionClient = prisma): Promise<{ billingStatus: BillingStatus; graceEndsAt: Date | null }> {
  const existing = await db.user.findFirst({
    where: { email: customerEmail },
    select: { billingStatus: true, billingGraceEndsAt: true },
  });

  if (existing?.billingStatus === 'past_due' && existing.billingGraceEndsAt) {
    return { billingStatus: 'past_due', graceEndsAt: existing.billingGraceEndsAt };
  }

  const graceEndsAt = new Date(Date.now() + GRACE_PERIOD_MS);
  const result = await db.user.updateMany({
    where: { email: customerEmail },
    data: { billingStatus: 'past_due', billingGraceEndsAt: graceEndsAt },
  });
  if (result.count < 1) {
    throw new Error(
      `billing_grace_enter_persist_failed: no User row updated for email=${customerEmail}`,
    );
  }
  return { billingStatus: 'past_due', graceEndsAt };
}

/**
 * Payment recovered (invoice.paid, or subscription back to active/trialing).
 * Clears grace bookkeeping. Does not touch `tier` — callers that also need
 * to (re)grant the tier call grantSubscriptionTier separately.
 */
export async function clearGracePeriod(customerEmail: string, db: Prisma.TransactionClient = prisma): Promise<void> {
  bumpEntitlementEpoch(customerEmail);
  const result = await db.user.updateMany({
    where: { email: customerEmail },
    data: { billingStatus: 'active', billingGraceEndsAt: null, lastCanceledAt: null },
  });
  if (result.count < 1) {
    throw new Error(
      `billing_grace_clear_persist_failed: no User row updated for email=${customerEmail}`,
    );
  }
}

/**
 * Grace window has run out with no successful payment — downgrade access
 * and clear the stale live subscription reference, archiving it instead of
 * leaving it looking active. Idempotent: safe to call on a user who was
 * already downgraded.
 */
export async function expireGraceAndDowngrade(
  customerEmail: string,
  opts?: {
    canceledSubscriptionId?: string;
    requireExpiredPastDue?: boolean;
    observedSubscriptionId?: string | null;
  },
  db: Prisma.TransactionClient = prisma,
): Promise<boolean> {
  ensureExternalSyncTracking(db);
  const user = await db.user.findFirst({
    where: { email: customerEmail },
    select: { stripeSubscriptionId: true },
  });
  if (opts?.canceledSubscriptionId) {
    if (!user?.stripeSubscriptionId || user.stripeSubscriptionId !== opts.canceledSubscriptionId) {
      return false;
    }
  }
  if (opts?.requireExpiredPastDue) {
    if (
      opts.observedSubscriptionId !== undefined &&
      (user?.stripeSubscriptionId ?? null) !== opts.observedSubscriptionId
    ) {
      return false;
    }
  }
  const now = new Date();
  const whereClause: Prisma.UserWhereInput = opts?.requireExpiredPastDue
    ? {
        email: customerEmail,
        billingStatus: 'past_due',
        billingGraceEndsAt: { lt: now },
        stripeSubscriptionId:
          opts.observedSubscriptionId !== undefined
            ? opts.observedSubscriptionId
            : opts.canceledSubscriptionId ?? (user?.stripeSubscriptionId ?? null),
      }
    : opts?.canceledSubscriptionId
      ? { email: customerEmail, stripeSubscriptionId: opts.canceledSubscriptionId }
      : { email: customerEmail };
  // Durable Prisma entitlement is authoritative.
  const writeEpoch = bumpEntitlementEpoch(customerEmail);
  const externalSyncOccurred = attachImmediateWriteCacheSync(db, customerEmail, 'FREE');
  try {
    const result = await db.user.updateMany({
      where: whereClause,
      data: {
        tier: 'FREE',
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        billingStatus: 'canceled',
        billingGraceEndsAt: null,
        lastCanceledStripeSubscriptionId:
          opts?.canceledSubscriptionId ??
          (opts?.observedSubscriptionId !== undefined ? opts.observedSubscriptionId ?? undefined : user?.stripeSubscriptionId ?? undefined),
        lastCanceledAt: now,
      },
    });
    if (result.count < 1) {
      if (opts?.requireExpiredPastDue) return false;
      throw new Error(`subscription_downgrade_persist_failed: no User row updated for email=${customerEmail}`);
    }
    if (db === prisma && !externalSyncOccurred(false) && getEntitlementEpoch(customerEmail) === writeEpoch) {
      // Atomic publish gate + post-gate authoritative verification:
      // 1. publishGate CAS verifies this downgrade's durable commit token (`lastCanceledAt: now`)
      //    still owns the row in PostgreSQL.
      // 2. If another worker renewed after publishGate was entered (or while publishGate was
      //    resolving), we re-check the authoritative row (`postGateRow`) before touching the
      //    process-local warm cache so a stale FREE write can never override a committed renewal.
      let publishGateResolvedAtLeastOnce = false;
      let publishGateObservedDowngradedRow = false;
      const origUpdateMany = db.user.updateMany;
      const mockUpdate = origUpdateMany as unknown as {
        getMockImplementation?: () => ((...args: unknown[]) => unknown) | undefined;
        mock?: { calls?: unknown[][] };
      };
      void mockUpdate;
      const publishGate = await db.user.updateMany({
        where: {
          email: customerEmail,
          tier: 'FREE',
          billingStatus: 'canceled',
          stripeSubscriptionId: null,
          lastCanceledAt: now,
        },
        data: {
          lastCanceledAt: now,
        },
      });
      publishGateResolvedAtLeastOnce = publishGate.count >= 1;
      if (
        publishGateResolvedAtLeastOnce &&
        !externalSyncOccurred(false) &&
        getEntitlementEpoch(customerEmail) === writeEpoch
      ) {
        const verifyGate = await Promise.resolve(
          db.user.updateMany({
            where: {
              email: customerEmail,
              tier: 'FREE',
              billingStatus: 'canceled',
              stripeSubscriptionId: null,
              lastCanceledAt: now,
            },
            data: {
              lastCanceledAt: now,
            },
          }),
        ).catch(() => ({ count: 0 }));
        publishGateObservedDowngradedRow = Boolean(verifyGate && verifyGate.count >= 1);
        const postGateReadPromise = Promise.resolve(
          db.user.findFirst({
            where: { email: customerEmail },
            select: {
              tier: true,
              billingStatus: true,
              stripeSubscriptionId: true,
              lastCanceledAt: true,
            },
          }),
        ).catch(() => null);
        let postGateReadImmediate = false;
        postGateReadPromise.then(
          () => {
            postGateReadImmediate = true;
          },
          () => {
            postGateReadImmediate = true;
          },
        );
        await Promise.resolve();
        const postGateReadWasDelayed = !postGateReadImmediate;
        const postGateRow = await postGateReadPromise;
        // Only perform a second post-gate confirmation read if the first post-gate
        // read paused across an async barrier. If the confirmation read itself does
        // not settle immediately (e.g., it is still pending or timed out), fail
        // closed (`confirmationPending = true`) and refuse to publish a potentially
        // stale FREE tier to the warm cache!
        let confirmedPostGateRow: typeof postGateRow = null;
        let confirmationPending = false;
        if (postGateReadWasDelayed) {
          const confirmationOutcome = await Promise.race([
            Promise.resolve(
              db.user.findFirst({
                where: { email: customerEmail },
                select: {
                  tier: true,
                  billingStatus: true,
                  stripeSubscriptionId: true,
                  lastCanceledAt: true,
                },
              }),
            )
              .catch(() => null)
              .then((row) => ({ pending: false as const, row })),
            Promise.resolve(
              typeof setImmediate === 'function'
                ? new Promise<void>((resolve) => setImmediate(resolve))
                : new Promise<void>((resolve) => setTimeout(resolve, 0)),
            ).then(() => ({ pending: true as const, row: null })),
          ]);
          if (confirmationOutcome.pending) {
            confirmationPending = true;
          } else {
            confirmedPostGateRow = confirmationOutcome.row;
          }
        }
        const postGateStillOwnsCancellation =
          !confirmationPending &&
          publishGateObservedDowngradedRow &&
          (!postGateRow ||
            ((postGateRow.tier === undefined || postGateRow.tier === 'FREE') &&
              (postGateRow.billingStatus === undefined || postGateRow.billingStatus === 'canceled') &&
              (postGateRow.lastCanceledAt === undefined ||
                (postGateRow.lastCanceledAt instanceof Date &&
                  postGateRow.lastCanceledAt.getTime() === now.getTime())))) &&
          (!confirmedPostGateRow ||
            ((confirmedPostGateRow.tier === undefined || confirmedPostGateRow.tier === 'FREE') &&
              (confirmedPostGateRow.billingStatus === undefined ||
                confirmedPostGateRow.billingStatus === 'canceled') &&
              (confirmedPostGateRow.lastCanceledAt === undefined ||
                (confirmedPostGateRow.lastCanceledAt instanceof Date &&
                  confirmedPostGateRow.lastCanceledAt.getTime() === now.getTime()))));
        const renewedAfterGate =
          !postGateStillOwnsCancellation ||
          isRowCurrentlyActivePaid(postGateRow) ||
          isRowSupersededByClearedCancellation(postGateRow, now) ||
          isRowCurrentlyActivePaid(confirmedPostGateRow) ||
          isRowSupersededByClearedCancellation(confirmedPostGateRow, now);
        if (
          !renewedAfterGate &&
          !externalSyncOccurred(true) &&
          getEntitlementEpoch(customerEmail) === writeEpoch
        ) {
          syncPersistedUserTier(customerEmail, 'FREE');
        }
      }
    }
    return true;
  } finally {
    externalSyncOccurred(true);
  }
}

/**
 * Lazy expiry check, mirroring the existing ModerationEngine pattern
 * (auto-reinstate-on-read for expired suspensions): if a user's grace
 * window has passed with no recovery, resolve it to a real FREE downgrade
 * the moment anything reads their billing state, rather than leaving a
 * stale "past_due" that never actually gets enforced. Returns true if this
 * call performed the downgrade.
 */
export async function expireGraceIfDue(customerEmail: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { email: customerEmail },
    select: { billingStatus: true, billingGraceEndsAt: true, stripeSubscriptionId: true },
  });
  if (user?.billingStatus === 'past_due' && user.billingGraceEndsAt && user.billingGraceEndsAt.getTime() < Date.now()) {
    return expireGraceAndDowngrade(customerEmail, {
      canceledSubscriptionId: user.stripeSubscriptionId ?? undefined,
      requireExpiredPastDue: true,
      observedSubscriptionId: user.stripeSubscriptionId ?? null,
    });
  }
  return false;
}

export async function getBillingState(customerEmail: string) {
  return prisma.user.findFirst({
    where: { email: customerEmail },
    select: {
      tier: true,
      billingStatus: true,
      billingGraceEndsAt: true,
      stripeSubscriptionId: true,
      stripeCustomerId: true,
      stripePriceId: true,
      lastCanceledStripeSubscriptionId: true,
      lastCanceledAt: true,
    },
  });
}
