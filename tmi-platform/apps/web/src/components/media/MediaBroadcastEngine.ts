'use client';
import { useCallback } from 'react';

interface PipFeed {
  id: string;
  title: string;
  url?: string;
  layer?: string;
  isActive?: boolean;
}

export function useMediaBroadcast() {
  const setPipFeed = useCallback((feed: PipFeed) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('PLAYLIST_VIDEO_START', { detail: feed }));
  }, []);

  return { setPipFeed };
}
