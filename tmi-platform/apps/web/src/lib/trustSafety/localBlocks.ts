/**
 * Client-side Fan Lobby block/mute lists — immediate UX friction.
 * Server-side TrustSafetyProtection is authoritative after a filed report.
 */

const BLOCK_KEY = "tmi-trust-safety:blocked";
const MUTE_KEY = "tmi-trust-safety:muted";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify([...set]));
}

export function getBlockedUserIds(): Set<string> {
  return readSet(BLOCK_KEY);
}

export function getMutedUserIds(): Set<string> {
  return readSet(MUTE_KEY);
}

export function blockUserLocal(userId: string) {
  const s = readSet(BLOCK_KEY);
  s.add(userId);
  writeSet(BLOCK_KEY, s);
}

export function unblockUserLocal(userId: string) {
  const s = readSet(BLOCK_KEY);
  s.delete(userId);
  writeSet(BLOCK_KEY, s);
}

export function muteUserLocal(userId: string) {
  const s = readSet(MUTE_KEY);
  s.add(userId);
  writeSet(MUTE_KEY, s);
}

export function unmuteUserLocal(userId: string) {
  const s = readSet(MUTE_KEY);
  s.delete(userId);
  writeSet(MUTE_KEY, s);
}
