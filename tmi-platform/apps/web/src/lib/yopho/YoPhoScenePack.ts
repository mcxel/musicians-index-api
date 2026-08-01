/**
 * YoPho Scene Pack — backgrounds, collages, prop signs for trading cards.
 * CSS/SVG kits + real banner assets when present. No fake stock photo claims (Rule 20).
 */

export type YoPhoSceneId =
  | "none"
  | "studio_columns"
  | "ocean_beach"
  | "neon_stage"
  | "city_night"
  | "grass_amphitheater"
  | "club_laser"
  | "cosmic_space"
  | "abducted_by_ufo"
  | "solid_cyan"
  | "solid_fuchsia"
  | "solid_gold"
  | "gradient_vice"
  | "collage_2up"
  | "collage_3up"
  | "collage_strip"
  | "collage_magazine";

export type YoPhoCollageLayout = "none" | "2up" | "3up" | "strip" | "magazine";

export interface YoPhoScenePack {
  id: YoPhoSceneId;
  label: string;
  tagline: string;
  category: "studio" | "nature" | "stage" | "city" | "neon" | "space" | "solid" | "collage";
  /** CSS background for kit scenes */
  backdropCss: string;
  /** Optional real asset under /public — never invent URLs that 404 */
  assetUrl?: string;
  collageLayout: YoPhoCollageLayout;
  /** Default sign text when scene implies a year/prop sign */
  defaultSignText?: string;
}

export const YOPHO_SCENE_PACKS: YoPhoScenePack[] = [
  {
    id: "none",
    label: "No Scene",
    tagline: "Portrait only",
    category: "studio",
    backdropCss: "transparent",
    collageLayout: "none",
  },
  {
    id: "studio_columns",
    label: "Studio Columns",
    tagline: "Classical pillars kit",
    category: "studio",
    backdropCss:
      "linear-gradient(180deg,#1a1428 0%,#0a0614 40%,#050510 100%), repeating-linear-gradient(90deg,transparent 0 38px,rgba(255,215,0,0.12) 38px 46px,transparent 46px 84px)",
    collageLayout: "none",
  },
  {
    id: "ocean_beach",
    label: "Ocean / Beach",
    tagline: "Horizon gradient kit",
    category: "nature",
    backdropCss:
      "linear-gradient(180deg,#1a4a6e 0%,#0d6b8a 28%,#c4a35a 62%,#0a0614 100%)",
    collageLayout: "none",
  },
  {
    id: "neon_stage",
    label: "Neon Stage",
    tagline: "TMI LIVE concert kit",
    category: "stage",
    backdropCss:
      "radial-gradient(ellipse at 50% 80%,rgba(255,45,170,0.45) 0%,transparent 45%),radial-gradient(ellipse at 20% 30%,rgba(0,229,255,0.25) 0%,transparent 40%),linear-gradient(180deg,#12081c 0%,#050510 100%)",
    assetUrl: "/banners/Banner Live Sessions.png",
    collageLayout: "none",
    defaultSignText: "LIVE",
  },
  {
    id: "city_night",
    label: "City Night",
    tagline: "Rooftop skyline kit",
    category: "city",
    backdropCss:
      "linear-gradient(180deg,#0a1028 0%,#1a0a28 50%,#050510 100%), repeating-linear-gradient(90deg,rgba(0,229,255,0.08) 0 2px,transparent 2px 18px)",
    assetUrl: "/banners/Banner Lounges.png",
    collageLayout: "none",
  },
  {
    id: "grass_amphitheater",
    label: "Amphitheater",
    tagline: "Outdoor grass bowl kit",
    category: "nature",
    backdropCss:
      "linear-gradient(180deg,#3a5a2a 0%,#1a3018 35%,#0a1410 70%,#050510 100%)",
    collageLayout: "none",
  },
  {
    id: "club_laser",
    label: "Club Laser",
    tagline: "Neon grid + lasers",
    category: "neon",
    backdropCss:
      "linear-gradient(180deg,#0a0618 0%,#050510 100%), repeating-linear-gradient(0deg,transparent 0 22px,rgba(0,229,255,0.15) 22px 23px), repeating-linear-gradient(90deg,transparent 0 22px,rgba(255,45,170,0.12) 22px 23px)",
    collageLayout: "none",
  },
  {
    id: "cosmic_space",
    label: "Cosmic",
    tagline: "Deep-space nebula kit",
    category: "space",
    backdropCss:
      "radial-gradient(circle at 30% 40%,rgba(170,45,255,0.45) 0%,transparent 35%),radial-gradient(circle at 70% 60%,rgba(0,229,255,0.3) 0%,transparent 40%),radial-gradient(circle at 50% 20%,rgba(255,215,0,0.15) 0%,transparent 30%),#030108",
    collageLayout: "none",
  },
  {
    id: "abducted_by_ufo",
    label: "Abducted by a UFO",
    tagline: "Novelty · saucer beam · night sky (scene pack only)",
    category: "space",
    backdropCss:
      "radial-gradient(ellipse at 50% 0%,rgba(0,255,136,0.35) 0%,transparent 42%),radial-gradient(ellipse at 50% 18%,rgba(170,45,255,0.4) 0%,transparent 28%),radial-gradient(circle at 20% 30%,rgba(255,255,255,0.5) 0 1px,transparent 2px),radial-gradient(circle at 70% 22%,rgba(255,255,255,0.45) 0 1px,transparent 2px),radial-gradient(circle at 40% 55%,rgba(255,255,255,0.35) 0 1px,transparent 2px),linear-gradient(180deg,#020410 0%,#0a0620 45%,#050510 100%)",
    collageLayout: "none",
    defaultSignText: "BEAM ME",
  },
  {
    id: "solid_cyan",
    label: "Studio Cyan",
    tagline: "Solid cyan wash",
    category: "solid",
    backdropCss: "linear-gradient(160deg,#003344 0%,#00E5FF33 50%,#050510 100%)",
    collageLayout: "none",
  },
  {
    id: "solid_fuchsia",
    label: "Studio Fuchsia",
    tagline: "Solid fuchsia wash",
    category: "solid",
    backdropCss: "linear-gradient(160deg,#2a0620 0%,#FF2DAA44 50%,#050510 100%)",
    collageLayout: "none",
  },
  {
    id: "solid_gold",
    label: "Studio Gold",
    tagline: "Solid gold wash",
    category: "solid",
    backdropCss: "linear-gradient(160deg,#2a2008 0%,#FFD70044 50%,#050510 100%)",
    collageLayout: "none",
  },
  {
    id: "gradient_vice",
    label: "Vice Gradient",
    tagline: "Cyan → fuchsia → gold",
    category: "solid",
    backdropCss: "linear-gradient(135deg,#00E5FF33 0%,#FF2DAA44 45%,#FFD70033 100%),#050510",
    collageLayout: "none",
  },
  {
    id: "collage_2up",
    label: "2-Up Collage",
    tagline: "Side-by-side slots",
    category: "collage",
    backdropCss: "linear-gradient(180deg,#0a0614,#050510)",
    collageLayout: "2up",
  },
  {
    id: "collage_3up",
    label: "3-Up Collage",
    tagline: "Triple strip slots",
    category: "collage",
    backdropCss: "linear-gradient(180deg,#0a0614,#050510)",
    collageLayout: "3up",
  },
  {
    id: "collage_strip",
    label: "Contact Strip",
    tagline: "Photo-booth strip",
    category: "collage",
    backdropCss: "linear-gradient(180deg,#1a1a22,#050510)",
    collageLayout: "strip",
  },
  {
    id: "collage_magazine",
    label: "Magazine Collage",
    tagline: "Cover + inset layout",
    category: "collage",
    backdropCss: "linear-gradient(160deg,#12081c,#050510)",
    collageLayout: "magazine",
  },
];

export function getScenePack(id: YoPhoSceneId): YoPhoScenePack {
  return YOPHO_SCENE_PACKS.find((s) => s.id === id) ?? YOPHO_SCENE_PACKS[0]!;
}
