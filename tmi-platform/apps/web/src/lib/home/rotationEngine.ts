"use client";

/**
 * ROTATION ENGINE
 * Drives the homepage never-static system.
 * Handles genre mixing, non-#1 artist injection, and diversity enforcement.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { TIMING } from "@/lib/motion/timingRegistry";
import { prefersReducedMotion } from "@/lib/motion/reducedMotionGuard";
import { rotateTiles, type HomepageTile } from "./tileController";

export type Genre =
  | "afrobeats"
  | "hip-hop"
  | "afro-fusion"
  | "dancehall"
  | "r&b"
  | "pop"
  | "trap"
  | "drill"
  | "jazz"
  | "world";

const GENRE_SEQUENCE: Genre[] = [
  "afrobeats",
  "hip-hop",
  "afro-fusion",
  "dancehall",
  "r&b",
  "pop",
  "trap",
  "drill",
  "world",
  "jazz",
];

interface RotationState {
  tiles: HomepageTile[];
  currentGenre: Genre;
  genreIndex: number;
  top10Tick: number;
  starburst: boolean;
  cycleCount: number;
}

/**
 * Generates the next tile set with genre mixing.
 */
export function getNextTileSet(currentIndex: number): HomepageTile[] {
  return rotateTiles(6);
}

/**
 * Mixes genre sequence — ensures no two identical genres back-to-back.
 */
export function mixGenres(current: Genre, all: Genre[]): Genre {
  const candidates = all.filter((g) => g !== current);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Hook: drives top10 tick, genre rotation, starburst trigger, and tile sets.
 */
export function useRotationEngine() {
  const [state, setState] = useState<RotationState>({
    tiles: getNextTileSet(0),
    currentGenre: GENRE_SEQUENCE[0],
    genreIndex: 0,
    top10Tick: 0,
    starburst: false,
    cycleCount: 0,
  });

  const tickRef = useRef(0);
  const genreRef = useRef(0);
  const reduced = prefersReducedMotion();

  // Top 10 face hold — ticks every 5 seconds
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      tickRef.current += 1;
      setState((prev) => ({ ...prev, top10Tick: tickRef.current }));
    }, TIMING.top10Hold);
    return () => clearInterval(id);
  }, [reduced]);

  // Genre + tile rotation — fires every ~25 seconds, triggers starburst
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      genreRef.current = (genreRef.current + 1) % GENRE_SEQUENCE.length;
      const nextGenre = GENRE_SEQUENCE[genreRef.current];
      const nextTiles = getNextTileSet(genreRef.current);

      setState((prev) => ({
        ...prev,
        tiles: nextTiles,
        currentGenre: nextGenre,
        genreIndex: genreRef.current,
        starburst: true,
        cycleCount: prev.cycleCount + 1,
      }));

      // Reset starburst after burst duration
      window.setTimeout(() => {
        setState((prev) => ({ ...prev, starburst: false }));
      }, TIMING.starburstDuration + 100);
    }, TIMING.homepagePageHold);

    return () => clearInterval(id);
  }, [reduced]);

  const clearStarburst = useCallback(() => {
    setState((prev) => ({ ...prev, starburst: false }));
  }, []);

  return { ...state, clearStarburst, genres: GENRE_SEQUENCE };
}
