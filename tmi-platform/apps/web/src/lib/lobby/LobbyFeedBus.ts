// Single-source authority for live lobby room state.
// All LobbyBillboardSurface instances subscribe here.
// No component should hold its own copy — read from getSnapshot, mutate via emit.

export type LobbyBillboardStatus = "LIVE" | "PRE-SHOW" | "QUEUE OPEN" | "STANDBY";

export interface LobbyFeedState {
  slug: string;
  title: string;
  performer: string;
  occupancy: number;
  occupancyPct: number;
  currentEvent: string;
  status: LobbyBillboardStatus;
  ranking: number;
  roomType: string;
  heat: number;
  updatedAt: number;
}

const DEFAULT_STATE: LobbyFeedState = {
  slug: "",
  title: "—",
  performer: "—",
  occupancy: 0,
  occupancyPct: 0,
  currentEvent: "—",
  status: "STANDBY",
  ranking: 0,
  roomType: "lobby",
  heat: 0,
  updatedAt: 0,
};

let _state: LobbyFeedState = { ...DEFAULT_STATE };
const _subs = new Set<(s: LobbyFeedState) => void>();

export function emitLobbyFeedState(patch: Partial<LobbyFeedState>): void {
  _state = { ..._state, ...patch, updatedAt: Date.now() };
  for (const fn of _subs) fn(_state);
}

export function getLobbyFeedSnapshot(): LobbyFeedState {
  return _state;
}

export function subscribeLobbyFeed(fn: (s: LobbyFeedState) => void): () => void {
  _subs.add(fn);
  fn(_state);
  return () => _subs.delete(fn);
}

export function resetLobbyFeedBus(): void {
  _state = { ...DEFAULT_STATE };
}
