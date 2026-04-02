/**
 * Homepage Layout Persistence Engine
 * Manages section order, visibility, and localStorage persistence.
 */

export const DEFAULT_SECTION_ORDER = [
  "MagazineCarousel",
  "FeaturedArtist",
  "Top10Chart",
  "NewsStrip",
  "SponsorStrip",
  "NewReleases",
  "TrendingArtists",
  "Interviews",
  "LiveShows",
  "ContestBanner",
  "AdvertiserStrip",
] as const;

export type SectionId = (typeof DEFAULT_SECTION_ORDER)[number];

const ORDER_KEY = "tmi_homepage_section_order_v1";
const HIDDEN_KEY = "tmi_homepage_hidden_sections_v1";

const VALID_IDS = new Set<string>(DEFAULT_SECTION_ORDER);

function isValidOrder(parsed: unknown): parsed is string[] {
  return (
    Array.isArray(parsed) &&
    parsed.length > 0 &&
    parsed.every((item) => typeof item === "string" && VALID_IDS.has(item))
  );
}

function isValidHidden(parsed: unknown): parsed is string[] {
  return (
    Array.isArray(parsed) &&
    parsed.every((item) => typeof item === "string" && VALID_IDS.has(item))
  );
}

export function loadSectionOrder(): string[] {
  if (typeof window === "undefined") return [...DEFAULT_SECTION_ORDER];
  try {
    const saved = localStorage.getItem(ORDER_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (isValidOrder(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [...DEFAULT_SECTION_ORDER];
}

export function saveSectionOrder(order: string[]): void {
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  } catch {
    // ignore
  }
}

export function resetSectionOrder(): string[] {
  const order = [...DEFAULT_SECTION_ORDER];
  saveSectionOrder(order);
  return order;
}

export function loadHiddenSections(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const saved = localStorage.getItem(HIDDEN_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (isValidHidden(parsed)) return new Set(parsed);
    }
  } catch {
    // ignore
  }
  return new Set();
}

export function saveHiddenSections(hidden: Set<string>): void {
  try {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden]));
  } catch {
    // ignore
  }
}

export function toggleSectionVisibility(
  hidden: Set<string>,
  sectionId: string
): Set<string> {
  const next = new Set(hidden);
  if (next.has(sectionId)) {
    next.delete(sectionId);
  } else {
    next.add(sectionId);
  }
  saveHiddenSections(next);
  return next;
}
