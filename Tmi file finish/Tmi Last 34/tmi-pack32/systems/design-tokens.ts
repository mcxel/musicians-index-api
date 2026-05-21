// apps/web/src/config/design-tokens.ts
// TMI Visual Design System — extracted from magazine PDFs
// All pages MUST use these tokens. Never hardcode values.

export const TMI = {
  // ── COLORS ─────────────────────────────────────────────
  colors: {
    // Backgrounds
    void:     "#0D0520",  // page root — deepest bg
    deep:     "#150830",  // section backgrounds
    card:     "#1E0D3E",  // card surface
    raised:   "#2A1452",  // elevated cards
    overlay:  "#3D1E78",  // hover/active overlay

    // Neon accents (from magazine images)
    cyan:     "#00E5FF",  // primary action, LIVE badges, borders
    cyanDim:  "#00A3B5",  // secondary cyan
    gold:     "#FFB800",  // labels, rankings, section headers
    goldBright:"#FFD700", // crown, winner, hero accents
    pink:     "#FF2D78",  // hot events, trending, alerts
    pinkDim:  "#B51F55",
    purple:   "#7B2FBE",  // editorial, sponsor
    purpleLight:"#9B4FE8",
    teal:     "#00C896",  // discovery, genre, green states
    amber:    "#FF8C00",  // booking, "hot" state

    // Text
    textPrimary:   "#FFFFFF",
    textSecondary: "#C8A8E8",
    textMuted:     "#7A5F9A",
    textGold:      "#FFB800",
    textCyan:      "#00E5FF",

    // Status
    liveRed:  "#FF2020",
    online:   "#00FF88",
    offline:  "#555570",
  },

  // ── FONTS ───────────────────────────────────────────────
  fonts: {
    display: "'Bebas Neue', Impact, sans-serif",  // hero headers
    heading: "'Oswald', 'Arial Narrow', sans-serif",  // card titles
    body:    "'Inter', sans-serif",               // body text
  },

  // ── FONT SIZES ──────────────────────────────────────────
  text: {
    displayXl: { fontSize: 72, fontWeight: 700, letterSpacing: 2, lineHeight: 1 },
    displayLg: { fontSize: 48, fontWeight: 700, letterSpacing: 2, lineHeight: 1 },
    displayMd: { fontSize: 36, fontWeight: 700, letterSpacing: 1, lineHeight: 1.1 },
    headingXl: { fontSize: 28, fontWeight: 700, lineHeight: 1.2 },
    headingLg: { fontSize: 22, fontWeight: 600, lineHeight: 1.3 },
    headingMd: { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
    label:     { fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" as const },
    body:      { fontSize: 15, fontWeight: 400, lineHeight: 1.7 },
    bodySm:    { fontSize: 13, fontWeight: 400, lineHeight: 1.5 },
  },

  // ── SPACING ─────────────────────────────────────────────
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 },

  // ── BORDERS + GLOW ──────────────────────────────────────
  border: {
    card:    "1px solid rgba(0, 229, 255, 0.25)",
    active:  "1px solid rgba(0, 229, 255, 0.8)",
    gold:    "1px solid rgba(255, 184, 0, 0.6)",
    pink:    "1px solid rgba(255, 45, 120, 0.6)",
    subtle:  "1px solid rgba(255, 255, 255, 0.08)",
  },
  glow: {
    cyan:    "0 0 12px rgba(0, 229, 255, 0.4)",
    gold:    "0 0 14px rgba(255, 184, 0, 0.45)",
    pink:    "0 0 12px rgba(255, 45, 120, 0.4)",
    purple:  "0 0 16px rgba(123, 47, 190, 0.5)",
  },

  // ── RADIUS ──────────────────────────────────────────────
  radius: { sm: 6, md: 8, lg: 12, xl: 16, pill: 999 },

  // ── LAYOUT DENSITY ──────────────────────────────────────
  // Use these to control how crowded a page feels
  density: {
    compact:    { padding: 12, gap: 8,  cardPad: 12 },
    standard:   { padding: 24, gap: 16, cardPad: 20 },
    immersive:  { padding: 32, gap: 24, cardPad: 24 },
    broadcast:  { padding: 0,  gap: 0,  cardPad: 0  },  // full-bleed live stage
    editorial:  { padding: 48, gap: 32, cardPad: 28 },  // magazine reading
  },

  // ── SPLIT RULE ──────────────────────────────────────────
  // When a page has > 5 content zones, split into child routes.
  // This prevents visual clutter and keeps pages scannable.
  splitThreshold: 5,
} as const;

export type TMIColor = keyof typeof TMI.colors;
export type TMIDensity = keyof typeof TMI.density;
