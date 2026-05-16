export const MOTION_TIMING = {
  HOLD_MS: 5000,
  STARBURST_MS: 800,
  SETTLE_MS: 500,
  // Staggered per-slot hold durations for the image slate rotator (Rotation 2)
  SLOT_HOLDS: [2000, 4000, 6000, 7000] as readonly number[],
} as const;
