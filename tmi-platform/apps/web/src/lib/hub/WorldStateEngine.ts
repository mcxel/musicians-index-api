/**
 * WorldStateEngine
 * Single source of truth for the entire TMI world at runtime.
 * Aggregates live performers, active shows, crowd counts, stage states, and rankings.
 * All hubs read from here. No hub holds its own copy of world state.
 */

import type { StageState } from "@/components/stage/StageCurtain";
import type { ShowPhase } from "@/lib/shows/ShowRuntimeEngine";

export type WorldEventType =
  | "performer_went_live"
  | "show_phase_changed"
  | "stage_state_changed"
  | "crowd_surge"
  | "battle_started"
  | "winner_declared"
  | "encore_triggered"
  | "hub_activated"
  | "hub_deactivated"
  | "ranking_updated"
  | "ticket_milestone"
  | "world_reset";

export interface LivePerformerEntry {
  performerId: string;
  displayName: string;
  roomId: string;
  genre: string;
  stageState: StageState;
  crowdCount: number;
  heat: number;
  ticketsSold: number;
  startedAt: number;
}

export interface ActiveShowEntry {
  showId: string;
  showType: string;
  roomId: string;
  phase: ShowPhase;
  contestantCount: number;
  crowdVoteOpen: boolean;
  startedAt: number;
}

export interface WorldRanking {
  entityId: string;
  entityType: "artist" | "venue" | "show" | "battle";
  displayName: string;
  score: number;
  rank: number;
  trend: "up" | "down" | "stable";
}

export interface WorldSnapshot {
  snapshotAt: number;
  activeLivePerformers: LivePerformerEntry[];
  activeShows: ActiveShowEntry[];
  totalOnline: number;
  totalLiveRooms: number;
  topRankings: WorldRanking[];
  globalHeat: number;
  activeBattleCount: number;
  activeCypherCount: number;
}

export interface WorldEvent {
  id: string;
  type: WorldEventType;
  roomId?: string;
  entityId?: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

type WorldListener = (snapshot: WorldSnapshot) => void;
type EventListener = (event: WorldEvent) => void;

let eventSeq = 0;
function nextEventId(): string {
  return `world-${Date.now()}-${(eventSeq++).toString(36)}`;
}

class WorldStateEngine {
  private performers = new Map<string, LivePerformerEntry>();
  private shows = new Map<string, ActiveShowEntry>();
  private rankings: WorldRanking[] = [];
  private totalOnline = 0;
  private listeners = new Set<WorldListener>();
  private eventListeners = new Set<EventListener>();
  private eventLog: WorldEvent[] = [];

  registerPerformer(entry: LivePerformerEntry): void {
    this.performers.set(entry.performerId, entry);
    this.emit({ type: "performer_went_live", entityId: entry.performerId, roomId: entry.roomId, payload: { displayName: entry.displayName } });
    this.notifyListeners();
  }

  updatePerformer(performerId: string, patch: Partial<LivePerformerEntry>): void {
    const existing = this.performers.get(performerId);
    if (!existing) return;
    const updated = { ...existing, ...patch };
    this.performers.set(performerId, updated);
    if (patch.stageState) {
      this.emit({ type: "stage_state_changed", entityId: performerId, roomId: updated.roomId, payload: { stageState: patch.stageState } });
    }
    this.notifyListeners();
  }

  removePerformer(performerId: string): void {
    this.performers.delete(performerId);
    this.notifyListeners();
  }

  registerShow(entry: ActiveShowEntry): void {
    this.shows.set(entry.showId, entry);
    this.notifyListeners();
  }

  updateShow(showId: string, patch: Partial<ActiveShowEntry>): void {
    const existing = this.shows.get(showId);
    if (!existing) return;
    const updated = { ...existing, ...patch };
    this.shows.set(showId, updated);
    if (patch.phase) {
      this.emit({ type: "show_phase_changed", entityId: showId, roomId: updated.roomId, payload: { phase: patch.phase } });
    }
    this.notifyListeners();
  }

  setTotalOnline(count: number): void {
    this.totalOnline = count;
    this.notifyListeners();
  }

  setRankings(rankings: WorldRanking[]): void {
    this.rankings = rankings;
    this.emit({ type: "ranking_updated", payload: { count: rankings.length } });
    this.notifyListeners();
  }

  emit(event: Omit<WorldEvent, "id" | "timestamp">): WorldEvent {
    const full: WorldEvent = { ...event, id: nextEventId(), timestamp: Date.now() };
    this.eventLog.unshift(full);
    if (this.eventLog.length > 500) this.eventLog.pop();
    this.eventListeners.forEach(l => l(full));
    return full;
  }

  getSnapshot(): WorldSnapshot {
    const performers = [...this.performers.values()];
    return {
      snapshotAt: Date.now(),
      activeLivePerformers: performers,
      activeShows: [...this.shows.values()],
      totalOnline: this.totalOnline,
      totalLiveRooms: new Set(performers.map(p => p.roomId)).size,
      topRankings: this.rankings.slice(0, 10),
      globalHeat: performers.reduce((s, p) => s + p.heat, 0) / Math.max(1, performers.length),
      activeBattleCount: 0,
      activeCypherCount: 0,
    };
  }

  subscribe(listener: WorldListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  getRecentEvents(limit = 50): WorldEvent[] {
    return this.eventLog.slice(0, limit);
  }

  private notifyListeners(): void {
    const snap = this.getSnapshot();
    this.listeners.forEach(l => l(snap));
  }
}

export const worldStateEngine = new WorldStateEngine();
