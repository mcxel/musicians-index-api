/**
 * SlotRotationEngine
 * Rotates visual assets (minimum 3 images) for major slots.
 */

export type RotationSlot = {
  slotId: string;
  images: string[];
  intervalMs: number;
};

export function getActiveImageForSlot(slot: RotationSlot): string {
  if (!slot.images || slot.images.length === 0) return "/placeholders/default-slot.jpg";
  if (slot.images.length === 1) return slot.images[0];

  // Enforce 3-image rotation minimum (by looping available if < 3)
  const rotationSet = slot.images.length >= 3 
    ? slot.images 
    : [...slot.images, ...slot.images, ...slot.images].slice(0, 3);

  const interval = slot.intervalMs > 0 ? slot.intervalMs : 5000;
  const index = Math.floor(Date.now() / interval) % rotationSet.length;
  return rotationSet[index];
}