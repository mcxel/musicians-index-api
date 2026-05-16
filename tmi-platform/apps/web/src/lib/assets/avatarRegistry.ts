import { ReconstructedAsset } from "./assetRegistry";

export interface AvatarProfile extends ReconstructedAsset {
  rigRef: string;
  clothingRef: string[];
  accessoryRef: string[];
  expressionsRef: string;
}

export const avatarRegistry = new Map<string, AvatarProfile>();