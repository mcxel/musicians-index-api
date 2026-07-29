/**
 * GET/POST/PATCH/DELETE — Memory & Collectibles Engine (Phase 7.3)
 *
 * Persists personal media / keepsakes to Prisma MemoryCollectible.
 * Honest empty when no user media. Server-side writes only.
 * Does not accept competition ledger kinds (MATCH_COMPLETED etc.).
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  createAlbum,
  createCollectible,
  listAlbums,
  listCollectibles,
  restoreCollectible,
  setCollectibleFavorite,
  trashCollectible,
} from "@/lib/memory/collectiblesPersistence";
import type {
  MemoryCollectibleKind,
  MemoryCaptureDestination,
  MemoryCaptureQuality,
  MemoryVisibility,
  MediaVariantMap,
  MotionPair,
  MemoryAnimationPreset,
} from "@/lib/memory/collectiblesContracts";
import { MEMORY_COLLECTIBLE_KINDS } from "@/lib/memory/collectiblesContracts";

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

function isKind(value: unknown): value is MemoryCollectibleKind {
  return (
    typeof value === "string" &&
    (MEMORY_COLLECTIBLE_KINDS as readonly string[]).includes(value)
  );
}

export async function GET(req: NextRequest) {
  const ownerId =
    req.nextUrl.searchParams.get("ownerId") ??
    (await resolveSessionUserId(req));

  if (!ownerId) {
    return NextResponse.json({ collectibles: [], albums: [] });
  }

  const kindParam = req.nextUrl.searchParams.get("kind");
  const kind = isKind(kindParam) ? kindParam : undefined;
  const favoritesOnly = req.nextUrl.searchParams.get("favorites") === "1";
  const trashOnly = req.nextUrl.searchParams.get("trash") === "1";
  const albumId = req.nextUrl.searchParams.get("albumId") ?? undefined;
  const includeAlbums = req.nextUrl.searchParams.get("albums") !== "0";

  const [collectibles, albums] = await Promise.all([
    listCollectibles({
      ownerId,
      kind,
      albumId,
      favoritesOnly,
      trashOnly,
      take: 200,
    }),
    includeAlbums ? listAlbums(ownerId) : Promise.resolve([]),
  ]);

  return NextResponse.json({ collectibles, albums });
}

export async function POST(req: NextRequest) {
  const userId = await resolveSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      action?: "create" | "album";
      kind?: MemoryCollectibleKind;
      title?: string;
      subtitle?: string;
      mediaUrl?: string;
      thumbnailUrl?: string;
      artworkUrl?: string;
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
      // album create
      albumTitle?: string;
      presetKey?: string;
      coverUrl?: string;
      animatedBorder?: string;
    };

    if (body.action === "album") {
      const album = await createAlbum({
        ownerId: userId,
        title: body.albumTitle ?? body.title ?? "",
        presetKey: body.presetKey,
        coverUrl: body.coverUrl,
        animatedBorder: body.animatedBorder,
      });
      if (!album) {
        return NextResponse.json({ error: "Album create failed" }, { status: 400 });
      }
      return NextResponse.json({ album });
    }

    if (!isKind(body.kind) || !body.title?.trim()) {
      return NextResponse.json(
        { error: "kind and title are required" },
        { status: 400 },
      );
    }

    const collectible = await createCollectible({
      ownerId: userId,
      kind: body.kind,
      title: body.title,
      subtitle: body.subtitle,
      mediaUrl: body.mediaUrl,
      thumbnailUrl: body.thumbnailUrl,
      artworkUrl: body.artworkUrl,
      albumId: body.albumId,
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
      captureDestination: body.captureDestination ?? "MEMORY_WALL",
      mediaVariants: body.mediaVariants,
      motionPair: body.motionPair,
      rimStyleId: body.rimStyleId,
      animationPreset: body.animationPreset,
      burstGroupId: body.burstGroupId,
    });

    if (!collectible) {
      return NextResponse.json({ error: "Create failed" }, { status: 400 });
    }
    return NextResponse.json({ collectible });
  } catch (err) {
    console.error("[memory/collectibles POST]", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const userId = await resolveSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      collectibleId?: string;
      isFavorite?: boolean;
      restore?: boolean;
    };
    if (!body.collectibleId) {
      return NextResponse.json({ error: "collectibleId required" }, { status: 400 });
    }

    if (body.restore) {
      const ok = await restoreCollectible(userId, body.collectibleId);
      return ok
        ? NextResponse.json({ ok: true })
        : NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (typeof body.isFavorite === "boolean") {
      const ok = await setCollectibleFavorite(
        userId,
        body.collectibleId,
        body.isFavorite,
      );
      return ok
        ? NextResponse.json({ ok: true })
        : NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "No patch fields" }, { status: 400 });
  } catch (err) {
    console.error("[memory/collectibles PATCH]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await resolveSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { collectibleId?: string };
    if (!body.collectibleId) {
      return NextResponse.json({ error: "collectibleId required" }, { status: 400 });
    }
    const ok = await trashCollectible(userId, body.collectibleId);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err) {
    console.error("[memory/collectibles DELETE]", err);
    return NextResponse.json({ error: "Trash failed" }, { status: 500 });
  }
}
