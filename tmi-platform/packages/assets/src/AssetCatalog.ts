// AssetCatalog enum defines the possible asset catalogs
export enum AssetCatalog {
  AvatarAssetCatalog = "AvatarAssetCatalog",
  YoArtifactAssetCatalog = "YoArtifactAssetCatalog",
}

import { AssetFamily } from "./AssetFamily";

/**
 * Determines if a given asset family is compatible with the specified catalog.
 * Currently all defined families belong to the AvatarAssetCatalog.
 * Extend this logic when new families require different catalogs.
 */
export function isFamilyCompatibleWithCatalog(family: AssetFamily, catalog: AssetCatalog): boolean {
  // Simple rule: avatar families belong to AvatarAssetCatalog; others are not compatible.
  if (catalog === AssetCatalog.AvatarAssetCatalog) {
    const avatarFamilies = new Set([
      AssetFamily.AVATAR_BODY,
      AssetFamily.HAIRSTYLE,
      AssetFamily.WARDROBE,
      AssetFamily.COSTUME,
      AssetFamily.ACCESSORY,
      AssetFamily.PROP,
    ]);
    return avatarFamilies.has(family);
  }
  // YoArtifactAssetCatalog currently has no families mapped.
  return false;
}
