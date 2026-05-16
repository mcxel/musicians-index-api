/**
 * GlobalPresenceBus
 * Cross-hub presence broadcast layer.
 * Extends LobbyFeedBus concept to all hub surfaces.
 * Any hub can subscribe to presence updates across the entire platform.
 */

export interface HubPresenceEntry {
  hubId: string;
  hubType: "fan" | "performer" | "venue" | "admin" | "battle" | "cypher" | "magazine" | "lobby";
  displayName: string;
  occupancy: number;
  activeUsers: string[];
  heat: number;
  isLive: boolean;
  lastActivity: number;
}

export interface PresencePulse {
  totalOnline: number;
  totalHubs: number;
  hottest: HubPresenceEntry | null;
  byType: Record<HubPresenceEntry["hubType"], number>;
  timestamp: number;
}

type PresenceListener = (pulse: PresencePulse) => void;
type HubListener = (entry: HubPresenceEntry) => void;

const MAX_HUBS = 500;
const hubRegistry = new Map<string, HubPresenceEntry>();
const globalListeners = new Set<PresenceListener>();
const hubListeners = new Map<string, Set<HubListener>>();

function buildPulse(): PresencePulse {
  const hubs = [...hubRegistry.values()];
  const byType: Record<HubPresenceEntry["hubType"], number> = {
    fan: 0, performer: 0, venue: 0, admin: 0, battle: 0, cypher: 0, magazine: 0, lobby: 0,
  };
  let totalOnline = 0;
  let hottest: HubPresenceEntry | null = null;

  for (const hub of hubs) {
    byType[hub.hubType]++;
    totalOnline += hub.occupancy;
    if (!hottest || hub.heat > hottest.heat) hottest = hub;
  }

  return { totalOnline, totalHubs: hubs.length, hottest, byType, timestamp: Date.now() };
}

function broadcast(): void {
  const pulse = buildPulse();
  globalListeners.forEach(l => l(pulse));
}

export function registerHub(entry: HubPresenceEntry): void {
  if (hubRegistry.size >= MAX_HUBS) {
    const oldest = [...hubRegistry.entries()].sort((a, b) => a[1].lastActivity - b[1].lastActivity)[0];
    if (oldest) hubRegistry.delete(oldest[0]);
  }
  hubRegistry.set(entry.hubId, { ...entry, lastActivity: Date.now() });
  broadcast();
}

export function updateHubPresence(hubId: string, patch: Partial<HubPresenceEntry>): void {
  const existing = hubRegistry.get(hubId);
  if (!existing) return;
  const updated = { ...existing, ...patch, lastActivity: Date.now() };
  hubRegistry.set(hubId, updated);
  hubListeners.get(hubId)?.forEach(l => l(updated));
  broadcast();
}

export function unregisterHub(hubId: string): void {
  hubRegistry.delete(hubId);
  broadcast();
}

export function joinHub(hubId: string, userId: string): void {
  const hub = hubRegistry.get(hubId);
  if (!hub) return;
  const users = new Set(hub.activeUsers);
  users.add(userId);
  updateHubPresence(hubId, { activeUsers: [...users], occupancy: users.size });
}

export function leaveHub(hubId: string, userId: string): void {
  const hub = hubRegistry.get(hubId);
  if (!hub) return;
  const users = new Set(hub.activeUsers);
  users.delete(userId);
  updateHubPresence(hubId, { activeUsers: [...users], occupancy: users.size });
}

export function subscribeToWorldPresence(listener: PresenceListener): () => void {
  globalListeners.add(listener);
  listener(buildPulse());
  return () => globalListeners.delete(listener);
}

export function subscribeToHub(hubId: string, listener: HubListener): () => void {
  if (!hubListeners.has(hubId)) hubListeners.set(hubId, new Set());
  hubListeners.get(hubId)!.add(listener);
  const hub = hubRegistry.get(hubId);
  if (hub) listener(hub);
  return () => hubListeners.get(hubId)?.delete(listener);
}

export function getWorldPulse(): PresencePulse {
  return buildPulse();
}

export function getHub(hubId: string): HubPresenceEntry | null {
  return hubRegistry.get(hubId) ?? null;
}

export function getAllHubs(): HubPresenceEntry[] {
  return [...hubRegistry.values()].sort((a, b) => b.heat - a.heat);
}
