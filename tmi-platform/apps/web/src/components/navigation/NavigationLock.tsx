'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * NavigationLock: Safe Return-Path Guard
 * Enforces continuity for: Home -> Venue -> Lobby -> Profile -> Home
 * and Home -> Lobby -> Seat -> Home
 */
export function NavigationLock() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [lastVenue, setLastVenue] = useState<string | null>(null);
  const [lastSeat, setLastSeat] = useState<string | null>(null);

  useEffect(() => {
    // Track venue and seating locations for safe return paths
    if (pathname?.includes('/live/rooms/') || pathname?.includes('/arena/')) {
      setLastVenue(pathname);
      sessionStorage.setItem('tmi_last_venue', pathname);
    }
    if (pathname?.includes('/checkout/seat') || pathname?.includes('/seating')) {
      setLastSeat(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    const storedVenue = sessionStorage.getItem('tmi_last_venue');
    if (storedVenue && !lastVenue) setLastVenue(storedVenue);
  }, []);

  // Determine if we are in a "dead end" profile or lobby that needs a return path
  const isProfile = pathname?.includes('/profile/') || pathname?.includes('/artists/') || pathname?.includes('/advertisers/');
  const isLobby = pathname?.includes('/live/lobby');
  
  if (!isProfile && !isLobby) return null;

  return (
    <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 9999, display: 'flex', gap: 12 }}>
      {lastSeat && (
        <button 
          onClick={() => router.push(lastSeat)}
          style={{ background: '#FFD700', color: '#000', padding: '8px 16px', borderRadius: 20, fontSize: 11, fontWeight: 900, cursor: 'pointer', border: 'none', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)' }}
        >
          🎟️ RETURN TO SEAT
        </button>
      )}
      
      {lastVenue && !lastSeat && (
        <button 
          onClick={() => router.push(lastVenue)}
          style={{ background: '#00FF88', color: '#000', padding: '8px 16px', borderRadius: 20, fontSize: 11, fontWeight: 900, cursor: 'pointer', border: 'none', boxShadow: '0 4px 15px rgba(0, 255, 136, 0.4)' }}
        >
          🎤 BACK TO VENUE
        </button>
      )}

      <button 
        onClick={() => router.push('/home/1')}
        style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 16px', borderRadius: 20, fontSize: 11, fontWeight: 800, cursor: 'pointer', backdropFilter: 'blur(10px)' }}
      >
        🏠 HOME
      </button>
    </div>
  );
}