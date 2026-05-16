import { VisualAutoFillRuntime } from "@/lib/ai-visuals/VisualAutoFillRuntime";
import { VisualVideoBindingEngine } from "@/lib/video/VisualVideoBindingEngine";
import type { CrownRankRuntimeEntry } from "./CrownRankRuntime";
import { resolveArtistReelLink, type HomepageArticleLink } from "./ArtistReelLinkEngine";

export type HomepageRankingMotionSource =
  | "real-uploaded-artist-video"
  | "generated-motion-portrait"
  | "generated-motion-loop"
  | "generated-static-image"
  | "emergency-fallback";

export type HomepageRankingMotionRuntime = {
  artistId: string;
  rank: number;
  durationSeconds: 2 | 4 | 6 | 7;
  motionSource: HomepageRankingMotionSource;
  visualSource: string;
  motionAssetRef: string;
  posterFrameUrl: string;
  articleLink: HomepageArticleLink;
  clickReady: boolean;
  hoverPausesMotion: boolean;
};

function seedFromId(value: string): number {
  return value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

export function getHomepageRankingDuration(rank: number, artistId: string): 2 | 4 | 6 | 7 {
  const seed = seedFromId(`${rank}:${artistId}`);
  if (rank === 1) return seed % 2 === 0 ? 6 : 7;
  return seed % 2 === 0 ? 2 : 4;
}

function ensureMotionFallbackImage(entry: CrownRankRuntimeEntry): string {
  const existingImage = entry.media.posterFrameUrl || entry.media.profileImageUrl;
  if (existingImage) return existingImage;

  const autofill = VisualAutoFillRuntime.ensureSlot({
    slotId: `home-1-rank-${entry.rank}-${entry.artistId}`,
    route: "/home/1",
    component: "Home1MagazineCoverHero",
    owner: "homepage-ranking-motion-engine",
    kind: "profile-image",
    priority: entry.rank === 1 ? "critical" : "high",
    badge: "LIVE",
  });

  return autofill.imageRef ?? "/assets/avatars/default-avatar.jpg";
}

export function resolveHomepageRankingMotion(entry: CrownRankRuntimeEntry): HomepageRankingMotionRuntime {
  const durationSeconds = getHomepageRankingDuration(entry.rank, entry.artistId);
  const articleLink = resolveArtistReelLink({
    artistId: entry.artistId,
    articleRoute: entry.articleRoute,
    fallbackRoute: entry.route,
  });

  if (entry.media.liveFeedUrl) {
    return {
      artistId: entry.artistId,
      rank: entry.rank,
      durationSeconds,
      motionSource: "real-uploaded-artist-video",
      visualSource: entry.media.sourceKind,
      motionAssetRef: entry.media.liveFeedUrl,
      posterFrameUrl: entry.media.posterFrameUrl,
      articleLink,
      clickReady: true,
      hoverPausesMotion: true,
    };
  }

  if (entry.media.motionPortraitUrl) {
    return {
      artistId: entry.artistId,
      rank: entry.rank,
      durationSeconds,
      motionSource: "generated-motion-portrait",
      visualSource: entry.media.sourceKind,
      motionAssetRef: entry.media.motionPortraitUrl,
      posterFrameUrl: entry.media.posterFrameUrl,
      articleLink,
      clickReady: true,
      hoverPausesMotion: true,
    };
  }

  const fallbackImage = ensureMotionFallbackImage(entry);
  const bindings = VisualVideoBindingEngine.bindImageToMotionVariants({
    imageRef: fallbackImage,
    route: "/home/1",
    ownerSystem: "homepage-ranking-motion-engine",
    subjectType: "artist-image",
    durations: entry.rank === 1 ? [6, 7] : [2, 4],
  });
  const selectedLoop = bindings.loops.find((loop) => loop.durationSeconds === durationSeconds) ?? bindings.loops[0];

  if (selectedLoop) {
    return {
      artistId: entry.artistId,
      rank: entry.rank,
      durationSeconds,
      motionSource: entry.media.mediaExists ? "generated-motion-loop" : "emergency-fallback",
      visualSource: entry.media.sourceKind,
      motionAssetRef: selectedLoop.motionId,
      posterFrameUrl: fallbackImage,
      articleLink,
      clickReady: true,
      hoverPausesMotion: true,
    };
  }

  return {
    artistId: entry.artistId,
    rank: entry.rank,
    durationSeconds,
    motionSource: entry.media.mediaExists ? "generated-static-image" : "emergency-fallback",
    visualSource: entry.media.sourceKind,
    motionAssetRef: fallbackImage,
    posterFrameUrl: fallbackImage,
    articleLink,
    clickReady: true,
    hoverPausesMotion: true,
  };
}

export function resolveHomepageRankingMotionBatch(entries: CrownRankRuntimeEntry[]): HomepageRankingMotionRuntime[] {
  return entries.map(resolveHomepageRankingMotion);
}