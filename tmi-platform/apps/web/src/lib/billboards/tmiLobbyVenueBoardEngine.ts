export type LobbyVenueType = "inside" | "outside" | "open-field" | "amphitheater" | "arena";
export type LobbySeatLayout = "flat" | "curved" | "hybrid";

export type LobbyVenueBoardEntry = {
  id: string;
  venueName: string;
  venueType: LobbyVenueType;
  seatLayout: LobbySeatLayout;
  screenCount: number;
  adProjectionEnabled: boolean;
  sponsorProjectionEnabled: boolean;
  performerFeedEnabled: boolean;
  route: string;
  backRoute: string;
  status: "ACTIVE" | "LOCKED" | "NEEDS_SETUP";
  reason?: string;
};

const VENUE_BOARD: LobbyVenueBoardEntry[] = [
  {
    id: "v1",
    venueName: "Neon Dome",
    venueType: "inside",
    seatLayout: "curved",
    screenCount: 6,
    adProjectionEnabled: true,
    sponsorProjectionEnabled: true,
    performerFeedEnabled: true,
    route: "/venues",
    backRoute: "/billboards",
    status: "ACTIVE",
  },
  {
    id: "v2",
    venueName: "Skyline Open Grounds",
    venueType: "open-field",
    seatLayout: "flat",
    screenCount: 2,
    adProjectionEnabled: true,
    sponsorProjectionEnabled: false,
    performerFeedEnabled: true,
    route: "/venues",
    backRoute: "/billboards",
    status: "NEEDS_SETUP",
    reason: "Open-field routing presets pending",
  },
  {
    id: "v3",
    venueName: "Aurora Arena",
    venueType: "arena",
    seatLayout: "hybrid",
    screenCount: 8,
    adProjectionEnabled: true,
    sponsorProjectionEnabled: true,
    performerFeedEnabled: true,
    route: "/venues",
    backRoute: "/billboards",
    status: "ACTIVE",
  },
  {
    id: "v4",
    venueName: "Pulse Amphitheater",
    venueType: "amphitheater",
    seatLayout: "curved",
    screenCount: 4,
    adProjectionEnabled: false,
    sponsorProjectionEnabled: true,
    performerFeedEnabled: true,
    route: "/venues",
    backRoute: "/billboards",
    status: "ACTIVE",
  },
  {
    id: "v5",
    venueName: "Harbor Deck",
    venueType: "outside",
    seatLayout: "flat",
    screenCount: 3,
    adProjectionEnabled: true,
    sponsorProjectionEnabled: false,
    performerFeedEnabled: false,
    route: "/venues",
    backRoute: "/billboards",
    status: "LOCKED",
    reason: "Performer feed uplink unavailable",
  },
];

export function listLobbyVenueBoard(): LobbyVenueBoardEntry[] {
  return VENUE_BOARD;
}
