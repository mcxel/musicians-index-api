/**
 * LiveLobbyPreviewEngine
 * Determines whether a performer is live and returns the correct preview data.
 * Wraps LiveRoomEngine + LivePresenceEngine into a single query interface.
 *
 * Usage in article/profile pages:
 *   const preview = getLivePreviewData(artistSlug);
 *   if (preview.isLive) render <LiveLobbyPreviewWindow />
 *   else render <ArticleMotionPreview />
 */

import { getAllRoomSnapshots } from "@/lib/live/LivePresenceEngine";

export interface LivePreviewData {
  isLive: boolean;
  artistSlug: string;
  roomId: string | null;
  roomLabel: string | null;
  audienceCount: number;
  energyLevel: number;
  currentSong: string | null;
  joinUrl: string | null;
  cameraMode: "wide" | "close" | "crowd" | "stage";
  lightingMood: "neon" | "dim" | "spotlight" | "full";
}

export interface MotionFallbackData {
  artistSlug: string;
  portraitImage: string;
  loopType: "montage" | "cinematic" | "magazine";
  accentColor: string;
}

const CURATED_IMAGES = [
  "/tmi-curated/mag-20.jpg",
  "/tmi-curated/mag-28.jpg",
  "/tmi-curated/mag-35.jpg",
  "/tmi-curated/mag-42.jpg",
  "/tmi-curated/mag-50.jpg",
  "/tmi-curated/mag-58.jpg",
  "/tmi-curated/mag-66.jpg",
  "/tmi-curated/mag-74.jpg",
  "/tmi-curated/mag-82.jpg",
];

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

function getMotionPortrait(slug: string): string {
  return CURATED_IMAGES[hashSlug(slug) % CURATED_IMAGES.length];
}

export function getLivePreviewData(artistSlug: string): LivePreviewData {
  try {
    const snapshots = getAllRoomSnapshots();
    const liveRoom = snapshots.find(snapshot =>
      snapshot.activePerformers.some(p =>
        p.displayName.toLowerCase().replace(/\s+/g, "-") === artistSlug.toLowerCase()
      )
    );

    if (liveRoom) {
      return {
        isLive: true,
        artistSlug,
        roomId: liveRoom.roomId,
        roomLabel: "Live Room",
        audienceCount: liveRoom.totalCount,
        energyLevel: Math.min(100, liveRoom.totalCount * 8),
        currentSong: null,
        joinUrl: `/live/${liveRoom.roomId}`,
        cameraMode: "stage",
        lightingMood: "neon",
      };
    }
  } catch {
    // Presence snapshot not available — fall through to offline state
  }

  return {
    isLive: false,
    artistSlug,
    roomId: null,
    roomLabel: null,
    audienceCount: 0,
    energyLevel: 0,
    currentSong: null,
    joinUrl: null,
    cameraMode: "wide",
    lightingMood: "dim",
  };
}

export function getMotionFallback(artistSlug: string): MotionFallbackData {
  const h = hashSlug(artistSlug);
  const loops: MotionFallbackData["loopType"][] = ["montage", "cinematic", "magazine"];
  const colors = ["#FFD700", "#FF2DAA", "#00FFFF", "#AA2DFF", "#00FF88"];

  return {
    artistSlug,
    portraitImage: getMotionPortrait(artistSlug),
    loopType: loops[h % loops.length],
    accentColor: colors[h % colors.length],
  };
}

export function isPerformerLive(artistSlug: string): boolean {
  return getLivePreviewData(artistSlug).isLive;
}
