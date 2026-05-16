// DEV ONLY — in-memory talent radar. Resets on server restart.

export type TalentBubble = {
  id: string;
  name: string;
  genre: string;
  region: string;
  // Funnel-derived metrics (0-1)
  heatScore: number;          // 0-100, drives bubble size
  completionRate: number;
  likeRate: number;
  fanConversionRate: number;
  // Platform state
  isLive: boolean;
  reliabilityScore: number;   // 0-1 (show-up rate)
  // Anti-hog
  monthsAtTop: number;
  bookingCooldown: boolean;
  // Display overrides (anti-hog applied)
  displayOpacity: number;     // 1 → 0.4 on cooldown
  displayScale: number;       // 1 → 0.7 on cooldown
};

// ─── In-memory registry ───────────────────────────────────────────────────────

const registry = new Map<string, TalentBubble>();

function applyAntiHog(b: TalentBubble): TalentBubble {
  const cooldown = b.monthsAtTop >= 2;
  return {
    ...b,
    bookingCooldown: cooldown,
    displayOpacity: cooldown ? 0.4 : 1,
    displayScale: cooldown ? 0.7 : 1,
  };
}

// ─── Seed data (12 performers, varied stats) ──────────────────────────────────

const SEED: Omit<TalentBubble, "bookingCooldown" | "displayOpacity" | "displayScale">[] = [
  { id: "milo-spark",   name: "Milo Spark",    genre: "Hip Hop",    region: "East",     heatScore: 88, completionRate: 0.91, likeRate: 0.74, fanConversionRate: 0.38, isLive: true,  reliabilityScore: 0.96, monthsAtTop: 0 },
  { id: "kira-bloom",   name: "Kira Bloom",    genre: "R&B",        region: "South",    heatScore: 82, completionRate: 0.85, likeRate: 0.68, fanConversionRate: 0.31, isLive: false, reliabilityScore: 0.88, monthsAtTop: 1 },
  { id: "tessa-glint",  name: "Tessa Glint",   genre: "Electronic", region: "West",     heatScore: 79, completionRate: 0.78, likeRate: 0.81, fanConversionRate: 0.27, isLive: true,  reliabilityScore: 0.92, monthsAtTop: 0 },
  { id: "kai-zenith",   name: "Kai Zenith",    genre: "Hip Hop",    region: "Midwest",  heatScore: 74, completionRate: 0.71, likeRate: 0.62, fanConversionRate: 0.24, isLive: false, reliabilityScore: 0.84, monthsAtTop: 3 },
  { id: "rio-lux",      name: "Rio Lux",       genre: "R&B",        region: "South",    heatScore: 69, completionRate: 0.68, likeRate: 0.57, fanConversionRate: 0.19, isLive: false, reliabilityScore: 0.78, monthsAtTop: 0 },
  { id: "nova-rift",    name: "Nova Rift",     genre: "Electronic", region: "West",     heatScore: 65, completionRate: 0.74, likeRate: 0.66, fanConversionRate: 0.22, isLive: true,  reliabilityScore: 0.90, monthsAtTop: 1 },
  { id: "jax-onyx",     name: "Jax Onyx",      genre: "Rock",       region: "East",     heatScore: 61, completionRate: 0.63, likeRate: 0.59, fanConversionRate: 0.16, isLive: false, reliabilityScore: 0.82, monthsAtTop: 0 },
  { id: "zeno-blaze",   name: "Zeno Blaze",    genre: "Hip Hop",    region: "West",     heatScore: 57, completionRate: 0.61, likeRate: 0.54, fanConversionRate: 0.14, isLive: false, reliabilityScore: 0.75, monthsAtTop: 2 },
  { id: "mira-zen",     name: "Mira Zen",      genre: "R&B",        region: "South",    heatScore: 54, completionRate: 0.58, likeRate: 0.51, fanConversionRate: 0.12, isLive: true,  reliabilityScore: 0.80, monthsAtTop: 0 },
  { id: "atlas-riff",   name: "Atlas Riff",    genre: "Rock",       region: "Midwest",  heatScore: 48, completionRate: 0.52, likeRate: 0.48, fanConversionRate: 0.10, isLive: false, reliabilityScore: 0.70, monthsAtTop: 0 },
  { id: "drax-tone",    name: "Drax Tone",     genre: "Hip Hop",    region: "East",     heatScore: 43, completionRate: 0.49, likeRate: 0.44, fanConversionRate: 0.09, isLive: false, reliabilityScore: 0.66, monthsAtTop: 4 },
  { id: "axel-volt",    name: "Axel Volt",     genre: "Electronic", region: "West",     heatScore: 38, completionRate: 0.44, likeRate: 0.39, fanConversionRate: 0.07, isLive: false, reliabilityScore: 0.72, monthsAtTop: 0 },
];

// Seed on module load
SEED.forEach((s) => {
  registry.set(s.id, applyAntiHog({ ...s, bookingCooldown: false, displayOpacity: 1, displayScale: 1 }));
});

// ─── Public API ───────────────────────────────────────────────────────────────

export function listBubbles(): TalentBubble[] {
  return Array.from(registry.values());
}

export function getBubble(id: string): TalentBubble | null {
  return registry.get(id) ?? null;
}

export function updateFromFunnel(
  id: string,
  completionRate: number,
  likeRate: number,
  fanConversionRate: number,
): void {
  const b = registry.get(id);
  if (!b) return;
  const heat = Math.round(completionRate * 40 + likeRate * 30 + fanConversionRate * 100 * 0.3);
  registry.set(id, applyAntiHog({ ...b, completionRate, likeRate, fanConversionRate, heatScore: Math.min(100, heat) }));
}

export function setLiveStatus(id: string, isLive: boolean): void {
  const b = registry.get(id);
  if (!b) return;
  registry.set(id, { ...b, isLive });
}

export function registerBubble(bubble: Omit<TalentBubble, "bookingCooldown" | "displayOpacity" | "displayScale">): void {
  registry.set(bubble.id, applyAntiHog({ ...bubble, bookingCooldown: false, displayOpacity: 1, displayScale: 1 }));
}

export const GENRE_COLORS: Record<string, string> = {
  "Hip Hop":    "#00ffff",
  "Hip-Hop":    "#00ffff",
  "R&B":        "#ff2daa",
  "Electronic": "#a855f7",
  "EDM":        "#a855f7",
  "Rock":       "#ffd700",
  "Pop":        "#22c55e",
  "Jazz":       "#f97316",
  "Soul":       "#f97316",
  "Afrobeat":   "#ff8c00",
  "Local":      "#94a3b8",
  "Worldwide":  "#5edfff",
  "Global":     "#5edfff",
};

export function colorForGenre(genre: string): string {
  return GENRE_COLORS[genre] ?? "#ffffff";
}
