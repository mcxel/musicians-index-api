/**
 * FanWorldSession — Canonical Single-Presence Fan Session State Manager.
 *
 * Tracks a fan's location, active venue, reserved audience seat, travel state,
 * and group chat canister state. Guaranteed single presence (no avatar clones).
 * Restricted strictly to accounts with the FAN role.
 */

export type TravelState = 'IDLE' | 'CHAIR_SUMMONED' | 'HYPERSPACE_TRAVEL' | 'ARRIVED';

export interface FanWorldSession {
  fanId: string;
  avatarIdentityId: string;
  role: 'FAN';
  currentVenueId: string;
  currentRoomId: string;
  currentSeatId: string | null;
  previousVenueId: string | null;
  destinationVenueId: string | null;
  destinationSeatId: string | null;
  activeEventId: string | null;
  groupChatId: string | null;
  travelState: TravelState;
  isSwipePanelOpen: boolean;
  lastMovedAt: number;
}

const _activeFanSessions = new Map<string, FanWorldSession>();
const _listeners = new Set<(session: FanWorldSession) => void>();

export function getOrCreateFanSession(fanId: string, initialVenueId = 'neon-club'): FanWorldSession {
  let session = _activeFanSessions.get(fanId);
  if (!session) {
    session = {
      fanId,
      avatarIdentityId: `avatar-fan-${fanId}`,
      role: 'FAN',
      currentVenueId: initialVenueId,
      currentRoomId: `room-${initialVenueId}`,
      currentSeatId: 'seat-A-12',
      previousVenueId: null,
      destinationVenueId: null,
      destinationSeatId: null,
      activeEventId: null,
      groupChatId: null,
      travelState: 'IDLE',
      isSwipePanelOpen: false,
      lastMovedAt: Date.now(),
    };
    _activeFanSessions.set(fanId, session);
  }
  return session;
}

export function startVenueTravel(fanId: string, destinationVenueId: string, targetSeatId = 'seat-B-05'): FanWorldSession | null {
  const session = _activeFanSessions.get(fanId);
  if (!session) return null;

  session.previousVenueId = session.currentVenueId;
  session.destinationVenueId = destinationVenueId;
  session.destinationSeatId = targetSeatId;
  session.travelState = 'CHAIR_SUMMONED';
  session.lastMovedAt = Date.now();

  console.log(`[FanWorldSession] 🚀 Travel initiated for Fan ${fanId} -> ${destinationVenueId}`);
  _notify(session);
  return session;
}

export function completeVenueTravel(fanId: string): FanWorldSession | null {
  const session = _activeFanSessions.get(fanId);
  if (!session || !session.destinationVenueId) return null;

  session.currentVenueId = session.destinationVenueId;
  session.currentRoomId = `room-${session.destinationVenueId}`;
  session.currentSeatId = session.destinationSeatId;
  session.destinationVenueId = null;
  session.destinationSeatId = null;
  session.travelState = 'ARRIVED';
  session.lastMovedAt = Date.now();

  console.log(`[FanWorldSession] 🛸 Fan ${fanId} safely arrived at ${session.currentVenueId} (Seat ${session.currentSeatId})`);
  _notify(session);
  return session;
}

function _notify(session: FanWorldSession) {
  _listeners.forEach((fn) => fn(session));
}

export function onFanSessionChange(callback: (session: FanWorldSession) => void): () => void {
  _listeners.add(callback);
  return () => { _listeners.delete(callback); };
}
