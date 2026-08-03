/**
 * CreatorAssetVault — thin reference registry (Phase 2B).
 *
 * assetId / type / ownerId / url|ref — points at Media Locker / PerformerRegistry
 * media. Does NOT create a duplicate upload pipeline.
 *
 * Complements TMICommerceConstitution.AssetVaultEntry types without inventing files.
 */

import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import type { AssetVaultCategory } from "@/lib/commerce/TMICommerceConstitution";

export type CreatorAssetType =
  | AssetVaultCategory
  | "PROFILE_IMAGE"
  | "MOTION_POSTER"
  | "INTRO_VIDEO"
  | "TRACK_AUDIO"
  | "YOPHO_REF"
  | "MEDIA_LOCKER_REF";

export interface CreatorAssetRef {
  assetId: string;
  type: CreatorAssetType;
  ownerId: string;
  /** URL or locker/registry reference key. */
  urlOrRef: string;
  label: string;
  source: "PerformerRegistry" | "MediaLocker" | "manual_ref";
  createdAt: string;
}

const _refs = new Map<string, CreatorAssetRef[]>();

function pushUnique(ownerId: string, ref: CreatorAssetRef): void {
  const list = _refs.get(ownerId) ?? [];
  if (list.some((r) => r.assetId === ref.assetId)) return;
  _refs.set(ownerId, [...list, ref]);
}

/**
 * Build reference rows from PerformerRegistry identity — no upload, no duplication.
 */
export function syncRefsFromPerformerRegistry(ownerId: string): CreatorAssetRef[] {
  const p = getPerformerById(ownerId);
  if (!p) return [...(_refs.get(ownerId) ?? [])];

  const now = new Date().toISOString();
  const add = (
    type: CreatorAssetType,
    urlOrRef: string | undefined,
    label: string,
    suffix: string,
  ) => {
    if (!urlOrRef) return;
    pushUnique(ownerId, {
      assetId: `${ownerId}.${suffix}`,
      type,
      ownerId,
      urlOrRef,
      label,
      source: "PerformerRegistry",
      createdAt: now,
    });
  };

  add("PROFILE_IMAGE", p.profileImageUrl, `${p.name} profile`, "profile");
  add("MOTION_POSTER", p.motionPosterUrl, `${p.name} motion poster`, "motion");
  add("INTRO_VIDEO", p.introVideoUrl, `${p.name} intro video`, "intro");

  if (Array.isArray(p.songs)) {
    for (const s of p.songs) {
      const slug = s.title.toLowerCase().replace(/\s+/g, "-");
      const ref =
        s.audioUrl ??
        s.streamingLinks?.spotify ??
        s.ownBuyUrl ??
        `media_locker:${ownerId}:${slug}`;
      pushUnique(ownerId, {
        assetId: `${ownerId}.track.${slug}`,
        type: "TRACK_AUDIO",
        ownerId,
        urlOrRef: ref,
        label: s.title,
        source: "PerformerRegistry",
        createdAt: now,
      });
    }
  }

  return [...(_refs.get(ownerId) ?? [])];
}

/** Register a Media Locker / external ref without uploading bytes here. */
export function registerCreatorAssetRef(
  ref: Omit<CreatorAssetRef, "createdAt"> & { createdAt?: string },
): CreatorAssetRef {
  const row: CreatorAssetRef = {
    ...ref,
    createdAt: ref.createdAt ?? new Date().toISOString(),
  };
  pushUnique(ref.ownerId, row);
  return row;
}

export function listCreatorAssets(ownerId: string): CreatorAssetRef[] {
  if (!_refs.has(ownerId)) {
    syncRefsFromPerformerRegistry(ownerId);
  }
  return [...(_refs.get(ownerId) ?? [])];
}

export function getCreatorAsset(
  ownerId: string,
  assetId: string,
): CreatorAssetRef | null {
  return listCreatorAssets(ownerId).find((a) => a.assetId === assetId) ?? null;
}
