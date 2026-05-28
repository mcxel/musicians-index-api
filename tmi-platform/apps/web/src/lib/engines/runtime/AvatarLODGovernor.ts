/**
 * AvatarLODGovernor
 * Distance-based avatar complexity scaling.
 * Prevents FPS collapse when rooms scale to 50–500 avatars.
 *
 * LOD levels:
 *   near       — full fidelity: all skeleton bones, outfit layers, animations
 *   medium     — reduced: 50% bone count, single outfit layer, simplified gestures
 *   far        — silhouette: shape + color only, 2-bone sway animation
 *   ultra-far  — billboard imposter: static sprite, crowd-aggregate energy pulse only
 */

export type LODLevel = 'near' | 'medium' | 'far' | 'ultra-far';

export interface LODConfig {
  level: LODLevel;
  boneCount: number;           // skeleton joints to simulate
  outfitLayers: number;        // 1–5 layers rendered
  animationFPS: number;        // target update rate for this avatar
  shadowEnabled: boolean;
  reflectionEnabled: boolean;
  usesBillboard: boolean;      // true = render as 2D sprite imposter
  gestureResolution: 'full' | 'simplified' | 'none';
  emoteResolution: 'full' | 'simplified' | 'none';
  energyUpdateHz: number;      // how often energy level updates per second
}

export interface AvatarDistanceRecord {
  avatarId: string;
  distanceUnits: number;       // camera-normalized distance (0 = on stage, 1 = back wall)
  lod: LODLevel;
  config: LODConfig;
  lastUpdatedAt: number;
}

const LOD_THRESHOLDS = {
  near:      0.25,   // 0–25% of room depth
  medium:    0.50,   // 25–50%
  far:       0.80,   // 50–80%
  ultraFar:  1.00,   // 80–100%
};

const LOD_CONFIGS: Record<LODLevel, LODConfig> = {
  'near': {
    level: 'near', boneCount: 54, outfitLayers: 5, animationFPS: 60,
    shadowEnabled: true, reflectionEnabled: true, usesBillboard: false,
    gestureResolution: 'full', emoteResolution: 'full', energyUpdateHz: 60,
  },
  'medium': {
    level: 'medium', boneCount: 22, outfitLayers: 2, animationFPS: 30,
    shadowEnabled: false, reflectionEnabled: false, usesBillboard: false,
    gestureResolution: 'simplified', emoteResolution: 'simplified', energyUpdateHz: 15,
  },
  'far': {
    level: 'far', boneCount: 4, outfitLayers: 1, animationFPS: 15,
    shadowEnabled: false, reflectionEnabled: false, usesBillboard: false,
    gestureResolution: 'none', emoteResolution: 'none', energyUpdateHz: 5,
  },
  'ultra-far': {
    level: 'ultra-far', boneCount: 0, outfitLayers: 1, animationFPS: 4,
    shadowEnabled: false, reflectionEnabled: false, usesBillboard: true,
    gestureResolution: 'none', emoteResolution: 'none', energyUpdateHz: 2,
  },
};

const lodRecords = new Map<string, AvatarDistanceRecord>();

function distanceToLOD(d: number): LODLevel {
  if (d <= LOD_THRESHOLDS.near)     return 'near';
  if (d <= LOD_THRESHOLDS.medium)   return 'medium';
  if (d <= LOD_THRESHOLDS.far)      return 'far';
  return 'ultra-far';
}

export function updateAvatarDistance(avatarId: string, distanceUnits: number): AvatarDistanceRecord {
  const lod = distanceToLOD(Math.max(0, Math.min(1, distanceUnits)));
  const record: AvatarDistanceRecord = {
    avatarId, distanceUnits, lod,
    config: LOD_CONFIGS[lod],
    lastUpdatedAt: Date.now(),
  };
  lodRecords.set(avatarId, record);
  return record;
}

export function getAvatarLOD(avatarId: string): AvatarDistanceRecord | undefined {
  return lodRecords.get(avatarId);
}

export function getLODConfig(level: LODLevel): LODConfig {
  return LOD_CONFIGS[level];
}

/** Batch update — call once per animation frame with camera position */
export function updateRoomLOD(
  avatarDistances: Array<{ avatarId: string; row: number; totalRows: number }>,
): AvatarDistanceRecord[] {
  return avatarDistances.map(({ avatarId, row, totalRows }) => {
    const dist = totalRows > 1 ? row / (totalRows - 1) : 0;
    return updateAvatarDistance(avatarId, dist);
  });
}

export function getLODStats(): Record<LODLevel, number> {
  const counts: Record<LODLevel, number> = { near: 0, medium: 0, far: 0, 'ultra-far': 0 };
  for (const r of lodRecords.values()) counts[r.lod]++;
  return counts;
}

/** Estimated render budget savings vs all-near baseline */
export function estimateRenderSavingsPct(): number {
  const stats = getLODStats();
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  const weightedCost =
    stats.near      * 1.0 +
    stats.medium    * 0.4 +
    stats.far       * 0.15 +
    stats['ultra-far'] * 0.04;
  const baselineCost = total * 1.0;
  return Math.round((1 - weightedCost / baselineCost) * 100);
}

export function clearLODRegistry(): void {
  lodRecords.clear();
}
