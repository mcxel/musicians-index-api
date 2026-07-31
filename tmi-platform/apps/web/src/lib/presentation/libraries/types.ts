/**
 * Shared Production Asset Definition & Library Types.
 * Centralized registry interfaces for Camera, Overlay, Underlay, Motion,
 * Lighting, FX, Sound, and Crowd presentation assets.
 */

export type AssetCertificationStatus = "DRAFT" | "TESTING" | "CERTIFIED" | "DEPRECATED";

export interface ProductionAssetDefinition {
  id: string;
  version: string;
  category: string;
  compatibleRuntimes: string[];
  requiredAnchors?: string[];
  requiredSurfaces?: string[];
  qualityTiers: Array<"low" | "medium" | "high" | "ultra">;
  accessibilityFallback?: string;
  certificationStatus: AssetCertificationStatus;
  meta?: Record<string, unknown>;
}

export class ProductionAssetRegistry<TAsset extends ProductionAssetDefinition = ProductionAssetDefinition> {
  private assets: Map<string, TAsset> = new Map();

  public register(asset: TAsset): void {
    this.assets.set(asset.id, asset);
  }

  public get(id: string): TAsset | undefined {
    return this.assets.get(id);
  }

  public list(): TAsset[] {
    return Array.from(this.assets.values());
  }

  public getCertifiedForRuntime(runtimeType: string): TAsset[] {
    return this.list().filter(
      (a) =>
        a.certificationStatus === "CERTIFIED" &&
        (a.compatibleRuntimes.includes("*") || a.compatibleRuntimes.includes(runtimeType)),
    );
  }
}
