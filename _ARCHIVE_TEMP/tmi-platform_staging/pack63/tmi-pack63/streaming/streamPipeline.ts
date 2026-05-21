// packages/media-pipeline/src/streamPipeline.ts
// Complete streaming pipeline spec for the platform.

export type StreamProtocol = "RTMP" | "SRT" | "WebRTC" | "HLS_INGEST" | "DASH";

export interface StreamIngestConfig {
  protocol: StreamProtocol;
  ingestUrl: string;        // where the artist streams to
  streamKey: string;        // unique per session
  bitrate: { min:number; recommended:number; max:number };
  resolution: { min:string; recommended:string; max:string };
  frameRate: { min:number; recommended:number; max:number };
  audioChannels: 1 | 2;
  supportedEncoders: string[];
}

export interface TranscodeProfile {
  quality: "1080p" | "720p" | "480p" | "360p" | "240p" | "audio_only";
  bitrate: number;          // kbps
  resolution: string;
  fps: number;
  segment_duration_s: number;
}

export const TRANSCODE_PROFILES: TranscodeProfile[] = [
  { quality:"1080p",     bitrate:6000, resolution:"1920x1080", fps:30, segment_duration_s:2 },
  { quality:"720p",      bitrate:3000, resolution:"1280x720",  fps:30, segment_duration_s:2 },
  { quality:"480p",      bitrate:1500, resolution:"854x480",   fps:30, segment_duration_s:2 },
  { quality:"360p",      bitrate:800,  resolution:"640x360",   fps:30, segment_duration_s:2 },
  { quality:"240p",      bitrate:400,  resolution:"426x240",   fps:24, segment_duration_s:4 },
  { quality:"audio_only",bitrate:128,  resolution:"0x0",       fps:0,  segment_duration_s:4 },
];

export interface HighlightMoment {
  roomId: string;
  streamSessionId: string;
  offsetSeconds: number;     // where in the stream
  type: "crowd_reaction" | "crown_moment" | "game_win" | "tip_spike" | "battle_end" | "manual_flag";
  intensity: number;         // 0-100
  durationSeconds: number;   // clip length
  thumbnailUrl?: string;
  autoPublish: boolean;
}

// 5 automatic highlight triggers
export const HIGHLIGHT_TRIGGERS = {
  REACTION_SPIKE:    { type:"crowd_reaction", threshold:50,   windowSeconds:10, description:"50+ reactions in 10s" },
  TIP_SPIKE:         { type:"tip_spike",       threshold:1000, windowSeconds:30, description:"$10+ in tips in 30s" },
  GAME_WIN:          { type:"game_win",         threshold:1,    windowSeconds:0,  description:"Any game winner moment" },
  CROWN_MOMENT:      { type:"crown_moment",     threshold:1,    windowSeconds:0,  description:"Crown awarded" },
  BATTLE_END:        { type:"battle_end",       threshold:1,    windowSeconds:0,  description:"Cypher battle concluded" },
} as const;

export interface ReplaySession {
  replayId: string;
  originalRoomId: string;
  streamSessionId: string;
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
  hlsUrl: string;          // replay HLS playlist URL
  thumbnailUrl?: string;
  viewCount: number;
  highlights: HighlightMoment[];
  archivePolicy: "keep_forever" | "keep_30_days" | "keep_7_days" | "delete_on_request";
}
