const SLOT_STORAGE_PREFIX = 'tmi-home-slot-layout-v1';

function storageKey(surfaceId: 1 | 2 | 3 | 4 | 5): string {
  return `${SLOT_STORAGE_PREFIX}-${surfaceId}`;
}

export function loadSlotLayout(surfaceId: 1 | 2 | 3 | 4 | 5): string[] | null {
  try {
    const raw = localStorage.getItem(storageKey(surfaceId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || !parsed.every((value) => typeof value === 'string')) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveSlotLayout(surfaceId: 1 | 2 | 3 | 4 | 5, layoutOrder: string[]): void {
  try {
    localStorage.setItem(storageKey(surfaceId), JSON.stringify(layoutOrder));
  } catch {
    // Ignore storage failures.
  }
}

export function clearSlotLayout(surfaceId: 1 | 2 | 3 | 4 | 5): void {
  try {
    localStorage.removeItem(storageKey(surfaceId));
  } catch {
    // Ignore storage failures.
  }
}
