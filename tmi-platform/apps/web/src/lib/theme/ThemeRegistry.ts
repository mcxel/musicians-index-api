/**
 * ThemeRegistry.ts
 *
 * Every TMI magazine surface reads from this file.
 * No page hardcodes colors, fonts, or effects — it asks the engine.
 *
 * v1: CSS-variable-based tokens (instant swap, zero DOM re-render).
 * v2: Font loading pipeline (Google Fonts / Variable Fonts via next/font).
 * v3: AI-assisted theme recommendation by genre/mood/upload analysis.
 *
 * Theme names are original editorial archetypes, not brand names.
 */

// ── Token buckets ─────────────────────────────────────────────────────────────

export interface TypographyTokens {
  fontDisplay: string;    // CSS font-family for headlines
  fontBody: string;       // CSS font-family for body text
  fontAccent: string;     // CSS font-family for labels, captions, badges
  weightDisplay: number;  // 400–900
  weightBody: number;
  letterSpacing: string;  // e.g. "0.02em"
  textTransform: 'uppercase' | 'none' | 'capitalize';
  lineHeight: string;
}

export interface PaletteTokens {
  background: string;   // main page background
  surface: string;      // card / panel background
  surfaceAlt: string;   // elevated surface
  accent: string;       // primary accent (hero color)
  accentAlt: string;    // secondary accent
  text: string;         // primary body text
  textMuted: string;    // secondary / caption text
  border: string;       // border / rule color
  overlay: string;      // scrim / dark overlay
  ink: string;          // decorative ink / stamp color (halftone, zine)
}

export interface FrameTokens {
  radius: string;         // photo / card border-radius
  borderWidth: string;    // "0px" | "1px" | "2px" | "3px"
  borderStyle: string;    // "solid" | "double" | "dashed" | "none"
  shadow: string;         // CSS box-shadow
  photoTreatment: 'none' | 'editorial' | 'polaroid' | 'tilted' | 'halftone';
}

export interface FXTokens {
  backgroundTexture: string;  // CSS background (gradient / pattern)
  noiseOpacity: number;       // 0–0.15 SVG noise grain on top
  glowColor: string;          // neon/glow color
  glowIntensity: number;      // 0–1
  particleColor: string;      // CinematicMotionReveal particle tint
  particleOpacity: number;    // 0–0.25
  overlayBlend: string;       // CSS mix-blend-mode for overlays
  paperStyle: string;         // CSS background for paper texture layer
}

export interface MotionTokens {
  revealDuration: string;     // "3s" | "5s" etc — matches CinematicMotionReveal
  revealEasing: string;       // CSS easing string
  transitionSpeed: string;    // base element transition ("0.2s" | "0.4s")
  sweepOpacity: number;       // 0–0.4 light sweep intensity
}

export interface ButtonTokens {
  radius: string;
  style: 'solid' | 'outline' | 'ghost' | 'stamp';
  textTransform: 'uppercase' | 'none' | 'capitalize';
  fontWeight: number;
  letterSpacing: string;
}

export interface BadgeTokens {
  radius: string;
  style: 'pill' | 'square' | 'tag' | 'sticker';
  borderWeight: string;
}

/** Optional collage-layer tokens (Pop Collage / Retro Zine only) */
export interface CollageTokens {
  allowRotation: boolean;
  maxRotationDeg: number;   // ±N degrees on mini images
  stickerPack: string;      // "none" | "retro-hearts" | "star-burst" | "tape-classic"
  tapeColor: string;
  doodleStyle: string;      // "none" | "marker" | "chalk" | "stamp"
}

// ── Full manifest ─────────────────────────────────────────────────────────────

export interface ThemeManifest {
  id: string;
  name: string;
  description: string;
  /** Editorial era tag — used by the resolver for genre/issue matching */
  era: 'classic' | 'golden' | 'street' | 'digital' | 'future';
  /** Primary mood — used for AI recommendation (v3) */
  mood: 'elegant' | 'gritty' | 'playful' | 'energetic' | 'premium' | 'retro' | 'minimal';
  /** Genres this theme naturally suits (loose match, not a hard lock) */
  genreAffinity: string[];
  /** True for themes that require higher membership tiers to unlock */
  tierMinimum?: 'FREE' | 'PRO' | 'RUBY' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

  typography: TypographyTokens;
  palette: PaletteTokens;
  frame: FrameTokens;
  fx: FXTokens;
  motion: MotionTokens;
  buttons: ButtonTokens;
  badges: BadgeTokens;
  collage?: CollageTokens;
}

// ── 10 launch archetypes ──────────────────────────────────────────────────────

const TMI_DEFAULT: ThemeManifest = {
  id: 'tmi-default',
  name: 'TMI Dark Neon',
  description: 'The native TMI palette. Dark space, cyan/fuchsia/gold neon.',
  era: 'digital',
  mood: 'energetic',
  genreAffinity: ['Hip-Hop', 'R&B', 'Pop', 'EDM', 'Dance'],
  typography: {
    fontDisplay: "'Inter', 'Helvetica Neue', sans-serif",
    fontBody:    "'Inter', 'Helvetica Neue', sans-serif",
    fontAccent:  "'Inter', 'Helvetica Neue', sans-serif",
    weightDisplay: 900,
    weightBody: 400,
    letterSpacing: '-0.01em',
    textTransform: 'none',
    lineHeight: '1.5',
  },
  palette: {
    background: '#050510',
    surface: 'rgba(10,6,20,0.85)',
    surfaceAlt: 'rgba(255,255,255,0.04)',
    accent: '#00FFFF',
    accentAlt: '#FF2DAA',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.5)',
    border: 'rgba(0,255,255,0.18)',
    overlay: 'rgba(5,5,16,0.88)',
    ink: '#AA2DFF',
  },
  frame: {
    radius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    shadow: '0 4px 24px rgba(0,0,0,0.6)',
    photoTreatment: 'none',
  },
  fx: {
    backgroundTexture: 'radial-gradient(circle at 20% 20%, rgba(0,255,255,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,45,170,0.06) 0%, transparent 50%)',
    noiseOpacity: 0.04,
    glowColor: '#00FFFF',
    glowIntensity: 0.5,
    particleColor: '#00FFFF',
    particleOpacity: 0.1,
    overlayBlend: 'screen',
    paperStyle: 'none',
  },
  motion: {
    revealDuration: '5s',
    revealEasing: 'cubic-bezier(0.22,1,0.36,1)',
    transitionSpeed: '0.25s',
    sweepOpacity: 0.22,
  },
  buttons: {
    radius: '8px',
    style: 'solid',
    textTransform: 'uppercase',
    fontWeight: 900,
    letterSpacing: '0.06em',
  },
  badges: { radius: '999px', style: 'pill', borderWeight: '1px' },
};

const HERITAGE_EDITORIAL: ThemeManifest = {
  id: 'heritage-editorial',
  name: 'Heritage Editorial',
  description: 'Timeless prestige. Elegant serifs, monochrome + gold, wide negative space.',
  era: 'classic',
  mood: 'elegant',
  genreAffinity: ['Gospel', 'Jazz', 'Blues', 'Orchestra', 'Soul', 'Classical'],
  tierMinimum: 'RUBY',
  typography: {
    fontDisplay: "Georgia, 'Times New Roman', serif",
    fontBody:    "Georgia, 'Times New Roman', serif",
    fontAccent:  "'Helvetica Neue', Arial, sans-serif",
    weightDisplay: 700,
    weightBody: 400,
    letterSpacing: '0.02em',
    textTransform: 'none',
    lineHeight: '1.75',
  },
  palette: {
    background: '#0e0c09',
    surface: 'rgba(20,18,14,0.92)',
    surfaceAlt: 'rgba(255,215,0,0.04)',
    accent: '#C8A84B',
    accentAlt: '#E8D5A0',
    text: '#F0EBE1',
    textMuted: 'rgba(240,235,225,0.5)',
    border: 'rgba(200,168,75,0.22)',
    overlay: 'rgba(14,12,9,0.90)',
    ink: '#C8A84B',
  },
  frame: {
    radius: '2px',
    borderWidth: '1px',
    borderStyle: 'solid',
    shadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,168,75,0.1)',
    photoTreatment: 'editorial',
  },
  fx: {
    backgroundTexture: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(200,168,75,0.03) 40px, rgba(200,168,75,0.03) 41px)',
    noiseOpacity: 0.06,
    glowColor: '#C8A84B',
    glowIntensity: 0.3,
    particleColor: '#C8A84B',
    particleOpacity: 0.06,
    overlayBlend: 'multiply',
    paperStyle: 'linear-gradient(135deg, rgba(255,245,220,0.03) 0%, transparent 100%)',
  },
  motion: {
    revealDuration: '4s',
    revealEasing: 'cubic-bezier(0.16,1,0.3,1)',
    transitionSpeed: '0.4s',
    sweepOpacity: 0.12,
  },
  buttons: { radius: '2px', style: 'outline', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.14em' },
  badges: { radius: '2px', style: 'square', borderWeight: '1px' },
};

const STREET_ENERGY: ThemeManifest = {
  id: 'street-energy',
  name: 'Street Energy',
  description: 'Bold, aggressive, raw. Full-bleed images, stamp-on typography, hard shadows.',
  era: 'street',
  mood: 'gritty',
  genreAffinity: ['Hip-Hop', 'Rap', 'R&B', 'Funk', 'Reggae', 'Dancehall'],
  tierMinimum: 'PRO',
  typography: {
    fontDisplay: "'Arial Black', 'Helvetica Neue', 'Impact', sans-serif",
    fontBody:    "'Helvetica Neue', Arial, sans-serif",
    fontAccent:  "'Arial Black', 'Impact', sans-serif",
    weightDisplay: 900,
    weightBody: 400,
    letterSpacing: '-0.02em',
    textTransform: 'uppercase',
    lineHeight: '1.2',
  },
  palette: {
    background: '#080808',
    surface: 'rgba(12,12,12,0.95)',
    surfaceAlt: 'rgba(255,255,255,0.04)',
    accent: '#00C8FF',
    accentAlt: '#FF3030',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.55)',
    border: 'rgba(0,200,255,0.2)',
    overlay: 'rgba(8,8,8,0.92)',
    ink: '#FF3030',
  },
  frame: {
    radius: '0px',
    borderWidth: '2px',
    borderStyle: 'solid',
    shadow: '6px 6px 0px rgba(0,200,255,0.4)',
    photoTreatment: 'none',
  },
  fx: {
    backgroundTexture: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 8px)',
    noiseOpacity: 0.08,
    glowColor: '#00C8FF',
    glowIntensity: 0.6,
    particleColor: '#00C8FF',
    particleOpacity: 0.12,
    overlayBlend: 'screen',
    paperStyle: 'none',
  },
  motion: {
    revealDuration: '3s',
    revealEasing: 'cubic-bezier(0.4,0,0.2,1)',
    transitionSpeed: '0.15s',
    sweepOpacity: 0.3,
  },
  buttons: { radius: '0px', style: 'solid', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.04em' },
  badges: { radius: '0px', style: 'square', borderWeight: '2px' },
};

const POP_COLLAGE: ThemeManifest = {
  id: 'pop-collage',
  name: 'Pop Collage',
  description: 'Chaotic, youthful, fun. Rotated photos, stickers, tape, handwritten text.',
  era: 'golden',
  mood: 'playful',
  genreAffinity: ['Pop', 'Dance Crews', 'Comedy', 'Latin'],
  tierMinimum: 'Silver',
  typography: {
    fontDisplay: "'Arial Black', 'Comic Sans MS', 'Helvetica Neue', sans-serif",
    fontBody:    "'Helvetica Neue', Arial, sans-serif",
    fontAccent:  "'Arial Black', 'Impact', sans-serif",
    weightDisplay: 900,
    weightBody: 400,
    letterSpacing: '0em',
    textTransform: 'none',
    lineHeight: '1.4',
  },
  palette: {
    background: '#1a0a1f',
    surface: 'rgba(30,10,40,0.92)',
    surfaceAlt: 'rgba(255,50,200,0.06)',
    accent: '#FF38C8',
    accentAlt: '#FFE000',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.6)',
    border: 'rgba(255,56,200,0.3)',
    overlay: 'rgba(26,10,31,0.88)',
    ink: '#00F0FF',
  },
  frame: {
    radius: '4px',
    borderWidth: '2px',
    borderStyle: 'solid',
    shadow: '3px 3px 0px rgba(255,56,200,0.4), -1px -1px 0px rgba(255,224,0,0.3)',
    photoTreatment: 'tilted',
  },
  fx: {
    backgroundTexture: 'radial-gradient(circle at 15% 20%, rgba(255,56,200,0.1) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(0,240,255,0.08) 0%, transparent 40%)',
    noiseOpacity: 0.05,
    glowColor: '#FF38C8',
    glowIntensity: 0.7,
    particleColor: '#FFE000',
    particleOpacity: 0.18,
    overlayBlend: 'screen',
    paperStyle: 'none',
  },
  motion: {
    revealDuration: '2.5s',
    revealEasing: 'cubic-bezier(0.34,1.56,0.64,1)',
    transitionSpeed: '0.2s',
    sweepOpacity: 0.28,
  },
  buttons: { radius: '999px', style: 'solid', textTransform: 'none', fontWeight: 900, letterSpacing: '0em' },
  badges: { radius: '999px', style: 'sticker', borderWeight: '2px' },
  collage: {
    allowRotation: true,
    maxRotationDeg: 5,
    stickerPack: 'retro-hearts',
    tapeColor: 'rgba(255,220,100,0.7)',
    doodleStyle: 'marker',
  },
};

const RETRO_ZINE: ThemeManifest = {
  id: 'retro-zine',
  name: 'Retro Zine',
  description: 'DIY underground. Typewriter mono, 2-color, halftone dots, newsprint feel.',
  era: 'golden',
  mood: 'retro',
  genreAffinity: ['Rock', 'Metal', 'Indie', 'Country', 'Blues'],
  tierMinimum: 'PRO',
  typography: {
    fontDisplay: "'Courier New', 'Courier', monospace",
    fontBody:    "'Courier New', 'Courier', monospace",
    fontAccent:  "'Courier New', monospace",
    weightDisplay: 700,
    weightBody: 400,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    lineHeight: '1.6',
  },
  palette: {
    background: '#0f0e09',
    surface: 'rgba(16,15,10,0.96)',
    surfaceAlt: 'rgba(255,220,60,0.04)',
    accent: '#F5D020',
    accentAlt: '#E8360C',
    text: '#E8E0C8',
    textMuted: 'rgba(232,224,200,0.5)',
    border: 'rgba(245,208,32,0.25)',
    overlay: 'rgba(15,14,9,0.93)',
    ink: '#E8360C',
  },
  frame: {
    radius: '0px',
    borderWidth: '2px',
    borderStyle: 'dashed',
    shadow: 'none',
    photoTreatment: 'halftone',
  },
  fx: {
    backgroundTexture: 'repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(245,208,32,0.04) 18px, rgba(245,208,32,0.04) 19px), repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(245,208,32,0.02) 18px, rgba(245,208,32,0.02) 19px)',
    noiseOpacity: 0.12,
    glowColor: '#F5D020',
    glowIntensity: 0.2,
    particleColor: '#F5D020',
    particleOpacity: 0.08,
    overlayBlend: 'multiply',
    paperStyle: 'linear-gradient(135deg, rgba(245,230,180,0.06) 0%, rgba(245,220,100,0.02) 100%)',
  },
  motion: {
    revealDuration: '2s',
    revealEasing: 'steps(8, end)',
    transitionSpeed: '0.1s',
    sweepOpacity: 0.1,
  },
  buttons: { radius: '0px', style: 'outline', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' },
  badges: { radius: '0px', style: 'tag', borderWeight: '2px' },
};

const MODERN_LUXURY: ThemeManifest = {
  id: 'modern-luxury',
  name: 'Modern Luxury',
  description: 'Glass morphism, holographic accents, premium negative space.',
  era: 'digital',
  mood: 'minimal',
  genreAffinity: ['R&B', 'Soul', 'Pop', 'Jazz', 'Electronic'],
  tierMinimum: 'Gold',
  typography: {
    fontDisplay: "'Helvetica Neue', 'Arial', sans-serif",
    fontBody:    "'Helvetica Neue', 'Arial', sans-serif",
    fontAccent:  "'Helvetica Neue', sans-serif",
    weightDisplay: 300,
    weightBody: 300,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    lineHeight: '1.65',
  },
  palette: {
    background: '#08060f',
    surface: 'rgba(255,255,255,0.05)',
    surfaceAlt: 'rgba(255,255,255,0.08)',
    accent: '#C4A0FF',
    accentAlt: '#70F0DC',
    text: '#F0F0F8',
    textMuted: 'rgba(240,240,248,0.45)',
    border: 'rgba(196,160,255,0.15)',
    overlay: 'rgba(8,6,15,0.86)',
    ink: '#C4A0FF',
  },
  frame: {
    radius: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    shadow: '0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
    photoTreatment: 'editorial',
  },
  fx: {
    backgroundTexture: 'radial-gradient(ellipse at 30% 30%, rgba(196,160,255,0.08) 0%, transparent 55%), radial-gradient(ellipse at 70% 70%, rgba(112,240,220,0.06) 0%, transparent 55%)',
    noiseOpacity: 0.03,
    glowColor: '#C4A0FF',
    glowIntensity: 0.4,
    particleColor: '#C4A0FF',
    particleOpacity: 0.08,
    overlayBlend: 'screen',
    paperStyle: 'none',
  },
  motion: {
    revealDuration: '6s',
    revealEasing: 'cubic-bezier(0.05,0.7,0.1,1)',
    transitionSpeed: '0.45s',
    sweepOpacity: 0.14,
  },
  buttons: { radius: '2px', style: 'ghost', textTransform: 'uppercase', fontWeight: 300, letterSpacing: '0.14em' },
  badges: { radius: '2px', style: 'square', borderWeight: '1px' },
};

const CONCERT_NIGHT: ThemeManifest = {
  id: 'concert-night',
  name: 'Concert Night',
  description: 'Stage lighting, lens flares, crowd silhouettes, smoke.',
  era: 'digital',
  mood: 'energetic',
  genreAffinity: ['Rock', 'Pop', 'EDM', 'Hip-Hop', 'Country', 'Metal'],
  tierMinimum: 'Silver',
  typography: {
    fontDisplay: "'Impact', 'Arial Black', sans-serif",
    fontBody:    "'Helvetica Neue', Arial, sans-serif",
    fontAccent:  "'Impact', sans-serif",
    weightDisplay: 900,
    weightBody: 400,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    lineHeight: '1.3',
  },
  palette: {
    background: '#020408',
    surface: 'rgba(4,6,14,0.94)',
    surfaceAlt: 'rgba(255,160,0,0.05)',
    accent: '#FF8C00',
    accentAlt: '#00AAFF',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.5)',
    border: 'rgba(255,140,0,0.2)',
    overlay: 'rgba(2,4,8,0.92)',
    ink: '#FF4400',
  },
  frame: {
    radius: '4px',
    borderWidth: '1px',
    borderStyle: 'solid',
    shadow: '0 0 40px rgba(255,140,0,0.15), 0 8px 32px rgba(0,0,0,0.8)',
    photoTreatment: 'none',
  },
  fx: {
    backgroundTexture: 'radial-gradient(ellipse at 50% 0%, rgba(255,140,0,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 100%, rgba(0,170,255,0.08) 0%, transparent 50%)',
    noiseOpacity: 0.06,
    glowColor: '#FF8C00',
    glowIntensity: 0.65,
    particleColor: '#FF8C00',
    particleOpacity: 0.14,
    overlayBlend: 'screen',
    paperStyle: 'none',
  },
  motion: {
    revealDuration: '4s',
    revealEasing: 'cubic-bezier(0.22,1,0.36,1)',
    transitionSpeed: '0.2s',
    sweepOpacity: 0.35,
  },
  buttons: { radius: '4px', style: 'solid', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.06em' },
  badges: { radius: '4px', style: 'pill', borderWeight: '1px' },
};

const AWARD_NIGHT: ThemeManifest = {
  id: 'award-night',
  name: 'Award Night',
  description: 'Black marble, gold foil, spotlight lighting, trophy presentation.',
  era: 'classic',
  mood: 'premium',
  genreAffinity: ['Gospel', 'R&B', 'Soul', 'Jazz', 'Pop', 'Hip-Hop'],
  tierMinimum: 'Gold',
  typography: {
    fontDisplay: "Georgia, 'Times New Roman', serif",
    fontBody:    "'Helvetica Neue', Arial, sans-serif",
    fontAccent:  "'Helvetica Neue', Arial, sans-serif",
    weightDisplay: 700,
    weightBody: 300,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    lineHeight: '1.5',
  },
  palette: {
    background: '#060504',
    surface: 'rgba(12,10,8,0.96)',
    surfaceAlt: 'rgba(255,215,0,0.06)',
    accent: '#FFD700',
    accentAlt: '#C8A84B',
    text: '#F5E8C8',
    textMuted: 'rgba(245,232,200,0.5)',
    border: 'rgba(255,215,0,0.2)',
    overlay: 'rgba(6,5,4,0.94)',
    ink: '#FFD700',
  },
  frame: {
    radius: '2px',
    borderWidth: '1px',
    borderStyle: 'solid',
    shadow: '0 0 0 1px rgba(255,215,0,0.15), 0 16px 64px rgba(0,0,0,0.8)',
    photoTreatment: 'editorial',
  },
  fx: {
    backgroundTexture: 'radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.12) 0%, transparent 50%), repeating-linear-gradient(135deg, rgba(255,215,0,0.02) 0px, rgba(255,215,0,0.02) 1px, transparent 1px, transparent 14px)',
    noiseOpacity: 0.05,
    glowColor: '#FFD700',
    glowIntensity: 0.55,
    particleColor: '#FFD700',
    particleOpacity: 0.12,
    overlayBlend: 'screen',
    paperStyle: 'linear-gradient(135deg, rgba(255,215,0,0.04) 0%, transparent 100%)',
  },
  motion: {
    revealDuration: '5.5s',
    revealEasing: 'cubic-bezier(0.16,1,0.3,1)',
    transitionSpeed: '0.4s',
    sweepOpacity: 0.25,
  },
  buttons: { radius: '2px', style: 'solid', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.12em' },
  badges: { radius: '2px', style: 'square', borderWeight: '1px' },
};

const NEON_FUTURE: ThemeManifest = {
  id: 'neon-future',
  name: 'Neon Future',
  description: 'Holographic gradients, glowing edges, animated light streaks.',
  era: 'future',
  mood: 'energetic',
  genreAffinity: ['EDM', 'Electronic', 'Dance Crews', 'Hip Hop Dance'],
  tierMinimum: 'Silver',
  typography: {
    fontDisplay: "'Helvetica Neue', 'Impact', Arial, sans-serif",
    fontBody:    "'Helvetica Neue', Arial, sans-serif",
    fontAccent:  "'Helvetica Neue', sans-serif",
    weightDisplay: 900,
    weightBody: 400,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    lineHeight: '1.25',
  },
  palette: {
    background: '#030010',
    surface: 'rgba(6,0,22,0.92)',
    surfaceAlt: 'rgba(0,255,200,0.05)',
    accent: '#00FFC8',
    accentAlt: '#CC00FF',
    text: '#EEFFFC',
    textMuted: 'rgba(238,255,252,0.45)',
    border: 'rgba(0,255,200,0.2)',
    overlay: 'rgba(3,0,16,0.92)',
    ink: '#CC00FF',
  },
  frame: {
    radius: '6px',
    borderWidth: '1px',
    borderStyle: 'solid',
    shadow: '0 0 30px rgba(0,255,200,0.2), 0 0 60px rgba(204,0,255,0.1)',
    photoTreatment: 'none',
  },
  fx: {
    backgroundTexture: 'conic-gradient(from 200deg at 50% 50%, rgba(0,255,200,0.06), transparent 30%, rgba(204,0,255,0.06), transparent 60%, rgba(0,100,255,0.04), transparent)',
    noiseOpacity: 0.04,
    glowColor: '#00FFC8',
    glowIntensity: 0.8,
    particleColor: '#00FFC8',
    particleOpacity: 0.16,
    overlayBlend: 'screen',
    paperStyle: 'none',
  },
  motion: {
    revealDuration: '4.5s',
    revealEasing: 'cubic-bezier(0.22,1,0.36,1)',
    transitionSpeed: '0.18s',
    sweepOpacity: 0.38,
  },
  buttons: { radius: '6px', style: 'solid', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.06em' },
  badges: { radius: '6px', style: 'pill', borderWeight: '1px' },
};

const HALL_OF_FAME: ThemeManifest = {
  id: 'hall-of-fame',
  name: 'Hall of Fame',
  description: 'Museum-grade presentation. Engraved plates, spotlight, premium framing.',
  era: 'classic',
  mood: 'premium',
  genreAffinity: [], // genre-agnostic — used for special editions
  tierMinimum: 'Diamond',
  typography: {
    fontDisplay: "Georgia, 'Times New Roman', serif",
    fontBody:    "Georgia, serif",
    fontAccent:  "'Helvetica Neue', Arial, sans-serif",
    weightDisplay: 700,
    weightBody: 400,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    lineHeight: '1.7',
  },
  palette: {
    background: '#050304',
    surface: 'rgba(10,7,5,0.96)',
    surfaceAlt: 'rgba(255,220,100,0.04)',
    accent: '#E8C96A',
    accentAlt: '#FFFFFF',
    text: '#F2EAD8',
    textMuted: 'rgba(242,234,216,0.45)',
    border: 'rgba(232,201,106,0.18)',
    overlay: 'rgba(5,3,4,0.95)',
    ink: '#E8C96A',
  },
  frame: {
    radius: '0px',
    borderWidth: '2px',
    borderStyle: 'double',
    shadow: '0 0 0 4px rgba(232,201,106,0.08), 0 20px 80px rgba(0,0,0,0.9)',
    photoTreatment: 'editorial',
  },
  fx: {
    backgroundTexture: 'radial-gradient(ellipse at 50% 20%, rgba(232,201,106,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(232,201,106,0.05) 0%, transparent 40%)',
    noiseOpacity: 0.04,
    glowColor: '#E8C96A',
    glowIntensity: 0.45,
    particleColor: '#E8C96A',
    particleOpacity: 0.08,
    overlayBlend: 'multiply',
    paperStyle: 'linear-gradient(180deg, rgba(232,201,106,0.04) 0%, transparent 100%)',
  },
  motion: {
    revealDuration: '7s',
    revealEasing: 'cubic-bezier(0.05,0.7,0.1,1)',
    transitionSpeed: '0.55s',
    sweepOpacity: 0.18,
  },
  buttons: { radius: '0px', style: 'outline', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.18em' },
  badges: { radius: '0px', style: 'square', borderWeight: '2px' },
};

// ── Registry ──────────────────────────────────────────────────────────────────

export const THEME_REGISTRY: Record<string, ThemeManifest> = {
  'tmi-default':         TMI_DEFAULT,
  'heritage-editorial':  HERITAGE_EDITORIAL,
  'street-energy':       STREET_ENERGY,
  'pop-collage':         POP_COLLAGE,
  'retro-zine':          RETRO_ZINE,
  'modern-luxury':       MODERN_LUXURY,
  'concert-night':       CONCERT_NIGHT,
  'award-night':         AWARD_NIGHT,
  'neon-future':         NEON_FUTURE,
  'hall-of-fame':        HALL_OF_FAME,
};

export function getTheme(id: string): ThemeManifest {
  return THEME_REGISTRY[id] ?? THEME_REGISTRY['tmi-default'];
}

export function getAllThemeIds(): string[] {
  return Object.keys(THEME_REGISTRY);
}

/**
 * Returns the IDs of themes accessible at a given membership tier.
 * Rule 19 / marketplace gate — tier restricts which themes can be picked.
 */
const TIER_ORDER = ['FREE', 'PRO', 'RUBY', 'Silver', 'Gold', 'Platinum', 'Diamond'] as const;
type PerformerTier = typeof TIER_ORDER[number];

export function getAccessibleThemes(tier: PerformerTier): ThemeManifest[] {
  const tierIndex = TIER_ORDER.indexOf(tier);
  return Object.values(THEME_REGISTRY).filter((t) => {
    if (!t.tierMinimum) return true; // no restriction
    const minIndex = TIER_ORDER.indexOf(t.tierMinimum as PerformerTier);
    return tierIndex >= minIndex;
  });
}
