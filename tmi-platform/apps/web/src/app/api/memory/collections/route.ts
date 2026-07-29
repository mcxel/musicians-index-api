/**
 * GET/POST — Collections Engine adapter (media library)
 *
 * Collection-first API wrapping MemoryCollectible / MemoryAlbum.
 * Keeps /api/memory/collectibles working for Phase 7.4 Motion Wall.
 *
 * Returns Collection + MediaAsset shapes. Honest empty when no media (Rule 20).
 * Never accepts competition ledger kinds (MATCH_COMPLETED / WINNER_DECLARED).
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  createCollection,
  getOrCreateDefaultCollection,
  listCollections,
  listMediaAssets,
  saveMediaAssetToCollection,
} from "@/lib/memory/collectionsPersistence";
import type {
  CollectionUnlockAccess,
  FrameSkin,
  MediaAssetKind,
  MediaEditInstruction,
} from "@/lib/memory/collectionsContracts";
import { COLLECTION_UNLOCK_ACCESS } from "@/lib/memory/collectionsContracts";
import { MEMORY_COLLECTIBLE_KINDS } from "@/lib/memory/collectiblesContracts";
import type {
  MemoryCaptureDestination,
  MemoryCaptureQuality,
  MemoryVisibility,
  MediaVariantMap,
  MotionPair,
  MemoryAnimationPreset,
} from "@/lib/memory/collectiblesContracts";

async function resolveSessionUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (!email) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return user?.id ?? null;
  } catch {
    return null;
  }
}

function isKind(value: unknown): value is MediaAssetKind {
  return (
    typeof value === "string" &&
    (MEMORY_COLLECTIBLE_KINDS as readonly string[]).includes(value)
  );
}

function isUnlockAccess(value: unknown): value is CollectionUnlockAccess {
  return (
    typeof value === "string" &&
    (COLLECTION_UNLOCK_ACCESS as readonly string[]).includes(value)
  );
}

export async function GET(req: NextRequest) {
  const ownerId =
    req.nextUrl.searchParams.get("ownerId") ??
    (await resolveSessionUserId(req));

  if (!ownerId) {
    return NextResponse.json({ collections: [], assets: [], mediaAssets: [] });
  }

  const kindParam = req.nextUrl.searchParams.get("kind");
  const kind = isKind(kindParam) ? kindParam : undefined;
  const favoritesOnly = req.nextUrl.searchParams.get("favorites") === "1";
  const trashOnly = req.nextUrl.searchParams.get("trash") === "1";
  const collectionId =
    req.nextUrl.searchParams.get("collectionId") ??
    req.nextUrl.searchParams.get("albumId") ??
    undefined;
  const ensureDefault = req.nextUrl.searchParams.get("ensureDefault") === "1";

  if (ensureDefault) {
    await getOrCreateDefaultCollection(ownerId);
  }

  const [collections, mediaAssets] = await Promise.all([
    listCollections(ownerId),
    listMediaAssets({
      ownerId,
      kind,
      collectionId,
      favoritesOnly,
      trashOnly,
      take: 200,
    }),
  ]);

  // Compat aliases for callers migrating from collectibles API.
  return NextResponse.json({
    collections,
    mediaAssets,
    assets: mediaAssets,
    albums: collections,
    collectibles: mediaAssets,
  });
}

export async function POST(req: NextRequest) {
  const userId = await resolveSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      action?: "save" | "collection" | "ensureDefault";
      kind?: MediaAssetKind;
      title?: string;
      subtitle?: string;
      mediaUrl?: string;
      thumbnailUrl?: string;
      artworkUrl?: string;
      collectionId?: string;
      albumId?: string;
      visibility?: MemoryVisibility;
      eventId?: string;
      venueId?: string;
      ticketId?: string;
      ticketCollectibleId?: string;
      rarity?: string;
      attendedAt?: string;
      locationLabel?: string;
      taggedUserIds?: string[];
      yophoPageId?: string;
      editOriginalMediaId?: string;
      captureQuality?: MemoryCaptureQuality;
      captureDestination?: MemoryCaptureDestination;
      mediaVariants?: MediaVariantMap;
      motionPair?: MotionPair;
      rimStyleId?: string;
      animationPreset?: MemoryAnimationPreset;
      burstGroupId?: string;
      frameSkin?: FrameSkin;
      mediaEdit?: MediaEditInstruction;
      unlockAccess?: CollectionUnlockAccess;
      presetKey?: string;
      coverUrl?: string;
      animatedBorder?: string;
      isDefault?: boolean;
    };

    const action = body.action ?? "save";

    if (action === "ensureDefault") {
      const collection = await getOrCreateDefaultCollection(userId);
      return NextResponse.json({ collection });
    }

    if (action === "collection") {
      if (!body.title?.trim()) {
        return NextResponse.json({ error: "title required" }, { status: 400 });
      }
      const collection = await createCollection({
        ownerId: userId,
        title: body.title,
        presetKey: body.presetKey,
        coverUrl: body.coverUrl,
        animatedBorder: body.animatedBorder,
        isDefault: body.isDefault,
        unlockAccess: isUnlockAccess(body.unlockAccess)
          ? body.unlockAccess
          : undefined,
      });
      if (!collection) {
        return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
      }
      return NextResponse.json({ collection, album: collection });
    }

    // Default: save media asset into a Collection (or All Memories).
    if (!isKind(body.kind) || !body.title?.trim()) {
      return NextResponse.json(
        { error: "kind and title required" },
        { status: 400 },
      );
    }

    const asset = await saveMediaAssetToCollection({
      ownerId: userId,
      kind: body.kind,
      title: body.title,
      subtitle: body.subtitle,
      mediaUrl: body.mediaUrl,
      thumbnailUrl: body.thumbnailUrl,
      artworkUrl: body.artworkUrl,
      collectionId: body.collectionId ?? body.albumId,
      visibility: body.visibility,
      eventId: body.eventId,
      venueId: body.venueId,
      ticketId: body.ticketId,
      ticketCollectibleId: body.ticketCollectibleId,
      rarity: body.rarity,
      attendedAt: body.attendedAt,
      locationLabel: body.locationLabel,
      taggedUserIds: body.taggedUserIds,
      yophoPageId: body.yophoPageId,
      editOriginalMediaId: body.editOriginalMediaId,
      captureQuality: body.captureQuality,
      captureDestination: body.captureDestination,
      mediaVariants: body.mediaVariants,
      motionPair: body.motionPair,
      rimStyleId: body.rimStyleId,
      animationPreset: body.animationPreset,
      burstGroupId: body.burstGroupId,
      frameSkin: body.frameSkin,
      mediaEdit: body.mediaEdit,
      unlockAccess: isUnlockAccess(body.unlockAccess)
        ? body.unlockAccess
        : undefined,
    });

    if (!asset) {
      return NextResponse.json({ error: "Failed to save media asset" }, { status: 500 });
    }

    return NextResponse.json({
      mediaAsset: asset,
      asset,
      collectible: asset,
    });
  } catch (err) {
    console.error("[memory/collections POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
