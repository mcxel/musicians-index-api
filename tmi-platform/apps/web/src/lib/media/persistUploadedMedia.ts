import { promises as fs } from "node:fs";
import path from "node:path";
import { isDurablePlayableMediaUrl } from "@/lib/media/durablePlayableUrl";
import {
  blobOwnerPrefix,
  isBlobStorageAvailable,
  isSafeBlobPathname,
  toBlobPlaybackUrl,
} from "@/lib/media/blobStorage";

export const LOCAL_MEDIA_DIR = path.join(process.cwd(), ".tmi-data", "uploads", "media");
const MAX_DATA_URL_BYTES = 10 * 1024 * 1024;

export type MediaPersistStorage = "blob" | "local_disk" | "data_url";

export type PersistUploadedMediaResult =
  | { ok: true; url: string; storage: MediaPersistStorage; pathname?: string }
  | { ok: false; error: string; status: number };

function safeFileBase(fileName: string): string {
  const base = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_");
  return base || "upload";
}

function blobPutOptions(file: File): {
  access: "private";
  addRandomSuffix: true;
  multipart: boolean;
  contentType?: string;
} {
  return {
    access: "private",
    addRandomSuffix: true,
    multipart: file.size > 1024 * 1024,
    contentType: file.type || undefined,
  };
}

/**
 * Single durable-store path for audio/video uploads.
 * Blob first when OIDC store id or legacy token is present.
 * Local disk only in development (same folder the local GET route reads).
 * Production without Blob: small files as data URLs; large files honest reject.
 */
export async function persistUploadedMediaFile(input: {
  file: File;
  ownerId: string;
  fallbackExt: string;
}): Promise<PersistUploadedMediaResult> {
  const { file, ownerId, fallbackExt } = input;

  if (isBlobStorageAvailable()) {
    try {
      const { put } = await import("@vercel/blob");
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const pathname = `${blobOwnerPrefix(ownerId)}/${Date.now()}-${safeName}`;
      const blob = await put(pathname, file, blobPutOptions(file));
      const playbackUrl = toBlobPlaybackUrl(blob.pathname);
      if (!isDurablePlayableMediaUrl(playbackUrl)) {
        return { ok: false, error: "Storage returned an unplayable URL.", status: 503 };
      }
      return { ok: true, url: playbackUrl, storage: "blob", pathname: blob.pathname };
    } catch (err) {
      console.error("[persistUploadedMedia] blob put failed");
      if (err instanceof Error && err.message) {
        console.error("[persistUploadedMedia]", err.message);
      }
      return { ok: false, error: "Cloud storage failed. Try again or contact support.", status: 503 };
    }
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const isLocalDev = process.env.NODE_ENV !== "production";

  if (isLocalDev) {
    const ext = file.name.split(".").pop()?.toLowerCase() || fallbackExt;
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeFileBase(file.name)}.${ext}`;
    await fs.mkdir(LOCAL_MEDIA_DIR, { recursive: true });
    await fs.writeFile(path.join(LOCAL_MEDIA_DIR, fileName), bytes);
    const url = `/api/upload/media/local/${encodeURIComponent(fileName)}`;
    return { ok: true, url, storage: "local_disk" };
  }

  if (bytes.length > MAX_DATA_URL_BYTES) {
    return {
      ok: false,
      error:
        "File storage is not fully configured yet. Files larger than 10 MB cannot be uploaded in this environment.",
      status: 503,
    };
  }

  const url = `data:${file.type || "application/octet-stream"};base64,${bytes.toString("base64")}`;
  return { ok: true, url, storage: "data_url" };
}

/** After a client (browser → Blob) upload: verify the object exists, return playback URL. */
export async function persistVerifiedBlobPathname(pathname: string): Promise<PersistUploadedMediaResult> {
  if (!isBlobStorageAvailable()) {
    return { ok: false, error: "Cloud storage is not available in this environment.", status: 503 };
  }
  if (!isSafeBlobPathname(pathname)) {
    return { ok: false, error: "Invalid storage path.", status: 400 };
  }
  try {
    const { head } = await import("@vercel/blob");
    const meta = await head(pathname);
    const resolved = meta.pathname || pathname;
    const playbackUrl = toBlobPlaybackUrl(resolved);
    if (!isDurablePlayableMediaUrl(playbackUrl)) {
      return { ok: false, error: "Storage returned an unplayable URL.", status: 503 };
    }
    return { ok: true, url: playbackUrl, storage: "blob", pathname: resolved };
  } catch (err) {
    console.error("[persistUploadedMedia] blob head failed");
    if (err instanceof Error && err.message) {
      console.error("[persistUploadedMedia]", err.message);
    }
    return { ok: false, error: "Uploaded file was not found in cloud storage.", status: 404 };
  }
}
