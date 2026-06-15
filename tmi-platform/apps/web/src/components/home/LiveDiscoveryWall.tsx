"use client";

import { useState } from "react";
import { useLiveSync } from "@/lib/media/useLiveSync";
import TMIBillboardLiveWall from "@/components/billboard/TMIBillboardLiveWall";
import type { LiveFeedItem } from "@/components/billboard/TMIBillboardLiveWall";
import { LobbyEntryFlow, type UniversalRoom } from "@/components/room/UniversalLobbyEntry";

export default function LiveDiscoveryWall({
  userTier = "free",
  userId,
}: {
  userTier?: LiveFeedItem["performerTier"];
  userId?: string;
}) {
  const { feed, isLoading } = useLiveSync();
  const [pending, setPending] = useState<UniversalRoom | null>(null);

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
    <>
      {pending && <LobbyEntryFlow room={pending} onClose={() => setPending(null)} />}
      <TMIBillboardLiveWall
        feeds={feed}
        userTier={userTier}
        userId={userId}
        onEnterLobby={(item) => {
          if (!item.roomId) return;
          setPending({
            id:           item.roomId,
            title:        item.performerName,
            genre:        item.genre,
            viewers:      item.viewers,
            status:       item.isLive ? 'live' : 'upcoming',
            access:       (item.performerTier === 'gold' || item.performerTier === 'platinum' || item.performerTier === 'diamond') ? 'vip' : 'free',
            accentColor:  '#FF2DAA',
            roomRoute:    `/live/rooms/${item.roomId}?from=lobby-wall`,
            venueIndex:   0,
            shape:        'oct',
          });
        }}
      />
    </>
  );
}
