export type RotationSlot<T> = {
  id: string;
  items: readonly T[];
  currentIndex: number;
};

export function normalizeRotationIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function nextRotationIndex(index: number, length: number): number {
  return normalizeRotationIndex(index + 1, length);
}

export function createRotationSlot<T>(id: string, items: readonly T[]): RotationSlot<T> {
  return {
    id,
    items,
    currentIndex: 0,
  };
}

export function stepRotationSlot<T>(slot: RotationSlot<T>): RotationSlot<T> {
  return {
    ...slot,
    currentIndex: nextRotationIndex(slot.currentIndex, slot.items.length),
  };
}

export function resolveRotationItem<T>(slot: RotationSlot<T>): T | undefined {
  if (slot.items.length === 0) return undefined;
  return slot.items[normalizeRotationIndex(slot.currentIndex, slot.items.length)];
}
