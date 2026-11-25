/**
 * MediaIngestionService — canonical URL-based media import pipeline.
 *
 * Used by POST /api/media/ingest and any future media-add entry point.
 * Never stores tokens, OAuth secrets, or private credentials.
 * oEmbed is used for public metadata resolution (YouTube, SoundCloud).
 * All other providers resolve via URL parsing only.
 */

export type MediaProvider =
  | "youtube"
  | "soundcloud"
  | "spotify"
  | "apple_music"
  | "tidal"
  | "bandcamp"
  | "suno"
  | "tmi"
  | "external";

export type MediaPlaybackKind = "native" | "official_embed" | "external_reference";

export interface SunoShareRef {
  provider: "suno";
  trackId: string;
  shareUrl: string;
  officialEmbedUrl: string;
}

export type IngestionErrorCode =
  | "INVALID_URL"
  | "UNSUPPORTED_PROVIDER"
  | "NO_PLAYABLE_SOURCE"
  | "PRIVATE_OR_UNAUTHORIZED_MEDIA"
  | "DUPLICATE_TRACK"
  | "IMPORT_FAILED"
  | "SAVE_FAILED";

export interface MediaMetadata {
  title: string;
  artistName: string | null;
  coverUrl: string | null;
  duration: number | null;       // seconds
  provider: MediaProvider;
  sourceUrl: string;             // canonical durable URL stored in DB
  providerTrackId: string | null;
  /** Native TMI <audio> playback. Official embeds are not native playable. */
  isPlayable: boolean;
  playbackKind: MediaPlaybackKind;
  officialEmbedUrl: string | null;
}

export interface IngestionError {
  code: IngestionErrorCode;
  message: string;
}

export type IngestionResult =
  | { ok: true; metadata: MediaMetadata }
  | { ok: false; error: IngestionError };

// ── Provider detection ────────────────────────────────────────────────────────

const YOUTUBE_PATTERNS = [
  /youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})/,
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
];

const SOUNDCLOUD_PATTERN = /soundcloud\.com\/([^/]+\/[^/?#]+)/;
const SPOTIFY_PATTERN    = /open\.spotify\.com\/(track|album|playlist)\/([A-Za-z0-9]+)/;
const APPLE_PATTERN      = /music\.apple\.com\/[a-z]{2}\/(?:album|music-video|song)\/[^/]+\/(\d+)/;
const TIDAL_PATTERN      = /tidal\.com\/(?:browse\/)?(?:track|album|playlist)\/(\d+)/;
const BANDCAMP_PATTERN   = /[a-z0-9-]+\.bandcamp\.com\/track\/([^/?#]+)/;
const SUNO_ID = "[A-Za-z0-9_-]{6,80}";
const SUNO_PATH = new RegExp(
  `https?://(?:www\\.)?(?:suno\\.com|suno\\.ai)/(?:song|s|embed)/(${SUNO_ID})`,
  "i",
);

/** Official hosted player page — wrap this iframe. Never rip cdn2.suno audio. */
export function officialSunoEmbedUrl(trackId: string): string {
  return `https://suno.com/embed/${encodeURIComponent(trackId)}`;
}

export function parseSunoShareUrl(raw: string | null | undefined): SunoShareRef | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const match = trimmed.match(SUNO_PATH);
  if (!match?.[1]) return null;
  const trackId = match[1];
  return {
    provider: "suno",
    trackId,
    shareUrl: `https://suno.com/song/${trackId}`,
    officialEmbedUrl: officialSunoEmbedUrl(trackId),
  };
}

export function detectMediaProvider(url: string): { provider: MediaProvider; id: string | null } {
  const u = url.trim();
  const suno = parseSunoShareUrl(u);
  if (suno) return { provider: "suno", id: suno.trackId };

  for (const pattern of YOUTUBE_PATTERNS) {
    const m = u.match(pattern);
    if (m?.[1]) return { provider: "youtube", id: m[1] };
  }

  if (SOUNDCLOUD_PATTERN.test(u)) return { provider: "soundcloud", id: u.match(SOUNDCLOUD_PATTERN)?.[1] ?? null };
  if (SPOTIFY_PATTERN.test(u)) return { provider: "spotify", id: u.match(SPOTIFY_PATTERN)?.[2] ?? null };
  if (APPLE_PATTERN.test(u)) return { provider: "apple_music", id: u.match(APPLE_PATTERN)?.[1] ?? null };
  if (TIDAL_PATTERN.test(u)) return { provider: "tidal", id: u.match(TIDAL_PATTERN)?.[1] ?? null };
  if (BANDCAMP_PATTERN.test(u)) return { provider: "bandcamp", id: u.match(BANDCAMP_PATTERN)?.[1] ?? null };

  // TMI-hosted CDN or local media
  if (u.includes("/upload/media/") || u.includes(".tmi-data") || u.includes("neon.tech")) {
    return { provider: "tmi", id: null };
  }

  // Generic audio/video URL
  if (/\.(mp3|wav|ogg|m4a|aac|flac|mp4|webm|mov)(\?|$)/i.test(u)) {
    return { provider: "external", id: null };
  }

  return { provider: "external", id: null };
}

// ── oEmbed fetching (YouTube + SoundCloud only) ───────────────────────────────

interface OEmbedResponse {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
  duration?: number;
}

async function fetchOEmbed(url: string, provider: MediaProvider): Promise<OEmbedResponse | null> {
  try {
    let endpoint: string;
    if (provider === "youtube") {
      endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    } else if (provider === "soundcloud") {
      endpoint = `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    } else {
      return null;
    }

    const res = await fetch(endpoint, {
      headers: { "User-Agent": "TMI-MediaIngestion/1.0" },
      signal: AbortSignal.timeout(5000),
    });

    if (res.status === 401 || res.status === 403) return null;
    if (!res.ok) return null;

    return await res.json() as OEmbedResponse;
  } catch {
    return null;
  }
}

// ── Metadata resolution ───────────────────────────────────────────────────────

function titleFromUrl(url: string, id: string | null): string {
  if (id) return id.replace(/[-_]/g, " ");
  try {
    const u = new URL(url);
    const seg = u.pathname.split("/").filter(Boolean).pop();
    if (seg) return seg.replace(/[-_]/g, " ");
  } catch { /* noop */ }
  return "Untitled";
}

/** Resolve metadata for a URL. Does NOT persist anything. */
export async function resolveMediaMetadata(rawUrl: string): Promise<IngestionResult> {
  const url = rawUrl.trim();

  if (!url) {
    return { ok: false, error: { code: "INVALID_URL", message: "URL cannot be empty." } };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: { code: "INVALID_URL", message: "That doesn't look like a valid URL." } };
  }

  // Only allow https (security: prevent SSRF against local/internal networks)
  if (parsed.protocol !== "https:") {
    return { ok: false, error: { code: "INVALID_URL", message: "Only HTTPS URLs are supported." } };
  }

  // Block internal/private IP ranges (SSRF prevention)
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.startsWith("127.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("169.254.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    return { ok: false, error: { code: "INVALID_URL", message: "Internal URLs are not permitted." } };
  }

  const { provider, id } = detectMediaProvider(url);
  const suno = provider === "suno" ? parseSunoShareUrl(url) : null;

  // Try oEmbed for providers that support it
  const oembed = await fetchOEmbed(url, provider);

  if (oembed === null && (provider === "youtube" || provider === "soundcloud")) {
    // oEmbed returned 401/403 = private/unlisted
    return {
      ok: false,
      error: {
        code: "PRIVATE_OR_UNAUTHORIZED_MEDIA",
        message: "This media appears to be private or age-restricted and cannot be imported.",
      },
    };
  }

  const metadata: MediaMetadata = {
    title: oembed?.title ?? titleFromUrl(url, id),
    artistName: oembed?.author_name ?? null,
    coverUrl: oembed?.thumbnail_url ?? null,
    duration: oembed?.duration ?? null,
    provider,
    sourceUrl: suno?.shareUrl ?? url,
    providerTrackId: id,
    isPlayable: provider !== "suno",
    playbackKind: suno ? "official_embed" : "native",
    officialEmbedUrl: suno?.officialEmbedUrl ?? null,
  };

  return { ok: true, metadata };
}
