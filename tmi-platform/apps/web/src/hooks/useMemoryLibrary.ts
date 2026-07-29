/**
 * useMemoryLibrary — thin shared cache over collectibles / collections API (Pass 8.x).
 * Same SoT as Memory Wall (Phase 7.4) — never MemoryLedger wins.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import type { CollectibleMemoryRecord } from "@/lib/memory/collectiblesContracts";

interface CacheEntry {
  items: CollectibleMemoryRecord[];
  loadedAt: number;
  error: boolean;
}

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry>>();

function cacheKey(ownerId?: string) {
  return ownerId ?? "__session__";
}

async function fetchCollectibles(ownerId?: string): Promise<CacheEntry> {
  const key = cacheKey(ownerId);
  const existing = cache.get(key);
  if (existing && Date.now() - existing.loadedAt < CACHE_TTL_MS) {
    return existing;
  }
  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = (async (): Promise<CacheEntry> => {
    try {
      const params = new URLSearchParams({ albums: "0" });
      if (ownerId) params.set("ownerId", ownerId);
      const res = await fetch(`/api/memory/collectibles?${params}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const entry: CacheEntry = { items: [], loadedAt: Date.now(), error: true };
        cache.set(key, entry);
        return entry;
      }
      const data = (await res.json()) as { collectibles?: CollectibleMemoryRecord[] };
      const entry: CacheEntry = {
        items: data.collectibles ?? [],
        loadedAt: Date.now(),
        error: false,
      };
      cache.set(key, entry);
      return entry;
    } catch {
      const entry: CacheEntry = { items: [], loadedAt: Date.now(), error: true };
      cache.set(key, entry);
      return entry;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

export interface UseMemoryLibraryOptions {
  ownerId?: string;
  /** Max items exposed to consumers (default 40). */
  take?: number;
  enabled?: boolean;
}

export interface UseMemoryLibraryResult {
  items: CollectibleMemoryRecord[];
  recent: CollectibleMemoryRecord[];
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

export function useMemoryLibrary(
  options: UseMemoryLibraryOptions = {}
): UseMemoryLibraryResult {
  const { ownerId, take = 40, enabled = true } = options;
  const [items, setItems] = useState<CollectibleMemoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      setError(false);
      return;
    }
    setLoading(true);
    const entry = await fetchCollectibles(ownerId);
    setItems(entry.items.slice(0, take));
    setError(entry.error);
    setLoading(false);
  }, [ownerId, take, enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    items,
    recent: items.slice(0, Math.min(8, take)),
    loading,
    error,
    refresh,
  };
}

/** Invalidate shared cache (e.g. after capture). */
export function invalidateMemoryLibraryCache(ownerId?: string) {
  if (ownerId) {
    cache.delete(cacheKey(ownerId));
  } else {
    cache.clear();
  }
}
