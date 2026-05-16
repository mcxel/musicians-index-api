/**
 * V2.4 Lobby Heat Memory
 * Tracks spatial monetization and engagement to feed the Evolution Engine.
 */

export interface SpatialHeatEvent {
  lobbyId: string;
  zoneId: string;
  nodeId: string | null; // Null if walking/idle
  eventType: 'TIP' | 'REACTION' | 'SOCIAL_CLUSTER' | 'PROLONGED_SIT';
  weight: number; // e.g., Tip amount, or reaction combo multiplier
  timestamp: number;
}

type LobbyHeatState = {
  events: SpatialHeatEvent[];
  zoneWeights: Map<string, number>;
  nodeWeights: Map<string, number>;
};

const heatMemory = new Map<string, LobbyHeatState>();

function stateFor(lobbyId: string): LobbyHeatState {
  const existing = heatMemory.get(lobbyId);
  if (existing) return existing;
  const created: LobbyHeatState = {
    events: [],
    zoneWeights: new Map<string, number>(),
    nodeWeights: new Map<string, number>(),
  };
  heatMemory.set(lobbyId, created);
  return created;
}

export function recordHeatEvent(event: SpatialHeatEvent) {
  const state = stateFor(event.lobbyId);
  state.events.push(event);

  const zoneWeight = state.zoneWeights.get(event.zoneId) ?? 0;
  state.zoneWeights.set(event.zoneId, zoneWeight + event.weight);

  if (event.nodeId) {
    const nodeWeight = state.nodeWeights.get(event.nodeId) ?? 0;
    state.nodeWeights.set(event.nodeId, nodeWeight + event.weight);
  }

  // Keep memory bounded for runtime safety.
  if (state.events.length > 5000) {
    state.events.splice(0, state.events.length - 5000);
  }
}

export function aggregateHotzones(lobbyId: string): { bestSeats: string[], highestTipAreas: string[] } {
  const state = heatMemory.get(lobbyId);
  if (!state) {
    return {
      bestSeats: [],
      highestTipAreas: [],
    };
  }

  const bestSeats = [...state.nodeWeights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([nodeId]) => nodeId);

  const highestTipAreas = [...state.zoneWeights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([zoneId]) => zoneId);

  return {
    bestSeats,
    highestTipAreas,
  };
}

export function clearLobbyHeatMemory(lobbyId: string): void {
  heatMemory.delete(lobbyId);
}