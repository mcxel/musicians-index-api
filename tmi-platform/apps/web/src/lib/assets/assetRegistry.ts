/**
 * Master Asset Registry 
 * Indexes all items exported by the Asset Reconstruction Engine.
 */
export interface ReconstructedAsset {
  assetId: string;
  type: 'HOST' | 'AVATAR' | 'PROP' | 'UI';
  rebuildHistory: string[];
  sourceMetadata: Record<string, any>;
}
export const loadedAssets = new Map<string, ReconstructedAsset>();