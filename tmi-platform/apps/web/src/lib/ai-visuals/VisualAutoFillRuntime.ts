import { processNext, queueAssetRequest, type VisualQueueAssetKind, type VisualQueuePriority } from "@/lib/ai-visuals/AiVisualQueueEngine";
import { registerGeneratedAsset } from "@/lib/ai-visuals/AiGeneratedAssetRegistry";
import { registerSlot, getSlot, queueSlotReplacement } from "@/lib/ai-visuals/VisualSlotRegistry";
import { autoPlaceAsset, registerPlacementRule } from "@/lib/ai-visuals/VisualAutoPlacementEngine";
import {
  getVisualSlot,
  isPlaceholderVisualRef,
  upsertVisualSlot,
  type VisualSlot,
} from "@/lib/visuals/TmiVisualSlotRegistry";

export type VisualAutoFillKind =
  | "profile-image"
  | "artist-article-image"
  | "bot-profile"
  | "venue-image"
  | "battle-image"
  | "event-image"
  | "ticket-image"
  | "homepage-hero-image"
  | "magazine-page-image"
  | "sponsor-image"
  | "advertiser-image"
  | "billboard-image";

export type VisualAutoFillRequest = {
  slotId: string;
  route: string;
  component: string;
  owner: string;
  kind: VisualAutoFillKind;
  priority?: VisualQueuePriority;
  badge?: VisualSlot["badge"];
};

export type VisualAutoFillResult = {
  slotId: string;
  imageRef: string | null;
  generated: boolean;
  queued: boolean;
  usedStaticFallback: boolean;
};

const SLOT_KIND_TO_QUEUE: Record<VisualAutoFillKind, { assetKind: VisualQueueAssetKind; aiAssetType: "image" | "poster" | "avatar-reference" | "venue-skin" | "battle-stage" | "sponsor-ad" | "billboard-scene" | "magazine-spread" }> = {
  "profile-image": { assetKind: "artist-profile-art", aiAssetType: "image" },
  "artist-article-image": { assetKind: "article-thumbnail", aiAssetType: "poster" },
  "bot-profile": { assetKind: "artist-profile-art", aiAssetType: "avatar-reference" },
  "venue-image": { assetKind: "venue-skin", aiAssetType: "venue-skin" },
  "battle-image": { assetKind: "battle-poster", aiAssetType: "battle-stage" },
  "event-image": { assetKind: "show-poster", aiAssetType: "poster" },
  "ticket-image": { assetKind: "ticket-art", aiAssetType: "image" },
  "homepage-hero-image": { assetKind: "homepage-hero-art", aiAssetType: "image" },
  "magazine-page-image": { assetKind: "magazine-cover", aiAssetType: "magazine-spread" },
  "sponsor-image": { assetKind: "sponsor-ad", aiAssetType: "sponsor-ad" },
  "advertiser-image": { assetKind: "sponsor-ad", aiAssetType: "sponsor-ad" },
  "billboard-image": { assetKind: "billboard-art", aiAssetType: "billboard-scene" },
};

function hasUsableVisual(slot: VisualSlot | undefined): string | null {
  if (!slot?.images?.length) return null;
  const best = slot.images[0] ?? null;
  if (!best || isPlaceholderVisualRef(best)) return null;
  return best;
}

function getStaticFallbackForKind(kind: VisualAutoFillKind): string {
  switch (kind) {
    case "homepage-hero-image":
      return "/tmi-curated/home1.jpg";
    case "magazine-page-image":
      return "/tmi-curated/mag-35.jpg";
    case "venue-image":
      return "/tmi-curated/venue-10.jpg";
    case "event-image":
      return "/tmi-curated/mag-66.jpg";
    case "ticket-image":
      return "/tmi-curated/mag-58.jpg";
    case "sponsor-image":
      return "/tmi-curated/venue-22.jpg";
    case "billboard-image":
      return "/assets/billboards/fallback-billboard.jpg";
    default:
      return "/assets/avatars/default-avatar.jpg";
  }
}

function hydrateTmiSlot(input: VisualAutoFillRequest, imageRef: string): VisualSlot {
  return upsertVisualSlot({
    slotId: input.slotId,
    owner: input.owner,
    route: input.route,
    images: [imageRef],
    priority: 100,
    badge: input.badge ?? "FEATURED",
  });
}

export class VisualAutoFillRuntime {
  static ensureSlot(input: VisualAutoFillRequest): VisualAutoFillResult {
    const existing = getVisualSlot(input.slotId);
    const existingRef = hasUsableVisual(existing);
    if (existingRef) {
      return {
        slotId: input.slotId,
        imageRef: existingRef,
        generated: false,
        queued: false,
        usedStaticFallback: false,
      };
    }

    const mapping = SLOT_KIND_TO_QUEUE[input.kind];

    registerSlot({
      slotId: input.slotId,
      page: input.route,
      component: input.component,
      assetType: mapping.assetKind,
      owner: input.owner,
      status: "empty",
    });

    registerPlacementRule({
      slotId: input.slotId,
      ownerSurface: input.kind === "homepage-hero-image" ? "homepage-hero" : input.kind === "magazine-page-image" ? "magazine-cover" : input.kind === "venue-image" ? "venue-background" : input.kind === "battle-image" ? "battle-poster" : input.kind === "billboard-image" ? "billboard-slot" : "artist-profile",
      ownerSystem: input.owner,
    });

    const queued = queueAssetRequest({
      assetKind: mapping.assetKind,
      aiAssetType: mapping.aiAssetType,
      subject: `${input.kind}:${input.slotId}`,
      ownerSystem: input.owner,
      route: input.route,
      component: input.component,
      slotId: input.slotId,
      priority: input.priority ?? "high",
    });

    queueSlotReplacement(input.slotId, queued.requestId);

    const processed = processNext();
    const processedRef = processed?.generatedAsset?.outputRef ?? (processed?.generatedAsset ? `/generated/ai/${processed.generatedAsset.assetId}.webp` : null);

    if (processedRef && processed?.request.slotId === input.slotId) {
      autoPlaceAsset(input.slotId, processed.generatedAsset?.assetId ?? "");
      hydrateTmiSlot(input, processedRef);
      return {
        slotId: input.slotId,
        imageRef: processedRef,
        generated: true,
        queued: true,
        usedStaticFallback: false,
      };
    }

    // Static fallback is only used if generation queue fails to produce an asset.
    const fallbackRef = getStaticFallbackForKind(input.kind);
    const fallbackAsset = registerGeneratedAsset({
      assetType: "image",
      prompt: `fallback:${input.kind}:${input.slotId}`,
      style: "tmi-fallback",
      ownerSystem: input.owner,
      targetRoute: input.route,
      targetComponent: input.component,
      qualityScore: 50,
      status: "active",
      outputRef: fallbackRef,
      generated: true,
      source: "ai_visual_runtime",
      synthetic: true,
      tags: ["fallback", input.kind],
    });

    hydrateTmiSlot(input, fallbackRef);

    return {
      slotId: input.slotId,
      imageRef: fallbackAsset.outputRef ?? fallbackRef,
      generated: false,
      queued: true,
      usedStaticFallback: true,
    };
  }

  static ensureHomepageHeroVisual(route: string = "/home/1"): VisualAutoFillResult {
    return this.ensureSlot({
      slotId: "home-1-hero",
      route,
      component: "HomePageCover.artifact",
      owner: "homepage-runtime",
      kind: "homepage-hero-image",
      priority: "critical",
      badge: "LIVE",
    });
  }
}
