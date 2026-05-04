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

// B3: One rotating venue ad slot.
export interface VenueAdSlot {
  id: string;
  type: "sponsor" | "promo" | "event" | "contest";
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaRoute: string;
  accent: string;
}

// B3: Venue ranking summary.
export interface VenueRankings {
  room: number;
  performer: number;
  venue: number;
  contest: number;
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
  // B3: Venue surface sync fields
  activeSponsor: { name: string; campaign: string; ctaRoute: string };
  venuePromo: { title: string; ctaRoute: string };
  upcomingEvent: { title: string; countdownSeconds: number; ticketsAvailable: boolean; lineup: string[] };
  rankings: VenueRankings;
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
  activeSponsor: { name: "—", campaign: "—", ctaRoute: "/sponsor" },
  venuePromo: { title: "—", ctaRoute: "/venue" },
  upcomingEvent: { title: "—", countdownSeconds: 0, ticketsAvailable: false, lineup: [] },
  rankings: { room: 0, performer: 0, venue: 0, contest: 0 },
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

// B3: Derive 4 rotating venue ad slots from bus state.
// Pure function — sponsor, venue promo, event, contest all from feed.
export function deriveVenueAdSlots(s: LobbyFeedState): VenueAdSlot[] {
  return [
    {
      id: "ad-sponsor",
      type: "sponsor",
      title: s.activeSponsor.name !== "—" ? s.activeSponsor.name : "Sponsor Campaign",
      subtitle: s.activeSponsor.campaign !== "—" ? s.activeSponsor.campaign : "Active partnership",
      ctaLabel: "View Campaign",
      ctaRoute: s.activeSponsor.ctaRoute,
      accent: "#FFD700",
    },
    {
      id: "ad-promo",
      type: "promo",
      title: s.venuePromo.title !== "—" ? s.venuePromo.title : s.title !== "—" ? s.title : "Venue Promo",
      subtitle: `${s.occupancy} attending · ${s.occupancyPct}%`,
      ctaLabel: "Enter Venue",
      ctaRoute: s.venuePromo.ctaRoute,
      accent: "#c4b5fd",
    },
    {
      id: "ad-event",
      type: "event",
      title: s.upcomingEvent.title !== "—" ? s.upcomingEvent.title : s.currentEvent !== "—" ? s.currentEvent : "Upcoming Event",
      subtitle: s.upcomingEvent.lineup.length > 0
        ? s.upcomingEvent.lineup.slice(0, 2).join(" · ")
        : s.performer !== "—" ? s.performer : "Lineup TBA",
      ctaLabel: s.upcomingEvent.ticketsAvailable ? "Get Tickets" : "View Event",
      ctaRoute: s.slug ? `/lobbies/${s.slug}` : "/live/stages",
      accent: "#fb923c",
    },
    {
      id: "ad-contest",
      type: "contest",
      title: "Arena Clash",
      subtitle: `Heat ${Math.round(s.battleHeat || s.heat * 0.7)} · Rank #${s.rankings.contest || s.ranking || "—"}`,
      ctaLabel: "Join Battle",
      ctaRoute: "/cypher",
      accent: "#f87171",
    },
  ];
}

// B3: Extract venue ranking summary from bus state.
export function deriveVenueRankings(s: LobbyFeedState): VenueRankings {
  return {
    room: s.rankings.room || s.ranking,
    performer: s.rankings.performer || s.ranking,
    venue: s.rankings.venue,
    contest: s.rankings.contest,
  };
}
