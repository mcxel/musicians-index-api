/**
 * FullSpectrumAvatarColorSystem — §11630–§11653
 * Owner law: GIVE THEM THE WHOLE CRAYON BOX.
 * Ordinary tint = FREE. Marketplace sells design/print/material — not RGB.
 * Color change must NOT remount the avatar GLB.
 */

export const FULL_SPECTRUM_AVATAR_COLOR_SYSTEM_ID = "FULL_SPECTRUM_AVATAR_COLOR_SYSTEM_v1" as const;

export type ColorFamilyId =
  | "reds"
  | "oranges"
  | "yellows"
  | "greens"
  | "teals"
  | "cyans"
  | "blues"
  | "indigos"
  | "purples"
  | "pinks"
  | "browns"
  | "tans"
  | "beiges"
  | "cream"
  | "whites"
  | "grays"
  | "charcoal"
  | "blacks";

export type CrayonSwatch = {
  id: string;
  label: string;
  hex: string;
  family: ColorFamilyId;
  tone: "light" | "dark" | "muted" | "bright" | "pastel" | "deep" | "neutral";
};

/** Large curated crayon-box library (quick colors). Custom/spectrum remain unlimited. */
export const CRAYON_BOX_SWATCHES: CrayonSwatch[] = [
  // reds
  { id: "cherry", label: "Cherry Red", hex: "#E11D48", family: "reds", tone: "bright" },
  { id: "crimson", label: "Crimson", hex: "#9F1239", family: "reds", tone: "deep" },
  { id: "burgundy", label: "Burgundy", hex: "#7F1D1D", family: "reds", tone: "dark" },
  { id: "rose", label: "Rose", hex: "#FB7185", family: "reds", tone: "pastel" },
  { id: "brick", label: "Brick", hex: "#B91C1C", family: "reds", tone: "muted" },
  // oranges
  { id: "tangerine", label: "Tangerine", hex: "#F97316", family: "oranges", tone: "bright" },
  { id: "amber", label: "Amber", hex: "#D97706", family: "oranges", tone: "deep" },
  { id: "peach", label: "Peach", hex: "#FDBA74", family: "oranges", tone: "pastel" },
  { id: "rust", label: "Rust", hex: "#9A3412", family: "oranges", tone: "dark" },
  // yellows
  { id: "sunflower", label: "Sunflower", hex: "#FACC15", family: "yellows", tone: "bright" },
  { id: "gold", label: "Gold", hex: "#FFD700", family: "yellows", tone: "bright" },
  { id: "mustard", label: "Mustard", hex: "#CA8A04", family: "yellows", tone: "muted" },
  { id: "butter", label: "Butter", hex: "#FEF08A", family: "yellows", tone: "pastel" },
  // greens
  { id: "lime", label: "Lime", hex: "#84CC16", family: "greens", tone: "bright" },
  { id: "forest", label: "Forest", hex: "#166534", family: "greens", tone: "dark" },
  { id: "mint", label: "Mint", hex: "#6EE7B7", family: "greens", tone: "pastel" },
  { id: "olive", label: "Olive", hex: "#4D7C0F", family: "greens", tone: "muted" },
  { id: "neon_acid", label: "Neon Acid", hex: "#B8FF00", family: "greens", tone: "bright" },
  // teals / cyans
  { id: "teal", label: "Teal", hex: "#0D9488", family: "teals", tone: "deep" },
  { id: "seafoam", label: "Seafoam", hex: "#5EEAD4", family: "teals", tone: "pastel" },
  { id: "cyan", label: "Electric Cyan", hex: "#00FFFF", family: "cyans", tone: "bright" },
  { id: "sky", label: "Sky", hex: "#38BDF8", family: "cyans", tone: "light" },
  // blues
  { id: "royal_blue", label: "Royal Blue", hex: "#2563EB", family: "blues", tone: "bright" },
  { id: "navy", label: "Navy", hex: "#0A0A40", family: "blues", tone: "dark" },
  { id: "denim", label: "Denim", hex: "#1E3A5F", family: "blues", tone: "muted" },
  { id: "ice", label: "Ice Blue", hex: "#BFDBFE", family: "blues", tone: "pastel" },
  // indigos / purples
  { id: "indigo", label: "Indigo", hex: "#4338CA", family: "indigos", tone: "deep" },
  { id: "violet", label: "Violet", hex: "#7C3AED", family: "purples", tone: "bright" },
  { id: "royal_purple", label: "Royal Purple", hex: "#AA2DFF", family: "purples", tone: "bright" },
  { id: "lavender", label: "Lavender", hex: "#C4B5FD", family: "purples", tone: "pastel" },
  { id: "eggplant", label: "Eggplant", hex: "#2A0845", family: "purples", tone: "dark" },
  // pinks
  { id: "hot_pink", label: "Hot Pink", hex: "#FF2DAA", family: "pinks", tone: "bright" },
  { id: "magenta", label: "Magenta", hex: "#DB2777", family: "pinks", tone: "deep" },
  { id: "blush", label: "Blush", hex: "#F9A8D4", family: "pinks", tone: "pastel" },
  // browns / tans / beiges
  { id: "espresso", label: "Espresso", hex: "#3A2312", family: "browns", tone: "dark" },
  { id: "chestnut", label: "Chestnut", hex: "#6A4020", family: "browns", tone: "muted" },
  { id: "tan", label: "Tan", hex: "#D2B48C", family: "tans", tone: "light" },
  { id: "sand", label: "Sand", hex: "#E7C9A9", family: "beiges", tone: "pastel" },
  { id: "khaki", label: "Khaki", hex: "#A3A36B", family: "beiges", tone: "muted" },
  // neutrals
  { id: "cream", label: "Cream", hex: "#FFF7ED", family: "cream", tone: "light" },
  { id: "ivory", label: "Ivory", hex: "#FFFFF0", family: "whites", tone: "light" },
  { id: "white", label: "White", hex: "#F0F0F0", family: "whites", tone: "neutral" },
  { id: "silver", label: "Silver", hex: "#E5E7EB", family: "grays", tone: "light" },
  { id: "slate", label: "Slate", hex: "#64748B", family: "grays", tone: "muted" },
  { id: "charcoal", label: "Charcoal", hex: "#374151", family: "charcoal", tone: "dark" },
  { id: "obsidian", label: "Obsidian", hex: "#111827", family: "blacks", tone: "dark" },
  { id: "black", label: "Black", hex: "#0A0A0A", family: "blacks", tone: "neutral" },
];

export const COLOR_FAMILIES: ColorFamilyId[] = [
  "reds",
  "oranges",
  "yellows",
  "greens",
  "teals",
  "cyans",
  "blues",
  "indigos",
  "purples",
  "pinks",
  "browns",
  "tans",
  "beiges",
  "cream",
  "whites",
  "grays",
  "charcoal",
  "blacks",
];

export function crayonBoxSwatchCount(): number {
  return CRAYON_BOX_SWATCHES.length;
}

export function swatchesByFamily(family: ColorFamilyId): CrayonSwatch[] {
  return CRAYON_BOX_SWATCHES.filter((s) => s.family === family);
}

/** Normalize #RGB / #RRGGBB → #RRGGBB uppercase. Invalid → null. */
export function normalizeHexColor(input: string): string | null {
  const raw = input.trim();
  const m3 = /^#([0-9a-fA-F]{3})$/.exec(raw);
  if (m3) {
    const [r, g, b] = m3[1]!.split("");
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  const m6 = /^#([0-9a-fA-F]{6})$/.exec(raw);
  if (m6) return `#${m6[1]}`.toUpperCase();
  return null;
}

export function isRenderSafeHex(hex: string): boolean {
  return normalizeHexColor(hex) != null;
}

export type ColorPickerMode = "QUICK" | "SPECTRUM" | "CUSTOM" | "RECENT" | "SAVED";

const RECENT_KEY = "tmi_avatar_recent_colors_v1";
const SAVED_KEY = "tmi_avatar_saved_colors_v1";

function readHexList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .map((x) => (typeof x === "string" ? normalizeHexColor(x) : null))
      .filter((x): x is string => Boolean(x))
      .slice(0, 24);
  } catch {
    return [];
  }
}

function writeHexList(key: string, hexes: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(hexes.slice(0, 24)));
  } catch {
    /* ignore quota */
  }
}

export function pushRecentColor(hex: string): string[] {
  const n = normalizeHexColor(hex);
  if (!n) return readHexList(RECENT_KEY);
  const next = [n, ...readHexList(RECENT_KEY).filter((h) => h !== n)].slice(0, 16);
  writeHexList(RECENT_KEY, next);
  return next;
}

export function listRecentColors(): string[] {
  return readHexList(RECENT_KEY);
}

export function toggleSavedColor(hex: string): string[] {
  const n = normalizeHexColor(hex);
  if (!n) return readHexList(SAVED_KEY);
  const cur = readHexList(SAVED_KEY);
  const next = cur.includes(n) ? cur.filter((h) => h !== n) : [n, ...cur].slice(0, 24);
  writeHexList(SAVED_KEY, next);
  return next;
}

export function listSavedColors(): string[] {
  return readHexList(SAVED_KEY);
}

/** Ordinary tint is free — never invent a color price. */
export const FREE_BASIC_TINT = true as const;
export const AVATAR_REMOUNT_ON_COLOR_CHANGE = false as const;

/**
 * Multi-zone tint map for assets that expose named material zones.
 * Only apply keys the authored asset actually supports.
 */
export type ZoneTintMap = Record<string, string>;

export function mergeZoneTint(
  current: ZoneTintMap | undefined,
  zone: string,
  hex: string,
): ZoneTintMap | null {
  const n = normalizeHexColor(hex);
  if (!n || !zone) return null;
  return { ...(current ?? {}), [zone]: n };
}
