/**
 * Canonical flag graphic resolver.
 * Screens never hardcode flag images — they call resolveFlagVisual(countryCode).
 *
 * Asset status ladder:
 *   OWNER_VERIFIED → STANDARD_APPROVED → CDN_TWEMOJI → EMOJI_FALLBACK
 *
 * Anti-Gravity later populates FlagAssetRegistry slots via FlagAssetImportContract.
 * CDN_TWEMOJI is Windows-safe display artwork (not owner-verified local /flags/iso).
 * Until local slots exist, CDN_TWEMOJI prevents ISO letter glyphs on Windows.
 */

import { getCountry, type CountryRecord } from "./GlobalCountryRegistry";

export type FlagAssetStatus =
  | "OWNER_VERIFIED"
  | "STANDARD_APPROVED"
  | "CDN_TWEMOJI"
  | "EMOJI_FALLBACK"
  | "MISSING";

export type FlagVisual = {
  countryCode: string;
  label: string;
  emoji: string;
  /** Absolute or /public path when a graphic exists. */
  imageUrl: string | null;
  assetStatus: FlagAssetStatus;
  /** Provenance note for audits — never invent owner sheets. */
  provenance: string;
  accessibleLabel: string;
};

export type FlagAssetSlot = {
  countryCode: string;
  /** Preferred production path once imported, e.g. /flags/iso/US.svg */
  slotPath: string;
  imageUrl: string | null;
  assetStatus: Exclude<FlagAssetStatus, "MISSING" | "EMOJI_FALLBACK" | "CDN_TWEMOJI"> | "EMPTY";
  sourceFilename?: string;
  sourceSheetId?: string;
  importedAtMs?: number;
  notes?: string;
};

/** Runtime registry of populated graphic slots — empty until Anti-Gravity import. */
const ASSET_SLOTS = new Map<string, FlagAssetSlot>();

export function getFlagSlotPath(countryCode: string): string {
  return `/flags/iso/${countryCode.toUpperCase()}.svg`;
}

export function getFlagAssetSlot(countryCode: string): FlagAssetSlot {
  const code = countryCode.toUpperCase();
  const existing = ASSET_SLOTS.get(code);
  if (existing) return existing;
  return {
    countryCode: code,
    slotPath: getFlagSlotPath(code),
    imageUrl: null,
    assetStatus: "EMPTY",
  };
}

export function listEmptyFlagSlots(): FlagAssetSlot[] {
  // Caller should pass all registry codes; this returns only registered slots that are empty
  // plus a helper for known slots. Prefer listFlagSlotsForImport() for full AG workflow.
  return [...ASSET_SLOTS.values()].filter((s) => s.assetStatus === "EMPTY" || !s.imageUrl);
}

/**
 * Register or update a graphic for one ISO code.
 * Used by tests and the future Anti-Gravity import runner — not by UI screens.
 */
export function upsertFlagAssetSlot(input: {
  countryCode: string;
  imageUrl: string;
  assetStatus: "OWNER_VERIFIED" | "STANDARD_APPROVED";
  sourceFilename?: string;
  sourceSheetId?: string;
  notes?: string;
}): FlagAssetSlot {
  const code = input.countryCode.toUpperCase();
  const slot: FlagAssetSlot = {
    countryCode: code,
    slotPath: getFlagSlotPath(code),
    imageUrl: input.imageUrl,
    assetStatus: input.assetStatus,
    sourceFilename: input.sourceFilename,
    sourceSheetId: input.sourceSheetId,
    importedAtMs: Date.now(),
    notes: input.notes,
  };
  ASSET_SLOTS.set(code, slot);
  return slot;
}

export function clearFlagAssetSlotsForTests(): void {
  ASSET_SLOTS.clear();
}

export function resolveFlagVisual(countryCode: string | null | undefined): FlagVisual | null {
  if (!countryCode?.trim()) return null;
  const country = getCountry(countryCode);
  if (!country) return null;
  return resolveFlagVisualFromCountry(country);
}

/**
 * Windows often renders regional-indicator emoji as ISO letters (e.g. "BE").
 * Twemoji SVGs show the actual flag artwork until local /flags/iso/{ISO}.svg slots are filled.
 */
export function twemojiRegionalFlagSvgUrl(countryCode: string): string | null {
  const cc = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return null;
  const a = 0x1f1e6 + (cc.charCodeAt(0) - 65);
  const b = 0x1f1e6 + (cc.charCodeAt(1) - 65);
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${a.toString(16)}-${b.toString(16)}.svg`;
}

export function resolveFlagVisualFromCountry(country: CountryRecord): FlagVisual {
  const code = country.countryCode;
  const slot = ASSET_SLOTS.get(code);
  const registryImage = country.flagImageUrl ?? null;

  if (slot?.imageUrl && slot.assetStatus !== "EMPTY") {
    return {
      countryCode: code,
      label: country.name,
      emoji: country.flag,
      imageUrl: slot.imageUrl,
      assetStatus: slot.assetStatus,
      provenance:
        slot.assetStatus === "OWNER_VERIFIED"
          ? `Owner-verified import${slot.sourceFilename ? `: ${slot.sourceFilename}` : ""}`
          : `Standard approved graphic${slot.sourceFilename ? `: ${slot.sourceFilename}` : ""}`,
      accessibleLabel: `${country.name} flag`,
    };
  }

  if (registryImage) {
    return {
      countryCode: code,
      label: country.name,
      emoji: country.flag,
      imageUrl: registryImage,
      assetStatus: "STANDARD_APPROVED",
      provenance: "Registry flagImageUrl (not owner sheet)",
      accessibleLabel: `${country.name} flag`,
    };
  }

  const twemojiUrl = twemojiRegionalFlagSvgUrl(code);
  if (twemojiUrl) {
    return {
      countryCode: code,
      label: country.name,
      emoji: country.flag,
      imageUrl: twemojiUrl,
      assetStatus: "CDN_TWEMOJI",
      provenance:
        "Twemoji SVG (Windows-safe flag graphic). Local /flags/iso slot still empty for AG import.",
      accessibleLabel: `${country.name} flag`,
    };
  }

  return {
    countryCode: code,
    label: country.name,
    emoji: country.flag,
    imageUrl: null,
    assetStatus: "EMOJI_FALLBACK",
    provenance: "Emoji fallback — owner graphic slot empty",
    accessibleLabel: `${country.name} flag`,
  };
}

/**
 * Contract for Anti-Gravity (later pass). Cursor does not invent sheet contents.
 */
export type FlagAssetImportCandidate = {
  sourceSheetId: string;
  sourceFilename: string;
  proposedCountryCode: string | null;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "AMBIGUOUS";
  notes: string;
};

export type FlagAssetImportContract = {
  version: 1;
  slotPathPattern: "/flags/iso/{ISO}.svg";
  allowedFormats: ["svg", "png", "webp"];
  maxBytes: number;
  requireOwnerApprovalForAmbiguous: true;
  /** AG must call upsertFlagAssetSlot only after ISO match is verified. */
  upsertApi: "upsertFlagAssetSlot";
  /**
   * Owner-supplied raster identification sheets (2026-11-17).
   * RIGHT chart = primary name↔flag identification.
   * LEFT chart = secondary visual cross-check only.
   * Finished UI slots must receive properly sourced individual SVG/PNG — not enlarged crops.
   */
  referenceSheets: {
    primary: {
      sheetId: "TMI_FLAG_REF_PRIMARY_NAMED_CHART_2026_11_17";
      role: "PRIMARY_IDENTIFICATION";
      absolutePath: string;
      filename: string;
    };
    secondary: {
      sheetId: "TMI_FLAG_REF_SECONDARY_VECTOR_GRID_2026_11_17";
      role: "SECONDARY_VISUAL_COMPARISON";
      absolutePath: string;
      filename: string;
    };
  };
  /** AG must never mark EMOJI_FALLBACK or auto-crops as OWNER_VERIFIED. */
  forbidden: [
    "fabricate_assets",
    "guess_iso_without_review",
    "label_emoji_as_owner",
    "label_auto_crop_as_owner_verified",
    "use_historical_sheet_name_as_canonical_registry",
    "enlarge_raster_crop_as_final_slot_graphic",
  ];
};

export const FLAG_ASSET_IMPORT_CONTRACT: FlagAssetImportContract = {
  version: 1,
  slotPathPattern: "/flags/iso/{ISO}.svg",
  allowedFormats: ["svg", "png", "webp"],
  maxBytes: 512_000,
  requireOwnerApprovalForAmbiguous: true,
  upsertApi: "upsertFlagAssetSlot",
  referenceSheets: {
    primary: {
      sheetId: "TMI_FLAG_REF_PRIMARY_NAMED_CHART_2026_11_17",
      role: "PRIMARY_IDENTIFICATION",
      absolutePath:
        "C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\Floors , walls and ceailing\\ChatGPT Image Nov 17, 2026, 07_28_10 PM.png",
      filename: "ChatGPT Image Nov 17, 2026, 07_28_10 PM.png",
    },
    secondary: {
      sheetId: "TMI_FLAG_REF_SECONDARY_VECTOR_GRID_2026_11_17",
      role: "SECONDARY_VISUAL_COMPARISON",
      absolutePath:
        "C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\Floors , walls and ceailing\\ChatGPT Image Nov 17, 2026, 07_27_44 PM.png",
      filename: "ChatGPT Image Nov 17, 2026, 07_27_44 PM.png",
    },
  },
  forbidden: [
    "fabricate_assets",
    "guess_iso_without_review",
    "label_emoji_as_owner",
    "label_auto_crop_as_owner_verified",
    "use_historical_sheet_name_as_canonical_registry",
    "enlarge_raster_crop_as_final_slot_graphic",
  ],
};

/**
 * Historical / obsolete sheet labels → current GlobalCountryRegistry ISO (or null = do not import as country).
 * Sheets are identification aids only — never overwrite registry canonical names from these labels.
 */
export const FLAG_SHEET_HISTORICAL_NAME_MAP: Record<
  string,
  { iso: string | null; note: string }
> = {
  SWAZILAND: { iso: "SZ", note: "Canonical: Eswatini (SZ)" },
  MACEDONIA: { iso: "MK", note: "Canonical: North Macedonia (MK)" },
  "SERBIA & MONTENEGRO": {
    iso: null,
    note: "Obsolete union — map to RS and/or ME separately; do not create AN-style fake code",
  },
  "NETHERLAND ANTILLES": {
    iso: null,
    note: "Dissolved 2010 — use CW/SX/BQ as applicable; do not mint AN as live signup country",
  },
  "GREAT BRITAIN": { iso: "GB", note: "Canonical: United Kingdom (GB)" },
  "UNITED STATES OF AMERICA": { iso: "US", note: "Canonical: United States (US)" },
  "VIRGIN ISLANDS (BRIT & USA)": {
    iso: null,
    note: "Ambiguous combined label — split to VG (British) and VI (U.S.)",
  },
};

export function listFlagSlotsForImport(
  countries: Array<{ countryCode: string; name: string }>,
): Array<FlagAssetSlot & { displayName: string }> {
  return countries.map((c) => ({
    ...getFlagAssetSlot(c.countryCode),
    displayName: c.name,
  }));
}
