import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MediaRegistry } from "@/lib/media/MediaRegistry";
import ShareLandingClient from "./ShareLandingClient";
import type { PublicMediaItem } from "./ShareLandingClient";

const PROD_URL = process.env.NEXT_PUBLIC_APP_URL || "https://themusiciansindex.com";
const DEFAULT_OG_IMAGE = `${PROD_URL}/og-default.jpg`;

// ── Server-side metadata for Open Graph / Twitter Card ────────────────────────
export async function generateMetadata(
  { params }: { params: { mediaId: string } },
): Promise<Metadata> {
  const item = await MediaRegistry.getById(params.mediaId).catch(() => null);

  if (!item || item.visibility !== "public") {
    return {
      title:       "TMI — The Musician's Index",
      description: "Discover music, live rooms, battles and more.",
    };
  }

  const isVideo = [
    "video", "performance", "battle_replay", "cypher_replay",
    "concert_recording", "broadcast_archive", "interview",
  ].includes(item.type);

  const title       = item.title;
  const description = item.description ?? `Listen to ${item.title} on The Musician's Index`;
  const thumbnail   = item.thumbnailUrl ?? DEFAULT_OG_IMAGE;
  const shareUrl    = `${PROD_URL}/share/${item.id}`;

  const openGraph: Metadata["openGraph"] = {
    title,
    description,
    url:     shareUrl,
    siteName: "The Musician's Index",
    images: [{ url: thumbnail, width: 1200, height: 630, alt: title }],
    type: isVideo ? "video.other" : "music.song",
  };

  // Add og:video tags for video content
  if (isVideo && item.sourceUrl) {
    const isHLS = item.sourceUrl.includes(".m3u8");
    (openGraph as Record<string, unknown>).videos = [
      {
        url:       item.sourceUrl,
        secureUrl: item.sourceUrl.replace(/^http:/, "https:"),
        type:      isHLS ? "application/x-mpegURL" : "video/mp4",
        width:     1280,
        height:    720,
      },
    ];
  }

  return {
    title,
    description,
    openGraph,
    twitter: {
      card:        isVideo ? "player" : "summary_large_image",
      title,
      description,
      images:      [thumbnail],
      // Twitter player card fields (only for video)
      ...(isVideo
        ? {
            site:         "@themusiciansindex",
            player:        shareUrl,
            playerWidth:   1280,
            playerHeight:  720,
          }
        : { site: "@themusiciansindex" }),
    },
    alternates: {
      canonical: shareUrl,
    },
  };
}

// ── Server page component ─────────────────────────────────────────────────────
export default async function ShareMediaPage({
  params,
}: {
  params: { mediaId: string };
}) {
  const item = await MediaRegistry.getById(params.mediaId).catch(() => null);

  if (!item || item.visibility !== "public") {
    notFound();
  }

  // Serialize for client (strip non-serialisable fields like Date objects)
  const publicItem: PublicMediaItem = {
    id:           item.id,
    type:         item.type,
    title:        item.title,
    description:  item.description ?? null,
    sourceUrl:    item.sourceUrl,
    thumbnailUrl: item.thumbnailUrl ?? null,
    durationMs:   item.durationMs ?? null,
    isLive:       item.isLive,
    createdAt:    item.createdAt.toISOString(),
  };

  return <ShareLandingClient mediaId={params.mediaId} item={publicItem} />;
}
