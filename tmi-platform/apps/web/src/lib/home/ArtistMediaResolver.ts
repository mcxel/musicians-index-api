import { EDITORIAL_ARTICLES } from "@/lib/editorial/NewsArticleModel";
import { resolveArtistAssetBySlug } from "@/lib/assets/artistAssetRegistry";
import { liveIdentitySurfaceEngine } from "@/lib/live/LiveIdentitySurfaceEngine";
import { resolveArtistMotion } from "@/lib/motion-portraits";
import { resolveProfileMediaPriority } from "./ProfileMediaPriorityResolver";

export interface ArtistMediaResolution {
  artistId: string;
  route: string;
  articleRoute: string;
  fallbackRoute: string;
  articleExists: boolean;
  profileImageUrl: string;
  mediaUrl: string;
  posterFrameUrl: string;
  liveFeedUrl?: string;
  motionPortraitUrl?: string;
  sourceKind: "live-feed" | "motion-portrait" | "profile-image" | "fallback-silhouette" | "missing";
  status: "LIVE" | "READY" | "FALLBACK" | "MISSING";
  entityExists: boolean;
  mediaExists: boolean;
  routeExists: boolean;
  statusExists: boolean;
  canRender: boolean;
}

function toSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function resolveArtistMedia(input: {
  artistId?: string;
  artistName?: string;
  heroImage?: string;
  preferredRoute?: string;
}): ArtistMediaResolution {
  const artistId = input.artistId ?? toSlug(input.artistName ?? "");
  const article = EDITORIAL_ARTICLES.find((entry) => entry.relatedArtistSlug === artistId);
  const asset = resolveArtistAssetBySlug(artistId);
  const liveSurface = liveIdentitySurfaceEngine.getSurface(artistId);
  const liveDisplay = liveSurface
    ? liveIdentitySurfaceEngine.resolveDisplayUrl(artistId)
    : { type: "empty" as const, url: "", status: "OFFLINE" as const };

  const fallbackRoute = asset?.replacementRoute ?? `/artists/${artistId}`;
  const articleRoute = article ? `/articles/artist/${article.slug}` : fallbackRoute;
  const route = input.preferredRoute ?? fallbackRoute;
  const profileImageUrl = asset?.profileImage ?? input.heroImage ?? "/tmi-curated/host-main.png";
  const motion = resolveArtistMotion({
    artistId,
    liveFeedUrl: liveDisplay.type === "live" ? liveDisplay.url : undefined,
    profileImageUrl,
    fallbackImageUrl: "/tmi-curated/host-main.png",
  });
  const mediaPriority = resolveProfileMediaPriority({
    motionClip: motion.status === "ready" && motion.sourceKind === "motion-portrait" ? motion.mediaUrl : undefined,
    liveClip: liveDisplay.type === "live" ? liveDisplay.url : undefined,
    coverFrame: motion.posterFrameUrl || profileImageUrl,
    fallbackStill: "/tmi-curated/host-main.png",
  });

  const status = motion.status === "live"
    ? "LIVE"
    : motion.status === "missing"
      ? "MISSING"
      : motion.status === "fallback"
        ? "FALLBACK"
        : "READY";

  return {
    artistId,
    route,
    articleRoute,
    fallbackRoute,
    articleExists: Boolean(article),
    profileImageUrl,
    mediaUrl: mediaPriority.resolvedSrc || motion.mediaUrl,
    posterFrameUrl: mediaPriority.coverFrame || motion.posterFrameUrl,
    liveFeedUrl: liveDisplay.type === "live" ? liveDisplay.url : undefined,
    motionPortraitUrl: mediaPriority.motionClip,
    sourceKind: mediaPriority.sourceType === "motion-clip"
      ? "motion-portrait"
      : mediaPriority.sourceType === "live-clip"
        ? "live-feed"
        : mediaPriority.sourceType === "cover-frame"
          ? "profile-image"
          : mediaPriority.sourceType === "fallback-still"
            ? "fallback-silhouette"
            : motion.sourceKind,
    status,
    entityExists: Boolean(artistId),
    mediaExists: Boolean((mediaPriority.resolvedSrc || motion.mediaUrl) && (mediaPriority.coverFrame || motion.posterFrameUrl)),
    routeExists: Boolean(route),
    statusExists: status !== "MISSING",
    canRender: Boolean(artistId && route && (mediaPriority.resolvedSrc || motion.mediaUrl) && (mediaPriority.coverFrame || motion.posterFrameUrl) && status !== "MISSING"),
  };
}