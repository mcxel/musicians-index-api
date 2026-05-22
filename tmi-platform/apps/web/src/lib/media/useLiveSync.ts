"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveFeedItem } from "@/components/billboard/TMIBillboardLiveWall";
import { syncLiveRegistry } from "@/lib/media/LiveStateRegistry";

const POLL_INTERVAL_MS = 4_000;

export interface UseLiveSyncOptions {
  /** Set false to pause polling (e.g. when tab is hidden or scene is inactive) */
  enabled?: boolean;
  /** Called when the feed updates — use to drive Billboard / homepage widgets */
  onUpdate?: (feed: LiveFeedItem[]) => void;
}

export interface UseLiveSyncResult {
  feed: LiveFeedItem[];
  isLoading: boolean;
  lastUpdated: number | null;
  error: string | null;
}

/**
 * useLiveSync — polls /api/live every 4 seconds, feeds LiveStateRegistry,
 * and returns the full LiveFeedItem[] array for UI consumption.
 *
 * Drop into any page or provider that needs live data:
 *   const { feed, isLoading } = useLiveSync({ enabled: isSceneActive });
 */
export function useLiveSync({
  enabled = true,
  onUpdate,
}: UseLiveSyncOptions = {}): UseLiveSyncResult {
  const [feed, setFeed]           = useState<LiveFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLast]    = useState<number | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef                  = useRef<AbortController | null>(null);

  const fetchFeed = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/live", { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`/api/live returned ${res.status}`);
      const data: LiveFeedItem[] = await res.json();

      // Feed the registry (source of truth for all widgets)
      syncLiveRegistry(
        data.filter((d) => d.isLive).map((d) => ({
          performerId: d.performerId,
          roomId:      d.roomId,
          genre:       d.genre,
          viewerCount: d.viewers,
        }))
      );

      setFeed(data);
      setLast(Date.now());
      setError(null);
      onUpdate?.(data);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message ?? "Live sync failed");
    } finally {
      setIsLoading(false);
    }
  }, [onUpdate]);

  useEffect(() => {
    if (!enabled) {
      timerRef.current && clearInterval(timerRef.current);
      return;
    }

    // Immediate first fetch
    fetchFeed();

    timerRef.current = setInterval(fetchFeed, POLL_INTERVAL_MS);
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      abortRef.current?.abort();
    };
  }, [enabled, fetchFeed]);

  return { feed, isLoading, lastUpdated, error };
}
