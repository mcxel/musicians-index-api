// YoArtifact asset schema – shares most fields with AvatarAsset but may have a different status set
import { AssetFamily } from "./AssetFamily";
export type YoAssetStatus =
  | 'REFERENCE_ONLY'
  | 'READY_FOR_QA'
  | 'CERTIFIED'
  | 'RETIRED';

export interface YoArtifactAsset {
  assetId: string; // stable ID e.g., yoArtifact_<hex8>
  version: number;
  contentHash: string;
  displayName: string;
  category: string;
  subcategory?: string;
  styleTags?: string[];
  eraTags?: string[];
  themeTags?: string[];
    family?: AssetFamily;
  source: string; // original folder path
  creator?: string;
  license?: string;
  rightsStatus?: string;
  status: YoAssetStatus;
  certification?: string;
}
