/**
 * publishHome2MagazineNetwork — build real UnifiedMediaRecord queue for Home 2
 * and publish onto MagazineDiscoveryBus (DiscoveryBus-pattern, magazine channel).
 *
 * Sources: magazineIssueData, PerformerRegistry (live / motion / video),
 * SponsorRegistry ad slots, Video Boost eligibility (FUTURE → empty until ledger).
 */

import { MagazineDiscoveryBus } from "@/lib/discovery/MagazineDiscoveryBus";
import { DiscoveryBus } from "@/lib/discovery/DiscoveryBus";
import { getAdSlotForZone } from "@/lib/commerce/SponsorRegistry";
import {
  getPerformerBySlug,
  PERFORMER_REGISTRY,
} from "@/lib/performers/PerformerRegistry";
import {
  MAGAZINE_ISSUE_1,
  type MagazineArticle,
} from "./magazineIssueData";
import type { UnifiedMediaRecord } from "./UnifiedMediaRecord";
import {
  resolveArticleAnimatedUrl,
  resolveArticleEditorialImage,
  resolveArticleVideoUrl,
} from "./resolveArticleEditorialImage";
import { listActiveVideoBoostMedia } from "./videoBoostEligibility";

const ACCENT: Record<MagazineArticle["category"], string> = {
  feature: "#00FFFF",
  interview: "#FF2DAA",
  review: "#AA2DFF",
  editorial: "#FFD700",
  news: "#00FF88",
};

function articleRoute(article: MagazineArticle): string {
  return `/magazine/article/${article.slug}`;
}

function articleToRecord(
  article: MagazineArticle,
  kind: UnifiedMediaRecord["kind"],
  sourceLabel: string,
): UnifiedMediaRecord {
  const performer = article.performerSlug
    ? getPerformerBySlug(article.performerSlug)
    : null;
  const live =
    performer?.isLive && performer.liveRoomRoute
      ? {
          liveUrl: null as string | null, // preview URL not on registry; route is live
          routeOverride: performer.liveRoomRoute,
        }
      : null;

  return {
    id: `mag-${kind}-${article.slug}`,
    kind,
    title: article.title,
    subtitle: article.subtitle,
    route: live?.routeOverride && kind === "live_performance"
      ? live.routeOverride
      : articleRoute(article),
    accentColor: ACCENT[article.category] ?? article.heroColor,
    sourceLabel,
    categoryKey: `${kind}:${article.category}`,
    publishedAt: article.publishedAt,
    performerSlug: article.performerSlug,
    articleSlug: article.slug,
    liveUrl: null,
    videoUrl: resolveArticleVideoUrl(article),
    animatedUrl: resolveArticleAnimatedUrl(article),
    editorialImageUrl: resolveArticleEditorialImage(article),
  };
}

function buildMusicVideoOfTheDay(): UnifiedMediaRecord | null {
  const withVideo = PERFORMER_REGISTRY.find((p) => p.introVideoUrl);
  if (withVideo?.introVideoUrl) {
    return {
      id: `mag-mvd-${withVideo.slug}`,
      kind: "music_video_of_the_day",
      title: `${withVideo.name} — Music Video of the Day`,
      subtitle: withVideo.bio?.slice(0, 120),
      route: withVideo.profileRoute || `/performers/${withVideo.slug}`,
      accentColor: "#FF2DAA",
      sourceLabel: "Music Video of the Day",
      categoryKey: `music_video_of_the_day:${withVideo.slug}`,
      performerSlug: withVideo.slug,
      videoUrl: withVideo.introVideoUrl,
      animatedUrl: withVideo.motionPosterUrl ?? null,
      editorialImageUrl: withVideo.coverImageUrl || withVideo.profileImageUrl,
    };
  }

  // Honest fallback: feature article with performer cover — not a fake video claim.
  const feature = MAGAZINE_ISSUE_1.find((a) => a.category === "feature" && a.performerSlug);
  if (!feature) return null;
  return {
    ...articleToRecord(feature, "music_video_of_the_day", "Music Video of the Day"),
    title: feature.title,
    subtitle: "Editorial spotlight — video upload pending",
  };
}

function buildYoPhoSpotlight(): UnifiedMediaRecord | null {
  const withCover = PERFORMER_REGISTRY.find(
    (p) => p.coverImageUrl && !p.coverImageUrl.includes("tmi-placeholder"),
  );
  if (!withCover) return null;
  return {
    id: `mag-yopho-${withCover.slug}`,
    kind: "yopho_spotlight",
    title: `YoPho Spotlight — ${withCover.name}`,
    subtitle: "Open the living canvas",
    route: "/performer/canvas",
    accentColor: "#AA2DFF",
    sourceLabel: "YoPho Spotlight",
    categoryKey: `yopho_spotlight:${withCover.slug}`,
    performerSlug: withCover.slug,
    videoUrl: withCover.introVideoUrl ?? null,
    animatedUrl: withCover.motionPosterUrl ?? null,
    editorialImageUrl: withCover.coverImageUrl || withCover.profileImageUrl,
  };
}

/** Live tiles only from real DiscoveryBus rooms (Rule 20) — never seeded isLive flags. */
function buildLivePerformanceRecords(): UnifiedMediaRecord[] {
  return DiscoveryBus.getAll()
    .filter((r) => r.isLive)
    .slice(0, 3)
    .map((r) => {
      const performer = PERFORMER_REGISTRY.find(
        (p) => p.liveRoomRoute === r.joinRoute || p.roomId === r.roomId || p.name === r.hostName,
      );
      return {
        id: `mag-live-${r.id}`,
        kind: "live_performance" as const,
        title: r.title || `${r.hostName} is LIVE`,
        subtitle: r.humanViewerCount > 0 ? `${r.humanViewerCount} watching` : "Live now",
        route: r.joinRoute || "/live/lobby",
        accentColor: r.accentColor || "#E63000",
        sourceLabel: "Live Performance",
        categoryKey: `live_performance:${r.roomId}`,
        performerSlug: performer?.slug,
        liveUrl: r.previewUrl,
        videoUrl: performer?.introVideoUrl ?? null,
        animatedUrl: performer?.motionPosterUrl ?? null,
        editorialImageUrl:
          r.posterUrl || performer?.coverImageUrl || performer?.profileImageUrl || null,
      };
    });
}

function buildSponsorRecord(): UnifiedMediaRecord | null {
  const slot = getAdSlotForZone("home-2-magazine-tv");
  if (slot.type === "paid" && slot.sponsor) {
    return {
      id: `mag-sponsor-${slot.sponsor.sponsorId}`,
      kind: "sponsor",
      title: slot.sponsor.name,
      subtitle: slot.sponsor.tagline,
      route: slot.sponsor.ctaHref || "/sponsors",
      accentColor: slot.sponsor.accentColor || "#FFD700",
      sourceLabel: "Sponsor",
      categoryKey: `sponsor:${slot.sponsor.sponsorId}`,
      editorialImageUrl: slot.sponsor.logoUrl ?? "/tmi-curated/mag-50.jpg",
    };
  }
  if (slot.type === "platform" && slot.platformPromo) {
    return {
      id: `mag-sponsor-platform-${slot.platformPromo.ctaHref}`,
      kind: "sponsor",
      title: slot.platformPromo.headline,
      subtitle: slot.platformPromo.body,
      route: slot.platformPromo.ctaHref,
      accentColor: slot.platformPromo.accentColor,
      sourceLabel: "Platform",
      categoryKey: `sponsor:platform`,
      editorialImageUrl: "/tmi-curated/mag-66.jpg",
    };
  }
  return {
    id: "mag-sponsor-advertise",
    kind: "sponsor",
    title: "Advertise on TMI Magazine",
    subtitle: "Reach the living magazine audience",
    route: "/sponsors/advertise",
    accentColor: "#FFD700",
    sourceLabel: "Advertise",
    categoryKey: "sponsor:cta",
    editorialImageUrl: "/tmi-curated/mag-74.jpg",
  };
}

export function buildHome2MagazineNetworkQueue(): UnifiedMediaRecord[] {
  const out: UnifiedMediaRecord[] = [];

  const mvd = buildMusicVideoOfTheDay();
  if (mvd) out.push(mvd);

  const yopho = buildYoPhoSpotlight();
  if (yopho) out.push(yopho);

  for (const a of MAGAZINE_ISSUE_1.filter((x) => x.category === "interview").slice(0, 4)) {
    out.push(articleToRecord(a, "interview", "Interview"));
  }
  for (const a of MAGAZINE_ISSUE_1.filter((x) => x.category === "feature").slice(0, 4)) {
    out.push(articleToRecord(a, "magazine_feature", "Magazine Feature"));
  }
  for (const a of MAGAZINE_ISSUE_1.filter((x) => x.category === "review").slice(0, 3)) {
    out.push(articleToRecord(a, "review", "Review"));
  }
  for (const a of MAGAZINE_ISSUE_1.filter((x) => x.category === "news").slice(0, 3)) {
    out.push(articleToRecord(a, "new_release", "New Release"));
  }
  for (const a of MAGAZINE_ISSUE_1.filter((x) => x.category === "editorial").slice(0, 3)) {
    out.push(articleToRecord(a, "organic", "Organic"));
  }

  // Snips: only when a performer has a short intro video (real media, not fabricated snips).
  for (const p of PERFORMER_REGISTRY.filter((x) => x.introVideoUrl).slice(0, 2)) {
    out.push({
      id: `mag-snip-${p.slug}`,
      kind: "snip",
      title: `${p.name} — Snip`,
      subtitle: "Short clip",
      route: p.profileRoute || `/performers/${p.slug}`,
      accentColor: "#00FFFF",
      sourceLabel: "Snip",
      categoryKey: `snip:${p.slug}`,
      performerSlug: p.slug,
      videoUrl: p.introVideoUrl!,
      animatedUrl: p.motionPosterUrl ?? null,
      editorialImageUrl: p.coverImageUrl || p.profileImageUrl,
    });
  }

  out.push(...buildLivePerformanceRecords());
  out.push(...listActiveVideoBoostMedia());

  const sponsor = buildSponsorRecord();
  if (sponsor) out.push(sponsor);

  // Deduplicate by id; drop invalid routes.
  const seen = new Set<string>();
  return out.filter((r) => {
    if (!r.id || !r.route || r.route === "#" || seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

/** Publish (or refresh) the Magazine Network bus for Home 2. */
export function publishHome2MagazineNetwork(): UnifiedMediaRecord[] {
  const queue = buildHome2MagazineNetworkQueue();
  MagazineDiscoveryBus.replaceAll(queue);
  return queue;
}
