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
  | "concert";

export type MediaSourceDefinition = {
  id: string;
  label: string;
  kind: MediaSourceKind;
  status: "LIVE" | "STANDBY" | "RECORDED";
  accent: string;
  detail: string;
  /** Match GlobalLiveSessionRegistry category when set */
  categoryFilter?: string;
};

/** Live/video sources allowed on TOP monitor wall — never analytics dashboards. */
export type LiveMonitorSourceDefinition = MediaSourceDefinition & {
  kind: Exclude<MediaSourceKind, "analytics">;
};

export const LIVE_MONITOR_SOURCE_REGISTRY: LiveMonitorSourceDefinition[] = [
  {
    id: "live-now",
    label: "Live Now",
    kind: "performer",
    status: "LIVE",
    accent: "#00FF88",
    detail: "Primary live session from GlobalLiveSessionRegistry.",
    categoryFilter: "live",
  },
  {
    id: "live-performer",
    label: "Performers",
    kind: "performer",
    status: "LIVE",
    accent: "#FFD700",
    detail: "Stage feed, venue lights, and live room source.",
    categoryFilter: "concert",
  },
  {
    id: "cypher",
    label: "Cyphers",
    kind: "cypher",
    status: "LIVE",
    accent: "#AA2DFF",
    detail: "Cypher circle and crowd response feed.",
    categoryFilter: "cypher",
  },
  {
    id: "battle",
    label: "Battles",
    kind: "battle",
    status: "LIVE",
    accent: "#FF4444",
    detail: "Head-to-head showdown source.",
    categoryFilter: "battle",
  },
  {
    id: "challenge",
    label: "Challenges",
    kind: "challenge",
    status: "LIVE",
    accent: "#FF2DAA",
    detail: "Challenge arena live feed.",
    categoryFilter: "challenge",
  },
  {
    id: "venue",
    label: "Venues",
    kind: "venue",
    status: "LIVE",
    accent: "#73FFFF",
    detail: "Venue cam, audience, stage, and lobby feed.",
    categoryFilter: "session",
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
    detail: "Uploaded media, replay, or screen share.",
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
    id: "live-now",
    label: "Live Now",
    accent: "#00FF88",
    sources: LIVE_MONITOR_SOURCE_REGISTRY.filter((s) =>
      ["live-now", "live-performer"].includes(s.id),
    ),
  },
  {
    id: "competition",
    label: "Battles & Cyphers",
    accent: "#FF4444",
    sources: LIVE_MONITOR_SOURCE_REGISTRY.filter((s) =>
      ["battle", "cypher", "challenge"].includes(s.id),
    ),
  },
  {
    id: "venues",
    label: "Venues & Rooms",
    accent: "#73FFFF",
    sources: LIVE_MONITOR_SOURCE_REGISTRY.filter((s) => ["venue"].includes(s.id)),
  },
  {
    id: "media-inputs",
    label: "Camera & Media",
    accent: "#00FFFF",
    sources: LIVE_MONITOR_SOURCE_REGISTRY.filter((s) =>
      ["admin-camera", "uploaded-video"].includes(s.id),
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
  {
    id: "revenue",
    label: "Revenue",
    kind: "analytics",
    status: "LIVE",
    accent: "#FFD700",
    detail: "Intelligence Deck only — not a monitor source.",
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
