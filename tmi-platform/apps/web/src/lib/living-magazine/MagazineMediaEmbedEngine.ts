// MagazineMediaEmbedEngine
// Renders external content inside TMI surfaces.
// Uses Pointer + Cache + Embed model to avoid hosting everything.

export type EmbedPlatform =
  | "youtube" | "spotify" | "soundcloud" | "tiktok" | "instagram"
  | "apple-music" | "twitter" | "reddit" | "bandcamp" | "vimeo";

export type EmbedType = "video" | "audio" | "social" | "article" | "playlist" | "blog";

export interface EmbedPointer {
  id: string;
  platform: EmbedPlatform;
  embedType: EmbedType;
  sourceUrl: string;
  mediaId: string;         // platform-specific ID
  headline: string;
  summary: string;
  thumbnailUrl?: string;
  author: string;
  publishedAt: string;
  embedAllowed: boolean;   // false = link card only, no iframe
}

export interface EmbedRenderConfig {
  pointer: EmbedPointer;
  maxWidth?: number;
  aspectRatio?: "16:9" | "1:1" | "4:5" | "9:16";
  autoplay?: boolean;
  showCaption?: boolean;
}

// Builds the embed URL from a pointer
export function buildEmbedUrl(pointer: EmbedPointer): string | null {
  if (!pointer.embedAllowed) return null;

  switch (pointer.platform) {
    case "youtube":
      return `https://www.youtube.com/embed/${pointer.mediaId}?rel=0`;
    case "spotify":
      return `https://open.spotify.com/embed/track/${pointer.mediaId}`;
    case "soundcloud":
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(pointer.sourceUrl)}`;
    case "vimeo":
      return `https://player.vimeo.com/video/${pointer.mediaId}`;
    default:
      return null;
  }
}

// Determines if platform supports embed (vs. link-card-only)
export function supportsEmbed(platform: EmbedPlatform): boolean {
  return ["youtube", "spotify", "soundcloud", "vimeo", "bandcamp"].includes(platform);
}

// Creates a lightweight source card record (for Reddit-like link submissions)
export interface SourceCard {
  id: string;
  sourceUrl: string;
  headline: string;
  summary: string;
  thumbnailUrl?: string;
  category: string;
  submittedBy: string;
  upvotes: number;
  commentCount: number;
  createdAt: string;
}

export function createSourceCard(
  id: string,
  sourceUrl: string,
  headline: string,
  summary: string,
  submittedBy: string,
  category: string,
): SourceCard {
  return {
    id,
    sourceUrl,
    headline,
    summary,
    category,
    submittedBy,
    upvotes: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
  };
}
