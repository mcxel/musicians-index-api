'use client';

/**
 * PersistentMiniPlayer — the visible half of the Universal Presence System.
 * Mounted once in the root layout. Renders nothing unless a fan/performer has
 * minimized out of a live room to use a hub panel — then shows a small
 * docked "still watching" widget (like a YouTube/Twitch mini player) with a
 * one-click way back into the exact room, instead of losing the room entirely.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWatchSession } from '@/lib/presence/WatchSessionContext';

export default function PersistentMiniPlayer() {
  const { current, minimized, minimize, restore, stopWatching } = useWatchSession();
  const pathname = usePathname();

  const isInsideTrackedRoom = !!current && !!pathname?.includes(`/live/rooms/${current.roomId}`);

  // The room itself only sets minimized=false on entry; nothing else flips
  // it automatically. Route changes are the real signal: leaving the
  // tracked room's URL means the fan opened a hub panel elsewhere, so
  // minimize; coming back to it (e.g. via browser back) means restore.
  useEffect(() => {
    if (!current) return;
    if (isInsideTrackedRoom && minimized) restore();
    if (!isInsideTrackedRoom && !minimized) minimize();
  }, [current, isInsideTrackedRoom, minimized, minimize, restore]);

  // Don't show the mini player while already inside the room it's tracking —
  // that would just duplicate the real room view.
  if (!current || !minimized || isInsideTrackedRoom) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9980,
        width: 220,
        borderRadius: 12,
        overflow: 'hidden',
        background: 'linear-gradient(160deg, rgba(10,6,20,0.96), rgba(5,3,16,0.98))',
        border: `1px solid ${current.accentColor}55`,
        boxShadow: `0 8px 28px rgba(0,0,0,0.5), 0 0 16px ${current.accentColor}22`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: `1px solid ${current.accentColor}33` }}>
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.12em', color: '#E63000', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#E63000', display: 'inline-block', boxShadow: '0 0 5px #E63000' }} />
          STILL WATCHING
        </span>
        <button
          onClick={stopWatching}
          aria-label="Leave room"
          title="Leave room"
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1 }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {current.title}
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
          👁 {current.viewers.toLocaleString()} watching
        </div>
        <Link
          href={`/live/rooms/${current.roomId}?from=lobby-wall`}
          style={{
            display: 'block', textAlign: 'center', padding: '8px 0', borderRadius: 8,
            background: current.accentColor, color: '#050310', fontSize: 10, fontWeight: 900,
            letterSpacing: '0.08em', textDecoration: 'none',
          }}
        >
          ▶ RETURN TO SHOW
        </Link>
      </div>
    </div>
  );
}
