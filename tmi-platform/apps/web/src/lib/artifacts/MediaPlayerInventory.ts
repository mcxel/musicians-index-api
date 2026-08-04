/**
 * Media Player chassis inventory — client cache + durable API sync.
 * Free default: Standard TMI Player (`standard`). Fish is never auto-equipped.
 * Auth path: /api/media-players (Prisma). Unauth: localStorage only.
 */

import {
  FREE_DEFAULT_CHASSIS_ID,
  MEDIA_PLAYER_CHASSIS_REGISTRY,
  canEquipChassis,
  type MediaPlayerChassisId,
} from "@/lib/artifacts/PlaylistArtifactEngine";

const OWNED_KEY = "tmi_media_player_owned_v1";
const EQUIPPED_KEY = "tmi_media_player_equipped_v1";

const FREE_STARTERS: MediaPlayerChassisId[] = [
  FREE_DEFAULT_CHASSIS_ID,
  "tmi_classic",
  "tmi_dark",
  "tmi_neon",
];

export interface MediaPlayerClientState {
  authenticated: boolean;
  ownedChassisIds: MediaPlayerChassisId[];
  equippedChassisId: MediaPlayerChassisId;
  pointsBalance: number;
}

type Listener = () => void;
const listeners = new Set<Listener>();

let memoryCache: MediaPlayerClientState | null = null;

function storageGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function storageSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

function notify(): void {
  listeners.forEach((fn) => fn());
}

export function subscribeMediaPlayerInventory(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function writeLocal(userId: string, owned: MediaPlayerChassisId[], equipped: MediaPlayerChassisId): void {
  const allOwned = storageGet<Record<string, MediaPlayerChassisId[]>>(OWNED_KEY, {});
  allOwned[userId] = Array.from(new Set(owned));
  storageSet(OWNED_KEY, allOwned);
  const allEq = storageGet<Record<string, MediaPlayerChassisId>>(EQUIPPED_KEY, {});
  allEq[userId] = equipped;
  storageSet(EQUIPPED_KEY, allEq);
}

function readLocalOwned(userId: string): MediaPlayerChassisId[] {
  const all = storageGet<Record<string, MediaPlayerChassisId[]>>(OWNED_KEY, {});
  return all[userId] ?? [...FREE_STARTERS];
}

function readLocalEquipped(userId: string): MediaPlayerChassisId {
  const all = storageGet<Record<string, MediaPlayerChassisId>>(EQUIPPED_KEY, {});
  return all[userId] ?? FREE_DEFAULT_CHASSIS_ID;
}

function setCache(state: MediaPlayerClientState): void {
  memoryCache = state;
  notify();
}

/** Ensure every user owns + equips the free Standard TMI Player (sync local). */
export function ensureDefaultMediaPlayer(userId: string): MediaPlayerChassisId {
  const owned = getOwnedChassisIds(userId);
  if (!owned.includes(FREE_DEFAULT_CHASSIS_ID)) {
    setOwnedChassisIds(userId, [...owned, ...FREE_STARTERS]);
  }
  const equipped = getEquippedChassisId(userId);
  if (equipped === "fish" || equipped === "submarine") {
    setEquippedChassisId(userId, FREE_DEFAULT_CHASSIS_ID);
    return FREE_DEFAULT_CHASSIS_ID;
  }
  if (!equipped || !MEDIA_PLAYER_CHASSIS_REGISTRY[equipped]) {
    setEquippedChassisId(userId, FREE_DEFAULT_CHASSIS_ID);
    return FREE_DEFAULT_CHASSIS_ID;
  }
  return equipped;
}

export function getOwnedChassisIds(userId: string): MediaPlayerChassisId[] {
  if (memoryCache?.ownedChassisIds?.length) return memoryCache.ownedChassisIds;
  return readLocalOwned(userId);
}

function setOwnedChassisIds(userId: string, ids: MediaPlayerChassisId[]): void {
  const unique = Array.from(new Set(ids));
  writeLocal(userId, unique, getEquippedChassisId(userId));
  if (memoryCache) {
    setCache({ ...memoryCache, ownedChassisIds: unique });
  }
}

export function getEquippedChassisId(userId: string): MediaPlayerChassisId {
  if (memoryCache?.equippedChassisId) return memoryCache.equippedChassisId;
  return readLocalEquipped(userId);
}

export function setEquippedChassisId(userId: string, chassisId: MediaPlayerChassisId): boolean {
  const owned = getOwnedChassisIds(userId);
  if (!canEquipChassis(chassisId, "FREE", owned)) return false;
  writeLocal(userId, owned, chassisId);
  if (memoryCache) {
    setCache({ ...memoryCache, equippedChassisId: chassisId });
  }
  return true;
}

export function grantChassisOwnership(userId: string, chassisId: MediaPlayerChassisId): void {
  const owned = getOwnedChassisIds(userId);
  if (owned.includes(chassisId)) return;
  setOwnedChassisIds(userId, [...owned, chassisId]);
}

export function ownsChassis(userId: string, chassisId: MediaPlayerChassisId): boolean {
  return getOwnedChassisIds(userId).includes(chassisId);
}

export function getCachedMediaPlayerState(): MediaPlayerClientState | null {
  return memoryCache;
}

/**
 * Hydrate from durable API when signed in; otherwise provision local free default.
 * Survives logout when DB/API path was used (ownership stays server-side).
 */
export async function hydrateMediaPlayerOwnership(
  userId: string,
): Promise<MediaPlayerClientState> {
  ensureDefaultMediaPlayer(userId);
  try {
    const res = await fetch("/api/media-players", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as {
      authenticated?: boolean;
      ownedChassisIds?: MediaPlayerChassisId[];
      equippedChassisId?: MediaPlayerChassisId;
      pointsBalance?: number;
    };

    if (data.authenticated && data.ownedChassisIds) {
      const owned = data.ownedChassisIds;
      const equipped = data.equippedChassisId ?? FREE_DEFAULT_CHASSIS_ID;
      writeLocal(userId, owned, equipped);
      const state: MediaPlayerClientState = {
        authenticated: true,
        ownedChassisIds: owned,
        equippedChassisId: equipped,
        pointsBalance: data.pointsBalance ?? 0,
      };
      setCache(state);
      return state;
    }
  } catch {
    /* fall through to local */
  }

  const state: MediaPlayerClientState = {
    authenticated: false,
    ownedChassisIds: getOwnedChassisIds(userId),
    equippedChassisId: getEquippedChassisId(userId),
    pointsBalance: 0,
  };
  setCache(state);
  return state;
}

/** Points purchase — durable Wallet.fanCredits when auth; else ProgressionEngine + local. */
export async function purchaseChassisWithPointsApi(
  userId: string,
  chassisId: MediaPlayerChassisId,
  spendLocalPoints: () => { ok: boolean; balance: number },
): Promise<{ ok: boolean; message: string; state?: MediaPlayerClientState }> {
  try {
    const res = await fetch("/api/media-players", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "purchase_points", chassisId }),
    });
    const data = await res.json();
    if (res.status === 401) {
      const local = spendLocalPoints();
      if (!local.ok) {
        return {
          ok: false,
          message: `Not enough points. Need balance · have ${local.balance}. Sign in to keep ownership durable.`,
        };
      }
      grantChassisOwnership(userId, chassisId);
      const state: MediaPlayerClientState = {
        authenticated: false,
        ownedChassisIds: getOwnedChassisIds(userId),
        equippedChassisId: getEquippedChassisId(userId),
        pointsBalance: local.balance,
      };
      setCache(state);
      return {
        ok: true,
        message: `Unlocked (local only — sign in to keep across devices).`,
        state,
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        message: (data.error as string) ?? "Purchase failed",
        state: memoryCache ?? undefined,
      };
    }
    const state: MediaPlayerClientState = {
      authenticated: true,
      ownedChassisIds: data.ownedChassisIds,
      equippedChassisId: data.equippedChassisId,
      pointsBalance: data.pointsBalance ?? 0,
    };
    writeLocal(userId, state.ownedChassisIds, state.equippedChassisId);
    setCache(state);
    return { ok: true, message: `Unlocked (−${data.spent ?? 0} pts).`, state };
  } catch {
    return { ok: false, message: "Unable to reach purchase service." };
  }
}

export async function equipChassisApi(
  userId: string,
  chassisId: MediaPlayerChassisId,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch("/api/media-players", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "equip", chassisId }),
    });
    if (res.status === 401) {
      const ok = setEquippedChassisId(userId, chassisId);
      return ok ? { ok: true } : { ok: false, message: "Not owned" };
    }
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error ?? "Equip failed" };
    writeLocal(userId, data.ownedChassisIds, data.equippedChassisId);
    setCache({
      authenticated: true,
      ownedChassisIds: data.ownedChassisIds,
      equippedChassisId: data.equippedChassisId,
      pointsBalance: data.pointsBalance ?? memoryCache?.pointsBalance ?? 0,
    });
    return { ok: true };
  } catch {
    const ok = setEquippedChassisId(userId, chassisId);
    return ok ? { ok: true } : { ok: false, message: "Equip failed" };
  }
}

export async function unequipChassisApi(userId: string): Promise<void> {
  try {
    const res = await fetch("/api/media-players", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unequip" }),
    });
    if (res.ok) {
      const data = await res.json();
      writeLocal(userId, data.ownedChassisIds, data.equippedChassisId);
      setCache({
        authenticated: true,
        ownedChassisIds: data.ownedChassisIds,
        equippedChassisId: data.equippedChassisId,
        pointsBalance: data.pointsBalance ?? 0,
      });
      return;
    }
  } catch {
    /* local fallback */
  }
  setEquippedChassisId(userId, FREE_DEFAULT_CHASSIS_ID);
}

/** Start Stripe Checkout for MEDIA_PLAYER_CHASSIS. */
export async function purchaseChassisWithStripe(
  chassisId: MediaPlayerChassisId,
): Promise<{ ok: boolean; url?: string; message?: string }> {
  try {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: "MEDIA_PLAYER_CHASSIS", chassisId }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, message: (data.error as string) ?? "Checkout unavailable" };
    }
    if (!data.url) return { ok: false, message: "No checkout URL returned" };
    return { ok: true, url: data.url as string };
  } catch {
    return { ok: false, message: "Unable to start Stripe checkout" };
  }
}
