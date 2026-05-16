/**
 * ProfileAssetRotationEngine.ts
 *
 * Allows multiple profile images, banners, and motion portraits to rotate.
 * Rotation by visit, day, engagement, event keeps returning users seeing fresh visuals.
 * Purpose: Make profiles feel alive and personalized.
 */

export interface ProfileAssetSlot {
  slotId: string;
  entityId: string;
  entityType: 'artist' | 'performer' | 'fan' | 'venue';
  slotName: 'profile-image' | 'banner' | 'motion-portrait' | 'memory-wall';
  assetId: string;
  assetUrl: string;
  generatedAt: number;
  views: number;
  engagement: number;
  isActive: boolean;
  displayOrder: number;
}

export interface RotationConfig {
  entityId: string;
  entityType: 'artist' | 'performer' | 'fan' | 'venue';
  rotationMode: 'by-visit' | 'by-day' | 'by-engagement' | 'by-event';
  rotationIntervalMs: number;
  minEngagementToRotate: number;
  maxAssetsPerSlot: number;
  lastRotationTime: number;
  nextRotationTime: number;
}

export interface RotationState {
  configId: string;
  currentAssetId: string;
  previousAssetId?: string;
  rotationCount: number;
  lastRotatedAt: number;
  nextRotateAt: number;
}

// In-memory registries
const profileAssets = new Map<string, ProfileAssetSlot>();
const rotationConfigs = new Map<string, RotationConfig>();
const rotationStates = new Map<string, RotationState>();

/**
 * Registers an asset for rotation into a profile slot.
 */
export function registerProfileAsset(input: {
  entityId: string;
  entityType: 'artist' | 'performer' | 'fan' | 'venue';
  slotName: 'profile-image' | 'banner' | 'motion-portrait' | 'memory-wall';
  assetUrl: string;
}): string {
  const slotId = `asset-${Date.now()}-${Math.random()}`;

  const asset: ProfileAssetSlot = {
    slotId,
    entityId: input.entityId,
    entityType: input.entityType,
    slotName: input.slotName,
    assetId: slotId,
    assetUrl: input.assetUrl,
    generatedAt: Date.now(),
    views: 0,
    engagement: 0,
    isActive: false,
    displayOrder: 999,
  };

  profileAssets.set(slotId, asset);
  return slotId;
}

/**
 * Sets rotation config for entity.
 */
export function configureRotation(input: {
  entityId: string;
  entityType: 'artist' | 'performer' | 'fan' | 'venue';
  rotationMode: 'by-visit' | 'by-day' | 'by-engagement' | 'by-event';
  rotationIntervalMs: number;
  minEngagementToRotate: number;
  maxAssetsPerSlot: number;
}): string {
  const configId = `rot-config-${input.entityId}-${Date.now()}`;

  const config: RotationConfig = {
    entityId: input.entityId,
    entityType: input.entityType,
    rotationMode: input.rotationMode,
    rotationIntervalMs: input.rotationIntervalMs,
    minEngagementToRotate: input.minEngagementToRotate,
    maxAssetsPerSlot: input.maxAssetsPerSlot,
    lastRotationTime: Date.now(),
    nextRotationTime: Date.now() + input.rotationIntervalMs,
  };

  rotationConfigs.set(configId, config);
  return configId;
}

/**
 * Gets currently active asset for entity slot (non-mutating).
 */
export function getActiveAssetForSlot(entityId: string, slotName: string): ProfileAssetSlot | null {
  const assets = Array.from(profileAssets.values()).filter(
    (a) => a.entityId === entityId && a.slotName === slotName && a.isActive
  );

  return assets.length > 0 ? assets[0] : null;
}

/**
 * Lists all assets for an entity slot.
 */
export function listAssetsForSlot(entityId: string, slotName: string): ProfileAssetSlot[] {
  return Array.from(profileAssets.values())
    .filter((a) => a.entityId === entityId && a.slotName === slotName)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Records engagement on an asset (view/interaction).
 */
export function recordAssetEngagement(
  slotId: string,
  engagementType: 'view' | 'interaction'
): void {
  const asset = profileAssets.get(slotId);
  if (asset) {
    if (engagementType === 'view') {
      asset.views += 1;
    } else if (engagementType === 'interaction') {
      asset.engagement += 1;
    }
  }
}

/**
 * Marks next asset for rotation (readiness check, non-executing).
 */
export function getNextRotationCandidate(
  entityId: string,
  slotName: string
): ProfileAssetSlot | null {
  const assets = listAssetsForSlot(entityId, slotName).filter((a) => !a.isActive);

  // Find asset with highest engagement
  if (assets.length === 0) return null;

  return assets.reduce((best, current) => (current.engagement > best.engagement ? current : best));
}

/**
 * Gets rotation state for entity (read-only).
 */
export function getRotationState(entityId: string): RotationState | null {
  const entries = Array.from(rotationStates.entries());
  const found = entries.find((e) => e[1].configId.includes(entityId));
  return found ? found[1] : null;
}

/**
 * Lists all assets with engagement scores (for admin inspection).
 */
export function listAssetsWithEngagement(): (ProfileAssetSlot & { engagementScore: number })[] {
  return Array.from(profileAssets.values()).map((asset) => ({
    ...asset,
    engagementScore: asset.views * 0.5 + asset.engagement * 2,
  }));
}

/**
 * Gets rotation report (non-mutating).
 */
export function getRotationReport(): {
  totalAssets: number;
  activeAssets: number;
  rotationConfigs: RotationConfig[];
  topEngagementAssets: ProfileAssetSlot[];
} {
  return {
    totalAssets: profileAssets.size,
    activeAssets: Array.from(profileAssets.values()).filter((a) => a.isActive).length,
    rotationConfigs: Array.from(rotationConfigs.values()),
    topEngagementAssets: Array.from(profileAssets.values())
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10),
  };
}
