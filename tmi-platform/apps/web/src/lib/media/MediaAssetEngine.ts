/**
 * MediaAssetEngine — Unified media pipeline for TMI
 *
 * One system for all media across the platform:
 *   Songs · Videos · Livestreams · Interviews · Sponsor Assets
 *   Venue Promos · Challenge Entries · Battle Entries · Cypher Clips
 *
 * Flow: Upload → Classify → Validate → Store → Deliver → Analyze
 *
 * P9F: MediaProcessingEngine wired in — staged job queue on every upload.
 * P9 implementation — in-memory store for soft launch,
 * replace with Neon DB writes + Cloudflare R2 URLs post-launch.
 */

export type MediaType =
  | "song"
  | "video"
  | "livestream"
  | "interview"
  | "sponsor_asset"
  | "venue_promo"
  | "challenge_entry"
  | "battle_entry"
  | "cypher_entry"
  | "article_media"
  | "beat"
  | "nft_asset";

export type MediaStatus =
  | "uploading"
  | "processing"
  | "ready"
  | "failed"
  | "moderation_hold"
  | "archived";

export type MediaFormat = "mp3" | "mp4" | "wav" | "aac" | "webm" | "jpg" | "png" | "gif";

export interface MediaAsset {
  id:           string;
  ownerId:      string;
  ownerName:    string;
  ownerRole:    "performer" | "fan" | "venue" | "sponsor" | "advertiser" | "promoter";
  type:         MediaType;
  status:       MediaStatus;
  title:        string;
  description?: string;
  format:       MediaFormat;
  sizeBytes:    number;
  durationSecs?: number;    // for audio/video
  bpm?:         number;     // for beats/songs
  key?:         string;     // musical key for beats
  genre?:       string;
  tags:         string[];
  url:          string;     // CDN delivery URL
  thumbnailUrl?: string;
  waveformUrl?:  string;    // audio waveform image
  plays:        number;
  downloads:    number;
  revenue:      number;     // USD earned from this asset
  linkedEntityId?:  string; // challengeId, battleId, roomId, articleId, etc.
  linkedEntityType?: string;
  createdAt:    string;
  updatedAt:    string;
  metadata:     Record<string, string | number | boolean>;
}

export interface UploadRequest {
  ownerId:    string;
  ownerName:  string;
  ownerRole:  MediaAsset["ownerRole"];
  type:       MediaType;
  title:      string;
  description?: string;
  genre?:     string;
  tags?:      string[];
  bpm?:       number;
  key?:       string;
  linkedEntityId?: string;
  linkedEntityType?: string;
  // In production: actual file blob → R2 presigned URL → CDN
  // In soft launch: simulate URL
  simulatedFileName?: string;
  simulatedSizeBytes?: number;
  simulatedFormat?: MediaFormat;
  simulatedDurationSecs?: number;
}

export interface UploadResult {
  ok:          boolean;
  assetId?:    string;
  url?:        string;
  status?:     MediaStatus;
  error?:      string;
}

// ── Validation rules by type ──────────────────────────────────────────────────
const ALLOWED_FORMATS: Record<MediaType, MediaFormat[]> = {
  song:            ["mp3", "wav", "aac", "mp4"],
  beat:            ["mp3", "wav", "aac"],
  video:           ["mp4", "webm"],
  livestream:      ["mp4", "webm"],
  interview:       ["mp4", "webm"],
  challenge_entry: ["mp3", "wav", "aac", "mp4"],
  battle_entry:    ["mp3", "wav", "aac", "mp4", "webm"],
  cypher_entry:    ["mp3", "wav", "mp4", "webm"],
  article_media:   ["mp4", "jpg", "png", "gif"],
  sponsor_asset:   ["mp4", "jpg", "png"],
  venue_promo:     ["mp4", "jpg", "png"],
  nft_asset:       ["jpg", "png", "gif", "mp4"],
};

const MAX_SIZE_BYTES: Record<MediaType, number> = {
  song:            50 * 1024 * 1024,   // 50 MB
  beat:            50 * 1024 * 1024,
  video:           500 * 1024 * 1024,  // 500 MB
  livestream:      0,                  // streaming — no file size
  interview:       500 * 1024 * 1024,
  challenge_entry: 50 * 1024 * 1024,
  battle_entry:    100 * 1024 * 1024,
  cypher_entry:    100 * 1024 * 1024,
  article_media:   20 * 1024 * 1024,
  sponsor_asset:   50 * 1024 * 1024,
  venue_promo:     200 * 1024 * 1024,
  nft_asset:       10 * 1024 * 1024,
};

// ── In-memory store (replace with Neon DB post-launch) ───────────────────────
const ASSETS = new Map<string, MediaAsset>();

// Lazy import to avoid circular deps — processing engine uses MediaType from here
let _processingEngine: typeof import("@/lib/media/MediaProcessingEngine").MediaProcessingEngine | null = null;
async function getProcessingEngine() {
  if (!_processingEngine) {
    const mod = await import("@/lib/media/MediaProcessingEngine");
    _processingEngine = mod.MediaProcessingEngine;
  }
  return _processingEngine;
}

function generateId(): string {
  return `med_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Core engine ───────────────────────────────────────────────────────────────
export class MediaAssetEngineClass {
  private static instance: MediaAssetEngineClass | null = null;
  static getInstance(): MediaAssetEngineClass {
    if (!this.instance) this.instance = new MediaAssetEngineClass();
    return this.instance;
  }

  async upload(req: UploadRequest): Promise<UploadResult> {
    const format = (req.simulatedFormat ?? "mp3") as MediaFormat;
    const sizeBytes = req.simulatedSizeBytes ?? 4_500_000;

    // Validate format
    const allowed = ALLOWED_FORMATS[req.type] ?? [];
    if (!allowed.includes(format)) {
      return { ok: false, error: `Format .${format} not allowed for ${req.type}. Allowed: ${allowed.join(", ")}` };
    }

    // Validate size
    const maxSize = MAX_SIZE_BYTES[req.type] ?? 50 * 1024 * 1024;
    if (maxSize > 0 && sizeBytes > maxSize) {
      return { ok: false, error: `File too large (${(sizeBytes / 1024 / 1024).toFixed(1)} MB). Max: ${(maxSize / 1024 / 1024).toFixed(0)} MB` };
    }

    const id = generateId();
    const now = new Date().toISOString();

    // In production: upload to Cloudflare R2, get CDN URL
    // In soft launch: simulate CDN URL
    const cdnBase = process.env.NEXT_PUBLIC_CDN_URL ?? "https://cdn.themusiciansindex.com";
    const url = `${cdnBase}/media/${req.ownerId}/${id}.${format}`;

    const asset: MediaAsset = {
      id,
      ownerId:          req.ownerId,
      ownerName:        req.ownerName,
      ownerRole:        req.ownerRole,
      type:             req.type,
      status:           "processing",
      title:            req.title,
      description:      req.description,
      format,
      sizeBytes,
      durationSecs:     req.simulatedDurationSecs,
      bpm:              req.bpm,
      key:              req.key,
      genre:            req.genre,
      tags:             req.tags ?? [],
      url,
      plays:            0,
      downloads:        0,
      revenue:          0,
      linkedEntityId:   req.linkedEntityId,
      linkedEntityType: req.linkedEntityType,
      createdAt:        now,
      updatedAt:        now,
      metadata:         {},
    };

    ASSETS.set(id, asset);

    // Kick off staged processing pipeline
    getProcessingEngine().then(engine => {
      engine.queueJob(id, req.ownerId, req.type);
      // Advance asset to ready when job completes (poll-style for soft launch)
      const checkReady = setInterval(() => {
        const job = engine.getJobByAsset(id);
        if (job?.status === "complete") {
          clearInterval(checkReady);
          const a = ASSETS.get(id);
          if (a) ASSETS.set(id, {
            ...a,
            status: "ready",
            thumbnailUrl: `${cdnBase}/thumbs/${id}.jpg`,
            waveformUrl: req.type === "song" || req.type === "beat" ? `${cdnBase}/waveforms/${id}.png` : undefined,
            updatedAt: new Date().toISOString(),
          });
        }
        if (job?.status === "failed") {
          clearInterval(checkReady);
          const a = ASSETS.get(id);
          if (a) ASSETS.set(id, { ...a, status: "failed", updatedAt: new Date().toISOString() });
        }
      }, 500);
      // Safety: clear after 30s to avoid memory leaks in dev
      setTimeout(() => clearInterval(checkReady), 30_000);
    }).catch(() => {
      // Fallback: 2s direct promotion (matches original behaviour)
      setTimeout(() => {
        const a = ASSETS.get(id);
        if (a) ASSETS.set(id, { ...a, status: "ready", updatedAt: new Date().toISOString() });
      }, 2000);
    });

    return { ok: true, assetId: id, url, status: "processing" };
  }

  getAsset(id: string): MediaAsset | null {
    return ASSETS.get(id) ?? null;
  }

  getAll(): MediaAsset[] {
    return [...ASSETS.values()];
  }

  getByOwner(ownerId: string): MediaAsset[] {
    return [...ASSETS.values()].filter(a => a.ownerId === ownerId);
  }

  getByType(type: MediaType, status: MediaStatus = "ready"): MediaAsset[] {
    return [...ASSETS.values()].filter(a => a.type === type && a.status === status);
  }

  getByEntity(entityId: string, entityType?: string): MediaAsset[] {
    return [...ASSETS.values()].filter(a =>
      a.linkedEntityId === entityId &&
      (!entityType || a.linkedEntityType === entityType)
    );
  }

  recordPlay(id: string): void {
    const a = ASSETS.get(id);
    if (a) ASSETS.set(id, { ...a, plays: a.plays + 1, updatedAt: new Date().toISOString() });
  }

  recordDownload(id: string): void {
    const a = ASSETS.get(id);
    if (a) ASSETS.set(id, { ...a, downloads: a.downloads + 1 });
  }

  recordRevenue(id: string, amountUsd: number): void {
    const a = ASSETS.get(id);
    if (a) ASSETS.set(id, { ...a, revenue: a.revenue + amountUsd });
  }

  getAllowedFormats(type: MediaType): MediaFormat[] {
    return ALLOWED_FORMATS[type] ?? [];
  }

  getMaxSizeMB(type: MediaType): number {
    return Math.floor((MAX_SIZE_BYTES[type] ?? 0) / 1024 / 1024);
  }

  getStats(): { total: number; ready: number; processing: number; totalPlays: number; totalRevenue: number } {
    const all = [...ASSETS.values()];
    return {
      total:        all.length,
      ready:        all.filter(a => a.status === "ready").length,
      processing:   all.filter(a => a.status === "processing").length,
      totalPlays:   all.reduce((s, a) => s + a.plays, 0),
      totalRevenue: all.reduce((s, a) => s + a.revenue, 0),
    };
  }
}

export const MediaEngine = MediaAssetEngineClass.getInstance();

// ── Media type metadata (for UI labels) ──────────────────────────────────────
export const MEDIA_TYPE_META: Record<MediaType, { label: string; emoji: string; color: string }> = {
  song:            { label: "Song",             emoji: "🎵", color: "#FF2DAA" },
  beat:            { label: "Beat",             emoji: "🎛️", color: "#AA2DFF" },
  video:           { label: "Video",            emoji: "🎬", color: "#00FFFF" },
  livestream:      { label: "Livestream",       emoji: "📡", color: "#FF2020" },
  interview:       { label: "Interview",        emoji: "🎙️", color: "#FFD700" },
  challenge_entry: { label: "Challenge Entry",  emoji: "⚡", color: "#FFD700" },
  battle_entry:    { label: "Battle Entry",     emoji: "⚔️", color: "#FF2DAA" },
  cypher_entry:    { label: "Cypher Entry",     emoji: "🎤", color: "#00FFFF" },
  article_media:   { label: "Article Media",    emoji: "📰", color: "#00FF88" },
  sponsor_asset:   { label: "Sponsor Asset",    emoji: "🤝", color: "#00FF88" },
  venue_promo:     { label: "Venue Promo",      emoji: "🏟️", color: "#FF6B35" },
  nft_asset:       { label: "NFT Asset",        emoji: "🖼️", color: "#AA2DFF" },
};
