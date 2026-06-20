'use client';

/**
 * RecentlyVisitedRail — one-click return to rooms a fan already attended,
 * per the Fan Hub P0 motion pass (locked 2026-06-19): "fans must be able to
 * reconnect with performers and rooms they already visited... no hunting
 * through multiple pages." Reads the same WatchSessionContext history every
 * LobbyEntryFlow join already populates — no separate tracking system.
 */

import Link from 'next/link';
import { useWatchSession } from '@/lib/presence/WatchSessionContext';

export default function RecentlyVisitedRail() {
  const { recentRooms } = useWatchSession();

  if (recentRooms.length === 0) {
    return (
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', padding: '10px 0' }}>
        Rooms you visit will show up here for one-click return.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
      {recentRooms.map((room) => (
        <Link key={room.roomId} href={`/live/rooms/${room.roomId}?from=lobby-wall`} style={{ textDecoration: 'none' }}>
          <div
            style={{
              width: 150,
              flexShrink: 0,
              borderRadius: 10,
              border: `1px solid ${room.accentColor}44`,
              background: `linear-gradient(145deg, ${room.accentColor}14, rgba(5,5,16,0.9))`,
              padding: '10px 12px',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: '#fff', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {room.title}
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
              👁 {room.viewers.toLocaleString()} watching
            </div>
            <div style={{ fontSize: 8, fontWeight: 700, color: room.accentColor, letterSpacing: '0.06em' }}>
              ↺ REJOIN
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
