/**
 * Vercel Blob availability + private playback URL helpers.
 * OIDC on Vercel (BLOB_STORE_ID) is enough — do not require BLOB_READ_WRITE_TOKEN.
 */

/** Vercel serverless request body limit is ~4.5 MB; stay under it for server puts. */
export const VERCEL_SERVER_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

export function isBlobStorageAvailable(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN) return true;
  const hasStore = Boolean(process.env.BLOB_STORE_ID);
  const onVercel = process.env.VERCEL === "1";
  const hasOidc = Boolean(process.env.VERCEL_OIDC_TOKEN);
  return hasStore && (onVercel || hasOidc);
}

export function blobClientUploadMode(): "oidc-presigned" | "rw-token" | "none" {
  if (process.env.BLOB_STORE_ID && (process.env.VERCEL === "1" || process.env.VERCEL_OIDC_TOKEN)) {
    return "oidc-presigned";
  }
  if (process.env.BLOB_READ_WRITE_TOKEN) return "rw-token";
  return "none";
}

export function sanitizeBlobOwnerId(ownerId: string): string {
  const safe = ownerId.replace(/[^a-zA-Z0-9._-]/g, "_");
  return safe || "user";
}

export function blobOwnerPrefix(ownerId: string): string {
  return `tmi-media/${sanitizeBlobOwnerId(ownerId)}`;
}

export function isSafeBlobPathname(pathname: string): boolean {
  if (!pathname) return false;
  if (pathname.includes("..") || pathname.includes("\\") || pathname.includes("\0")) return false;
  if (pathname.startsWith("/") || pathname.includes("://")) return false;
  return (
    pathname.startsWith("tmi-media/") ||
    pathname.startsWith("beats/") ||
    pathname.startsWith("uploads/")
  );
}

export function toBlobPlaybackUrl(pathname: string): string {
  return `/api/media/blob?pathname=${encodeURIComponent(pathname)}`;
}

export function extractBlobPathname(stored: string): string | null {
  const trimmed = stored.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/api/media/blob")) {
    try {
      const u = new URL(trimmed, "https://themusiciansindex.com");
      const p = u.searchParams.get("pathname");
      return p && isSafeBlobPathname(p) ? p : null;
    } catch {
      return null;
    }
  }

  if (trimmed.startsWith("tmi-media/") || trimmed.startsWith("beats/")) {
    return isSafeBlobPathname(trimmed) ? trimmed : null;
  }

  try {
    const u = new URL(trimmed);
    if (!/\.blob\.vercel-storage\.com$/i.test(u.hostname)) return null;
    const p = decodeURIComponent(u.pathname.replace(/^\//, ""));
    return isSafeBlobPathname(p) ? p : null;
  } catch {
    return null;
  }
}

/** Rewrite private Blob HTTPS URLs to the authenticated TMI stream route. */
export function toClientPlayableMediaUrl(stored: string): string {
  const pathname = extractBlobPathname(stored);
  if (pathname) return toBlobPlaybackUrl(pathname);
  return stored;
}

export function pathnameOwnedByUser(pathname: string, ownerId: string, email?: string): boolean {
  if (pathname.startsWith(`${blobOwnerPrefix(ownerId)}/`)) return true;
  if (email && pathname.startsWith(`${blobOwnerPrefix(email)}/`)) return true;
  return false;
}
