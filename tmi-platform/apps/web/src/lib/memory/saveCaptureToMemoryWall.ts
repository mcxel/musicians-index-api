/**
 * Thin capture → Memory Wall destination bridge (Phase 7.3)
 *
 * Reuses existing CaptureEngine snap helpers. Does NOT rebuild the camera suite.
 * Default post-capture destination is MEMORY_WALL (collectibles table).
 * Cinematic HD camera tools / Ken Burns / AI search = FUTURE 7.4+ — not stubbed.
 */

import type {
  MemoryCaptureDestination,
  MemoryCaptureQuality,
  MemoryCollectibleKind,
  CreateCollectibleInput,
} from "./collectiblesContracts";
import { createCollectible } from "./collectiblesPersistence";
import type { CollectibleMemoryRecord } from "./collectiblesContracts";
import type { CaptureType } from "@/lib/capture/CaptureEngine";

export interface SaveCaptureToMemoryWallInput {
  ownerId: string;
  imageData: string;
  title?: string;
  captureType?: CaptureType;
  eventId?: string;
  venueId?: string;
  roomId?: string;
  taggedUserIds?: string[];
  albumId?: string;
  quality?: MemoryCaptureQuality;
  destination?: MemoryCaptureDestination;
  visibility?: CreateCollectibleInput["visibility"];
}

function kindFromCaptureType(captureType?: CaptureType): MemoryCollectibleKind {
  if (captureType === "event_poster") return "POSTER";
  return "PHOTO";
}

/**
 * Persist a captured image into MemoryCollectible with destination MEMORY_WALL
 * (or ALBUM / PRIVATE when caller overrides). Returns null on invalid input / DB fail.
 */
export async function saveCaptureToMemoryWall(
  input: SaveCaptureToMemoryWallInput,
): Promise<CollectibleMemoryRecord | null> {
  const ownerId = input.ownerId?.trim();
  const mediaUrl = input.imageData?.trim();
  if (!ownerId || !mediaUrl) return null;

  const destination: MemoryCaptureDestination = input.destination ?? "MEMORY_WALL";
  // Only Memory Wall / album / private destinations write to collectibles here.
  // SHARE_FRIENDS / SNIP / YOPHO / PROFILE are 7.4+ wiring — refuse silently for honesty.
  if (
    destination !== "MEMORY_WALL" &&
    destination !== "ALBUM" &&
    destination !== "PRIVATE"
  ) {
    return null;
  }

  const kind = kindFromCaptureType(input.captureType);
  const title =
    input.title?.trim() ||
    (input.captureType ? `Capture · ${input.captureType}` : "Memory capture");

  return createCollectible({
    ownerId,
    kind,
    title,
    mediaUrl,
    thumbnailUrl: mediaUrl.startsWith("data:") ? undefined : mediaUrl,
    eventId: input.eventId ?? input.roomId,
    venueId: input.venueId,
    taggedUserIds: input.taggedUserIds,
    albumId: destination === "ALBUM" ? input.albumId : input.albumId,
    captureQuality: input.quality ?? "STANDARD",
    captureDestination: destination,
    visibility: input.visibility ?? "private",
  });
}
