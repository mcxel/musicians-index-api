/**
 * Fan Avatar Lobby Skin Canon — locked from asset scan 2026-07-29.
 *
 * PRODUCT LAW (Marcel):
 * - Fan Lobby = ONE walkable social room (spawn → roam → interact → WebRTC over avatar).
 * - Skins are purchasable looks for THAT room (Fan Store / Rule 19 Avatar Lobby Skins).
 * - NOT the same as Performer Venue Skins (stage/auditorium) or PlaylistArtifact skins.
 * - Fan-facing seat grids are forbidden in this surface; show seating is bot-orchestrated elsewhere.
 *
 * ASSET LAW (Rule 18):
 * - Files under `tmi-platform/Lobbies/` are Google-search / concept reference screenshots — NOT runtime geometry.
 * - `lobies walls base.png` is a discovery-wall UI mock (FAN LOBBY card), not a wall texture atlas.
 * - Do not treat JPGs as GLTF rooms. Runtime skins need real materials/models or honest 2D/3D dressing.
 *
 * COMMERCE: Store SKUs live in StoreItemEngine.LOBBY_ITEMS (`/store/lobbies`).
 * This registry is the visual/product vocabulary; wire equip ↔ ownership next — do not invent a second store.
 */

export type FanLobbySkinFamily =
  | "cinema"
  | "neon_lounge"
  | "bar_hotel"
  | "nightclub"
  | "chill_lounge"
  | "cypher_underground"
  | "futuristic"
  | "talk_show"
  | "tropical"
  | "grand_ornate"
  | "spoken_future"; // Marcel spoken — not yet in Lobbies/ folder

export type FanLobbySkinId =
  | "lobby-cinema"
  | "lobby-neon"
  | "lobby-chill"
  | "lobby-cypher"
  | "lobby-futuristic"
  /** Concept families from Lobbies/ folder not yet sold as discrete SKUs */
  | "concept-bar-hotel"
  | "concept-nightclub"
  | "concept-talk-show"
  | "concept-tropical"
  | "concept-grand-ornate"
  /** Spoken by Marcel — not present as dedicated refs in Lobbies/ */
  | "spoken-barbershop"
  | "spoken-bank"
  | "spoken-music-set";

export interface FanLobbySkinDef {
  id: FanLobbySkinId;
  family: FanLobbySkinFamily;
  label: string;
  tagline: string;
  /** Matches StoreItemEngine when commerce-ready */
  storeItemId?: string;
  /** Concept refs on disk (Rule 18 — concept only until modeled) */
  conceptRefs: string[];
  status: "store_sku" | "concept_folder" | "spoken_intent";
  isPremium: boolean;
  priceCents?: number;
}

/**
 * Canonical vocabulary after scanning `tmi-platform/Lobbies/` + store lobbies page.
 * Prefer these names over inventing parallel IDs.
 */
export const FAN_LOBBY_SKIN_CANON: FanLobbySkinDef[] = [
  {
    id: "lobby-cinema",
    family: "cinema",
    label: "Movie Theater / Major Cineplex",
    tagline: "Front lobby — poster wall, gloss floor, cove light (Marcel hero ref)",
    storeItemId: "lobby-cinema",
    conceptRefs: [
      "Lobbies/Lobbies 1.jpg",
      "Lobbies/Lobbies 1 -1.jpg",
      "apps/web/public/assets/lobbies/cineplex-reference.png",
    ],
    status: "store_sku",
    isPremium: true,
    priceCents: 799,
  },
  {
    id: "lobby-neon",
    family: "neon_lounge",
    label: "Neon Lounge",
    tagline: "Electric purple/cyan hangout — default flex",
    storeItemId: "lobby-neon",
    conceptRefs: ["Lobbies/Lobbies 4.jpg", "Lobbies/Lobbies 5.jpg", "Lobbies/Lobbies 6.jpg"],
    status: "store_sku",
    isPremium: true,
    priceCents: 499,
  },
  {
    id: "lobby-chill",
    family: "chill_lounge",
    label: "Chill Lounge",
    tagline: "Warm lighting, couch energy",
    storeItemId: "lobby-chill",
    conceptRefs: ["Lobbies/Lobbies 8.jpg", "Lobbies/Lobbies 2.jpg"],
    status: "store_sku",
    isPremium: true,
    priceCents: 299,
  },
  {
    id: "lobby-cypher",
    family: "cypher_underground",
    label: "Underground Cipher",
    tagline: "Brick, graffiti, raw street energy",
    storeItemId: "lobby-cypher",
    conceptRefs: ["Lobbies/Lobbies 10.jpg"],
    status: "store_sku",
    isPremium: true,
    priceCents: 499,
  },
  {
    id: "lobby-futuristic",
    family: "futuristic",
    label: "Futuristic Space",
    tagline: "LED grid corridors, floating platforms, sci-fi",
    storeItemId: "lobby-futuristic",
    conceptRefs: ["Lobbies/Lobbies 4.jpg", "Lobbies/Lobbies 6.jpg", "Lobbies/Lobbies 7.jpg"],
    status: "store_sku",
    isPremium: true,
    priceCents: 999,
  },
  {
    id: "concept-bar-hotel",
    family: "bar_hotel",
    label: "Bar / Hotel Lobby Bar",
    tagline: "Long bar, stools, bottle wall — from 'bar lobbies' refs",
    conceptRefs: ["Lobbies/Lobbies 2.jpg", "Lobbies/Lobbies 3.jpg"],
    status: "concept_folder",
    isPremium: true,
  },
  {
    id: "concept-nightclub",
    family: "nightclub",
    label: "Nightclub Entrance / Club Lounge",
    tagline: "Pink/purple LED, disco, modular lounges",
    conceptRefs: [
      "Lobbies/Lobbies 4.jpg",
      "Lobbies/Lobbies 5.jpg",
      "Lobbies/Lobbies 6.jpg",
      "Lobbies/Lobbies 7.jpg",
    ],
    status: "concept_folder",
    isPremium: true,
  },
  {
    id: "concept-talk-show",
    family: "talk_show",
    label: "Late Night Talk Show Set",
    tagline: "Host desk, guest sofa, city skyline LED — broadcast hangout",
    conceptRefs: ["Lobbies/Lobbies 9.jpg", "Lobbies/Lobbies 10.jpg"],
    status: "concept_folder",
    isPremium: true,
  },
  {
    id: "concept-tropical",
    family: "tropical",
    label: "Tropical / Conservatory Lobby",
    tagline: "Indoor plants, lanterns, resort atrium",
    conceptRefs: ["Lobbies/Lobbies 8.jpg", "Lobbies/Lobbies 9.jpg", "Lobbies/Lobbies 11.jpg"],
    status: "concept_folder",
    isPremium: true,
  },
  {
    id: "concept-grand-ornate",
    family: "grand_ornate",
    label: "Grand Ornate Hotel Lobby",
    tagline: "Chandeliers, wood paneling, multi-level atrium",
    conceptRefs: ["Lobbies/Lobbies 7.jpg", "Lobbies/Lobbies 8.jpg", "Lobbies/Lobbies 10.jpg"],
    status: "concept_folder",
    isPremium: true,
  },
  {
    id: "spoken-barbershop",
    family: "spoken_future",
    label: "Barbershop",
    tagline: "Spoken product intent — no dedicated folder refs yet",
    conceptRefs: [],
    status: "spoken_intent",
    isPremium: true,
  },
  {
    id: "spoken-bank",
    family: "spoken_future",
    label: "Bank Lobby",
    tagline: "Spoken product intent — no dedicated folder refs yet",
    conceptRefs: [],
    status: "spoken_intent",
    isPremium: true,
  },
  {
    id: "spoken-music-set",
    family: "spoken_future",
    label: "Music Set / Studio Floor",
    tagline: "Spoken product intent — no dedicated folder refs yet",
    conceptRefs: [],
    status: "spoken_intent",
    isPremium: true,
  },
];

export function getFanLobbySkinCanon(id: string): FanLobbySkinDef | undefined {
  return FAN_LOBBY_SKIN_CANON.find((s) => s.id === id || s.storeItemId === id);
}

export function listStoreReadyFanLobbySkins(): FanLobbySkinDef[] {
  return FAN_LOBBY_SKIN_CANON.filter((s) => s.status === "store_sku");
}

/**
 * Skins the in-lobby Skin switcher can equip now: store SKUs + concept-folder
 * looks with public CSS/backdrop dressing. Spoken-intent (no assets) excluded.
 */
export function listSwitchableFanLobbySkins(): FanLobbySkinDef[] {
  return FAN_LOBBY_SKIN_CANON.filter(
    (s) => s.status === "store_sku" || s.status === "concept_folder",
  );
}

/**
 * 2D floor chair node for conversation hangouts (Phase A++).
 * Not a spreadsheet seat grid — chairs are positions in the skinned room.
 * No 3D mesh / IK claimed here (Rule 18 / 20).
 */
export type SeatAnchorFacing = "N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW";

export interface SeatAnchor {
  id: string;
  /** Viewport percentage — LEGACY_UNVERIFIED, not world feet. */
  xPct: number;
  yPct: number;
  /** Optional Voltron mesh scope. Position xyz stays null until measured. */
  eventId?: string;
  clusterId?: string;
  auditoriumId?: string;
  facing: SeatAnchorFacing;
  /** open = claimable; reserved = decor-only (not assignable) */
  state: "open" | "reserved";
  /**
   * Skin-layout conversation cluster id (Phase A.5).
   * When seated, presence.conversationGroupId inherits this; standing → null.
   */
  conversationGroupId?: string;
  /** Floor hit-test radius in % of venue width/height (data only until consumers use it). */
  interactionRadius?: number;
}

/** Default cineplex conversation circle — 8 chairs around center. */
export function conversationCircleSeats(prefix = "chair"): SeatAnchor[] {
  const ring: Array<{ id: string; xPct: number; yPct: number; facing: SeatAnchorFacing }> = [
    { id: `${prefix}-1`, xPct: 50, yPct: 42, facing: "S" },
    { id: `${prefix}-2`, xPct: 62, yPct: 46, facing: "SW" },
    { id: `${prefix}-3`, xPct: 68, yPct: 56, facing: "W" },
    { id: `${prefix}-4`, xPct: 62, yPct: 66, facing: "NW" },
    { id: `${prefix}-5`, xPct: 50, yPct: 70, facing: "N" },
    { id: `${prefix}-6`, xPct: 38, yPct: 66, facing: "NE" },
    { id: `${prefix}-7`, xPct: 32, yPct: 56, facing: "E" },
    { id: `${prefix}-8`, xPct: 38, yPct: 46, facing: "SE" },
  ];
  const conversationGroupId = `${prefix}-circle`;
  return ring.map((s) => ({
    ...s,
    state: "open" as const,
    conversationGroupId,
    interactionRadius: 7,
  }));
}

/**
 * Honest 2D runtime dressing for the free-roam floor (FanLobbyVenue).
 * NOT GLTF rooms — CSS + optional concept still as backdrop only (Rule 18).
 * Concept stills copied from `tmi-platform/Lobbies/` → `/assets/lobbies/`.
 * Store purchase→equip ownership gate is Phase 2; switcher is preview/equip local.
 */
export interface FanLobbySkinDressing {
  background: string;
  accent: string;
  floorTint: string;
  ambientIcons: string[];
  /** Public URL for concept still backdrop — never treated as mesh geometry */
  backdropImageUrl?: string;
  /** Conversation chairs as 2D floor nodes */
  seats: SeatAnchor[];
  /** Spawn point when standing / on join before Sit */
  entrance: { xPct: number; yPct: number };
}

const DEFAULT_ENTRANCE = { xPct: 50, yPct: 88 };
const DEFAULT_SEATS = conversationCircleSeats("chair");

const FAN_LOBBY_SKIN_DRESSING: Partial<Record<FanLobbySkinId, FanLobbySkinDressing>> = {
  "lobby-cinema": {
    background:
      "radial-gradient(ellipse at 50% 8%, rgba(255,180,40,0.22), transparent 50%), linear-gradient(180deg, #1a0c18 0%, #0a0610 45%, #050510 100%)",
    accent: "#FFD700",
    floorTint: "rgba(255,180,40,0.07)",
    ambientIcons: ["🎬", "🍿", "🎟️"],
    backdropImageUrl: "/assets/lobbies/cineplex-reference.png",
    seats: DEFAULT_SEATS,
    entrance: DEFAULT_ENTRANCE,
  },
  "lobby-neon": {
    background:
      "radial-gradient(circle at 50% 15%, rgba(170,45,255,0.22), transparent 55%), radial-gradient(circle at 80% 70%, rgba(0,255,255,0.12), transparent 45%), #050510",
    accent: "#00FFFF",
    floorTint: "rgba(0,255,255,0.06)",
    ambientIcons: ["💡", "🎧", "✨"],
    backdropImageUrl: "/assets/lobbies/lobbies-4.jpg",
    seats: conversationCircleSeats("neon"),
    entrance: DEFAULT_ENTRANCE,
  },
  "lobby-chill": {
    background:
      "radial-gradient(circle at 40% 20%, rgba(255,140,80,0.16), transparent 55%), linear-gradient(180deg, #120a08 0%, #050510 70%)",
    accent: "#FF8C50",
    floorTint: "rgba(255,140,80,0.06)",
    ambientIcons: ["🛋️", "☕", "🌙"],
    backdropImageUrl: "/assets/lobbies/lobbies-8.jpg",
    seats: conversationCircleSeats("chill"),
    entrance: { xPct: 48, yPct: 86 },
  },
  "lobby-cypher": {
    background:
      "radial-gradient(circle at 50% 30%, rgba(255,45,170,0.14), transparent 50%), linear-gradient(180deg, #0c0a0a 0%, #050510 70%)",
    accent: "#FF2DAA",
    floorTint: "rgba(255,45,170,0.06)",
    ambientIcons: ["🎙️", "🧱", "🔥"],
    backdropImageUrl: "/assets/lobbies/lobbies-10.jpg",
    seats: conversationCircleSeats("cypher"),
    entrance: DEFAULT_ENTRANCE,
  },
  "lobby-futuristic": {
    background:
      "radial-gradient(circle at 50% 10%, rgba(0,255,136,0.14), transparent 50%), linear-gradient(180deg, #061018 0%, #050510 70%)",
    accent: "#00FF88",
    floorTint: "rgba(0,255,136,0.05)",
    ambientIcons: ["🚀", "📡", "⬛"],
    backdropImageUrl: "/assets/lobbies/lobbies-6.jpg",
    seats: conversationCircleSeats("future"),
    entrance: DEFAULT_ENTRANCE,
  },
  "concept-bar-hotel": {
    background:
      "radial-gradient(circle at 30% 20%, rgba(200,140,60,0.18), transparent 50%), linear-gradient(180deg, #140c08 0%, #050510 70%)",
    accent: "#E8C070",
    floorTint: "rgba(200,140,60,0.07)",
    ambientIcons: ["🍸", "🪑", "✨"],
    backdropImageUrl: "/assets/lobbies/lobbies-2.jpg",
    seats: [
      { id: "bar-1", xPct: 28, yPct: 52, facing: "E", state: "open" },
      { id: "bar-2", xPct: 28, yPct: 60, facing: "E", state: "open" },
      { id: "bar-3", xPct: 28, yPct: 68, facing: "E", state: "open" },
      { id: "lounge-1", xPct: 58, yPct: 55, facing: "W", state: "open" },
      { id: "lounge-2", xPct: 66, yPct: 55, facing: "W", state: "open" },
      { id: "lounge-3", xPct: 62, yPct: 66, facing: "N", state: "open" },
    ],
    entrance: { xPct: 50, yPct: 90 },
  },
  "concept-nightclub": {
    background:
      "radial-gradient(circle at 50% 10%, rgba(255,45,170,0.22), transparent 45%), radial-gradient(circle at 80% 80%, rgba(170,45,255,0.16), transparent 40%), #050510",
    accent: "#FF2DAA",
    floorTint: "rgba(255,45,170,0.08)",
    ambientIcons: ["🪩", "💜", "🔊"],
    backdropImageUrl: "/assets/lobbies/lobbies-5.jpg",
    seats: conversationCircleSeats("club"),
    entrance: DEFAULT_ENTRANCE,
  },
  "concept-talk-show": {
    background:
      "radial-gradient(ellipse at 50% 0%, rgba(80,140,255,0.2), transparent 50%), linear-gradient(180deg, #0a1020 0%, #050510 70%)",
    accent: "#60A5FF",
    floorTint: "rgba(80,140,255,0.06)",
    ambientIcons: ["🎙️", "🛋️", "🌃"],
    backdropImageUrl: "/assets/lobbies/lobbies-9.jpg",
    seats: [
      { id: "guest-sofa-1", xPct: 42, yPct: 58, facing: "N", state: "open" },
      { id: "guest-sofa-2", xPct: 50, yPct: 58, facing: "N", state: "open" },
      { id: "guest-sofa-3", xPct: 58, yPct: 58, facing: "N", state: "open" },
      { id: "audience-1", xPct: 30, yPct: 78, facing: "N", state: "open" },
      { id: "audience-2", xPct: 50, yPct: 80, facing: "N", state: "open" },
      { id: "audience-3", xPct: 70, yPct: 78, facing: "N", state: "open" },
    ],
    entrance: { xPct: 50, yPct: 92 },
  },
  "concept-tropical": {
    background:
      "radial-gradient(circle at 40% 15%, rgba(40,200,120,0.18), transparent 50%), linear-gradient(180deg, #061410 0%, #050510 70%)",
    accent: "#3DDC97",
    floorTint: "rgba(40,200,120,0.06)",
    ambientIcons: ["🌴", "🏮", "🍃"],
    backdropImageUrl: "/assets/lobbies/lobbies-11.jpg",
    seats: conversationCircleSeats("trop"),
    entrance: DEFAULT_ENTRANCE,
  },
  "concept-grand-ornate": {
    background:
      "radial-gradient(ellipse at 50% 5%, rgba(255,215,0,0.16), transparent 45%), linear-gradient(180deg, #1a1208 0%, #050510 70%)",
    accent: "#FFD700",
    floorTint: "rgba(255,215,0,0.06)",
    ambientIcons: ["🏛️", "💎", "🕯️"],
    backdropImageUrl: "/assets/lobbies/lobbies-7.jpg",
    seats: conversationCircleSeats("grand"),
    entrance: DEFAULT_ENTRANCE,
  },
};

export const DEFAULT_FAN_LOBBY_SKIN_ID: FanLobbySkinId = "lobby-cinema";

const SKIN_STORAGE_KEY = "tmi-fan-lobby-skin";

export function getPersistedFanLobbySkinId(): FanLobbySkinId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SKIN_STORAGE_KEY);
    if (!raw) return null;
    const canon = getFanLobbySkinCanon(raw);
    if (!canon || canon.status === "spoken_intent") return null;
    return canon.id;
  } catch {
    return null;
  }
}

export const FAN_LOBBY_SKIN_CHANGED_EVENT = "tmi:fan-lobby-skin-changed";

export function persistFanLobbySkinId(skinId: FanLobbySkinId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SKIN_STORAGE_KEY, skinId);
    window.dispatchEvent(new CustomEvent(FAN_LOBBY_SKIN_CHANGED_EVENT, { detail: { skinId } }));
  } catch {
    /* ignore quota */
  }
}

export function getFanLobbySkinDressing(skinId: string): FanLobbySkinDressing {
  const id = (getFanLobbySkinCanon(skinId)?.id ?? DEFAULT_FAN_LOBBY_SKIN_ID) as FanLobbySkinId;
  const base =
    FAN_LOBBY_SKIN_DRESSING[id] ?? FAN_LOBBY_SKIN_DRESSING[DEFAULT_FAN_LOBBY_SKIN_ID]!;
  return {
    ...base,
    seats: base.seats ?? DEFAULT_SEATS,
    entrance: base.entrance ?? DEFAULT_ENTRANCE,
  };
}

export function getFanLobbySeatAnchors(skinId: string): SeatAnchor[] {
  return getFanLobbySkinDressing(skinId).seats;
}

/**
 * Performer Venue Skins (auditorium / stage seating) live under
 * `Venue Skins Plus Seating/` + VenueSkinRegistry — NOT Fan Avatar Lobby skins.
 * Do not merge those seat-grid refs into this registry.
 */
export const FAN_LOBBY_VS_VENUE_NOTE =
  "Fan Lobby skins = walkable social room looks. Venue skins = stage/auditorium environments with bot-managed seating for shows.";
