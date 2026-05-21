// packages/ui-hud/src/ui-hud.engine.ts
// Scenes, CRT/VHS overlays, neon effects, scanlines, transitions, HUD elements.

export type SceneId =
  | "magazine" | "dashboard" | "live-stage" | "sponsor-showcase"
  | "lobby" | "underground-cypher" | "game-night" | "concert-arena"
  | "neon-club" | "rooftop-city" | "backstage" | "space-dome"
  | "beach-festival" | "virtual-grid" | "admin-command" | "studio"
  | "archive" | "hall-of-fame"
  // New scenes for VR/Stadium
  | "stadium-vr" | "vr-lobby" | "vr-store" | "vr-theater";

export interface SceneConfig {
  id: SceneId;
  label: string;
  backgroundType: "gradient" | "texture" | "particles" | "video_loop" | "vr_3d";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  crtEnabled: boolean;
  filmGrainEnabled: boolean;
  particlesEnabled: boolean;
  neonGlowEnabled: boolean;
  scanlineOpacity: number;  // 0-1
  audioProfile: string;     // references audio engine profile
  transitionStyle: "fade" | "page_flip" | "zoom" | "slide" | "vhs_glitch";
  lightingPreset: string;
  isVRCapable: boolean;     // can be rendered in WebXR
}

export const SCENE_REGISTRY: Record<SceneId, SceneConfig> = {
  "magazine":      { id: "magazine",      label: "Magazine Cover",    backgroundType: "texture",   primaryColor: "#0D0520", secondaryColor: "#FFB800", accentColor: "#FF8C00", crtEnabled: false, filmGrainEnabled: true,  particlesEnabled: false, neonGlowEnabled: false, scanlineOpacity: 0,   audioProfile: "editorial",     transitionStyle: "page_flip", lightingPreset: "standard",        isVRCapable: false },
  "dashboard":     { id: "dashboard",     label: "Dashboard",         backgroundType: "gradient", primaryColor: "#0D0520", secondaryColor: "#00E5FF", accentColor: "#7B2FBE", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: true,  neonGlowEnabled: true,  scanlineOpacity: 0.1, audioProfile: "dashboard_hum", transitionStyle: "fade",      lightingPreset: "neon_purple",     isVRCapable: false },
  "live-stage":    { id: "live-stage",    label: "Live Stage",        backgroundType: "video_loop", primaryColor: "#0D0520", secondaryColor: "#FF2D78", accentColor: "#00E5FF", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: true, neonGlowEnabled: true, scanlineOpacity: 0, audioProfile: "stage_ambient", transitionStyle: "zoom",     lightingPreset: "concert_white",   isVRCapable: true  },
  "sponsor-showcase":{ id: "sponsor-showcase", label: "Sponsor World",backgroundType: "gradient", primaryColor: "#0D0520", secondaryColor: "#FF8C00", accentColor: "#FFB800", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: false, neonGlowEnabled: true, scanlineOpacity: 0, audioProfile: "sponsor_neutral", transitionStyle: "fade",    lightingPreset: "sponsor_spotlight", isVRCapable: false },
  "lobby":         { id: "lobby",         label: "Main Lobby",        backgroundType: "gradient", primaryColor: "#150830", secondaryColor: "#7B2FBE", accentColor: "#00E5FF", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: true,  neonGlowEnabled: true,  scanlineOpacity: 0,   audioProfile: "lobby_ambient", transitionStyle: "slide",     lightingPreset: "neon_purple",     isVRCapable: true  },
  "underground-cypher": { id: "underground-cypher", label: "Cypher Arena", backgroundType: "gradient", primaryColor: "#0A000F", secondaryColor: "#FF2020", accentColor: "#FF8C00", crtEnabled: true, filmGrainEnabled: true, particlesEnabled: true, neonGlowEnabled: true, scanlineOpacity: 0.15, audioProfile: "cypher_beat", transitionStyle: "vhs_glitch", lightingPreset: "battle_red", isVRCapable: true },
  "game-night":    { id: "game-night",    label: "Game Show Arena",   backgroundType: "particles", primaryColor: "#0D0520", secondaryColor: "#FFB800", accentColor: "#FF2D78", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: true, neonGlowEnabled: true, scanlineOpacity: 0, audioProfile: "game_show",     transitionStyle: "zoom",      lightingPreset: "rainbow_party",   isVRCapable: true  },
  "concert-arena": { id: "concert-arena", label: "Concert Arena",     backgroundType: "video_loop", primaryColor: "#000000", secondaryColor: "#FFFFFF", accentColor: "#FFB800", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: true, neonGlowEnabled: true, scanlineOpacity: 0, audioProfile: "concert_crowd", transitionStyle: "zoom",     lightingPreset: "concert_white",   isVRCapable: true  },
  "neon-club":     { id: "neon-club",     label: "Neon Club",         backgroundType: "gradient", primaryColor: "#0D0520", secondaryColor: "#FF2D78", accentColor: "#7B2FBE", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: true, neonGlowEnabled: true, scanlineOpacity: 0, audioProfile: "afterparty",    transitionStyle: "slide",     lightingPreset: "afterparty",      isVRCapable: true  },
  "rooftop-city":  { id: "rooftop-city",  label: "Rooftop",           backgroundType: "gradient", primaryColor: "#0A0A1A", secondaryColor: "#00E5FF", accentColor: "#FFB800", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: true, neonGlowEnabled: true, scanlineOpacity: 0, audioProfile: "city_ambient",  transitionStyle: "fade",      lightingPreset: "neon_purple",     isVRCapable: true  },
  "backstage":     { id: "backstage",     label: "Backstage",         backgroundType: "texture",   primaryColor: "#1A1000", secondaryColor: "#FFB800", accentColor: "#FF8C00", crtEnabled: false, filmGrainEnabled: true,  particlesEnabled: false, neonGlowEnabled: false, scanlineOpacity: 0, audioProfile: "backstage",    transitionStyle: "fade",      lightingPreset: "dim_intimate",    isVRCapable: false },
  "space-dome":    { id: "space-dome",    label: "Space Dome",        backgroundType: "particles", primaryColor: "#000010", secondaryColor: "#7B2FBE", accentColor: "#00E5FF", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: true, neonGlowEnabled: true, scanlineOpacity: 0, audioProfile: "space_ambient", transitionStyle: "zoom",      lightingPreset: "neon_purple",     isVRCapable: true  },
  "beach-festival":{ id: "beach-festival",label: "Beach Festival",    backgroundType: "gradient", primaryColor: "#001020", secondaryColor: "#FF8C00", accentColor: "#FFB800", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: true, neonGlowEnabled: false, scanlineOpacity: 0, audioProfile: "festival",      transitionStyle: "fade",      lightingPreset: "concert_white",   isVRCapable: true  },
  "virtual-grid":  { id: "virtual-grid",  label: "Virtual Grid",      backgroundType: "gradient", primaryColor: "#000820", secondaryColor: "#00E5FF", accentColor: "#7B2FBE", crtEnabled: true,  filmGrainEnabled: false, particlesEnabled: true, neonGlowEnabled: true, scanlineOpacity: 0.2, audioProfile: "synth_pad",  transitionStyle: "vhs_glitch", lightingPreset: "cypher_cyan",     isVRCapable: true  },
  "admin-command": { id: "admin-command", label: "Admin Command",     backgroundType: "gradient", primaryColor: "#0D0520", secondaryColor: "#FF8C00", accentColor: "#FFB800", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: false, neonGlowEnabled: true, scanlineOpacity: 0, audioProfile: "system_hum",    transitionStyle: "fade",      lightingPreset: "standard",        isVRCapable: false },
  "studio":        { id: "studio",        label: "Studio",            backgroundType: "texture",   primaryColor: "#0D0520", secondaryColor: "#FFB800", accentColor: "#FF8C00", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: false, neonGlowEnabled: false, scanlineOpacity: 0, audioProfile: "studio_silence", transitionStyle: "fade",     lightingPreset: "standard",        isVRCapable: false },
  "archive":       { id: "archive",       label: "Archive",           backgroundType: "texture",   primaryColor: "#0D0520", secondaryColor: "#7B2FBE", accentColor: "#00E5FF", crtEnabled: true,  filmGrainEnabled: true,  particlesEnabled: false, neonGlowEnabled: true, scanlineOpacity: 0.3, audioProfile: "archive",    transitionStyle: "vhs_glitch", lightingPreset: "dim_intimate",    isVRCapable: false },
  "hall-of-fame":  { id: "hall-of-fame",  label: "Hall of Fame",      backgroundType: "gradient", primaryColor: "#0D0520", secondaryColor: "#FFD700", accentColor: "#FF8C00", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: true, neonGlowEnabled: true, scanlineOpacity: 0, audioProfile: "triumphant",    transitionStyle: "zoom",      lightingPreset: "victory_gold",    isVRCapable: false },
  // VR-specific scenes
  "stadium-vr":    { id: "stadium-vr",    label: "VR Stadium",        backgroundType: "vr_3d",     primaryColor: "#000010", secondaryColor: "#FF2D78", accentColor: "#FFB800", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: true, neonGlowEnabled: true, scanlineOpacity: 0, audioProfile: "stadium_spatial", transitionStyle: "zoom",    lightingPreset: "concert_white",   isVRCapable: true  },
  "vr-lobby":      { id: "vr-lobby",      label: "VR Lobby",          backgroundType: "vr_3d",     primaryColor: "#0D0520", secondaryColor: "#7B2FBE", accentColor: "#00E5FF", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: true, neonGlowEnabled: true, scanlineOpacity: 0, audioProfile: "vr_ambient",    transitionStyle: "fade",      lightingPreset: "neon_purple",     isVRCapable: true  },
  "vr-store":      { id: "vr-store",      label: "VR Item Store",     backgroundType: "vr_3d",     primaryColor: "#0D0520", secondaryColor: "#FFB800", accentColor: "#7B2FBE", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: true, neonGlowEnabled: true, scanlineOpacity: 0, audioProfile: "boutique",      transitionStyle: "fade",      lightingPreset: "victory_gold",    isVRCapable: true  },
  "vr-theater":    { id: "vr-theater",    label: "VR Theater",        backgroundType: "vr_3d",     primaryColor: "#050510", secondaryColor: "#FFB800", accentColor: "#FF8C00", crtEnabled: false, filmGrainEnabled: false, particlesEnabled: false, neonGlowEnabled: true, scanlineOpacity: 0, audioProfile: "theater_spatial", transitionStyle: "fade",    lightingPreset: "dim_intimate",    isVRCapable: true  },
};

// ── HUD SATELLITE FOOTER ──────────────────────────────────
export const HUD_SATELLITE_FOOTER = {
  text: "THE MUSICIAN'S INDEX | CHICO_BASE: 39.7285°N 121.8375°W | SIGNAL: 100% | SECURE",
  recLightActive: false,  // true when any show is live
  updateIntervalMs: 5000,
} as const;
