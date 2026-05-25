// Shared broadcast feed types — used by BroadcastRotationEngine, Home3, Home5, Home1

export type BroadcastFeedKind =
  | "audience-seat"
  | "live-camera"
  | "challenge"
  | "battle"
  | "cypher"
  | "concert"
  | "world-premiere"
  | "album-release"
  | "game-show"
  | "sponsor-billboard"
  | "magazine-feature"
  | "venue-ticketing"
  | "fan-lobby-wall"
  | "performer-lobby-wall"
  | "mixed-lobby-wall";

export type PerformerCategory =
  | "rapper"
  | "singer"
  | "instrumentalist"
  | "dancer"
  | "comedian"
  | "streamer"
  | "host"
  | "dj"
  | "producer"
  | "spoken-word"
  | "variety";

export type BroadcastLayoutMode =
  | "single"
  | "split"
  | "spotlight"
  | "audience-grid"
  | "billboard";

export type BroadcastMediaMode = "webrtc" | "hls" | "preview" | "avatar";

export type BroadcastTileShape =
  | "octagon"
  | "hexagon"
  | "torn-edge"
  | "glitch-rect"
  | "circle"
  | "diamond";

export interface BroadcastFeedItem {
  id: string;
  kind: BroadcastFeedKind;
  title: string;
  subtitle: string;
  href: string;
  genre?: string;
  roomId?: string;
  performerIds?: string[];
  performerCategories?: PerformerCategory[];
  viewerCount?: number;
  seatId?: string;
  status: "live" | "scheduled" | "fallback";
  layoutMode: BroadcastLayoutMode;
  mediaMode: BroadcastMediaMode;
  accentColor?: string;
  avatarEmoji?: string;
  streamUrl?: string;
  isHighXP?: boolean;
  prizePool?: string;
  shape?: BroadcastTileShape;
}

// Shape mapping by feed kind
export const KIND_TO_SHAPE: Record<BroadcastFeedKind, BroadcastTileShape> = {
  "audience-seat":      "circle",
  "live-camera":        "octagon",
  "challenge":          "hexagon",
  "battle":             "hexagon",
  "cypher":             "hexagon",
  "concert":            "octagon",
  "world-premiere":     "torn-edge",
  "album-release":      "torn-edge",
  "game-show":          "glitch-rect",
  "sponsor-billboard":  "glitch-rect",
  "magazine-feature":   "torn-edge",
  "venue-ticketing":    "glitch-rect",
  "fan-lobby-wall":     "circle",
  "performer-lobby-wall":"octagon",
  "mixed-lobby-wall":   "glitch-rect",
};

// Deck labels shown in the broadcast banner
export const DECK_LABELS: Record<BroadcastFeedKind, string> = {
  "audience-seat":      "LIVE AUDIENCE",
  "live-camera":        "PUBLIC LIVE CAMERAS",
  "challenge":          "SONG CHALLENGES",
  "battle":             "BATTLE ARENA",
  "cypher":             "CYPHER STAGE",
  "concert":            "WORLD CONCERTS",
  "world-premiere":     "WORLD PREMIERES",
  "album-release":      "ALBUM RELEASES",
  "game-show":          "GAME SHOWS",
  "sponsor-billboard":  "SPONSOR WALL",
  "magazine-feature":   "MAGAZINE FEATURES",
  "venue-ticketing":    "VENUE TICKETING",
  "fan-lobby-wall":     "FAN LOBBY",
  "performer-lobby-wall":"PERFORMER LOBBY",
  "mixed-lobby-wall":   "DISCOVERY BRIDGE",
};
