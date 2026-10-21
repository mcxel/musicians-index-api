/**
 * YoPhoCompositorCatalog.ts
 * Canonical catalog for the YoPho AI Cutout & Scene Compositor.
 * Defines assets, categories, presets, and metadata matching the master visual canon.
 */

export interface CompositorCard {
  id: string;
  name: string;
  category: "VEHICLE" | "ENVIRONMENT" | "PROP" | "BACKGROUND";
  subCategory?: string;
  badge?: string;
  thumbnail: string;
  previewBg: string;
  layerType: "BACKGROUND" | "ENVIRONMENT" | "PROP" | "VEHICLE";
  defaultScale?: number;
  defaultPosition?: { x: number; y: number };
}

export interface SceneCategory {
  id: string;
  label: string;
  icon: string;
}

export interface AdjustTool {
  id: "move" | "scale" | "rotate" | "layers" | "shadows" | "lighting" | "filters" | "effects";
  label: string;
  icon: string;
}

export const SCENE_CATEGORIES: SceneCategory[] = [
  { id: "vehicles", label: "Vehicles", icon: "🚗" },
  { id: "buildings", label: "Buildings", icon: "🏢" },
  { id: "nature", label: "Nature", icon: "🌿" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "luxury", label: "Luxury", icon: "💎" },
  { id: "space", label: "Space", icon: "🪐" },
  { id: "seasonal", label: "Seasonal", icon: "❄️" },
  { id: "more", label: "More", icon: "⋯" },
];

export const ADJUST_TOOLS: AdjustTool[] = [
  { id: "move", label: "Move", icon: "✥" },
  { id: "scale", label: "Scale", icon: "⤢" },
  { id: "rotate", label: "Rotate", icon: "↻" },
  { id: "layers", label: "Layers", icon: "🥞" },
  { id: "shadows", label: "Shadows", icon: "◐" },
  { id: "lighting", label: "Lighting", icon: "☀️" },
  { id: "filters", label: "Filters", icon: "🎛️" },
  { id: "effects", label: "Effects", icon: "✨" },
];

export const VEHICLE_PROPS: CompositorCard[] = [
  {
    id: "veh-sports-cars",
    name: "Sports Cars",
    category: "VEHICLE",
    thumbnail: "/assets/banners/banner-games.png",
    previewBg: "linear-gradient(135deg, #FF1744, #B71C1C)",
    layerType: "VEHICLE",
    badge: "EXOTIC",
    defaultScale: 1.0,
  },
  {
    id: "veh-luxury-cars",
    name: "Luxury Cars",
    category: "VEHICLE",
    thumbnail: "/assets/banners/banner-lounges.png",
    previewBg: "linear-gradient(135deg, #37474F, #212121)",
    layerType: "VEHICLE",
    badge: "VIP",
    defaultScale: 1.0,
  },
  {
    id: "veh-lowriders",
    name: "Lowriders",
    category: "VEHICLE",
    thumbnail: "/assets/banners/banner-dance_off.png",
    previewBg: "linear-gradient(135deg, #7B1FA2, #311B92)",
    layerType: "VEHICLE",
    badge: "CUSTOM",
    defaultScale: 1.0,
  },
  {
    id: "veh-classic-cars",
    name: "Classic Cars",
    category: "VEHICLE",
    thumbnail: "/assets/banners/banner-comedy.png",
    previewBg: "linear-gradient(135deg, #0288D1, #01579B)",
    layerType: "VEHICLE",
    badge: "RETRO",
    defaultScale: 1.0,
  },
  {
    id: "veh-suvs-trucks",
    name: "SUVs & Trucks",
    category: "VEHICLE",
    thumbnail: "/assets/banners/banner-fans.png",
    previewBg: "linear-gradient(135deg, #2E7D32, #1B5E20)",
    layerType: "VEHICLE",
    badge: "HEAVY",
    defaultScale: 1.0,
  },
  {
    id: "veh-motorcycles",
    name: "Motorcycles",
    category: "VEHICLE",
    thumbnail: "/assets/banners/banner-challenges.png",
    previewBg: "linear-gradient(135deg, #455A64, #263238)",
    layerType: "VEHICLE",
    badge: "BIKE",
    defaultScale: 0.9,
  },
  {
    id: "veh-atvs-gokarts",
    name: "ATVs & Go-Karts",
    category: "VEHICLE",
    thumbnail: "/assets/banners/banner-battle.png",
    previewBg: "linear-gradient(135deg, #E65100, #BF360C)",
    layerType: "VEHICLE",
    badge: "TRACK",
    defaultScale: 0.9,
  },
  {
    id: "veh-jets-planes",
    name: "Jets & Planes",
    category: "VEHICLE",
    thumbnail: "/assets/banners/banner-live_sessions.png",
    previewBg: "linear-gradient(135deg, #0D47A1, #002171)",
    layerType: "VEHICLE",
    badge: "AERO",
    defaultScale: 1.1,
  },
  {
    id: "veh-yachts-boats",
    name: "Yachts & Boats",
    category: "VEHICLE",
    thumbnail: "/assets/banners/banner-lobbies.png",
    previewBg: "linear-gradient(135deg, #006064, #004D40)",
    layerType: "VEHICLE",
    badge: "MARINE",
    defaultScale: 1.1,
  },
  {
    id: "veh-futuristic",
    name: "Futuristic Vehicles",
    category: "VEHICLE",
    thumbnail: "/assets/banners/banner-cyhpers.png",
    previewBg: "linear-gradient(135deg, #00E5FF, #651FFF)",
    layerType: "VEHICLE",
    badge: "CYBER",
    defaultScale: 1.0,
  },
];

export const ENVIRONMENTS: CompositorCard[] = [
  {
    id: "env-city-streets",
    name: "City Streets",
    category: "ENVIRONMENT",
    thumbnail: "/assets/banners/banner-actors_and_streamers.png",
    previewBg: "linear-gradient(180deg, #1A237E, #050510)",
    layerType: "ENVIRONMENT",
    badge: "URBAN",
  },
  {
    id: "env-mansions",
    name: "Mansions",
    category: "ENVIRONMENT",
    thumbnail: "/assets/banners/banner-lounges.png",
    previewBg: "linear-gradient(180deg, #3E2723, #1B0000)",
    layerType: "ENVIRONMENT",
    badge: "ESTATE",
  },
  {
    id: "env-nightclubs",
    name: "Nightclubs",
    category: "ENVIRONMENT",
    thumbnail: "/assets/banners/banner-dance_off.png",
    previewBg: "linear-gradient(180deg, #880E4F, #311B92)",
    layerType: "ENVIRONMENT",
    badge: "NEON",
  },
  {
    id: "env-beaches",
    name: "Beaches",
    category: "ENVIRONMENT",
    thumbnail: "/assets/banners/banner-fans.png",
    previewBg: "linear-gradient(180deg, #FF6F00, #006064)",
    layerType: "ENVIRONMENT",
    badge: "COAST",
  },
  {
    id: "env-rooftops",
    name: "Rooftops",
    category: "ENVIRONMENT",
    thumbnail: "/assets/banners/banner-live_sessions.png",
    previewBg: "linear-gradient(180deg, #283593, #000051)",
    layerType: "ENVIRONMENT",
    badge: "SKYLINE",
  },
  {
    id: "env-studios",
    name: "Studios",
    category: "ENVIRONMENT",
    thumbnail: "/assets/banners/banner-instrument_players.png",
    previewBg: "linear-gradient(180deg, #212121, #000000)",
    layerType: "ENVIRONMENT",
    badge: "AUDIO",
  },
  {
    id: "env-concert-stages",
    name: "Concert Stages",
    category: "ENVIRONMENT",
    thumbnail: "/assets/banners/banner-battle_of_the_bands.png",
    previewBg: "linear-gradient(180deg, #4A148C, #0D47A1)",
    layerType: "ENVIRONMENT",
    badge: "ARENA",
  },
  {
    id: "env-space-scifi",
    name: "Space / Sci-Fi",
    category: "ENVIRONMENT",
    thumbnail: "/assets/banners/banner-cyhpers.png",
    previewBg: "linear-gradient(180deg, #000000, #311B92)",
    layerType: "ENVIRONMENT",
    badge: "COSMIC",
  },
  {
    id: "env-casinos",
    name: "Casinos",
    category: "ENVIRONMENT",
    thumbnail: "/assets/banners/banner-comedy.png",
    previewBg: "linear-gradient(180deg, #B71C1C, #FFD700)",
    layerType: "ENVIRONMENT",
    badge: "VEGAS",
  },
  {
    id: "env-urban",
    name: "Urban",
    category: "ENVIRONMENT",
    thumbnail: "/assets/banners/banner-games.png",
    previewBg: "linear-gradient(180deg, #263238, #102027)",
    layerType: "ENVIRONMENT",
    badge: "METRO",
  },
];

export const PROPS_DECOR: CompositorCard[] = [
  {
    id: "prop-dj-booths",
    name: "DJ Booths",
    category: "PROP",
    thumbnail: "/assets/banners/banner-dance_off.png",
    previewBg: "linear-gradient(135deg, #00E5FF, #D500F9)",
    layerType: "PROP",
    badge: "AUDIO",
  },
  {
    id: "prop-royal-thrones",
    name: "Royal Thrones",
    category: "PROP",
    thumbnail: "/assets/banners/banner-lounges.png",
    previewBg: "linear-gradient(135deg, #FFD700, #B71C1C)",
    layerType: "PROP",
    badge: "ROYAL",
  },
  {
    id: "prop-desks-offices",
    name: "Desks & Offices",
    category: "PROP",
    thumbnail: "/assets/banners/banner-actors_and_streamers.png",
    previewBg: "linear-gradient(135deg, #37474F, #212121)",
    layerType: "PROP",
    badge: "HQ",
  },
  {
    id: "prop-signs-billboards",
    name: "Signs & Billboards",
    category: "PROP",
    thumbnail: "/assets/banners/banner-live_sessions.png",
    previewBg: "linear-gradient(135deg, #00E676, #00B0FF)",
    layerType: "PROP",
    badge: "NEON",
  },
  {
    id: "prop-red-carpets",
    name: "Red Carpets",
    category: "PROP",
    thumbnail: "/assets/banners/banner-fans.png",
    previewBg: "linear-gradient(135deg, #D50000, #880E4F)",
    layerType: "PROP",
    badge: "GALA",
  },
  {
    id: "prop-money-luxury",
    name: "Money & Luxury",
    category: "PROP",
    thumbnail: "/assets/banners/banner-comedy.png",
    previewBg: "linear-gradient(135deg, #00C853, #FFD700)",
    layerType: "PROP",
    badge: "GOLD",
  },
  {
    id: "prop-weapons",
    name: "Weapons (Props)",
    category: "PROP",
    thumbnail: "/assets/banners/banner-challenges.png",
    previewBg: "linear-gradient(135deg, #424242, #212121)",
    layerType: "PROP",
    badge: "STUDIO",
  },
  {
    id: "prop-furniture",
    name: "Furniture",
    category: "PROP",
    thumbnail: "/assets/banners/banner-lounges.png",
    previewBg: "linear-gradient(135deg, #5D4037, #3E2723)",
    layerType: "PROP",
    badge: "LOUNGE",
  },
  {
    id: "prop-seasonal",
    name: "Seasonal",
    category: "PROP",
    thumbnail: "/assets/banners/banner-battle.png",
    previewBg: "linear-gradient(135deg, #80D8FF, #0091EA)",
    layerType: "PROP",
    badge: "EVENT",
  },
  {
    id: "prop-fantasy",
    name: "Fantasy",
    category: "PROP",
    thumbnail: "/assets/banners/banner-cyhpers.png",
    previewBg: "linear-gradient(135deg, #AA00FF, #304FFE)",
    layerType: "PROP",
    badge: "MYTHIC",
  },
];

export const BACKGROUNDS: CompositorCard[] = [
  {
    id: "bg-neon-cyberpunk",
    name: "Neon Cyberpunk",
    category: "BACKGROUND",
    thumbnail: "/assets/banners/banner-cyhpers.png",
    previewBg: "linear-gradient(135deg, #050518 0%, #1A0B2E 50%, #00FFFF22 100%)",
    layerType: "BACKGROUND",
    badge: "CYBER",
  },
  {
    id: "bg-sunset-skyline",
    name: "Sunset Skyline",
    category: "BACKGROUND",
    thumbnail: "/assets/banners/banner-live_sessions.png",
    previewBg: "linear-gradient(180deg, #FF2D55 0%, #7928CA 60%, #050510 100%)",
    layerType: "BACKGROUND",
    badge: "DUSK",
  },
  {
    id: "bg-studio-gradients",
    name: "Studio Gradients",
    category: "BACKGROUND",
    thumbnail: "/assets/banners/banner-instrument_players.png",
    previewBg: "radial-gradient(ellipse at 50% 40%, #1F1B3C 0%, #080612 100%)",
    layerType: "BACKGROUND",
    badge: "STUDIO",
  },
  {
    id: "bg-penthouse-views",
    name: "Penthouse Views",
    category: "BACKGROUND",
    thumbnail: "/assets/banners/banner-lounges.png",
    previewBg: "linear-gradient(135deg, #0A1128 0%, #1C2541 60%, #050510 100%)",
    layerType: "BACKGROUND",
    badge: "METRO",
  },
  {
    id: "bg-abstract-glow",
    name: "Abstract Glow",
    category: "BACKGROUND",
    thumbnail: "/assets/banners/banner-dance_off.png",
    previewBg: "radial-gradient(circle at 70% 30%, #FF2DAA44 0%, #00FFFF22 40%, #050510 100%)",
    layerType: "BACKGROUND",
    badge: "PRISM",
  },
  {
    id: "bg-golden-horizon",
    name: "Golden Hour Horizon",
    category: "BACKGROUND",
    thumbnail: "/assets/banners/banner-fans.png",
    previewBg: "linear-gradient(180deg, #FFB300 0%, #E65100 50%, #1A0000 100%)",
    layerType: "BACKGROUND",
    badge: "GOLDEN",
  },
  {
    id: "bg-stadium-lights",
    name: "Stadium Show Lights",
    category: "BACKGROUND",
    thumbnail: "/assets/banners/banner-battle_of_the_bands.png",
    previewBg: "radial-gradient(circle at 50% 20%, #00E5FF55 0%, #050510 80%)",
    layerType: "BACKGROUND",
    badge: "SHOW",
  },
  {
    id: "bg-red-carpet-wall",
    name: "Red Carpet Backdrop",
    category: "BACKGROUND",
    thumbnail: "/assets/banners/banner-comedy.png",
    previewBg: "linear-gradient(135deg, #2D0014 0%, #140008 100%)",
    layerType: "BACKGROUND",
    badge: "PRESS",
  },
  {
    id: "bg-tropical-paradise",
    name: "Tropical Paradise",
    category: "BACKGROUND",
    thumbnail: "/assets/banners/banner-actors_and_streamers.png",
    previewBg: "linear-gradient(180deg, #00B0FF 0%, #004D40 70%, #050510 100%)",
    layerType: "BACKGROUND",
    badge: "RESORT",
  },
  {
    id: "bg-retro-wave",
    name: "Retro Wave",
    category: "BACKGROUND",
    thumbnail: "/assets/banners/banner-games.png",
    previewBg: "linear-gradient(180deg, #3A0CA3 0%, #F72585 65%, #050510 100%)",
    layerType: "BACKGROUND",
    badge: "SYNTH",
  },
];

export const ADVANCED_FEATURES_LIST = [
  "Works with People, Pets & Objects",
  "Transparent PNG export",
  "Multiple people in one scene",
  "Layer control (front / behind)",
  "AI lighting & shadows",
  "Style filters (realistic, cinematic, cartoon, etc.)",
  "Preset templates",
  "Save to your YoPho library",
  "Use in profile, lounge, or social",
] as const;
