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
 * Honest 2D runtime dressing for the free-roam floor (FanLobbyVenue).
 * NOT GLTF rooms — CSS + optional concept still as backdrop only (Rule 18).
 * Store purchase→equip is Phase 2; Phase 1 mounts cinema as the default look.
 */
export interface FanLobbySkinDressing {
  background: string;
  accent: string;
  floorTint: string;
  ambientIcons: string[];
  /** Public URL for concept still backdrop — never treated as mesh geometry */
  backdropImageUrl?: string;
}

const FAN_LOBBY_SKIN_DRESSING: Partial<Record<FanLobbySkinId, FanLobbySkinDressing>> = {
  "lobby-cinema": {
    background:
      "radial-gradient(ellipse at 50% 8%, rgba(255,180,40,0.22), transparent 50%), linear-gradient(180deg, #1a0c18 0%, #0a0610 45%, #050510 100%)",
    accent: "#FFD700",
    floorTint: "rgba(255,180,40,0.07)",
    ambientIcons: ["🎬", "🍿", "🎟️"],
    backdropImageUrl: "/assets/lobbies/cineplex-reference.png",
  },
  "lobby-neon": {
    background:
      "radial-gradient(circle at 50% 15%, rgba(170,45,255,0.22), transparent 55%), radial-gradient(circle at 80% 70%, rgba(0,255,255,0.12), transparent 45%), #050510",
    accent: "#00FFFF",
    floorTint: "rgba(0,255,255,0.06)",
    ambientIcons: ["💡", "🎧", "✨"],
  },
  "lobby-chill": {
    background:
      "radial-gradient(circle at 40% 20%, rgba(255,140,80,0.16), transparent 55%), linear-gradient(180deg, #120a08 0%, #050510 70%)",
    accent: "#FF8C50",
    floorTint: "rgba(255,140,80,0.06)",
    ambientIcons: ["🛋️", "☕", "🌙"],
  },
  "lobby-cypher": {
    background:
      "radial-gradient(circle at 50% 30%, rgba(255,45,170,0.14), transparent 50%), linear-gradient(180deg, #0c0a0a 0%, #050510 70%)",
    accent: "#FF2DAA",
    floorTint: "rgba(255,45,170,0.06)",
    ambientIcons: ["🎙️", "🧱", "🔥"],
  },
  "lobby-futuristic": {
    background:
      "radial-gradient(circle at 50% 10%, rgba(0,255,136,0.14), transparent 50%), linear-gradient(180deg, #061018 0%, #050510 70%)",
    accent: "#00FF88",
    floorTint: "rgba(0,255,136,0.05)",
    ambientIcons: ["🚀", "📡", "⬛"],
  },
};

export const DEFAULT_FAN_LOBBY_SKIN_ID: FanLobbySkinId = "lobby-cinema";

export function getFanLobbySkinDressing(skinId: string): FanLobbySkinDressing {
  const id = (getFanLobbySkinCanon(skinId)?.id ?? DEFAULT_FAN_LOBBY_SKIN_ID) as FanLobbySkinId;
  return (
    FAN_LOBBY_SKIN_DRESSING[id] ??
    FAN_LOBBY_SKIN_DRESSING[DEFAULT_FAN_LOBBY_SKIN_ID]!
  );
}

/**
 * Performer Venue Skins (auditorium / stage seating) live under
 * `Venue Skins Plus Seating/` + VenueSkinRegistry — NOT Fan Avatar Lobby skins.
 * Do not merge those seat-grid refs into this registry.
 */
export const FAN_LOBBY_VS_VENUE_NOTE =
  "Fan Lobby skins = walkable social room looks. Venue skins = stage/auditorium environments with bot-managed seating for shows.";
