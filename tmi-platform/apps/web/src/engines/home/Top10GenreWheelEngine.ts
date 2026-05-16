// Full Top 10 Genre Wheel Authority Engine
// 10-position rotating genre wheel for magazine authority display
// Tracks genre rotation across weeks with deterministic positioning

import type { MusicGenre } from "./CoverGenreRotationAuthority";
import { MUSIC_GENRES, getGenreForWeek, getCurrentWeekIndex } from "./CoverGenreRotationAuthority";

export interface Top10Position {
  position: number; // 1-10, starting from top
  genre: MusicGenre;
  angle: number; // 0-360 degrees
  x: number; // -1 to 1 (normalized)
  y: number; // -1 to 1 (normalized)
  week: number;
}

// Generate 10 positions around a circle (clock-like positioning)
function generatePositions(genres: MusicGenre[]): Top10Position[] {
  const positions: Top10Position[] = [];
  
  for (let i = 0; i < 10; i++) {
    const angle = (i * 36) - 90; // Start at top (12 o'clock)
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians);
    const y = Math.sin(radians);
    
    positions.push({
      position: i + 1,
      genre: genres[i] || "House",
      angle,
      x,
      y,
      week: getCurrentWeekIndex(),
    });
  }
  
  return positions;
}

// Get the Top 10 genre wheel for the current week
export function getTop10GenreWheel(): Top10Position[] {
  const weekIdx = getCurrentWeekIndex();
  
  // Build a 10-genre rotation (cycle through MUSIC_GENRES)
  const wheel: MusicGenre[] = [];
  for (let i = 0; i < 10; i++) {
    wheel.push(MUSIC_GENRES[(weekIdx + i) % MUSIC_GENRES.length]!);
  }
  
  return generatePositions(wheel);
}

// Get the Top 10 for a specific week
export function getTop10GenreWheelForWeek(weekIndex: number): Top10Position[] {
  const wheel: MusicGenre[] = [];
  for (let i = 0; i < 10; i++) {
    wheel.push(MUSIC_GENRES[(weekIndex + i) % MUSIC_GENRES.length]!);
  }
  
  const positions = generatePositions(wheel);
  positions.forEach((p) => (p.week = weekIndex));
  
  return positions;
}

// Get a specific position on the wheel
export function getTop10Position(positionNumber: number): Top10Position | null {
  const wheel = getTop10GenreWheel();
  return wheel.find((p) => p.position === positionNumber) || null;
}

// Get the #1 position (12 o'clock)
export function getTop10First(): Top10Position | null {
  return getTop10Position(1);
}

// Get positions by genre (returns all positions for a given genre)
export function getPositionsByGenre(genre: MusicGenre): Top10Position[] {
  const wheel = getTop10GenreWheel();
  return wheel.filter((p) => p.genre === genre);
}

// Get next N positions starting from a given position
export function getNextPositions(startPosition: number, count: number): Top10Position[] {
  const wheel = getTop10GenreWheel();
  const positions: Top10Position[] = [];
  
  for (let i = 0; i < count; i++) {
    const pos = ((startPosition - 1 + i) % 10) + 1;
    const found = wheel.find((p) => p.position === pos);
    if (found) positions.push(found);
  }
  
  return positions;
}

// Generate display angles for a clock-like visualization (12-hour format)
export function getClockAngle(position: number): number {
  // Convert position (1-10) to angle
  // Position 1 = 0° (top/12 o'clock)
  // Position 2 = 36°
  // Position 3 = 72°, etc.
  return ((position - 1) * 36) % 360;
}

// Get the "danger zone" positions (positions likely to be challenged)
export function getDangerZonePositions(): Top10Position[] {
  const wheel = getTop10GenreWheel();
  // Positions 6-10 are the "danger zone" (lower in the standings)
  return wheel.filter((p) => p.position >= 6);
}

// Check if a genre is in the Top 10
export function isGenreInTop10(genre: MusicGenre): boolean {
  const wheel = getTop10GenreWheel();
  return wheel.some((p) => p.genre === genre);
}

// Get the "hot 3" (positions 1-3, the challenge zone)
export function getHot3Positions(): Top10Position[] {
  return getNextPositions(1, 3);
}

// Get the "rising" positions (positions 4-6, momentum zone)
export function getRisingPositions(): Top10Position[] {
  return getNextPositions(4, 3);
}

// Get the "fighting back" positions (positions 7-10, re-entry zone)
export function getFightingBackPositions(): Top10Position[] {
  return getNextPositions(7, 4);
}

// Export full position data as a serializable object
export interface Top10WheelSnapshot {
  week: number;
  timestamp: number;
  positions: Top10Position[];
  hot3: Top10Position[];
  rising: Top10Position[];
  fightingBack: Top10Position[];
}

export function getTop10Snapshot(): Top10WheelSnapshot {
  const positions = getTop10GenreWheel();
  
  return {
    week: getCurrentWeekIndex(),
    timestamp: Date.now(),
    positions,
    hot3: getHot3Positions(),
    rising: getRisingPositions(),
    fightingBack: getFightingBackPositions(),
  };
}
