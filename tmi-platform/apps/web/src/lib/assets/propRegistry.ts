import { ReconstructedAsset } from "./assetRegistry";

export interface PropData extends ReconstructedAsset {
  meshRef: string;
  textureRef: string;
  anchorPoints: Array<{ id: string; x: number; y: number; z: number }>;
  interactable: boolean;
}

export const propRegistry = new Map<string, PropData>();