"use client";

import { useState, useEffect, useCallback } from "react";
import {
  type RotationKey,
  ROTATION_CONFIGS,
  getRotationPage,
  getPageCount,
} from "@/lib/homepageRotationEngine";

interface UseHomepageRotationResult<T> {
  /** Current page of items. */
  items: T[];
  /** Zero-based current page index. */
  pageIndex: number;
  /** Total number of pages. */
  totalPages: number;
  /** Manually advance to the next page. */
  next: () => void;
  /** Manually go back a page. */
  prev: () => void;
}

/**
 * useHomepageRotation
 *
 * Drives timed rotation for a single homepage content group.
 * Auto-advances every `holdMs` from the engine config.
 * Safe to use in multiple rail components simultaneously.
 *
 * @example
 *   const { items } = useHomepageRotation<ArtistRankEntry>("topTen");
 */
export function useHomepageRotation<T = unknown>(
  key: RotationKey
): UseHomepageRotationResult<T> {
  const holdMs = ROTATION_CONFIGS[key].holdMs;
  const totalPages = getPageCount(key);

  const [pageIndex, setPageIndex] = useState(0);

  const next = useCallback(() => {
    setPageIndex((p) => (p + 1) % totalPages);
  }, [totalPages]);

  const prev = useCallback(() => {
    setPageIndex((p) => (p - 1 + totalPages) % totalPages);
  }, [totalPages]);

  useEffect(() => {
    if (totalPages <= 1) return;
    const id = setInterval(next, holdMs);
    return () => clearInterval(id);
  }, [holdMs, next, totalPages]);

  const items = getRotationPage<T>(key, pageIndex);

  return { items, pageIndex, totalPages, next, prev };
}
