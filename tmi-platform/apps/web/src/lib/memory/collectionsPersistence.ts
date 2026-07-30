/**
 * Collections Engine — persistence helpers (media library)
 *
 * Wraps collectiblesPersistence with Collection-first terminology.
 * Unspecified collection → default “All Memories” (getOrCreate).
 * Dual-writes CollectionItem join when possible; keeps albumId for 7.4 compat.
 *
 * Never writes competition wins into photo Collections (Achievement path only).
 */

import prisma from "@/lib/prisma";
import {
  createAlbum,
  createCollectible,
  listAlbums,
  listCollectibles,
} from "./collectiblesPersistence";
import type {
  CollectibleMemoryRecord,
  CreateCollectibleInput,
  MemoryAlbumRecord,
} from "./collectiblesContracts";
import type {
  Collection,
  CollectionItem,
  CollectionUnlockAccess,
  CreateCollectionInput,
  FrameSkin,
  ListCollectionsQuery,
  MediaAsset,
  MediaEditInstruction,
  SaveMediaAssetInput,
} from "./collectionsContracts";
import {
  COLLECTION_UNLOCK_ACCESS,
  DEFAULT_COLLECTION_PRESET,
  DEFAULT_COLLECTION_TITLE,
  albumToCollection,
  collectibleToMediaAsset,
  normalizeVariantMap,
} from "./collectionsContracts";

type AlbumRow = {
  id: string;
  ownerId: string;
  title: string;
  presetKey: string | null;
  coverUrl: string | null;
  animatedBorder: string | null;
  isDefault?: boolean;
  unlockAccess?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function isUnlockAccess(value: unknown): value is CollectionUnlockAccess {
  return (
    typeof value === "string" &&
    (COLLECTION_UNLOCK_ACCESS as readonly string[]).includes(value)
  );
}

function toAlbumRecordExtended(row: AlbumRow): MemoryAlbumRecord & {
  isDefault: boolean;
  unlockAccess?: string | null;
} {
  return {
    id: row.id,
    ownerId: row.ownerId,
    title: row.title,
    presetKey: row.presetKey ?? undefined,
    coverUrl: row.coverUrl ?? undefined,
    animatedBorder: row.animatedBorder ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    isDefault: Boolean(row.isDefault),
    unlockAccess: row.unlockAccess,
  };
}

/** Ensure owner has a default “All Memories” Collection; create if missing. */
export async function getOrCreateDefaultCollection(
  ownerId: string,
): Promise<Collection | null> {
  const id = ownerId?.trim();
  if (!id) return null;

  try {
    const existing = await prisma.memoryAlbum.findFirst({
      where: { ownerId: id, isDefault: true },
    });
    if (existing) {
      return albumToCollection(toAlbumRecordExtended(existing as AlbumRow));
    }

    // Prefer an existing album titled All Memories if present (pre-migration rows).
    const byTitle = await prisma.memoryAlbum.findFirst({
      where: { ownerId: id, title: DEFAULT_COLLECTION_TITLE },
    });
    if (byTitle) {
      const updated = await prisma.memoryAlbum.update({
        where: { id: byTitle.id },
        data: {
          isDefault: true,
          presetKey: byTitle.presetKey ?? DEFAULT_COLLECTION_PRESET,
        },
      });
      return albumToCollection(toAlbumRecordExtended(updated as AlbumRow));
    }

    const created = await prisma.memoryAlbum.create({
      data: {
        ownerId: id,
        title: DEFAULT_COLLECTION_TITLE,
        presetKey: DEFAULT_COLLECTION_PRESET,
        isDefault: true,
      },
    });
    return albumToCollection(toAlbumRecordExtended(created as AlbumRow));
  } catch (err) {
    console.error("[collectionsPersistence.getOrCreateDefaultCollection]", err);
    return null;
  }
}

export async function listCollections(ownerId: string): Promise<Collection[]> {
  if (!ownerId.trim()) return [];
  try {
    const rows = await prisma.memoryAlbum.findMany({
      where: { ownerId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return rows.map((r) => albumToCollection(toAlbumRecordExtended(r as AlbumRow)));
  } catch (err) {
    // Fallback if isDefault column not yet migrated — use legacy listAlbums.
    console.error("[collectionsPersistence.listCollections]", err);
    const albums = await listAlbums(ownerId);
    return albums.map((a) =>
      albumToCollection({
        ...a,
        isDefault: a.title === DEFAULT_COLLECTION_TITLE,
      }),
    );
  }
}

export async function createCollection(
  input: CreateCollectionInput,
): Promise<Collection | null> {
  const ownerId = input.ownerId?.trim();
  const title = input.title?.trim();
  if (!ownerId || !title) return null;

  try {
    const row = await prisma.memoryAlbum.create({
      data: {
        ownerId,
        title,
        presetKey: input.presetKey?.toString() || null,
        coverUrl: input.coverUrl?.trim() || null,
        animatedBorder: input.animatedBorder?.trim() || null,
        isDefault: input.isDefault ?? false,
        unlockAccess: isUnlockAccess(input.unlockAccess) ? input.unlockAccess : null,
      },
    });
    return albumToCollection(toAlbumRecordExtended(row as AlbumRow));
  } catch (err) {
    console.error("[collectionsPersistence.createCollection]", err);
    // Compat path without new columns
    const album = await createAlbum({
      ownerId,
      title,
      presetKey: input.presetKey,
      coverUrl: input.coverUrl,
      animatedBorder: input.animatedBorder,
    });
    return album
      ? albumToCollection({ ...album, isDefault: Boolean(input.isDefault) })
      : null;
  }
}

async function writeCollectionItemJoin(
  collectionId: string,
  mediaAssetId: string,
): Promise<CollectionItem | null> {
  try {
    const row = await prisma.collectionItem.upsert({
      where: {
        collectionId_mediaAssetId: { collectionId, mediaAssetId },
      },
      create: { collectionId, mediaAssetId },
      update: {},
    });
    return {
      id: row.id,
      collectionId: row.collectionId,
      mediaAssetId: row.mediaAssetId,
      addedAt: row.addedAt.toISOString(),
    };
  } catch (err) {
    // Join table may not exist yet — albumId membership still valid.
    console.error("[collectionsPersistence.writeCollectionItemJoin]", err);
    return null;
  }
}

/**
 * Collection-first media save.
 * Unspecified collectionId → default “All Memories”.
 * Dual-writes albumId (7.4) + CollectionItem join when available.
 */
export async function saveMediaAssetToCollection(
  input: SaveMediaAssetInput,
): Promise<MediaAsset | null> {
  const ownerId = input.ownerId?.trim();
  if (!ownerId) return null;

  let collectionId = input.collectionId?.trim() || undefined;
  if (!collectionId) {
    const def = await getOrCreateDefaultCollection(ownerId);
    collectionId = def?.id;
  }

  const frameSkin = sanitizeFrameSkin(input.frameSkin);
  const mediaEdit = sanitizeMediaEdit(input.mediaEdit);
  const variants = normalizeVariantMap(input.mediaVariants);

  const createInput: CreateCollectibleInput = {
    ...input,
    albumId: collectionId,
    mediaVariants: variants,
    rimStyleId: frameSkin?.rimStyleId ?? input.rimStyleId,
    animationPreset: frameSkin?.animationPreset ?? input.animationPreset,
  };

  const created = await createCollectible(createInput);
  if (!created) return null;

  // Best-effort enrich with Collection Engine fields (ignore if columns missing).
  if (frameSkin || mediaEdit || input.unlockAccess) {
    try {
      await prisma.memoryCollectible.update({
        where: { id: created.id },
        data: {
          frameSkin: (frameSkin as any) ?? undefined,
          mediaEdit: (mediaEdit as any) ?? undefined,
          unlockAccess: isUnlockAccess(input.unlockAccess) ? input.unlockAccess : undefined,
        },
      });
    } catch {
      // Soft FUTURE fields — save already succeeded via createCollectible.
    }
  }

  if (collectionId && input.dualWriteJoin !== false) {
    await writeCollectionItemJoin(collectionId, created.id);
  }

  return collectibleToMediaAsset({
    ...created,
    frameSkin,
    mediaEdit: mediaEdit ?? undefined,
    unlockAccess: input.unlockAccess,
  });
}

export async function listMediaAssets(
  query: ListCollectionsQuery,
): Promise<MediaAsset[]> {
  const ownerId = query.ownerId?.trim();
  if (!ownerId) return [];

  const rows = await listCollectibles({
    ownerId,
    kind: query.kind,
    albumId: query.collectionId,
    favoritesOnly: query.favoritesOnly,
    trashOnly: query.trashOnly,
    includeTrash: query.includeTrash,
    take: query.take,
  });

  // Enrich with frameSkin / mediaEdit when columns exist.
  const ids = rows.map((r) => r.id);
  let extras = new Map<
    string,
    { frameSkin?: FrameSkin | null; mediaEdit?: MediaEditInstruction | null; unlockAccess?: string | null }
  >();
  if (ids.length > 0) {
    try {
      const enriched = await prisma.memoryCollectible.findMany({
        where: { id: { in: ids }, ownerId },
        select: {
          id: true,
          frameSkin: true,
          mediaEdit: true,
          unlockAccess: true,
        },
      });
      extras = new Map(
        enriched.map((e) => [
          e.id,
          {
            frameSkin: parseFrameSkin(e.frameSkin),
            mediaEdit: parseMediaEdit(e.mediaEdit),
            unlockAccess: e.unlockAccess,
          },
        ]),
      );
    } catch {
      extras = new Map();
    }
  }

  return rows.map((r) => {
    const extra = extras.get(r.id);
    return collectibleToMediaAsset({
      ...r,
      frameSkin: extra?.frameSkin,
      mediaEdit: extra?.mediaEdit ?? undefined,
      unlockAccess: extra?.unlockAccess,
    });
  });
}

function sanitizeFrameSkin(input?: FrameSkin): FrameSkin | undefined {
  if (!input || typeof input !== "object") return undefined;
  const out: FrameSkin = {};
  if (typeof input.rimStyleId === "string" && input.rimStyleId.trim()) {
    out.rimStyleId = input.rimStyleId.trim();
  }
  if (typeof input.bezelStyleId === "string" && input.bezelStyleId.trim()) {
    out.bezelStyleId = input.bezelStyleId.trim();
  }
  if (typeof input.glowColor === "string" && input.glowColor.trim()) {
    out.glowColor = input.glowColor.trim();
  }
  if (typeof input.glowIntensity === "number" && Number.isFinite(input.glowIntensity)) {
    out.glowIntensity = input.glowIntensity;
  }
  if (input.animationPreset) out.animationPreset = input.animationPreset;
  return Object.keys(out).length > 0 ? out : undefined;
}

function sanitizeMediaEdit(input?: MediaEditInstruction): MediaEditInstruction | undefined {
  if (!input || typeof input !== "object") return undefined;
  const masterAssetId = input.masterAssetId?.trim();
  if (!masterAssetId) return undefined;
  return {
    masterAssetId,
    ops: Array.isArray(input.ops) ? input.ops : undefined,
    editedVersionUrl:
      typeof input.editedVersionUrl === "string" && input.editedVersionUrl.trim()
        ? input.editedVersionUrl.trim()
        : undefined,
  };
}

function parseFrameSkin(raw: unknown): FrameSkin | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  return sanitizeFrameSkin(raw as FrameSkin);
}

function parseMediaEdit(raw: unknown): MediaEditInstruction | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  return sanitizeMediaEdit(raw as MediaEditInstruction);
}

/** Map CollectibleMemoryRecord → MediaAsset without DB round-trip. */
export function asMediaAsset(row: CollectibleMemoryRecord): MediaAsset {
  return collectibleToMediaAsset(row);
}
