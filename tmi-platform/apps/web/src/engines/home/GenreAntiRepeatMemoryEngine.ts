// Genre Anti-Repeat Memory Authority Engine
// Hard-locks previous 2 cover genres to prevent repetition across sessions
// Uses browser localStorage for persistence

import type { MusicGenre } from "./CoverGenreRotationAuthority";
import { MUSIC_GENRES } from "./CoverGenreRotationAuthority";

const STORAGE_KEY = "tmi_genre_anti_repeat_history";

interface GenreHistoryRecord {
  week: number;
  genre: MusicGenre;
  timestamp: number;
}

// Get the full genre history from localStorage
function getGenreHistory(): GenreHistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save the genre history to localStorage
function saveGenreHistory(history: GenreHistoryRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Silently fail if storage unavailable
  }
}

// Record a genre selection to prevent future repeats
export function recordGenreSelection(week: number, genre: MusicGenre): void {
  const history = getGenreHistory();
  
  // Remove any entries older than 2 weeks (keep only recent)
  const cutoff = week - 2;
  const filtered = history.filter((h) => h.week >= cutoff);
  
  // Add new entry
  filtered.push({ week, genre, timestamp: Date.now() });
  
  // Keep only the 3 most recent entries (current + 2 previous)
  const sorted = filtered.sort((a, b) => b.week - a.week).slice(0, 3);
  
  saveGenreHistory(sorted);
}

// Get the previous 2 genres from hard memory (not just this session)
export function getPreviousCoverGenresFromMemory(currentWeek: number): MusicGenre[] {
  const history = getGenreHistory();
  const recent = history
    .filter((h) => h.week < currentWeek)
    .sort((a, b) => b.week - a.week)
    .slice(0, 2)
    .map((h) => h.genre);
  
  return recent;
}

// Check if a genre is in the hard anti-repeat memory
export function isGenreInAntiRepeatMemory(genre: MusicGenre, currentWeek: number): boolean {
  const previousGenres = getPreviousCoverGenresFromMemory(currentWeek);
  return previousGenres.includes(genre);
}

// Get eligible genres that haven't been shown in the last 2 weeks
export function getAntiRepeatEligibleGenres(currentWeek: number): MusicGenre[] {
  const blocked = getPreviousCoverGenresFromMemory(currentWeek);
  return [...MUSIC_GENRES].filter((g) => !blocked.includes(g));
}

// Clear the history (admin use only)
export function clearGenreHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}
