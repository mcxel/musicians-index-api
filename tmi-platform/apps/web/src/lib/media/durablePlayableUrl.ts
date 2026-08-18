/**
 * Refresh-safe playback URL check.
 * Song.audioUrl / Video.videoUrl / Beat.previewUrl are the canonical source fields.
 * blob: URLs die on refresh and must never be persisted or queued as canonical.
 */

import { toClientPlayableMediaUrl } from "@/lib/media/blobStorage";

const SIMULATED_CDN = "cdn.themusiciansindex.com/media/";

export function isDurablePlayableMediaUrl(url: string | null | undefined): url is string {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed === "#") return false;
  if (trimmed.startsWith("blob:")) return false;
  if (trimmed.includes(SIMULATED_CDN)) return false;
  return (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("/api/upload/media/local/") ||
    trimmed.startsWith("/api/media/blob") ||
    trimmed.startsWith("/api/media/play/")
  );
}

export function resolveDurablePlayableSrc(url: string | null | undefined): string | null {
  if (!isDurablePlayableMediaUrl(url)) return null;
  const playable = toClientPlayableMediaUrl(url);
  return isDurablePlayableMediaUrl(playable) ? playable : null;
}
