/**
 * LiveDiscoveryRecord — canonical schema for Live Lobby Walls / GlobalLiveDiscoveryOverlay.
 * Contract first (Rule 8). No fake rooms. humanViewerCount never includes support bots.
 */

export type LiveDiscoveryVisibility =
  | "public"
  | "friends"
  | "invite"
  | "private";

/** Rail / channel categories shown in the overlay (human labels map 1:1). */
export type LiveDiscoveryCategory =
  | "live_now"
  | "battles"
  | "cyphers"
  | "challenges"
  | "concerts"
  | "fan_lobbies"
  | "lounges"
  | "listening"
  | "dance"
  | "games"
  | "comedy"
  | "djs"
  | "videos"
  | "private_invited"
  | "new_empty"
  | "friends"
  | "worldwide";

export type LiveDiscoveryJoinGate =
  | "none"
  | "ticket"
  | "invite"
  | "age"
  | "paid";

export type LiveDiscoveryPreviewMode = "poster" | "low_res" | "none";

export interface LiveDiscoveryRecord {
  /** Stable discovery tile id (usually roomId) */
  id: string;
  roomId: string;
  title: string;
  hostName: string;
  hostUserId: string;
  /** ISO 3166-1 alpha-2 (e.g. US). ZZ = unknown. */
  countryCode: string;
  category: LiveDiscoveryCategory;
  /** Secondary tags for multi-rail placement (e.g. live_now + battles) */
  categories: LiveDiscoveryCategory[];
  visibility: LiveDiscoveryVisibility;
  /** Real humans watching — VenueSupportPresence / humanViewers pattern. Never support bots. */
  humanViewerCount: number;
  posterUrl: string | null;
  /** Optional stream preview URL — overlay uses poster until focused; never opens N WebRTC clients. */
  previewUrl: string | null;
  previewMode: LiveDiscoveryPreviewMode;
  accentColor: string;
  joinRoute: string;
  joinGate: LiveDiscoveryJoinGate;
  isLive: boolean;
  /** Room started recently with zero humans — New & Empty rail. */
  isNewEmpty: boolean;
  startedAt: number;
  updatedAt: number;
  /** Optional experience type for InstantJoin role routing */
  experienceId?: string;
  entryPriceUsd?: number | null;
  /** Family-distinct status line for Lobby Wall cards (anchors / open calls). */
  statusLine?: string;
  /** Permanent 24/7 Anchor Room Network tile — always listed even at 0 humans. */
  isAnchor?: boolean;
  /** Anchor family for distinct card copy (battle / cypher / lounge / …). */
  anchorFamily?: string;
  /** Idle-rotating featured category (locked when queue forms). */
  featuredCategory?: string;
  /** Up to 3 eligible like-vs-like types while recruiting (not collapsed to first). */
  calloutSlots?: string[];
  categoryLocked?: boolean;
  /** Honest recruiting — room stays on wall; overlay is LOOKING FOR, not fake LIVE crowd. */
  recruiting?: boolean;
  /** Mosaic / panel cast line (LIVE · … / LOOKING FOR · …). Never includes viewer counts. */
  castOverlay?: string;
}

export const LIVE_DISCOVERY_CATEGORY_LABELS: Record<LiveDiscoveryCategory, string> = {
  live_now: "LIVE NOW",
  battles: "Battles",
  cyphers: "Cyphers",
  challenges: "Challenges",
  concerts: "Concerts",
  fan_lobbies: "Fan Lobbies",
  lounges: "Lounges",
  listening: "Listening",
  dance: "Dance",
  games: "Games",
  comedy: "Comedy",
  djs: "DJs",
  videos: "Videos / Snips",
  private_invited: "Private / Invited",
  new_empty: "New & Empty",
  friends: "Friends",
  worldwide: "Worldwide",
};

/** Default rail order for the overlay (vertical scroll). */
export const LIVE_DISCOVERY_RAIL_ORDER: LiveDiscoveryCategory[] = [
  "live_now",
  "battles",
  "cyphers",
  "challenges",
  "concerts",
  "fan_lobbies",
  "lounges",
  "listening",
  "dance",
  "games",
  "comedy",
  "djs",
  "videos",
  "private_invited",
  "new_empty",
  "friends",
  "worldwide",
];

export function isoCountryToFlag(countryCode: string): string {
  const code = (countryCode ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code) || code === "ZZ") return "🏳️";
  const base = 127397;
  return String.fromCodePoint(...code.split("").map((c) => base + c.charCodeAt(0)));
}

export function mapStreamCategoryToDiscovery(
  category: string | undefined | null,
): LiveDiscoveryCategory {
  const c = (category ?? "live").toLowerCase().replace(/_/g, "-");
  if (c === "battle" || c === "battles") return "battles";
  if (c === "cypher" || c === "cyphers") return "cyphers";
  if (c === "challenge" || c === "challenges") return "challenges";
  if (
    c === "concert" ||
    c === "concerts" ||
    c === "mini-concert" ||
    c === "world-concert" ||
    c === "live-online-concert" ||
    c === "release-party" ||
    c === "mini-release" ||
    c === "world-release" ||
    c === "releases"
  )
    return "concerts";
  if (c === "fan-lobby" || c === "fan_lobbies" || c === "fan-lobbies") return "fan_lobbies";
  if (c === "lounge" || c === "lounges" || c === "vip-lounge" || c === "rehearsal") return "lounges";
  if (c === "performer-lobby" || c === "performer_lobby" || c === "performer-lobbies") return "lounges";
  if (c === "listening" || c === "radio" || c === "stream-and-win") return "listening";
  if (c === "dance" || c === "dance-party" || c === "world-dance-party") return "dance";
  if (c === "game" || c === "games" || c === "game-show" || c === "session") return "games";
  if (c === "comedy") return "comedy";
  if (c === "dj" || c === "djs") return "djs";
  if (c === "video" || c === "videos" || c === "snip" || c === "snips") return "videos";
  return "live_now";
}
