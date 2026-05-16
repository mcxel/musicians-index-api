/**
 * Ranking Memory Lock Engine
 * 
 * Manages genre/ranking cycle memory across /home/1 (cover) and /home/1-2 (spread).
 * 
 * Rules:
 * 1. No genre repetition between consecutive /home/1 views
 * 2. No genre repetition between /home/1 and /home/1-2 in same cycle
 * 3. 3-cycle lock: A genre cannot return until 3 different genres have been shown
 * 
 * Memory buffer:
 * Example cycle sequence:
 * - Cycle 1: Hip Hop (cover) → Country (spread)
 * - Cycle 2: Jazz (cover) → Electronic (spread)
 * - Cycle 3: Reggae (cover) → Soul (spread)
 * - Cycle 4: Hip Hop can return (3 genres shown in cover column)
 */

import type { MusicGenre } from "./CoverGenreRotationAuthority";

interface RankingMemoryState {
  // Genre history for cover (3-cycle window)
  coverHistory: MusicGenre[];
  // Genre history for spread (3-cycle window)
  spreadHistory: MusicGenre[];
  // Timestamp of last update
  lastUpdated: number;
}

const STORAGE_KEY = "tmi:ranking-memory-lock";
const CYCLE_WINDOW = 3; // 3-genre anti-repeat window

function getStoredMemory(): RankingMemoryState {
  try {
    if (typeof window === "undefined") return { coverHistory: [], spreadHistory: [], lastUpdated: 0 };
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { coverHistory: [], spreadHistory: [], lastUpdated: 0 };
  } catch {
    return { coverHistory: [], spreadHistory: [], lastUpdated: 0 };
  }
}

function saveMemory(state: RankingMemoryState) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently fail in case of storage quota exceeded
  }
}

/**
 * Record a cover genre selection in memory
 */
export function recordCoverGenre(genre: MusicGenre): void {
  const memory = getStoredMemory();
  
  // Add to history and keep only last CYCLE_WINDOW entries
  memory.coverHistory = [genre, ...memory.coverHistory].slice(0, CYCLE_WINDOW);
  memory.lastUpdated = Date.now();
  
  saveMemory(memory);
}

/**
 * Record a spread genre selection in memory
 */
export function recordSpreadGenre(genre: MusicGenre): void {
  const memory = getStoredMemory();
  
  // Add to history and keep only last CYCLE_WINDOW entries
  memory.spreadHistory = [genre, ...memory.spreadHistory].slice(0, CYCLE_WINDOW);
  memory.lastUpdated = Date.now();
  
  saveMemory(memory);
}

/**
 * Check if a genre is eligible for cover (not in recent 3-cycle history)
 */
export function isCoverGenreEligible(genre: MusicGenre): boolean {
  const memory = getStoredMemory();
  
  // Never show same genre as most recent cover
  if (memory.coverHistory[0] === genre) return false;
  
  // Must not appear in current 3-cycle window
  return !memory.coverHistory.includes(genre);
}

/**
 * Check if a genre is eligible for spread (not conflicting with current cover or recent spread)
 */
export function isSpreadGenreEligible(genre: MusicGenre, currentCoverGenre: MusicGenre): boolean {
  const memory = getStoredMemory();
  
  // Never match the current cover genre (no same-cycle duplication)
  if (genre === currentCoverGenre) return false;
  
  // Never show same genre as most recent spread
  if (memory.spreadHistory[0] === genre) return false;
  
  // Must not appear in current 3-cycle window
  return !memory.spreadHistory.includes(genre);
}

/**
 * Get genre eligibility report for debugging
 */
export function getGenreMemoryReport(): {
  coverHistory: MusicGenre[];
  spreadHistory: MusicGenre[];
  eligibleForCover: (genre: MusicGenre) => boolean;
  eligibleForSpread: (genre: MusicGenre, coverGenre: MusicGenre) => boolean;
} {
  const memory = getStoredMemory();
  
  return {
    coverHistory: memory.coverHistory,
    spreadHistory: memory.spreadHistory,
    eligibleForCover: isCoverGenreEligible,
    eligibleForSpread: isSpreadGenreEligible,
  };
}

/**
 * Clear memory (for testing or reset)
 */
export function clearRankingMemory(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}
