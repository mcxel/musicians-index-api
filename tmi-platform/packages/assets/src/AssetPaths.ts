// Single source of truth for all physical paths in the asset pipeline.
// __dirname anchors everything regardless of process.cwd().
import path from "path";

// packages/assets/src → packages/assets
export const ASSET_PACKAGE_ROOT = path.resolve(__dirname, "..");
// packages/assets → packages → tmi-platform
export const REPO_ROOT = path.resolve(ASSET_PACKAGE_ROOT, "../..");

export const INGEST_CONFIG_PATH = path.resolve(REPO_ROOT, "ingest.config.json");

export const AVATAR_MANIFEST_PATH = path.resolve(
  ASSET_PACKAGE_ROOT,
  "src/manifests/avatar.manifest.json"
);
export const YOPHO_MANIFEST_PATH = path.resolve(
  ASSET_PACKAGE_ROOT,
  "src/manifests/yopho.manifest.json"
);

export const GENERATED_DIR = path.resolve(ASSET_PACKAGE_ROOT, "generated");

export const YOPHO_SOURCE_DIR = path.resolve(REPO_ROOT, "Yopho Bases");
export const BOBBLEHEAD_SOURCE_DIR = path.resolve(REPO_ROOT, "BobbleHead Avatar Bases");

// Maps source folder base-name → destination catalog
export const CATALOG_CLASSIFICATION: Record<
  string,
  "AvatarAssetCatalog" | "YoArtifactAssetCatalog"
> = {
  "BobbleHead Avatar Bases": "AvatarAssetCatalog",
  "Yopho Bases": "YoArtifactAssetCatalog",
};
