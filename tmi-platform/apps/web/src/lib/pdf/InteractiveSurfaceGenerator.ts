/**
 * InteractiveSurfaceGenerator
 * Converts magazine layout blocks into interactive runtime surfaces:
 * tappable article cards, expandable spreads, live ad panels, shoppable zones.
 */

import { registerAsset, setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import { claimAuthority } from "@/lib/registry/AssetAuthorityLedger";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";
import type { MagazineLayoutBlock, MagazineLayout } from "@/lib/pdf/MagazineLayoutExtractor";

export type SurfaceInteractionMode =
  | "tap-to-expand"
  | "swipe-reveal"
  | "hover-preview"
  | "live-ad-inject"
  | "shop-overlay"
  | "read-mode"
  | "static";

export interface InteractiveSurface {
  surfaceId: string;
  assetId: string;
  blockId: string;
  pdfId: string;
  interactionMode: SurfaceInteractionMode;
  headline: string | null;
  thumbnailUri: string | null;
  dominantColor: string | null;
  ctaLabel: string | null;
  ctaRoute: string | null;
  isLive: boolean;
  adSlotId: string | null;
  articleRoute: string | null;
  registeredAt: number;
}

export interface SurfaceGenerationResult {
  pdfId: string;
  surfaces: InteractiveSurface[];
  liveAdCount: number;
  shopOverlayCount: number;
  errors: string[];
  generatedAt: number;
}

const GENERATOR_PRIORITY = 3;
const GENERATOR_TTL_MS = 30_000;

const surfaceLog = new Map<string, SurfaceGenerationResult>();

function pickInteractionMode(block: MagazineLayoutBlock): SurfaceInteractionMode {
  switch (block.type) {
    case "feature-article":   return "tap-to-expand";
    case "short-read":        return "hover-preview";
    case "photo-spread":      return "swipe-reveal";
    case "ad-placement":      return "live-ad-inject";
    case "pull-quote-block":  return "read-mode";
    case "sidebar-editorial": return "hover-preview";
    case "cover-layout":      return "tap-to-expand";
    case "table-of-contents": return "tap-to-expand";
    default:                  return "static";
  }
}

function buildCta(block: MagazineLayoutBlock): { label: string | null; route: string | null } {
  if (block.type === "feature-article" || block.type === "cover-layout") {
    return { label: "Read Article", route: `/magazine/${block.pdfId}/article/${block.blockId}` };
  }
  if (block.type === "ad-placement") {
    return { label: "Learn More", route: `/sponsor/${block.adTarget ?? "general"}` };
  }
  if (block.type === "photo-spread") {
    return { label: "View Spread", route: `/magazine/${block.pdfId}/spread/${block.blockId}` };
  }
  return { label: null, route: null };
}

function generateSurface(
  block: MagazineLayoutBlock,
  index: number
): InteractiveSurface | null {
  const interactionMode = pickInteractionMode(block);
  if ((interactionMode as string) === "static") return null;

  const surfaceId = `surface_${block.pdfId}_${block.blockId}`;
  const assetId = `interactive_surface_${surfaceId}`;
  const { label: ctaLabel, route: ctaRoute } = buildCta(block);
  const adSlotId = block.isSponsored ? `ad_slot_${block.pdfId}_${index}` : null;
  const articleRoute = block.type === "feature-article" || block.type === "short-read"
    ? `/magazine/${block.pdfId}/article/${block.blockId}` : null;

  registerAsset(assetId, "magazine-panel", block.pdfId, {
    generatorId: "InteractiveSurfaceGenerator",
    motionCompatible: true,
    metadata: { interactionMode, blockId: block.blockId, headline: block.headline },
    tags: ["interactive-surface", interactionMode, block.pdfId],
  });

  const claim = claimAuthority(assetId, "InteractiveSurfaceGenerator", "generator", {
    exclusive: false, priority: GENERATOR_PRIORITY, ttlMs: GENERATOR_TTL_MS,
  });

  if (claim.granted) {
    setHydrationStatus(assetId, "hydrating");
    recordLineage(assetId, "pdf-extraction", "InteractiveSurfaceGenerator", {
      parentAssetId: block.assetId,
      transforms: ["reconstruct", "animate"],
      reconstructable: true,
      metadata: { interactionMode, pdfId: block.pdfId, blockId: block.blockId },
    });
    setHydrationStatus(assetId, "hydrated");
  }

  return {
    surfaceId, assetId,
    blockId: block.blockId,
    pdfId: block.pdfId,
    interactionMode,
    headline: block.headline,
    thumbnailUri: block.imageUri,
    dominantColor: block.dominantColor,
    ctaLabel, ctaRoute,
    isLive: interactionMode === "live-ad-inject",
    adSlotId, articleRoute,
    registeredAt: Date.now(),
  };
}

export function generateSurfaces(layout: MagazineLayout): SurfaceGenerationResult {
  const result: SurfaceGenerationResult = {
    pdfId: layout.pdfId,
    surfaces: [],
    liveAdCount: 0,
    shopOverlayCount: 0,
    errors: [],
    generatedAt: Date.now(),
  };

  layout.blocks.forEach((block, i) => {
    try {
      const surface = generateSurface(block, i);
      if (surface) {
        result.surfaces.push(surface);
        if (surface.isLive) result.liveAdCount++;
        if (surface.interactionMode === "shop-overlay") result.shopOverlayCount++;
      }
    } catch (err) {
      result.errors.push(
        `block[${block.blockId}]: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  });

  surfaceLog.set(layout.pdfId, result);
  return result;
}

export function getSurfaceResult(pdfId: string): SurfaceGenerationResult | null {
  return surfaceLog.get(pdfId) ?? null;
}

export function getSurface(surfaceId: string): InteractiveSurface | null {
  for (const r of surfaceLog.values()) {
    const found = r.surfaces.find(s => s.surfaceId === surfaceId);
    if (found) return found;
  }
  return null;
}

export function getSurfacesByMode(mode: SurfaceInteractionMode): InteractiveSurface[] {
  const out: InteractiveSurface[] = [];
  for (const r of surfaceLog.values()) {
    out.push(...r.surfaces.filter(s => s.interactionMode === mode));
  }
  return out;
}

export function getSurfaceGeneratorStats(): { totalPdfs: number; totalSurfaces: number; liveAds: number } {
  let totalSurfaces = 0, liveAds = 0;
  for (const r of surfaceLog.values()) {
    totalSurfaces += r.surfaces.length;
    liveAds += r.liveAdCount;
  }
  return { totalPdfs: surfaceLog.size, totalSurfaces, liveAds };
}
