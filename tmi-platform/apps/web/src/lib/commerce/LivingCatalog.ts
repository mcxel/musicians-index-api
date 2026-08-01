/**
 * LivingCatalog — thin catalog model for hybrid distributor + TMI commerce.
 *
 * Does NOT duplicate the upload pipeline. Tracks originate from
 * PerformerRegistry.songs (and optional local overlays for ISRC / distributor /
 * streaming links / commerce flags). Media Locker remains the upload surface;
 * this layer only annotates and surfaces Listen vs Own.
 */

import {
  getPerformerBySlug,
  type PerformerSong,
} from "@/lib/performers/PerformerRegistry";
import {
  STREAM_VS_OWN_COPY,
  resolvePrimaryListenProfileUrl,
  type DistributorProviderId,
} from "@/lib/commerce/DistributorConnectorRegistry";
import {
  getPerformerStorefrontLink,
  resolveArtistBuyUrl,
} from "@/lib/commerce/CommerceConnectorRegistry";
import { listCreatorProducts } from "@/lib/commerce/CreatorProductRegistry";

/** UI framing only — one album sale ≈ thousands of streams. No fake charts. */
export const HYBRID_ECONOMICS_COPY = STREAM_VS_OWN_COPY;

export interface LivingCatalogStreamingLinks {
  spotify?: string;
  appleMusic?: string;
  youtube?: string;
  soundcloud?: string;
  audiomack?: string;
  bandcamp?: string;
  other?: string;
}

/** Canonical thin track record for Phase 1 hybrid commerce. */
export interface LivingCatalogTrack {
  id: string;
  performerId: string;
  title: string;
  durationSec?: number;
  /** Optional ISRC for catalog matching / distributor identity. */
  isrc?: string;
  /** Distributor that delivered the track to DSPs (manual Phase 1). */
  distributor?: DistributorProviderId;
  streamingLinks?: LivingCatalogStreamingLinks;
  /** Audio on TMI (registry / media locker path). */
  audioUrl?: string;
  coverUrl?: string;
  /** Optional per-track Own deep-link from registry. */
  ownBuyUrl?: string;
  /** When true, Own/Support CTA may surface for this track. */
  tmiCommerceEnabled: boolean;
  /** Reserved for battle/cypher eligibility — default false until wired. */
  battleEligible: boolean;
  source: "performer_registry" | "local_overlay";
}

export interface LivingCatalogOverlay {
  trackKey: string;
  isrc?: string;
  distributor?: DistributorProviderId;
  streamingLinks?: LivingCatalogStreamingLinks;
  tmiCommerceEnabled?: boolean;
  battleEligible?: boolean;
  buyUrl?: string;
}

const OVERLAY_PREFIX = "tmi_living_catalog_";

function overlayKey(performerId: string): string {
  return `${OVERLAY_PREFIX}${performerId}`;
}

function trackKeyFromSong(song: PerformerSong, index: number): string {
  const base = (song.title || `track-${index}`).trim().toLowerCase().replace(/\s+/g, "-");
  return `${base}-${index}`;
}

function readOverlays(performerId: string): LivingCatalogOverlay[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(overlayKey(performerId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LivingCatalogOverlay[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOverlays(performerId: string, overlays: LivingCatalogOverlay[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(overlayKey(performerId), JSON.stringify(overlays));
  } catch {
    /* ignore */
  }
}

export function saveLivingCatalogOverlay(
  performerId: string,
  overlay: LivingCatalogOverlay,
): LivingCatalogOverlay {
  const existing = readOverlays(performerId).filter((o) => o.trackKey !== overlay.trackKey);
  const next: LivingCatalogOverlay = {
    ...overlay,
    isrc: overlay.isrc?.trim().toUpperCase() || undefined,
  };
  writeOverlays(performerId, [...existing, next]);
  return next;
}

export function clearLivingCatalogOverlay(performerId: string, trackKey: string): void {
  writeOverlays(
    performerId,
    readOverlays(performerId).filter((o) => o.trackKey !== trackKey),
  );
}

/**
 * Build living catalog from PerformerRegistry songs + local overlays.
 * Empty array when no registry songs (honest empty — Rule 20).
 */
export function getLivingCatalogForPerformer(performerId: string): LivingCatalogTrack[] {
  if (!performerId) return [];
  const performer = getPerformerBySlug(performerId);
  const songs = performer?.songs ?? [];
  const overlays = readOverlays(performerId);
  const overlayByKey = new Map(overlays.map((o) => [o.trackKey, o]));

  return songs.map((song, index) => {
    const key = trackKeyFromSong(song, index);
    const overlay = overlayByKey.get(key);
    const songLinks = song.streamingLinks
      ? ({ ...song.streamingLinks } as LivingCatalogStreamingLinks)
      : undefined;
    return {
      id: `${performerId}:${key}`,
      performerId,
      title: song.title,
      durationSec: song.durationSec,
      audioUrl: song.audioUrl,
      coverUrl: song.coverUrl,
      ownBuyUrl: overlay?.buyUrl ?? song.ownBuyUrl,
      isrc: overlay?.isrc ?? song.isrc,
      distributor:
        overlay?.distributor ??
        song.distributorId ??
        (song.distributor as DistributorProviderId | undefined),
      streamingLinks: overlay?.streamingLinks ?? songLinks,
      tmiCommerceEnabled:
        overlay?.tmiCommerceEnabled ?? song.commerceEnabled ?? true,
      battleEligible: overlay?.battleEligible ?? song.battleEligible ?? false,
      source: overlay ? "local_overlay" : "performer_registry",
    };
  });
}

function firstStreamingLink(
  links?: LivingCatalogStreamingLinks | PerformerSong["streamingLinks"] | null,
): string | null {
  if (!links) return null;
  const ordered = [
    links.spotify,
    links.appleMusic,
    links.youtube,
    links.soundcloud,
    links.audiomack,
    links.bandcamp,
    "other" in links ? links.other : undefined,
  ];
  for (const u of ordered) {
    if (u?.trim()) return u.trim();
  }
  return null;
}

/** Prefer track audio, else streaming links, else performer listen profile. */
export function resolveListenUrl(
  track: LivingCatalogTrack | PerformerSong,
  performerId?: string,
): string | null {
  if ("audioUrl" in track && track.audioUrl?.trim()) return track.audioUrl.trim();
  const fromLinks = firstStreamingLink(
    "streamingLinks" in track ? track.streamingLinks : undefined,
  );
  if (fromLinks) return fromLinks;
  const pid =
    performerId ||
    ("performerId" in track ? (track as LivingCatalogTrack).performerId : undefined);
  if (pid) return resolvePrimaryListenProfileUrl(pid);
  return null;
}

/**
 * Resolve living tracks for UI lists (Bio music tab / article CTA).
 * Prefers catalog merge; falls back to raw songs when registry has none.
 */
export function resolveLivingTracks(
  performerId: string,
  songs?: PerformerSong[] | null,
): Array<
  PerformerSong & {
    distributorId?: DistributorProviderId;
  }
> {
  const catalog = getLivingCatalogForPerformer(performerId);
  if (catalog.length > 0) {
    return catalog.map((t) => ({
      title: t.title,
      durationSec: t.durationSec ?? 0,
      audioUrl: t.audioUrl,
      coverUrl: t.coverUrl,
      isrc: t.isrc,
      distributorId: t.distributor,
      distributor: t.distributor,
      streamingLinks: t.streamingLinks,
      commerceEnabled: t.tmiCommerceEnabled,
      battleEligible: t.battleEligible,
      ownBuyUrl: t.ownBuyUrl,
    }));
  }
  return (songs ?? []).map((s) => ({ ...s }));
}

function isLivingCatalogTrack(
  track: LivingCatalogTrack | PerformerSong,
): track is LivingCatalogTrack {
  return "tmiCommerceEnabled" in track && "performerId" in track;
}

/** Own / Support URL for a living track or registry song. */
export function resolveOwnUrl(
  track: LivingCatalogTrack | PerformerSong,
  performerId: string,
): string | null {
  if (isLivingCatalogTrack(track)) {
    if (track.ownBuyUrl?.trim()) return track.ownBuyUrl.trim();
    if (track.tmiCommerceEnabled === false) return null;
    return resolveOwnSupportUrl(performerId, track);
  }

  // PerformerSong branch
  if (track.ownBuyUrl?.trim()) return track.ownBuyUrl.trim();
  if (track.commerceEnabled === false) return null;

  const asCatalog: LivingCatalogTrack = {
    id: `${performerId}:adhoc`,
    performerId,
    title: track.title,
    durationSec: track.durationSec,
    audioUrl: track.audioUrl,
    coverUrl: track.coverUrl,
    isrc: track.isrc,
    distributor:
      track.distributorId ?? (track.distributor as DistributorProviderId | undefined),
    streamingLinks: track.streamingLinks as LivingCatalogStreamingLinks | undefined,
    ownBuyUrl: track.ownBuyUrl,
    tmiCommerceEnabled: track.commerceEnabled ?? true,
    battleEligible: track.battleEligible ?? false,
    source: "performer_registry",
  };
  return resolveOwnSupportUrl(performerId, asCatalog);
}

/** Fallback Listen destination when no track audio/streaming URL exists. */
export function resolveListenFallbackHref(performerId: string): string {
  return `/live/radio?artist=${encodeURIComponent(performerId)}`;
}

/**
 * Own / Support URL: catalog overlay buyUrl → matching SINGLE/ALBUM product →
 * artist storefront → null (honest empty).
 */
export function resolveOwnSupportUrl(
  performerId: string,
  track?: LivingCatalogTrack | null,
): string | null {
  if (!performerId) return null;
  if (track && !track.tmiCommerceEnabled) return null;

  if (track?.ownBuyUrl?.trim()) return track.ownBuyUrl.trim();

  const overlays = readOverlays(performerId);
  if (track) {
    const key = track.id.includes(":") ? track.id.split(":").slice(1).join(":") : track.id;
    const overlay = overlays.find((o) => o.trackKey === key);
    if (overlay?.buyUrl?.trim()) return overlay.buyUrl.trim();
  }

  const products = listCreatorProducts(performerId);
  if (track) {
    const titleLower = track.title.trim().toLowerCase();
    const match = products.find(
      (p) =>
        (p.type === "SINGLE" || p.type === "ALBUM" || p.type === "BUNDLE") &&
        p.title.trim().toLowerCase() === titleLower &&
        p.buyUrl,
    );
    if (match?.buyUrl) return match.buyUrl;
  }

  const musicProduct = products.find(
    (p) =>
      (p.type === "SINGLE" || p.type === "ALBUM" || p.type === "VINYL" || p.type === "BUNDLE") &&
      p.buyUrl,
  );
  if (musicProduct?.buyUrl) return musicProduct.buyUrl;

  return resolveArtistBuyUrl(getPerformerStorefrontLink(performerId));
}

export function livingCatalogTrackCount(performerId: string): number {
  return getLivingCatalogForPerformer(performerId).length;
}
