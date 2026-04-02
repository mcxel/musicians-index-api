// packages/media-pipeline/src/media-complete.engine.ts
// Complete media system: upload, transcode, stream, clips, replay, highlights.

export type LiveStreamProvider = "mux" | "cloudflare_stream" | "agora";

// ── LIVESTREAM SYSTEM ─────────────────────────────────────
export interface LiveStreamSession {
  id: string;
  artistId: string;
  roomId: string;
  provider: LiveStreamProvider;
  streamKey: string;         // secret RTMP key
  ingestUrl: string;         // artist pushes to this
  playbackUrl: string;       // viewers pull from this (HLS m3u8)
  thumbnailUrl?: string;
  isRecording: boolean;
  status: "idle" | "live" | "ended" | "processing";
  peakViewers: number;
  totalMinutesStreamed: number;
  startedAt?: Date;
  endedAt?: Date;
}

// ── HLS QUALITY VARIANTS ──────────────────────────────────
export const HLS_VARIANTS = [
  { name: "1080p",  width: 1920, height: 1080, videoBitrate: 5000, audioBitrate: 192 },
  { name: "720p",   width: 1280, height: 720,  videoBitrate: 2500, audioBitrate: 128 },
  { name: "480p",   width: 854,  height: 480,  videoBitrate: 1000, audioBitrate: 96  },
  { name: "360p",   width: 640,  height: 360,  videoBitrate: 600,  audioBitrate: 96  },
  { name: "auto",   adaptive: true },  // ABR adaptive bitrate
] as const;

// ── CLIP GENERATION ───────────────────────────────────────
export interface ClipRequest {
  livestreamId: string;
  startSeconds: number;
  endSeconds: number;
  title?: string;
  autoHighlight?: boolean;   // AI-detected best moments
  thumbnailFrame?: number;   // seconds from start for thumbnail
  sponsorOverlay?: string;   // sponsor logo watermark
  outputFormats: ("mp4" | "webm" | "gif")[];
}

export interface ClipResult {
  clipId: string;
  mp4Url?: string;
  webmUrl?: string;
  gifUrl?: string;
  thumbnailUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  status: "processing" | "ready" | "failed";
}

// ── HIGHLIGHT DETECTION ───────────────────────────────────
export interface HighlightMoment {
  startSeconds: number;
  endSeconds: number;
  score: number;          // 0-1 significance score
  reason: string;         // "High viewer reaction", "Crown moment", "Big tip"
  type: "crowd_surge" | "crown_event" | "tip_milestone" | "game_winner" | "sponsor_mention";
}

// Auto-detection rules for highlight moments
export const HIGHLIGHT_RULES = {
  viewerSurge: { threshold: 20, windowSeconds: 30, score: 0.7 },
  tipMilestone: { threshold: 50_00, score: 0.9 },      // $50 tip
  crownEvent: { score: 1.0 },                           // always highlight
  gameWinner: { score: 0.9 },
  hypeSurge: { threshold: 90, score: 0.85 },            // hype > 90%
  reactionBurst: { threshold: 50, windowSeconds: 10, score: 0.8 },
} as const;

// ── REPLAY SYSTEM ──────────────────────────────────────────
export interface ReplaySession {
  id: string;
  livestreamId: string;
  playbackUrl: string;     // VOD URL after processing
  durationSeconds: number;
  highlights: HighlightMoment[];
  clipCount: number;
  status: "processing" | "ready" | "archived";
  processingStartedAt?: Date;
  readyAt?: Date;
  expiresAt?: Date;       // replays expire after N days
}

// ── MOTION ARTIST CARDS ────────────────────────────────────
// 3-second video clips for artist cards on Home 1
export const MOTION_CARD_SPEC = {
  maxDurationSeconds: 3,
  width: 400,
  height: 500,
  outputFormats: ["webm", "mp4"],
  transparent: true,      // alpha channel for webm
  loop: true,
  muted: true,
  autoplay: true,
  cdnPath: "/media/motion-cards/",
} as const;

// ── MEDIA API ROUTES ──────────────────────────────────────
export const MEDIA_ROUTES = {
  "POST /api/media/upload-url":          "Get pre-signed upload URL",
  "POST /api/media/confirm/:id":         "Start processing pipeline",
  "GET  /api/media/:id/status":          "Check pipeline progress",
  "GET  /api/media/:id":                 "Get media with CDN URLs",
  "POST /api/livestream/start":          "Start stream session",
  "POST /api/livestream/end":            "End stream + start replay",
  "GET  /api/livestream/:id":            "Stream details",
  "GET  /api/replays/:id":               "Replay with highlights",
  "POST /api/clips":                     "Create clip from replay",
  "GET  /api/clips/:id":                 "Get clip",
  "GET  /api/clips/highlights/:liveId":  "Auto-generated highlights",
};
