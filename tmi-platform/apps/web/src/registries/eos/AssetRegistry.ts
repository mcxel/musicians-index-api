/**
 * EOS Asset Registry — resolves asset IDs to canonical VenueAssetRegistry paths.
 */

import { getVenueAsset, type VenueType } from "@/lib/venues/VenueAssetRegistry";

export interface ResolvedAssetBundle {
  venueType: VenueType;
  ambientVideoUrl: string;
  audienceViewVideoUrl?: string;
  performerViewVideoUrl?: string;
  bannerUrl?: string;
  panelArtUrl?: string;
  accentColor: string;
  secondaryColor: string;
}

export function resolveAssetsForVenue(venueType: VenueType): ResolvedAssetBundle {
  const asset = getVenueAsset(venueType);
  return {
    venueType,
    ambientVideoUrl: asset.ambientVideoUrl,
    audienceViewVideoUrl: asset.audienceViewVideoUrl,
    performerViewVideoUrl: asset.performerViewVideoUrl,
    bannerUrl: asset.bannerUrl,
    panelArtUrl: asset.panelArtUrl,
    accentColor: asset.accentColor,
    secondaryColor: asset.secondaryColor,
  };
}

const PRELOAD_TIMEOUT_MS = 2500;

function preloadUrl(url: string): Promise<void> {
  return new Promise<void>((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const timer = window.setTimeout(done, PRELOAD_TIMEOUT_MS);

    if (url.endsWith(".mp4") || url.endsWith(".webm")) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        window.clearTimeout(timer);
        done();
      };
      v.onerror = () => {
        window.clearTimeout(timer);
        done();
      };
      v.src = url;
    } else {
      const img = new Image();
      img.onload = () => {
        window.clearTimeout(timer);
        done();
      };
      img.onerror = () => {
        window.clearTimeout(timer);
        done();
      };
      img.src = url;
    }
  });
}

/**
 * Best-effort asset warm-up. Never blocks StageLoader forever —
 * missing/slow assets must not prevent EOS from reaching RUNNING.
 */
export async function preloadAssetBundle(venueType: VenueType): Promise<ResolvedAssetBundle> {
  const bundle = resolveAssetsForVenue(venueType);
  const urls = [
    bundle.ambientVideoUrl,
    bundle.audienceViewVideoUrl,
    bundle.performerViewVideoUrl,
    bundle.bannerUrl,
  ].filter(Boolean) as string[];

  await Promise.all(urls.map(preloadUrl));
  return bundle;
}
