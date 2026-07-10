export type MediaSourceKind = "boardroom" | "camera" | "performer" | "venue" | "cypher" | "battle" | "security" | "sponsor" | "analytics" | "media";

export type MediaSourceDefinition = {
  id: string;
  label: string;
  kind: MediaSourceKind;
  status: "LIVE" | "STANDBY" | "RECORDED";
  accent: string;
  detail: string;
};

export const MEDIA_SOURCE_REGISTRY: MediaSourceDefinition[] = [
  { id: "boardroom", label: "Boardroom", kind: "boardroom", status: "LIVE", accent: "#FFD700", detail: "Board meeting camera and participant feed." },
  { id: "admin-camera", label: "Admin Camera", kind: "camera", status: "LIVE", accent: "#00FFFF", detail: "Executive camera input and mic monitoring." },
  { id: "bigace-camera", label: "Big Ace Camera", kind: "camera", status: "LIVE", accent: "#FF2DAA", detail: "AI executive participant view." },
  { id: "live-performer", label: "Live Performer", kind: "performer", status: "LIVE", accent: "#FFD700", detail: "Stage feed, venue lights, and live room source." },
  { id: "cypher", label: "Cypher", kind: "cypher", status: "LIVE", accent: "#AA2DFF", detail: "Cypher circle and crowd response feed." },
  { id: "battle", label: "Battle", kind: "battle", status: "LIVE", accent: "#FF4444", detail: "Head-to-head showdown source." },
  { id: "venue", label: "Venue", kind: "venue", status: "LIVE", accent: "#73FFFF", detail: "Venue cam, audience, stage, and lobby feed." },
  { id: "security", label: "Security", kind: "security", status: "LIVE", accent: "#FF6B8A", detail: "Sentinel wall and incident feed." },
  { id: "sponsor-ad", label: "Sponsor Ad", kind: "sponsor", status: "RECORDED", accent: "#FFD88F", detail: "Promo reel, ad slot, and sponsor takeover." },
  { id: "uploaded-video", label: "Uploaded Video", kind: "media", status: "RECORDED", accent: "#8CF9FF", detail: "Uploaded media, replay, or screen share." },
  { id: "revenue", label: "Revenue", kind: "analytics", status: "LIVE", accent: "#FFD700", detail: "Stripe, sales, subscriptions, and trend data." },
];

export const DEFAULT_MATRIX_ASSIGNMENTS = ["boardroom", "bigace-camera", "venue", "security"];

export function getMediaSource(sourceId: string | undefined) {
  return MEDIA_SOURCE_REGISTRY.find((source) => source.id === sourceId) ?? MEDIA_SOURCE_REGISTRY[0];
}
