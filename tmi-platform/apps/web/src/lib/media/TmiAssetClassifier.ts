/**
 * TmiAssetClassifier
 * Determines rendering strategy for uploaded/system assets.
 */

export type AssetSurfaceType = 
  | "cover" 
  | "banner" 
  | "thumbnail" 
  | "avatar" 
  | "background"
  | "battle-poster"
  | "cypher-poster"
  | "sponsor-banner"
  | "ticket-surface"
  | "venue-wall"
  | "lobby-monitor"
  | "host-panel"
  | "article-surface";

export function classifyAsset(url: string, metadata?: { width: number; height: number; tags: string[] }): AssetSurfaceType {
  if (!metadata) return "thumbnail";
  
  const ratio = metadata.width / metadata.height;
  
  if (metadata.tags?.includes("battle")) return "battle-poster";
  if (metadata.tags?.includes("cypher")) return "cypher-poster";
  if (metadata.tags?.includes("sponsor")) return "sponsor-banner";
  if (metadata.tags?.includes("ticket")) return "ticket-surface";
  if (metadata.tags?.includes("venue")) return "venue-wall";
  if (metadata.tags?.includes("monitor")) return "lobby-monitor";
  if (metadata.tags?.includes("host")) return "host-panel";
  if (metadata.tags?.includes("article")) return "article-surface";

  if (ratio > 2) return "banner";
  if (ratio < 0.8) return "cover";
  if (metadata.tags?.includes("portrait")) return "avatar";
  
  return "background";
}