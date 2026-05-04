// Single-source authority for live lobby room state.
// All LobbyBillboardSurface instances subscribe here.
// No component should hold its own copy — read from getSnapshot, mutate via emit.

export type LobbyBillboardStatus = "LIVE" | "PRE-SHOW" | "QUEUE OPEN" | "STANDBY";

// B2: One viewport slot in the monitor rotation.
export interface LobbyMonitorSlot {
  id: string;
  label: string;
  source: "room" | "stage" | "battle" | "cypher" | "performer" | "sponsor";
  title: string;
  subtitle: string;
  route: string;
  heat: number;
  status: "LIVE" | "STANDBY" | "NEXT";
}

export interface LobbyFeedState {
  slug: string;
  title: string;
  performer: string;
  nextPerformer: string;   // B2: next in queue — used by venue mirror
  occupancy: number;
  occupancyPct: number;
  currentEvent: string;
  status: LobbyBillboardStatus;
  ranking: number;
  roomType: string;
  heat: number;
  battleHeat: number;      // B2: battle intensity — used by stage monitor heat bar
  updatedAt: number;
}

const DEFAULT_STATE: LobbyFeedState = {
  slug: "",
  title: "—",
  performer: "—",
  nextPerformer: "—",
  occupancy: 0,
  occupancyPct: 0,
  currentEvent: "—",
  status: "STANDBY",
  ranking: 0,
  roomType: "lobby",
  heat: 0,
  battleHeat: 0,
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

// B2: Derive 4 live monitor slots from current bus state.
// Pure function — computed from feed, no extra stored state.
export function deriveMonitorSlots(s: LobbyFeedState): LobbyMonitorSlot[] {
  const isLive = s.status === "LIVE";
  const isPreShow = s.status === "PRE-SHOW";
  return [
    {
      id: "m-room",
      label: "Live Room",
      source: "room",
      title: s.title !== "—" ? s.title : "Lobby",
      subtitle: `${s.occupancy} seated · ${s.occupancyPct}%`,
      route: s.slug ? `/lobbies/${s.slug}` : "/lobbies",
      heat: s.heat,
      status: isLive ? "LIVE" : isPreShow ? "NEXT" : "STANDBY",
    },
    {
      id: "m-stage",
      label: "Live Stage",
      source: "stage",
      title: s.performer !== "—" ? s.performer : "Stage",
      subtitle: s.currentEvent !== "—" ? s.currentEvent : "Stage standby",
      route: "/live/stages",
      heat: Math.round(s.heat * 0.9),
      status: isLive ? "LIVE" : "STANDBY",
    },
    {
      id: "m-battle",
      label: "Battle",
      source: "battle",
      title: "Arena Clash",
      subtitle: `Heat ${Math.round(s.battleHeat || s.heat * 0.7)}`,
      route: "/cypher",
      heat: Math.round(s.battleHeat || s.heat * 0.7),
      status: (s.battleHeat || 0) > 5 ? "LIVE" : "STANDBY",
    },
    {
      id: "m-cypher",
      label: "Cypher",
      source: "cypher",
      title: "Cypher Feed",
      subtitle: s.roomType === "cypher" ? `${s.performer} — active` : "Monitoring",
      route: "/cypher",
      heat: Math.round(s.heat * 0.6),
      status: s.roomType === "cypher" && isLive ? "LIVE" : "STANDBY",
    },
  ];
}
