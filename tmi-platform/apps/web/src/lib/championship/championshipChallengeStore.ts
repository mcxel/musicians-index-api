/**
 * Championship challenge queue — localStorage persistence (client).
 * Honest empty when nothing queued. No fake win records.
 */

import type { ChampionshipChallengeRequest } from "./types";

const STORAGE_KEY = "tmi_championship_challenge_queue_v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadChallengeQueue(): ChampionshipChallengeRequest[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChampionshipChallengeRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveChallengeQueue(queue: ChampionshipChallengeRequest[]): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    /* quota */
  }
}

export function appendChallenge(
  request: ChampionshipChallengeRequest,
): ChampionshipChallengeRequest[] {
  const next = [request, ...loadChallengeQueue()].slice(0, 100);
  saveChallengeQueue(next);
  return next;
}

export function listChallengesForChallenger(
  challengerId: string,
): ChampionshipChallengeRequest[] {
  return loadChallengeQueue().filter((c) => c.challengerId === challengerId);
}

export function listChallengesForTitle(
  titleId: string,
): ChampionshipChallengeRequest[] {
  return loadChallengeQueue().filter((c) => c.titleId === titleId);
}
