"use client";

/**
 * useSeatSession — client-side seat persistence across page refreshes.
 * Stores the fan's claimed seatId in sessionStorage keyed by roomId.
 * On re-entry the SeatingMeshEngine's checkInFan() can restore the seat
 * if it's still available.
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "tmi:seat:";

function storageKey(roomId: string, fanId: string): string {
  return `${STORAGE_PREFIX}${roomId}:${fanId}`;
}

export interface SeatSession {
  seatId: string;
  roomId: string;
  fanId: string;
  claimedAt: number;
}

/** Persist a claimed seat to sessionStorage. */
export function persistSeatClaim(roomId: string, fanId: string, seatId: string): void {
  if (typeof window === "undefined") return;
  const entry: SeatSession = { seatId, roomId, fanId, claimedAt: Date.now() };
  sessionStorage.setItem(storageKey(roomId, fanId), JSON.stringify(entry));
}

/** Retrieve the previously claimed seat for this fan+room, or null. */
export function getSeatClaim(roomId: string, fanId: string): SeatSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(storageKey(roomId, fanId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SeatSession;
  } catch {
    return null;
  }
}

/** Clear the seat claim (fan left the room intentionally). */
export function clearSeatClaim(roomId: string, fanId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(storageKey(roomId, fanId));
}

/**
 * React hook — manages seat session state for a fan in a specific room.
 * Returns the current seatId (or null), plus claim/release helpers.
 */
export function useSeatSession(roomId: string, fanId: string) {
  const [seatId, setSeatId] = useState<string | null>(null);

  // Rehydrate from sessionStorage on mount
  useEffect(() => {
    const prior = getSeatClaim(roomId, fanId);
    if (prior) setSeatId(prior.seatId);
  }, [roomId, fanId]);

  const claim = useCallback(
    (newSeatId: string) => {
      persistSeatClaim(roomId, fanId, newSeatId);
      setSeatId(newSeatId);
    },
    [roomId, fanId],
  );

  const release = useCallback(() => {
    clearSeatClaim(roomId, fanId);
    setSeatId(null);
  }, [roomId, fanId]);

  return { seatId, claim, release };
}
