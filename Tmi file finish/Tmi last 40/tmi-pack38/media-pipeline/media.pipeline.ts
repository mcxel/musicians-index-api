// packages/media-pipeline/src/media.pipeline.ts
// Upload → validate → encode → thumbnail → CDN delivery.
// Uses S3/Cloudflare R2 for storage, FFmpeg for encoding.

export type MediaPipelineStage =
  | "upload_received"       // raw file arrives
  | "virus_scan"            // ClamAV or similar
  | "format_validate"       // check MIME type, magic bytes
  | "content_moderation"    // AI moderation for NSFW/harmful
  | "image_resize"          // multiple sizes for images
  | "video_transcode"       // MP4 → HLS (1080p, 720p, 480p, 360p)
  | "audio_encode"          // AAC encode + waveform generation
  | "thumbnail_generate"    // video frame → thumbnail
  | "cdn_upload"            // push to CDN origin
  | "cdn_purge"             // invalidate old cached version
  | "database_update"       // update Upload record with CDN URLs
  | "delivery_ready";       // asset available to users

export interface MediaPipelineJob {
  uploadId: string;
  userId: string;
  originalUrl: string;
  mediaType: "IMAGE" | "VIDEO" | "AUDIO" | "AVATAR" | "COVER" | "BANNER";
  stages: MediaPipelineStage[];
  completedStages: MediaPipelineStage[];
  currentStage: MediaPipelineStage;
  isComplete: boolean;
  error?: string;
  outputs: {
    cdnUrl?: string;
    thumbnailUrl?: string;
    waveformUrl?: string;
    hlsManifestUrl?: string;     // for video: m3u8 playlist
    variants?: VideoVariant[];   // 1080p, 720p, etc
  };
  createdAt: Date;
}

export interface VideoVariant {
  resolution: "1080p" | "720p" | "480p" | "360p" | "240p";
  bitratekbps: number;
  url: string;
}

// ── VIDEO TRANSCODE SPEC ──────────────────────────────────
export const VIDEO_TRANSCODE_SPEC = {
  "1080p": { width: 1920, height: 1080, videoBitrate: 5000, audioBitrate: 192 },
  "720p":  { width: 1280, height: 720,  videoBitrate: 2500, audioBitrate: 128 },
  "480p":  { width: 854,  height: 480,  videoBitrate: 1000, audioBitrate: 96  },
  "360p":  { width: 640,  height: 360,  videoBitrate: 600,  audioBitrate: 96  },
  "240p":  { width: 426,  height: 240,  videoBitrate: 300,  audioBitrate: 64  },
} as const;

// ── IMAGE RESIZE SPEC ────────────────────────────────────
export const IMAGE_RESIZE_SPEC = {
  avatar:    [{ w: 512, h: 512 }, { w: 128, h: 128 }, { w: 64, h: 64 }],
  cover:     [{ w: 1920, h: 1080 }, { w: 960, h: 540 }, { w: 480, h: 270 }],
  banner:    [{ w: 1920, h: 480 }, { w: 960, h: 240 }],
  thumbnail: [{ w: 400, h: 300 }, { w: 200, h: 150 }],
  product:   [{ w: 800, h: 800 }, { w: 400, h: 400 }, { w: 200, h: 200 }],
} as const;

// ── CDN FOLDER STRUCTURE ──────────────────────────────────
// All media lives under a structured CDN path
export function getCDNPath(
  userId: string,
  mediaType: string,
  filename: string
): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  // e.g. /media/artists/2026/03/[userId]/avatar-512.webp
  return `/media/${mediaType}/${year}/${month}/${userId}/${filename}`;
}

// ── MOTION VIDEO PIPELINE (3-second artist clips) ─────────
// Artists can upload 3-second motion clips for their cards on Home 1
export const MOTION_CLIP_SPEC = {
  maxDurationSeconds: 3,
  outputFormats: ["webm", "mp4"],  // webm primary, mp4 fallback
  resolution: { w: 400, h: 500 }, // portrait for magazine cards
  transparent: true,               // webm supports alpha channel
  loop: true,                      // plays on loop in card
  autoplay: true,
  muted: true,                     // always muted for autoplay
};
