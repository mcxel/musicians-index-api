import { ReconstructedAsset } from "./assetRegistry";

export interface HostProfile extends ReconstructedAsset {
  voiceRef: string;
  rigRef: string;
  expressionsRef: string;
  posesRef: string;
}

export const hostRegistry = new Map<string, HostProfile>();