export type LobbyThemeDefinition = {
  key: string;
  label: string;
  roomType: string;
  visualDirection: string;
  layerProfile: string[];
  permissions: Array<"fan" | "artist" | "performer" | "venue">;
};

export const lobbyThemes: LobbyThemeDefinition[] = [
  {
    key: "vip_lounge",
    label: "VIP Lounge Skin",
    roomType: "vip_club",
    visualDirection: "Luxury social lounge with premium seating and concierge flow.",
    layerProfile: ["hero-theater-surface", "vip-seating", "bottle-service", "premium-queue"],
    permissions: ["fan", "artist", "performer", "venue"],
  },
  {
    key: "stage_theater",
    label: "Stage Theater Skin",
    roomType: "performance_theater",
    visualDirection: "Performance-first theater with queue control and clear host stage dominance.",
    layerProfile: ["hero-theater-surface", "performance-floor", "backstage-wings", "performer-queue"],
    permissions: ["fan", "artist", "performer", "venue"],
  },
  {
    key: "arena_tower",
    label: "Arena Tower Skin",
    roomType: "premium_arena",
    visualDirection: "Vertical arena bowl with upper deck discovery and premium portal routing.",
    layerProfile: ["arena-core", "lower-bowl", "upper-bowl", "vertical-portal"],
    permissions: ["fan", "artist", "performer", "venue"],
  },
  {
    key: "discovery_lobby",
    label: "Discovery Lobby Skin",
    roomType: "discovery_hub",
    visualDirection: "Multi-room discovery feed with category lanes and billboard preview docking.",
    layerProfile: ["discovery-hub", "room-lanes", "billboard-preview", "access-queue"],
    permissions: ["fan", "artist", "performer", "venue"],
  },
];
