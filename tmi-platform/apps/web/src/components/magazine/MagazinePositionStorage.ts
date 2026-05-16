export const MAGAZINE_POSITION_KEY = "tmi_magazine_position";

export type MagazinePosition = {
  lastIssue: string;
  lastSpread: number;
  lastPage: number;
  lastScrollX: number;
  timestamp: number;
};

export function readMagazinePosition(): MagazinePosition | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MAGAZINE_POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MagazinePosition>;
    if (
      typeof parsed.lastIssue !== "string" ||
      typeof parsed.lastSpread !== "number" ||
      typeof parsed.lastPage !== "number"
    ) {
      return null;
    }
    return {
      lastIssue: parsed.lastIssue,
      lastSpread: parsed.lastSpread,
      lastPage: parsed.lastPage,
      lastScrollX: typeof parsed.lastScrollX === "number" ? parsed.lastScrollX : 0,
      timestamp: typeof parsed.timestamp === "number" ? parsed.timestamp : Date.now(),
    };
  } catch {
    return null;
  }
}

export function writeMagazinePosition(next: MagazinePosition): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MAGAZINE_POSITION_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures for private mode / blocked storage.
  }
}
