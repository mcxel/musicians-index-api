"use client";

import { useRouter } from "next/navigation";
import { useLiveSync } from "@/lib/media/useLiveSync";
import TMIBillboardLiveWall from "@/components/billboard/TMIBillboardLiveWall";
import type { LiveFeedItem } from "@/components/billboard/TMIBillboardLiveWall";

/**
 * LiveDiscoveryWall — drop-in client component that polls /api/live
 * and renders TMIBillboardLiveWall with real data.
 *
 * Usage: add to any server or client page as <LiveDiscoveryWall />
 */
export default function LiveDiscoveryWall({
  userTier = "free",
  userId,
}: {
  userTier?: LiveFeedItem["performerTier"];
  userId?: string;
}) {
  const router = useRouter();
  const { feed, isLoading } = useLiveSync();

  if (isLoading && feed.length === 0) {
    return (
      <div
        style={{
          padding: "40px 24px",
          textAlign: "center",
          color: "rgba(255,255,255,0.2)",
          fontSize: 11,
          letterSpacing: "0.2em",
          fontWeight: 800,
        }}
      >
        LOADING LIVE FEED...
      </div>
    );
  }

  return (
    <TMIBillboardLiveWall
      feeds={feed}
      userTier={userTier}
      userId={userId}
      onEnterLobby={(item) => {
        if (item.roomId) {
          router.push(`/live/rooms/${item.roomId}`);
        }
      }}
    />
  );
}
