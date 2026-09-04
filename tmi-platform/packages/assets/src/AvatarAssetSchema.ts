// Avatar asset schema
import { AssetFamily } from "./AssetFamily";

export type AssetStatus =
  | 'REFERENCE_ONLY'
  | 'NEEDS_MODEL'
  | 'NEEDS_RIG'
  | 'NEEDS_TEXTURE'
  | 'NEEDS_LOD'
  | 'READY_FOR_QA'
  | 'CERTIFIED'
  | 'RETIRED';

export interface AvatarAsset {
  assetId: string; // stable ID e.g., fanAvatar_<hex8>
  version: number; // integer version
  contentHash: string; // SHA‑256 hex string
  displayName: string;
  category: string;
  subcategory?: string;
  styleTags?: string[];
  eraTags?: string[];
  themeTags?: string[];
  family?: AssetFamily;
  rigVersion?: string;
  compatibleRigVersions?: string[];
  bodyCompatibility?: string;
  attachmentSocket?: string;
  genderPresentationTags?: string[];
  agePresentationTags?: string[];
  materialVariants?: string[];
  colorVariants?: string[];
  lod0?: string; // URL to GLB/KTX2
  lod1?: string;
  lod2?: string;
  lod3?: string;
  thumbnail?: string; // CDN or local URL
  previewTurntable?: string;
  collisionProfile?: string;
  clothPhysicsClass?: string;
  performanceCost?: number;
  entitlementClass?: string;
  rarity?: string;
  season?: string;
  source: string; // original folder path
  creator?: string;
  license?: string;
  rightsStatus?: string;
  status: AssetStatus;
  certification?: string;
}
