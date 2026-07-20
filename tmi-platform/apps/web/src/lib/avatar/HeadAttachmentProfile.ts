/**
 * HeadAttachmentProfile — Universal Head Attachment & Neck Mount Profile.
 *
 * Establishes one standardized scalp mesh, neck mount, and facial insertion plate
 * across all 6 body builds (`slim`, `athletic`, `average`, `curvy`, `heavy`, `chunky`)
 * and face-scan head plates (`BobbleHead Avatar 2 Cutout for face scan.jpg`).
 *
 * Connects modular 3D Hair (Locs, Braids, Afros, Fades, Buns) and Hats (Caps, Beanies)
 * with fit adjustments (width, depth, crown height) and collision rules.
 */

import { BodyBuild, BodyHeight } from '@/lib/avatars/UnifiedAvatarRuntime';

export interface HeadFitAdjustment {
  headWidthScale: number;     // 0.85 - 1.15
  headDepthScale: number;     // 0.85 - 1.15
  foreheadHeightOffset: number;// -0.05 to +0.05
  hairlinePositionOffset: number;// -0.05 to +0.05
  crownHeightScale: number;   // 0.90 to 1.20
  templeWidthScale: number;   // 0.85 to 1.15
}

export interface AccessoryCollisionProfile {
  hatFitCircumference: number;  // mm
  hairCompressUnderHat: boolean; // Compress afro/curl under caps
  hatCompatibilityMode: 'fit' | 'shrink-hair' | 'hide-hair' | 'incompatible';
  earringClearance: boolean;
  glassesClearance: boolean;
}

export interface HeadAttachmentProfile {
  id: string;
  bodyBuild: BodyBuild;
  bodyHeight: BodyHeight;
  neckAnchorPoint: [number, number, number]; // [X, Y, Z] relative to torso
  headScale: [number, number, number];
  faceScanPlateId: string;
  fitAdjustments: HeadFitAdjustment;
  collision: AccessoryCollisionProfile;
}

export const BASE_HEAD_ATTACHMENT_PROFILES: Record<BodyBuild, HeadAttachmentProfile> = {
  slim: {
    id: 'head-profile-slim',
    bodyBuild: 'slim',
    bodyHeight: 'medium',
    neckAnchorPoint: [0, 1.55, 0],
    headScale: [1.0, 1.0, 1.0],
    faceScanPlateId: 'bobblehead-face-scan-plate-02',
    fitAdjustments: {
      headWidthScale: 1.0,
      headDepthScale: 1.0,
      foreheadHeightOffset: 0.0,
      hairlinePositionOffset: 0.0,
      crownHeightScale: 1.0,
      templeWidthScale: 1.0,
    },
    collision: {
      hatFitCircumference: 570,
      hairCompressUnderHat: true,
      hatCompatibilityMode: 'fit',
      earringClearance: true,
      glassesClearance: true,
    },
  },
  athletic: {
    id: 'head-profile-athletic',
    bodyBuild: 'athletic',
    bodyHeight: 'tall',
    neckAnchorPoint: [0, 1.68, 0],
    headScale: [1.02, 1.02, 1.02],
    faceScanPlateId: 'bobblehead-face-scan-plate-02',
    fitAdjustments: {
      headWidthScale: 1.02,
      headDepthScale: 1.02,
      foreheadHeightOffset: 0.0,
      hairlinePositionOffset: 0.0,
      crownHeightScale: 1.02,
      templeWidthScale: 1.02,
    },
    collision: {
      hatFitCircumference: 580,
      hairCompressUnderHat: true,
      hatCompatibilityMode: 'fit',
      earringClearance: true,
      glassesClearance: true,
    },
  },
  average: {
    id: 'head-profile-average',
    bodyBuild: 'average',
    bodyHeight: 'medium',
    neckAnchorPoint: [0, 1.60, 0],
    headScale: [1.0, 1.0, 1.0],
    faceScanPlateId: 'bobblehead-face-scan-plate-02',
    fitAdjustments: {
      headWidthScale: 1.0,
      headDepthScale: 1.0,
      foreheadHeightOffset: 0.0,
      hairlinePositionOffset: 0.0,
      crownHeightScale: 1.0,
      templeWidthScale: 1.0,
    },
    collision: {
      hatFitCircumference: 575,
      hairCompressUnderHat: true,
      hatCompatibilityMode: 'fit',
      earringClearance: true,
      glassesClearance: true,
    },
  },
  curvy: {
    id: 'head-profile-curvy',
    bodyBuild: 'curvy',
    bodyHeight: 'medium',
    neckAnchorPoint: [0, 1.58, 0],
    headScale: [1.0, 1.0, 1.0],
    faceScanPlateId: 'bobblehead-face-scan-plate-02',
    fitAdjustments: {
      headWidthScale: 1.0,
      headDepthScale: 1.0,
      foreheadHeightOffset: 0.0,
      hairlinePositionOffset: 0.0,
      crownHeightScale: 1.0,
      templeWidthScale: 1.0,
    },
    collision: {
      hatFitCircumference: 575,
      hairCompressUnderHat: true,
      hatCompatibilityMode: 'fit',
      earringClearance: true,
      glassesClearance: true,
    },
  },
  heavy: {
    id: 'head-profile-heavy',
    bodyBuild: 'heavy',
    bodyHeight: 'medium',
    neckAnchorPoint: [0, 1.62, 0],
    headScale: [1.05, 1.05, 1.05],
    faceScanPlateId: 'bobblehead-face-scan-plate-02',
    fitAdjustments: {
      headWidthScale: 1.05,
      headDepthScale: 1.05,
      foreheadHeightOffset: 0.0,
      hairlinePositionOffset: 0.0,
      crownHeightScale: 1.02,
      templeWidthScale: 1.05,
    },
    collision: {
      hatFitCircumference: 595,
      hairCompressUnderHat: true,
      hatCompatibilityMode: 'fit',
      earringClearance: true,
      glassesClearance: true,
    },
  },
};

export function getHeadAttachmentProfile(build: BodyBuild): HeadAttachmentProfile {
  return BASE_HEAD_ATTACHMENT_PROFILES[build] ?? BASE_HEAD_ATTACHMENT_PROFILES['average'];
}
