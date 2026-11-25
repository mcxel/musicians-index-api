/**
 * FoundryPromotedAssetRegistry — ledger of Foundry jobs promoted into apps/web/public.
 *
 * Promote = copy manufactured GLB → public path + record sha256 + bind registry slot.
 * PHYSICAL_GREEN / CERTIFIED venue runtime remains a separate gate (navmesh + 18-step).
 * Never invent certified runtime behavior without the file on disk.
 */

export type FoundryPromoteStatus =
  | "PROMOTED_PUBLIC"
  | "REGISTRY_BOUND"
  | "PENDING_PHYSICAL_CERT";

export interface FoundryPromotedAsset {
  jobId: string;
  assetId: string;
  publicPath: string;
  sha256: string;
  bytes: number;
  foundryArtifact: string;
  status: FoundryPromoteStatus;
  note: string;
}

export const FOUNDRY_PROMOTED_ASSETS: readonly FoundryPromotedAsset[] = [
  {
    jobId: "JOB-AVATAR-PROOF001",
    assetId: "bobblehead_v0",
    publicPath: "/models/avatars/bobblehead_v0.glb",
    sha256: "f2004ed5a27385ee5189885ba554aeb76a514107e9cc26007d65c84a1e69805e",
    bytes: 2087124,
    foundryArtifact:
      "packages/assets/generated/manufacturing/artifacts/JOB-AVATAR-PROOF001/avatar-BH-A-base.glb",
    status: "REGISTRY_BOUND",
    note: "AvatarGlbRegistry bobblehead_v0 certified — Fan Canister authority.",
  },
  {
    jobId: "JOB-STARTER-WARDROBE-001",
    assetId: "starter_wardrobe_v0",
    publicPath: "/models/avatars/starter_wardrobe_v0.glb",
    sha256: "5e50cffc5a9035fde4b32e8f42090f9fe07b68e9e68c010f74a51ea8ceac98bf",
    bytes: 160028,
    foundryArtifact:
      "packages/assets/generated/manufacturing/artifacts/JOB-STARTER-WARDROBE-001/TMI_STARTER_WARDROBE_001.glb",
    status: "REGISTRY_BOUND",
    note:
      "Starter wardrobe pack (hair/tees/kicks/mic). FanCosmeticCatalog free starter SKUs bind via certifiedGlbPack.",
  },
  {
    jobId: "JOB-JUMBOTRON-001",
    assetId: "center_hung_jumbotron_v0",
    publicPath: "/models/venues/center_hung_jumbotron_v0.glb",
    sha256: "fa7ffc59b5172fa1709d2a4dd915f7f64e772d557a2ca819c562799666ca642f",
    bytes: 10536,
    foundryArtifact:
      "packages/assets/generated/manufacturing/artifacts/JOB-JUMBOTRON-001/TMI_ARENA_JUMBOTRON_001.glb",
    status: "PROMOTED_PUBLIC",
    note: "Center-hung 4-face jumbotron mesh promoted. Face runtime = JumbotronFaceTargetRegistry (content), mesh mount PENDING_PHYSICAL_CERT.",
  },
  {
    jobId: "JOB-VENUE-PROOF001",
    assetId: "monday-night-stage-world",
    publicPath: "/models/venues/monday-night-stage-world.glb",
    sha256: "52fa38706bf3c8d4cb4a473c02c5656f40fcb5e035d0b2f41e5aa25d0f36533a",
    bytes: 166216,
    foundryArtifact:
      "packages/assets/generated/manufacturing/artifacts/JOB-VENUE-PROOF001/monday-night-stage-world.glb",
    status: "PENDING_PHYSICAL_CERT",
    note: "VenueAssetContract visualGlb PRODUCTION. certificationStatus=PENDING_REVIEW (navmesh MISSING).",
  },
  {
    jobId: "JOB-VENUE-PROOF001",
    assetId: "monday-night-stage-collision",
    publicPath: "/models/venues/monday-night-stage-collision.glb",
    sha256: "d4f7a46f46b5f9028480ee026bb8e138bbf6d98fc4ad093570bdf78aedb7b7e5",
    bytes: 8004,
    foundryArtifact:
      "packages/assets/generated/manufacturing/artifacts/JOB-VENUE-PROOF001/monday-night-stage-collision.glb",
    status: "PENDING_PHYSICAL_CERT",
    note: "VenueAssetContract collisionGlb PRODUCTION. Physical roam cert still open.",
  },
] as const;

export const STARTER_WARDROBE_PACK_PUBLIC_PATH = "/models/avatars/starter_wardrobe_v0.glb";

/** Manufactured mesh names inside starter_wardrobe_v0.glb → catalog cosmetic ids. */
export const STARTER_WARDROBE_MESH_TO_COSMETIC: Readonly<Record<string, string>> = {
  Hair_Afro_Classic: "hair_afro",
  Hair_High_Taper_Fade: "hair_taper_high",
  Hair_Box_Braids_Shoulder: "hair_braids",
  Hair_Neon_Spikes: "hair_neon_spikes",
  Tee_Basic_Obsidian: "street_fit",
  Tee_Cyber_Cyan: "cyber-jacket-neon",
  Kicks_Leather_White: "holographic-sneakers-gold",
  Prop_Gold_Microphone: "mic_gold",
};

export function getFoundryPromotedAsset(assetId: string): FoundryPromotedAsset | undefined {
  return FOUNDRY_PROMOTED_ASSETS.find((a) => a.assetId === assetId);
}

export function listFoundryPromotedPublicPaths(): string[] {
  return FOUNDRY_PROMOTED_ASSETS.map((a) => a.publicPath);
}
