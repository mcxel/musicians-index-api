/**
 * LobbyWallBoostEngine — paid visibility boosts for lobby mosaic tiles (Rule 20).
 * Honest PROMOTED badge; no fake engagement. In-memory until DB persistence lands.
 */

import type { LobbyWallCoreCategoryId } from "@/lib/lobby/liveLobbyWallLaw";

/** Boost active window — 24h from purchase (premium wall boost) or 4h ($2.99 entry boost). */
export const LOBBY_WALL_BOOST_DURATION_MS = 24 * 60 * 60 * 1000;
export const LOBBY_WALL_BOOST_299_DURATION_MS = 4 * 60 * 60 * 1000;
export const LOBBY_WALL_BOOST_299_PRICE_CENTS = 299;

export type LobbyBoostKind = "lobby_wall" | "lobby_wall_299" | "wdp_submission";

export interface LobbyWallBoostRecord {
  id: string;
  roomId: string;
  performerId: string;
  category: LobbyWallCoreCategoryId | "all";
  kind: LobbyBoostKind;
  priceCents: number;
  impressionsDelivered: number;
  clicksDelivered?: number;
  extensionCount?: number;
  wdpEntryId: string | null;
  startedAtMs: number;
  expiresAtMs: number;
  stripeSessionId: string | null;
  paymentIntentId?: string | null;
  appliedStripeSessionIds?: string[];
  fulfillmentStatus?: "ACTIVE" | "EXPIRED" | "REFUNDED";
  revokedAtMs?: number | null;
}

const boostsById = new Map<string, LobbyWallBoostRecord>();
const activeRoomBoost = new Map<string, string>();
let lobbyBoostsHydrated = false;

/** §P0 Emergency Shared-State Protection — see the matching comment in
 *  DiscoveryBoostEngine.ts for the incident and rationale. Automatic,
 *  unconditional test-mode isolation — never an opt-in env var. */
function isTestRuntime(): boolean {
  return process.env.NODE_ENV === "test" || Boolean(process.env.JEST_WORKER_ID);
}

let cachedTestLobbyLedgerDir: string | null = null;

function assertIsolatedTestRuntimeOrThrow(fnName: string): void {
  if (!isTestRuntime()) {
    throw new Error(
      `${fnName}() refused: no test environment detected (NODE_ENV!=="test" and JEST_WORKER_ID unset). ` +
        "This function is destructive and must never run against the real durable ledger.",
    );
  }
}

function getDurableLobbyBoostFileOps(): {
  read: () => Record<string, LobbyWallBoostRecord> | null;
  write: (data: Record<string, LobbyWallBoostRecord>) => void;
} | null {
  if (typeof process === "undefined" || !process.versions?.node) return null;
  try {
    // eslint-disable-next-line no-eval
    const req = eval("require") as (mod: string) => any;
    const fs = req("fs");
    const os = req("os");
    const path = req("path");
    const dir = isTestRuntime()
      ? (cachedTestLobbyLedgerDir ??= path.join(os.tmpdir(), `tmi-test-revenue-${process.pid}`))
      : process.env.TMI_DURABLE_REVENUE_DIR || path.join(os.tmpdir(), "tmi-durable-revenue-v1");
    const file = path.join(dir, "lobby-wall-boosts-ledger.json");
    return {
      read: () => {
        try {
          if (!fs.existsSync(file)) return null;
          const raw = fs.readFileSync(file, "utf8");
          return raw ? (JSON.parse(raw) as Record<string, LobbyWallBoostRecord>) : null;
        } catch {
          return null;
        }
      },
      write: (data) => {
        try {
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          const tmp = `${file}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}.tmp`;
          fs.writeFileSync(tmp, JSON.stringify(data), "utf8");
          fs.renameSync(tmp, file);
        } catch {
          try {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(file, JSON.stringify(data), "utf8");
          } catch {
            // ignore in restricted sandbox
          }
        }
      },
    };
  } catch {
    return null;
  }
}

function hydrateLobbyWallBoostsFromDurable(): void {
  const ops = getDurableLobbyBoostFileOps();
  if (!ops) return;
  const disk = ops.read();
  if (!disk) {
    lobbyBoostsHydrated = true;
    return;
  }
  for (const [id, rec] of Object.entries(disk)) {
    const inMem = boostsById.get(id);
    if (!inMem) {
      boostsById.set(id, rec);
      if (rec.fulfillmentStatus !== "REFUNDED" && rec.fulfillmentStatus !== "EXPIRED") {
        activeRoomBoost.set(rec.roomId, id);
      }
    } else {
      if (rec.fulfillmentStatus === "REFUNDED") {
        inMem.fulfillmentStatus = "REFUNDED";
        inMem.expiresAtMs = rec.expiresAtMs;
        inMem.revokedAtMs = rec.revokedAtMs;
        if (activeRoomBoost.get(inMem.roomId) === id) activeRoomBoost.delete(inMem.roomId);
      }
      if (rec.expiresAtMs > inMem.expiresAtMs && inMem.fulfillmentStatus !== "REFUNDED") {
        inMem.expiresAtMs = rec.expiresAtMs;
        inMem.priceCents = Math.max(inMem.priceCents, rec.priceCents);
        inMem.extensionCount = Math.max(inMem.extensionCount ?? 0, rec.extensionCount ?? 0);
      }
      inMem.impressionsDelivered = Math.max(inMem.impressionsDelivered, rec.impressionsDelivered);
      inMem.clicksDelivered = Math.max(inMem.clicksDelivered ?? 0, rec.clicksDelivered ?? 0);
    }
  }
  lobbyBoostsHydrated = true;
}

function flushLobbyWallBoostsToDurable(): void {
  const ops = getDurableLobbyBoostFileOps();
  if (!ops) return;
  const out: Record<string, LobbyWallBoostRecord> = {};
  for (const [id, rec] of boostsById.entries()) {
    out[id] = rec;
  }
  ops.write(out);
}

function genBoostId(): string {
  return `lwb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function purgeExpiredBoosts(nowMs: number = Date.now()): number {
  if (!lobbyBoostsHydrated) hydrateLobbyWallBoostsFromDurable();
  let removed = 0;
  for (const [id, rec] of [...boostsById.entries()]) {
    if (rec.expiresAtMs <= nowMs && rec.fulfillmentStatus !== "EXPIRED" && rec.fulfillmentStatus !== "REFUNDED") {
      rec.fulfillmentStatus = "EXPIRED";
      if (activeRoomBoost.get(rec.roomId) === id) {
        activeRoomBoost.delete(rec.roomId);
      }
      removed += 1;
    } else if (rec.expiresAtMs <= nowMs && activeRoomBoost.get(rec.roomId) === id) {
      activeRoomBoost.delete(rec.roomId);
    }
  }
  if (removed > 0) flushLobbyWallBoostsToDurable();
  return removed;
}

export function recordLobbyWallBoost(input: {
  roomId: string;
  performerId: string;
  category: LobbyWallCoreCategoryId | "all";
  kind: LobbyBoostKind;
  priceCents?: number;
  wdpEntryId?: string | null;
  stripeSessionId?: string | null;
  paymentIntentId?: string | null;
  extendIfActive?: boolean;
  startedAtMs?: number;
  durationMs?: number;
}): LobbyWallBoostRecord {
  hydrateLobbyWallBoostsFromDurable();
  const startedAtMs = input.startedAtMs ?? Date.now();
  purgeExpiredBoosts(startedAtMs);

  // 1. Idempotency: duplicate Stripe session OR duplicate PaymentIntent
  // returns the existing boost unchanged. (§P0 Payment Idempotency fix,
  // 2026-11-09: previously session-id-only — a paymentIntentId-only replay
  // fell through to "no active boost found with this session id" and
  // created an orphaned duplicate record for the same room/charge instead.)
  if (input.stripeSessionId || input.paymentIntentId) {
    for (const existing of boostsById.values()) {
      const sessionMatch =
        Boolean(input.stripeSessionId) &&
        (existing.stripeSessionId === input.stripeSessionId ||
          existing.appliedStripeSessionIds?.includes(input.stripeSessionId!));
      const paymentIntentMatch =
        Boolean(input.paymentIntentId) && existing.paymentIntentId === input.paymentIntentId;
      if (sessionMatch || paymentIntentMatch) {
        return existing;
      }
    }
  }

  const defaultDuration =
    input.kind === "lobby_wall_299"
      ? LOBBY_WALL_BOOST_299_DURATION_MS
      : LOBBY_WALL_BOOST_DURATION_MS;
  const durationMs = input.durationMs ?? defaultDuration;
  const defaultPriceCents =
    input.kind === "lobby_wall_299"
      ? LOBBY_WALL_BOOST_299_PRICE_CENTS
      : input.kind === "wdp_submission"
        ? 999
        : 1999;
  const priceCents = input.priceCents ?? defaultPriceCents;

  // 2. Boost extension: if an active boost already exists for roomId and a new session arrives
  if (input.extendIfActive !== false) {
    const activeId = activeRoomBoost.get(input.roomId);
    const existing = activeId ? boostsById.get(activeId) : undefined;
    if (
      existing &&
      existing.fulfillmentStatus !== "REFUNDED" &&
      existing.expiresAtMs > startedAtMs &&
      (input.extendIfActive === true || Boolean(input.stripeSessionId))
    ) {
      existing.expiresAtMs = Math.max(existing.expiresAtMs, startedAtMs) + durationMs;
      existing.priceCents += priceCents;
      existing.extensionCount = (existing.extensionCount ?? 0) + 1;
      existing.fulfillmentStatus = "ACTIVE";
      if (input.stripeSessionId) {
        existing.stripeSessionId = input.stripeSessionId;
        const set = new Set(existing.appliedStripeSessionIds ?? []);
        set.add(input.stripeSessionId);
        existing.appliedStripeSessionIds = [...set];
      }
      if (input.paymentIntentId) {
        existing.paymentIntentId = input.paymentIntentId;
      }
      flushLobbyWallBoostsToDurable();
      return existing;
    }
  }

  const record: LobbyWallBoostRecord = {
    id: genBoostId(),
    roomId: input.roomId,
    performerId: input.performerId,
    category: input.category,
    kind: input.kind,
    priceCents,
    impressionsDelivered: 0,
    clicksDelivered: 0,
    extensionCount: 0,
    wdpEntryId: input.wdpEntryId ?? null,
    startedAtMs,
    expiresAtMs: startedAtMs + durationMs,
    stripeSessionId: input.stripeSessionId ?? null,
    paymentIntentId: input.paymentIntentId ?? null,
    appliedStripeSessionIds: input.stripeSessionId ? [input.stripeSessionId] : [],
    fulfillmentStatus: "ACTIVE",
    revokedAtMs: null,
  };
  boostsById.set(record.id, record);
  activeRoomBoost.set(record.roomId, record.id);
  flushLobbyWallBoostsToDurable();
  return record;
}

export function recordLobbyWallBoostImpression(
  roomId: string,
  nowMs: number = Date.now(),
): LobbyWallBoostRecord | null {
  hydrateLobbyWallBoostsFromDurable();
  const rec = getActiveBoostForRoom(roomId, nowMs);
  if (!rec) return null;
  rec.impressionsDelivered += 1;
  flushLobbyWallBoostsToDurable();
  return rec;
}

export function recordLobbyWallBoostClick(
  roomId: string,
  nowMs: number = Date.now(),
): LobbyWallBoostRecord | null {
  hydrateLobbyWallBoostsFromDurable();
  const rec = getActiveBoostForRoom(roomId, nowMs);
  if (!rec) return null;
  rec.clicksDelivered = (rec.clicksDelivered ?? 0) + 1;
  flushLobbyWallBoostsToDurable();
  return rec;
}

export function revokeLobbyWallBoostByPaymentRef(input: {
  boostId?: string | null;
  roomId?: string | null;
  stripeSessionId?: string | null;
  paymentIntentId?: string | null;
  nowMs?: number;
}): LobbyWallBoostRecord[] {
  hydrateLobbyWallBoostsFromDurable();
  const nowMs = input.nowMs ?? Date.now();
  const revoked: LobbyWallBoostRecord[] = [];
  for (const rec of boostsById.values()) {
    const matchId = Boolean(input.boostId) && rec.id === input.boostId;
    const matchRoom = Boolean(input.roomId) && rec.roomId === input.roomId;
    const matchSession =
      Boolean(input.stripeSessionId) &&
      (rec.stripeSessionId === input.stripeSessionId ||
        rec.appliedStripeSessionIds?.includes(input.stripeSessionId!));
    const matchPi =
      Boolean(input.paymentIntentId) && rec.paymentIntentId === input.paymentIntentId;
    if (matchId || matchRoom || matchSession || matchPi) {
      rec.fulfillmentStatus = "REFUNDED";
      rec.revokedAtMs = nowMs;
      rec.expiresAtMs = Math.min(rec.expiresAtMs, nowMs);
      if (activeRoomBoost.get(rec.roomId) === rec.id) {
        activeRoomBoost.delete(rec.roomId);
      }
      revoked.push(rec);
    }
  }
  if (revoked.length > 0) flushLobbyWallBoostsToDurable();
  return revoked;
}

export function simulateLobbyWallBoostServerRestartForTests(): void {
  assertIsolatedTestRuntimeOrThrow("simulateLobbyWallBoostServerRestartForTests");
  boostsById.clear();
  activeRoomBoost.clear();
  lobbyBoostsHydrated = false;
}

export function resetLobbyWallBoostsForTests(): void {
  assertIsolatedTestRuntimeOrThrow("resetLobbyWallBoostsForTests");
  boostsById.clear();
  activeRoomBoost.clear();
  lobbyBoostsHydrated = true;
  flushLobbyWallBoostsToDurable();
}

export function getActiveBoostForRoom(
  roomId: string,
  nowMs: number = Date.now(),
): LobbyWallBoostRecord | null {
  hydrateLobbyWallBoostsFromDurable();
  purgeExpiredBoosts(nowMs);
  const id = activeRoomBoost.get(roomId);
  if (!id) return null;
  const rec = boostsById.get(id);
  if (!rec || rec.expiresAtMs <= nowMs || rec.fulfillmentStatus === "REFUNDED" || rec.fulfillmentStatus === "EXPIRED") {
    return null;
  }
  return rec;
}

export function getActiveBoostsForRooms(
  roomIds: readonly string[],
  nowMs: number = Date.now(),
): Map<string, LobbyWallBoostRecord> {
  hydrateLobbyWallBoostsFromDurable();
  purgeExpiredBoosts(nowMs);
  const out = new Map<string, LobbyWallBoostRecord>();
  for (const roomId of roomIds) {
    const rec = getActiveBoostForRoom(roomId, nowMs);
    if (rec) out.set(roomId, rec);
  }
  return out;
}

export function listActiveBoosts(nowMs: number = Date.now()): LobbyWallBoostRecord[] {
  hydrateLobbyWallBoostsFromDurable();
  purgeExpiredBoosts(nowMs);
  return [...boostsById.values()].filter(
    (r) => r.expiresAtMs > nowMs && r.fulfillmentStatus !== "REFUNDED" && r.fulfillmentStatus !== "EXPIRED",
  );
}

export function buildBoostCheckoutMetadata(input: {
  roomId: string;
  performerId: string;
  category: string;
  kind: LobbyBoostKind;
  wdpEntryId?: string;
}): Record<string, string> {
  const type =
    input.kind === "wdp_submission"
      ? "wdp_submission_boost"
      : input.kind === "lobby_wall_299"
        ? "boost_lobby_wall_299"
        : "boost_lobby_wall";
  return {
    type,
    roomId: input.roomId,
    performerId: input.performerId,
    category: input.category,
    boostKind: input.kind,
    ...(input.wdpEntryId ? { wdpEntryId: input.wdpEntryId } : {}),
  };
}
