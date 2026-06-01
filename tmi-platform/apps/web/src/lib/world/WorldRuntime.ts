"use client";

/**
 * WorldRuntime — singleton live-state for the entire TMI world.
 *
 * Tracks all active venues, viewer counts, current event, and
 * whether each arena is live. Consumed by WorldLobby (Home 1),
 * per-venue lobby walls, and the billboard wall (/live/rooms).
 *
 * Every event type routes through this registry:
 *   World Concert      → Arena  (18,500) — stadium
 *   Battle Arena       → Arena  (18,500) — ring-side
 *   Cypher Arena       → Theater (2,730) — intimate
 *   Monday Night Stage → Theater (2,730) — weekly flagship
 *   Dirty Dozens       → Arena  (18,500) — game-show skin
 *   Dance Off          → Arena  (18,500) — dance stage
 *   World Releases     → Theater (2,730) — listening room
 *   Fan Lives          → Club     (420)  — small rooms
 *   Challenges         → Outdoor (8,200) — festival
 *   Special Events     → varies
 *
 * ONLY EXCEPTION:
 *   World Dance Party  → DanceArena3D (no seating — standing/dance floor)
 */

export type VenueSkin =
  | "stadium"       // World Concert, Battle Arena
  | "theater"       // Cypher, Monday Night Stage, World Releases
  | "gameshow"      // Dirty Dozens, Monthly Idol
  | "festival"      // Challenges, Outdoor
  | "club"          // Fan Lives, VIP
  | "dance"         // World Dance Party — NO SEATS
  | "boardroom";    // Private sessions

export type EventType =
  | "concert"
  | "battle"
  | "cypher"
  | "monday-stage"
  | "dirty-dozens"
  | "dance-off"
  | "world-releases"
  | "fan-live"
  | "challenge"
  | "special"
  | "world-dance-party";  // EXCEPTION — DanceArena3D

export interface WorldVenue {
  id: string;
  label: string;
  eventType: EventType;
  skin: VenueSkin;
  route: string;           // e.g. /rooms/world-concert
  lobbyRoute: string;      // e.g. /live/rooms?venue=concert
  emoji: string;
  color: string;
  accentColor: string;
  venueIndex: 0 | 1 | 2 | 3 | 4;  // AudienceScene venue type
  capacity: number;
  isLive: boolean;
  viewers: number;
  currentArtist?: string;
  currentEvent?: string;
  usesDanceFloor: boolean;  // true ONLY for world-dance-party
}

// ── Canonical venue registry ─────────────────────────────────────────────────
const WORLD_VENUES: WorldVenue[] = [
  {
    id: "world-concert",
    label: "World Concert",
    eventType: "concert",
    skin: "stadium",
    route: "/rooms/world-concert",
    lobbyRoute: "/live/rooms?venue=concert",
    emoji: "🌐",
    color: "#FFD700",
    accentColor: "#FFD700",
    venueIndex: 1,
    capacity: 18500,
    isLive: true,
    viewers: 3400,
    currentArtist: "Nova Cipher",
    currentEvent: "World Concert Live",
    usesDanceFloor: false,
  },
  {
    id: "battle-arena",
    label: "Battle Arena",
    eventType: "battle",
    skin: "stadium",
    route: "/rooms/battle-arena",
    lobbyRoute: "/live/rooms?venue=battle",
    emoji: "⚔️",
    color: "#FF2DAA",
    accentColor: "#FF2DAA",
    venueIndex: 1,
    capacity: 18500,
    isLive: true,
    viewers: 2100,
    currentArtist: "Wavetek vs Bar God",
    currentEvent: "Championship Battle",
    usesDanceFloor: false,
  },
  {
    id: "cypher-arena",
    label: "Cypher Arena",
    eventType: "cypher",
    skin: "theater",
    route: "/rooms/cypher",
    lobbyRoute: "/live/rooms?venue=cypher",
    emoji: "🎤",
    color: "#00FFFF",
    accentColor: "#00FFFF",
    venueIndex: 0,
    capacity: 2730,
    isLive: true,
    viewers: 841,
    currentArtist: "Open Floor",
    currentEvent: "Monday Cypher",
    usesDanceFloor: false,
  },
  {
    id: "monday-stage",
    label: "Monday Night Stage",
    eventType: "monday-stage",
    skin: "theater",
    route: "/rooms/monday-stage",
    lobbyRoute: "/live/rooms?venue=monday-stage",
    emoji: "🎶",
    color: "#00FF88",
    accentColor: "#00FF88",
    venueIndex: 0,
    capacity: 2730,
    isLive: false,
    viewers: 0,
    currentEvent: "Starts 8PM EST",
    usesDanceFloor: false,
  },
  {
    id: "dirty-dozens",
    label: "Dirty Dozens",
    eventType: "dirty-dozens",
    skin: "gameshow",
    route: "/rooms/dirty-dozens",
    lobbyRoute: "/live/rooms?venue=gameshow",
    emoji: "🎮",
    color: "#AA2DFF",
    accentColor: "#AA2DFF",
    venueIndex: 1,
    capacity: 18500,
    isLive: true,
    viewers: 920,
    currentEvent: "Round 3 in Progress",
    usesDanceFloor: false,
  },
  {
    id: "monthly-idol",
    label: "Monthly Idol",
    eventType: "special",
    skin: "gameshow",
    route: "/rooms/monthly-idol",
    lobbyRoute: "/live/rooms?venue=gameshow",
    emoji: "👑",
    color: "#FF9500",
    accentColor: "#FF9500",
    venueIndex: 0,
    capacity: 2730,
    isLive: true,
    viewers: 1840,
    currentEvent: "Finals Night",
    usesDanceFloor: false,
  },
  {
    id: "world-releases",
    label: "World Releases",
    eventType: "world-releases",
    skin: "theater",
    route: "/rooms/new-release",
    lobbyRoute: "/live/rooms?venue=releases",
    emoji: "🎵",
    color: "#00FF88",
    accentColor: "#00FF88",
    venueIndex: 0,
    capacity: 2730,
    isLive: true,
    viewers: 312,
    currentEvent: "Krypt — New Album Drop",
    usesDanceFloor: false,
  },
  {
    id: "fan-lives",
    label: "Fan Lives",
    eventType: "fan-live",
    skin: "club",
    route: "/live/rooms?venue=fan",
    lobbyRoute: "/live/rooms?venue=fan",
    emoji: "📡",
    color: "#FF6B35",
    accentColor: "#FF6B35",
    venueIndex: 2,
    capacity: 420,
    isLive: true,
    viewers: 188,
    currentEvent: "Multiple Fan Streams",
    usesDanceFloor: false,
  },
  {
    id: "world-dance-party",
    label: "World Dance Party",
    eventType: "world-dance-party",
    skin: "dance",
    route: "/rooms/world-dance-party",
    lobbyRoute: "/live/rooms?venue=dance",
    emoji: "💃",
    color: "#FF2DAA",
    accentColor: "#FF2DAA",
    venueIndex: 2,  // not used — DanceArena3D handles this
    capacity: 5000,
    isLive: true,
    viewers: 888,
    currentEvent: "Friday Night Dance",
    usesDanceFloor: true,  // ← THE ONE EXCEPTION
  },
  {
    id: "challenges",
    label: "Challenges",
    eventType: "challenge",
    skin: "festival",
    route: "/challenge",
    lobbyRoute: "/live/rooms?venue=challenge",
    emoji: "🏆",
    color: "#FFD700",
    accentColor: "#FFD700",
    venueIndex: 3,
    capacity: 8200,
    isLive: true,
    viewers: 440,
    currentEvent: "Beat the Beat — Active",
    usesDanceFloor: false,
  },
];

// ── Singleton state (in-memory, updated by interval) ────────────────────────
let _venues = WORLD_VENUES.map(v => ({ ...v }));
let _lastTick = Date.now();

export function getWorldVenues(): WorldVenue[] {
  return _venues;
}

export function getVenueById(id: string): WorldVenue | undefined {
  return _venues.find(v => v.id === id);
}

export function getVenuesByEventType(type: EventType): WorldVenue[] {
  return _venues.filter(v => v.eventType === type);
}

export function getLiveVenues(): WorldVenue[] {
  return _venues.filter(v => v.isLive);
}

export function getTotalViewers(): number {
  return _venues.reduce((sum, v) => sum + v.viewers, 0);
}

// Tick viewer counts (call from a setInterval in the client)
export function tickWorldRuntime(): void {
  _venues = _venues.map(v => ({
    ...v,
    viewers: v.isLive
      ? Math.max(5, v.viewers + Math.floor((Math.random() - 0.35) * 40))
      : 0,
  }));
  _lastTick = Date.now();
}

// Returns slug→venue mapping for LobbyTheaterShell/ArenaEventShell routing
export function slugToVenueConfig(slug: string): Pick<WorldVenue, "venueIndex" | "skin" | "usesDanceFloor" | "eventType" | "color"> {
  const byId = _venues.find(v => v.id === slug || v.route.includes(slug));
  if (byId) return byId;
  // Fallback heuristics
  if (slug.includes("dance-party") || slug.includes("dance_party")) return { venueIndex: 2, skin: "dance", usesDanceFloor: true,  eventType: "world-dance-party", color: "#FF2DAA" };
  if (slug.includes("battle") || slug.includes("arena"))            return { venueIndex: 1, skin: "stadium",  usesDanceFloor: false, eventType: "battle",    color: "#FF2DAA" };
  if (slug.includes("cypher") || slug.includes("monday"))           return { venueIndex: 0, skin: "theater",  usesDanceFloor: false, eventType: "cypher",    color: "#00FFFF" };
  if (slug.includes("concert") || slug.includes("premiere"))        return { venueIndex: 1, skin: "stadium",  usesDanceFloor: false, eventType: "concert",   color: "#FFD700" };
  if (slug.includes("idol") || slug.includes("dirty") || slug.includes("dozens")) return { venueIndex: 1, skin: "gameshow", usesDanceFloor: false, eventType: "dirty-dozens", color: "#AA2DFF" };
  if (slug.includes("challenge"))                                    return { venueIndex: 3, skin: "festival", usesDanceFloor: false, eventType: "challenge", color: "#FFD700" };
  if (slug.includes("fan"))                                          return { venueIndex: 2, skin: "club",     usesDanceFloor: false, eventType: "fan-live",  color: "#FF6B35" };
  // Default — theater
  return { venueIndex: 0, skin: "theater", usesDanceFloor: false, eventType: "concert", color: "#00FFFF" };
}

export { WORLD_VENUES };
