/**
 * Memory & Collectibles Engine — Prisma persistence (EOS Phase 7.3 + 7.4)
 *
 * Server-side create / list / soft-delete (trash) / favorite / album helpers.
 * Honest empty arrays when the owner has no media (Rule 20).
 * Never writes competition ledger events (MATCH_COMPLETED etc.) into this table.
 *
 * Optional side-effect: after a real save, may append MEDIA_CAPTURED / MEDIA_SAVED /
 * TICKET_COLLECTED to MemoryLedger (event log only — wall never reads ledger as feed).
 */

import prisma from "@/lib/prisma";
import { MemoryLedger } from "@/core/eos/memoryLedger";
import type {
  CollectibleMemoryRecord,
  CreateAlbumInput,
  CreateCollectibleInput,
  ListCollectiblesQuery,
  MediaVariantMap,
  MemoryAlbumRecord,
  MemoryAnimationPreset,
  MemoryCaptureDestination,
  MemoryCaptureQuality,
  MemoryCollectibleKind,
  MemoryVisibility,
  MotionPair,
  MotionSourceFormat,
} from "./collectiblesContracts";
import {
  MEMORY_ANIMATION_PRESETS,
  MEMORY_COLLECTIBLE_KINDS,
  MOTION_SOURCE_FORMATS,
} from "./collectiblesContracts";

type PrismaCollectibleRow = {
  id: string;
  ownerId: string;
  kind: string;
  title: string;
  subtitle: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  artworkUrl: string | null;
  albumId: string | null;
  isFavorite: boolean;
  trashedAt: Date | null;
  visibility: string;
  eventId: string | null;
  venueId: string | null;
  ticketId: string | null;
  ticketCollectibleId: string | null;
  rarity: string | null;
  attendedAt: Date | null;
  locationLabel: string | null;
  taggedUserIds: unknown;
  yophoPageId: string | null;
  editOriginalMediaId: string | null;
  captureQuality: string | null;
  captureDestination: string | null;
  mediaVariants: unknown;
  motionPair: unknown;
  rimStyleId: string | null;
  animationPreset: string | null;
  burstGroupId: string | null;
  capturedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

function isCollectibleKind(value: string): value is MemoryCollectibleKind {
  return (MEMORY_COLLECTIBLE_KINDS as readonly string[]).includes(value);
}

function isAnimationPreset(value: string): value is MemoryAnimationPreset {
  return (MEMORY_ANIMATION_PRESETS as readonly string[]).includes(value);
}

function isMotionSourceFormat(value: unknown): value is MotionSourceFormat {
  return (
    typeof value === "string" &&
    (MOTION_SOURCE_FORMATS as readonly string[]).includes(value)
  );
}

function parseTaggedUserIds(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const ids = raw.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  return ids.length > 0 ? ids : undefined;
}

function parseMediaVariants(raw: unknown): MediaVariantMap | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const obj = raw as Record<string, unknown>;
  const out: MediaVariantMap = {};
  for (const key of ["ORIGINAL_MASTER", "VIEWING", "PREVIEW", "THUMBNAIL"] as const) {
    const v = obj[key];
    if (typeof v === "string" && v.trim()) out[key] = v.trim();
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function parseMotionPair(raw: unknown): MotionPair | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const obj = raw as Record<string, unknown>;
  const stillUrl = typeof obj.stillUrl === "string" ? obj.stillUrl.trim() : "";
  const motionUrl = typeof obj.motionUrl === "string" ? obj.motionUrl.trim() : "";
  const durationMs =
    typeof obj.durationMs === "number" && Number.isFinite(obj.durationMs)
      ? obj.durationMs
      : NaN;
  if (!stillUrl || !motionUrl || !Number.isFinite(durationMs) || durationMs <= 0) {
    return undefined;
  }
  if (!isMotionSourceFormat(obj.sourceFormat)) return undefined;
  return {
    stillUrl,
    motionUrl,
    durationMs,
    hasAudio: typeof obj.hasAudio === "boolean" ? obj.hasAudio : undefined,
    posterFrameMs:
      typeof obj.posterFrameMs === "number" && Number.isFinite(obj.posterFrameMs)
        ? obj.posterFrameMs
        : undefined,
    sourceFormat: obj.sourceFormat,
  };
}

function sanitizeMotionPair(input?: MotionPair): MotionPair | undefined {
  if (!input) return undefined;
  return parseMotionPair(input);
}

function sanitizeMediaVariants(input?: MediaVariantMap): MediaVariantMap | undefined {
  if (!input) return undefined;
  return parseMediaVariants(input);
}

function toRecord(row: PrismaCollectibleRow): CollectibleMemoryRecord {
  const animationPreset = row.animationPreset
    ? isAnimationPreset(row.animationPreset)
      ? row.animationPreset
      : undefined
    : undefined;

  return {
    id: row.id,
    ownerId: row.ownerId,
    kind: isCollectibleKind(row.kind) ? row.kind : "KEEPSAKE",
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    mediaUrl: row.mediaUrl ?? undefined,
    thumbnailUrl: row.thumbnailUrl ?? undefined,
    artworkUrl: row.artworkUrl ?? undefined,
    albumId: row.albumId ?? undefined,
    isFavorite: row.isFavorite,
    trashedAt: row.trashedAt ? row.trashedAt.toISOString() : null,
    visibility: (row.visibility as MemoryVisibility) || "private",
    eventId: row.eventId ?? undefined,
    venueId: row.venueId ?? undefined,
    ticketId: row.ticketId ?? undefined,
    ticketCollectibleId: row.ticketCollectibleId ?? undefined,
    rarity: row.rarity ?? undefined,
    attendedAt: row.attendedAt ? row.attendedAt.toISOString() : undefined,
    locationLabel: row.locationLabel ?? undefined,
    taggedUserIds: parseTaggedUserIds(row.taggedUserIds),
    yophoPageId: row.yophoPageId ?? undefined,
    editOriginalMediaId: row.editOriginalMediaId ?? undefined,
    captureQuality: (row.captureQuality as MemoryCaptureQuality | null) ?? undefined,
    captureDestination: (row.captureDestination as MemoryCaptureDestination | null) ?? undefined,
    mediaVariants: parseMediaVariants(row.mediaVariants),
    motionPair: parseMotionPair(row.motionPair),
    rimStyleId: row.rimStyleId ?? undefined,
    animationPreset,
    burstGroupId: row.burstGroupId ?? undefined,
    capturedAt: row.capturedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toAlbumRecord(row: {
  id: string;
  ownerId: string;
  title: string;
  presetKey: string | null;
  coverUrl: string | null;
  animatedBorder: string | null;
  createdAt: Date;
  updatedAt: Date;
}): MemoryAlbumRecord {
  return {
    id: row.id,
    ownerId: row.ownerId,
    title: row.title,
    presetKey: row.presetKey ?? undefined,
    coverUrl: row.coverUrl ?? undefined,
    animatedBorder: row.animatedBorder ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Best-effort ledger side-effect after a real collectible save (never feeds the wall). */
function emitLedgerSideEffect(record: CollectibleMemoryRecord): void {
  try {
    const kind =
      record.kind === "TICKET"
        ? "TICKET_COLLECTED"
        : record.captureDestination === "MEMORY_WALL"
          ? "MEDIA_SAVED"
          : "MEDIA_CAPTURED";
    MemoryLedger.record(kind, record.ownerId, {
      roomId: record.eventId,
      payload: {
        collectibleId: record.id,
        kind: record.kind,
        hasMotion: Boolean(record.motionPair?.motionUrl),
      },
    });
  } catch {
    // Side-effect only — never fail the save.
  }
}

/** Create a collectible only when real owner + kind + title exist — no fabricated rows. */
export async function createCollectible(
  input: CreateCollectibleInput,
): Promise<CollectibleMemoryRecord | null> {
  const ownerId = input.ownerId?.trim();
  const title = input.title?.trim();
  if (!ownerId || !title || !isCollectibleKind(input.kind)) return null;

  // Tickets require a real ticketId — never mint a keepsake without one.
  if (input.kind === "TICKET" && !input.ticketId?.trim()) return null;

  const mediaVariants = sanitizeMediaVariants(input.mediaVariants);
  const motionPair = sanitizeMotionPair(input.motionPair);
  const animationPreset =
    input.animationPreset && isAnimationPreset(input.animationPreset)
      ? input.animationPreset
      : undefined;

  try {
    const row = await prisma.memoryCollectible.create({
      data: {
        ownerId,
        kind: input.kind,
        title,
        subtitle: input.subtitle?.trim() || null,
        mediaUrl: input.mediaUrl?.trim() || null,
        thumbnailUrl: input.thumbnailUrl?.trim() || null,
        artworkUrl: input.artworkUrl?.trim() || null,
        albumId: input.albumId?.trim() || null,
        isFavorite: input.isFavorite ?? false,
        visibility: input.visibility ?? "private",
        eventId: input.eventId?.trim() || null,
        venueId: input.venueId?.trim() || null,
        ticketId: input.ticketId?.trim() || null,
        ticketCollectibleId: input.ticketCollectibleId?.trim() || null,
        rarity: input.rarity?.trim() || null,
        attendedAt: input.attendedAt ? new Date(input.attendedAt) : null,
        locationLabel: input.locationLabel?.trim() || null,
        taggedUserIds: input.taggedUserIds?.length ? input.taggedUserIds : undefined,
        yophoPageId: input.yophoPageId?.trim() || null,
        editOriginalMediaId: input.editOriginalMediaId?.trim() || null,
        captureQuality: input.captureQuality ?? null,
        captureDestination: input.captureDestination ?? "MEMORY_WALL",
        mediaVariants: mediaVariants ?? undefined,
        motionPair: motionPair ?? undefined,
        rimStyleId: input.rimStyleId?.trim() || null,
        animationPreset: animationPreset ?? null,
        burstGroupId: input.burstGroupId?.trim() || null,
        capturedAt: input.capturedAt ? new Date(input.capturedAt) : new Date(),
      },
    });
    const record = toRecord(row as PrismaCollectibleRow);
    emitLedgerSideEffect(record);
    return record;
  } catch (err) {
    console.error("[collectiblesPersistence.createCollectible]", err);
    return null;
  }
}

/** List collectibles for an owner. Returns [] when none (honest empty). */
export async function listCollectibles(
  query: ListCollectiblesQuery,
): Promise<CollectibleMemoryRecord[]> {
  const ownerId = query.ownerId?.trim();
  if (!ownerId) return [];

  try {
    const where: {
      ownerId: string;
      kind?: string;
      albumId?: string;
      isFavorite?: boolean;
      trashedAt?: null | { not: null };
    } = { ownerId };

    if (query.kind) where.kind = query.kind;
    if (query.albumId) where.albumId = query.albumId;
    if (query.favoritesOnly) where.isFavorite = true;
    if (query.trashOnly) where.trashedAt = { not: null };
    else if (!query.includeTrash) where.trashedAt = null;

    const rows = await prisma.memoryCollectible.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(Math.max(query.take ?? 100, 1), 500),
    });
    return rows.map((r) => toRecord(r as PrismaCollectibleRow));
  } catch (err) {
    console.error("[collectiblesPersistence.listCollectibles]", err);
    return [];
  }
}

/** Soft-delete (move to Trash). Owner-scoped. */
export async function trashCollectible(
  ownerId: string,
  collectibleId: string,
): Promise<boolean> {
  if (!ownerId.trim() || !collectibleId.trim()) return false;
  try {
    const result = await prisma.memoryCollectible.updateMany({
      where: { id: collectibleId, ownerId, trashedAt: null },
      data: { trashedAt: new Date() },
    });
    return result.count > 0;
  } catch (err) {
    console.error("[collectiblesPersistence.trashCollectible]", err);
    return false;
  }
}

/** Restore from Trash. */
export async function restoreCollectible(
  ownerId: string,
  collectibleId: string,
): Promise<boolean> {
  if (!ownerId.trim() || !collectibleId.trim()) return false;
  try {
    const result = await prisma.memoryCollectible.updateMany({
      where: { id: collectibleId, ownerId, trashedAt: { not: null } },
      data: { trashedAt: null },
    });
    return result.count > 0;
  } catch (err) {
    console.error("[collectiblesPersistence.restoreCollectible]", err);
    return false;
  }
}

export async function setCollectibleFavorite(
  ownerId: string,
  collectibleId: string,
  isFavorite: boolean,
): Promise<boolean> {
  if (!ownerId.trim() || !collectibleId.trim()) return false;
  try {
    const result = await prisma.memoryCollectible.updateMany({
      where: { id: collectibleId, ownerId },
      data: { isFavorite },
    });
    return result.count > 0;
  } catch (err) {
    console.error("[collectiblesPersistence.setCollectibleFavorite]", err);
    return false;
  }
}

export async function createAlbum(
  input: CreateAlbumInput,
): Promise<MemoryAlbumRecord | null> {
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
      },
    });
    return toAlbumRecord(row);
  } catch (err) {
    console.error("[collectiblesPersistence.createAlbum]", err);
    return null;
  }
}

export async function listAlbums(ownerId: string): Promise<MemoryAlbumRecord[]> {
  if (!ownerId.trim()) return [];
  try {
    const rows = await prisma.memoryAlbum.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toAlbumRecord);
  } catch (err) {
    console.error("[collectiblesPersistence.listAlbums]", err);
    return [];
  }
}
