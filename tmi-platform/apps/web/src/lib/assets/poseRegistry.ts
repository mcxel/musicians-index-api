/**
 * Tracks pose variants extracted from static images or videos.
 */
export interface PoseVariant {
  poseId: string;
  bones: Record<string, { x: number; y: number; z: number; rotation: number }>;
}

export const poseRegistry = new Map<string, PoseVariant>();