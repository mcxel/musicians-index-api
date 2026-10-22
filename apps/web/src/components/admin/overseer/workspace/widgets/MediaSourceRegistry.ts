export type MediaSourceKind =
  | "camera"
  | "performer"
  | "venue"
  | "cypher"
  | "battle"
  | "security"
  | "sponsor"
  | "analytics"
  | "media"
  | "challenge"
  | "concert"
  | "summit"
  | "lobby"
  | "lounge"
  | "dance"
  | "game";

export type MediaSourceDefinition = {
  id: string;
  label: string;
  kind: MediaSourceKind;
  status: "LIVE" | "STANDBY" | "RECORDED";
  accent: string;
  detail: string;
  /** Match GlobalLiveSessionRegistry category when set */
  categoryFilter?: string;
  /** Route link for this network family */
  route?: string;
};

/** Live/video sources allowed on TOP monitor wall — never analytics dashboards. */
export type LiveMonitorSourceDefinition = MediaSourceDefinition & {
  kind: Exclude<MediaSourceKind, "analytics">;
};

export const LIVE_MONITOR_SOURCE_REGISTRY: LiveMonitorSourceDefinition[] = [
  {
    id: "go-live",
    label: "Go Live",
    kind: "performer",
    status: "LIVE",
    accent: "#00FF88",
    detail: "Primary live performer streams from GlobalLiveSessionRegistry.",
    categoryFilter: "live",
    route: "/live",
  },
  {
    id: "monday-stage",
    label: "Monday Night Live",
    kind: "concert",
    status: "LIVE",
    accent: "#FFD700",
    detail: "Official Monday Night Stage broadcast arena.",
    categoryFilter: "monday-stage",
    route: "/rooms/monday-stage",
  },
  {
    id: "battle",
    label: "Battles",
    kind: "battle",
    status: "LIVE",
    accent: "#FF4444",
    detail: "Head-to-head showdown and tournament battles.",
    categoryFilter: "battle",
    route: "/battles",
  },
  {
    id: "challenge",
    label: "Challenges",
    kind: "challenge",
    status: "LIVE",
    accent: "#FF2DAA",
    detail: "Song challenges and creative face-offs.",
    categoryFilter: "challenge",
    route: "/challenges",
  },
  {
    id: "cypher",
    label: "Cyphers",
    kind: "cypher",
    status: "LIVE",
    accent: "#AA2DFF",
    detail: "Cypher circle and open microphone stages.",
    categoryFilter: "cypher",
    route: "/cypher/stage",
  },
  {
    id: "fan-lobby",
    label: "Fan Lobbies",
    kind: "lobby",
    status: "LIVE",
    accent: "#00FFFF",
    detail: "Fan avatar rooms and discovery lobbies.",
    categoryFilter: "fan_lobby",
    route: "/hub/fan",
  },
  {
    id: "performer-lobby",
    label: "Performer Lobbies",
    kind: "lobby",
    status: "LIVE",
    accent: "#FFD700",
    detail: "Backstage green rooms and performer presence floors.",
    categoryFilter: "performer_lobby",
    route: "/hub/performer",
  },
  {
    id: "lounge",
    label: "Lounges",
    kind: "lounge",
    status: "LIVE",
    accent: "#00FF88",
    detail: "Artist lounges and listening sessions.",
    categoryFilter: "playlist_lounge",
    route: "/lounges",
  },
  {
    id: "dance-party",
    label: "World Dance Party",
    kind: "dance",
    status: "LIVE",
    accent: "#FF2DAA",
    detail: "Global dance party arena and synchronized music rooms.",
    categoryFilter: "dance",
    route: "/dance-party/live",
  },
  {
    id: "games",
    label: "Games",
    kind: "game",
    status: "LIVE",
    accent: "#AA2DFF",
    detail: "Interactive music games, trivia, and cypher games.",
    categoryFilter: "variety",
    route: "/games",
  },
  {
    id: "venue",
    label: "Venues",
    kind: "venue",
    status: "LIVE",
    accent: "#73FFFF",
    detail: "3D venue stages, audience view, and venue cams.",
    categoryFilter: "session",
    route: "/venue/preview",
  },
  {
    id: "summit",
    label: "Summit / Boardroom",
    kind: "summit",
    status: "STANDBY",
    accent: "#FFD700",
    detail: "Executive boardroom video conference with adaptive Voltron composition.",
    categoryFilter: "summit",
    route: "/admin/summit",
  },
  {
    id: "screen-share",
    label: "Shared Screen",
    kind: "media",
    status: "STANDBY",
    accent: "#00FFFF",
    detail: "Executive screen share and presentation display.",
  },
  {
    id: "admin-camera",
    label: "Admin Camera",
    kind: "camera",
    status: "STANDBY",
    accent: "#00FFFF",
    detail: "Executive camera input when shared.",
  },
  {
    id: "uploaded-video",
    label: "Uploaded Video",
    kind: "media",
    status: "RECORDED",
    accent: "#8CF9FF",
    detail: "Uploaded media, replay, or playlist item.",
  },
];

export type LiveMonitorSourceGroup = {
  id: string;
  label: string;
  accent: string;
  sources: LiveMonitorSourceDefinition[];
};

export const LIVE_MONITOR_SOURCE_GROUPS: LiveMonitorSourceGroup[] = [
  {
    id: "live-networks",
    label: "Live Networks",
    accent: "#00FF88",
    sources: LIVE_MONITOR_SOURCE_REGISTRY.filter((s) =>
      ["go-live", "monday-stage", "battle", "challenge", "cypher"].includes(s.id),
    ),
  },
  {
    id: "lobbies-lounges",
    label: "Lobbies & Lounges",
    accent: "#00FFFF",
    sources: LIVE_MONITOR_SOURCE_REGISTRY.filter((s) =>
      ["fan-lobby", "performer-lobby", "lounge", "dance-party", "games", "venue"].includes(s.id),
    ),
  },
  {
    id: "communications",
    label: "Summit & Video",
    accent: "#FFD700",
    sources: LIVE_MONITOR_SOURCE_REGISTRY.filter((s) =>
      ["summit", "admin-camera"].includes(s.id),
    ),
  },
  {
    id: "media-inputs",
    label: "Screen & Media",
    accent: "#8CF9FF",
    sources: LIVE_MONITOR_SOURCE_REGISTRY.filter((s) =>
      ["screen-share", "uploaded-video"].includes(s.id),
    ),
  },
];

/** @deprecated Use LIVE_MONITOR_SOURCE_REGISTRY for monitor wall; kept for MediaMatrixEngine compat */
export const MEDIA_SOURCE_REGISTRY: MediaSourceDefinition[] = [
  ...LIVE_MONITOR_SOURCE_REGISTRY,
  {
    id: "bigace-camera",
    label: "Big Ace Camera",
    kind: "camera",
    status: "LIVE",
    accent: "#FF2DAA",
    detail: "AI executive participant view.",
  },
  {
    id: "security",
    label: "Security",
    kind: "security",
    status: "LIVE",
    accent: "#FF6B8A",
    detail: "Sentinel wall and incident feed.",
  },
  {
    id: "sponsor-ad",
    label: "Sponsor Ad",
    kind: "sponsor",
    status: "RECORDED",
    accent: "#FFD88F",
    detail: "Promo reel, ad slot, and sponsor takeover.",
  },
];

/** Empty defaults — monitors start with NO SOURCE ASSIGNED (Rule 20). */
export const DEFAULT_MATRIX_ASSIGNMENTS: (string | null)[] = [null, null, null, null];

export function getLiveMonitorSource(sourceId: string | undefined | null) {
  if (!sourceId) return null;
  return LIVE_MONITOR_SOURCE_REGISTRY.find((source) => source.id === sourceId) ?? null;
}

export function getMediaSource(sourceId: string | undefined) {
  return MEDIA_SOURCE_REGISTRY.find((source) => source.id === sourceId) ?? MEDIA_SOURCE_REGISTRY[0];
}

export function isMonitorEligibleSource(sourceId: string): boolean {
  return LIVE_MONITOR_SOURCE_REGISTRY.some((s) => s.id === sourceId);
}
