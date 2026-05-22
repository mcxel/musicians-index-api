/**
 * RandomFlowEngine
 * Smart room selection: prioritizes active, high-energy rooms.
 * Avoids rooms the user already left quickly. Escalates quality each click.
 */

import type { LobbyRoom } from '@/components/live/LiveLobbyWallGrid';

const STORAGE_KEY = 'tmi_random_flow_v1';

type RoomRecord = {
  roomId: string;
  visitedAt: number;
  dwellMs: number;
};

type FlowState = {
  history: RoomRecord[];
  clickCount: number;
};

function loadState(): FlowState {
  if (typeof window === 'undefined') return { history: [], clickCount: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FlowState;
  } catch { /* ignore */ }
  return { history: [], clickCount: 0 };
}

function saveState(s: FlowState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function recordRoomLeave(roomId: string, dwellMs: number) {
  const state = loadState();
  const existing = state.history.findIndex((r) => r.roomId === roomId);
  const record: RoomRecord = { roomId, visitedAt: Date.now(), dwellMs };
  if (existing >= 0) state.history[existing] = record;
  else state.history.push(record);
  if (state.history.length > 50) state.history.splice(0, state.history.length - 50);
  saveState(state);
}

function scoreRoom(room: LobbyRoom, history: RoomRecord[], clickCount: number): number {
  let score = room.viewerCount;

  // Boost by type preference — escalate quality each click
  if (room.status === 'live') score += 5000;
  if (room.prizePool) score += parseInt(room.prizePool.replace(/[^0-9]/g, '') || '0', 10) * 0.5;

  // Penalize rooms the user already bounced from quickly
  const rec = history.find((r) => r.roomId === room.id);
  if (rec) {
    if (rec.dwellMs < 8000) score -= 20000; // bounced in under 8s
    else if (rec.dwellMs < 30000) score -= 5000; // left within 30s
    else score += 2000; // they liked this room
  }

  // Escalate: later clicks get higher-energy rooms
  if (clickCount > 3 && room.viewerCount < 500) score -= 3000;
  if (clickCount > 6 && room.viewerCount < 2000) score -= 3000;

  return score + Math.random() * 200; // small jitter
}

export function pickRandomRoom(rooms: LobbyRoom[]): LobbyRoom | null {
  const live = rooms.filter((r) => r.status === 'live' || r.status === 'starting');
  if (live.length === 0) return null;

  const state = loadState();
  const scored = live
    .map((r) => ({ room: r, score: scoreRoom(r, state.history, state.clickCount) }))
    .sort((a, b) => b.score - a.score);

  // Pick from top 40% (not always #1 — keeps it feeling random)
  const topCount = Math.max(1, Math.floor(scored.length * 0.4));
  const pick = scored[Math.floor(Math.random() * topCount)];

  saveState({ ...state, clickCount: state.clickCount + 1 });
  return pick?.room ?? null;
}

export function resetFlowHistory() {
  saveState({ history: [], clickCount: 0 });
}
