export type LobbyLayoutTemplate = {
  themeKey: string;
  zones: string[];
  dominantSeatTypes: string[];
  queueStyle: string;
  portalStyle: string;
};

export const lobbyLayouts: LobbyLayoutTemplate[] = [
  {
    themeKey: "vip_lounge",
    zones: ["host-stage", "vip-seating", "bar", "premium-queue"],
    dominantSeatTypes: ["SOFA_SEAT", "VIP_SEAT"],
    queueStyle: "concierge rope line",
    portalStyle: "backlit velvet portal",
  },
  {
    themeKey: "stage_theater",
    zones: ["performance-stage", "audience-floor", "backstage", "performer-queue"],
    dominantSeatTypes: ["LOW_SEAT", "VIP_SEAT", "SPECTATOR_NODE"],
    queueStyle: "staging rail",
    portalStyle: "stage curtain portal",
  },
  {
    themeKey: "arena_tower",
    zones: ["arena-core", "lower-bowl", "upper-bowl", "vertical-portal"],
    dominantSeatTypes: ["HIGH_SEAT", "VIP_SEAT"],
    queueStyle: "tower stack",
    portalStyle: "elevator portal",
  },
  {
    themeKey: "discovery_lobby",
    zones: ["discovery-hub", "room-lanes", "billboard-preview", "access-queue"],
    dominantSeatTypes: ["LOW_SEAT", "SOFA_SEAT", "QUEUE_NODE"],
    queueStyle: "multi-lane access queue",
    portalStyle: "room card portal",
  },
];
