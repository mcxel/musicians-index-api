"use client";

import { useMemo } from "react";
import CommandCenterMediaStack, { type CommandCenterMediaSlot } from "@/components/commandCenter/CommandCenterMediaStack";
import RoomExperienceLayer from "@/components/live/RoomExperienceLayer";
import { getVenueAsset, type VenueType } from "@/lib/venues/VenueAssetRegistry";

interface LiveRoomMediaViewportDeckProps {
  roomId: string;
  venueType: VenueType;
  role: "FAN" | "PERFORMER";
}

/**
 * Media-player-first room presentation.
 * One venue runtime identity -> two monitor feeds (audience + action).
 */
export default function LiveRoomMediaViewportDeck({ roomId, venueType, role }: LiveRoomMediaViewportDeckProps) {
  const venue = getVenueAsset(venueType);

  const slots = useMemo<CommandCenterMediaSlot[]>(() => {
    const audienceFeed = venue.audienceViewVideoUrl ?? venue.ambientVideoUrl ?? null;
    const actionFeed = venue.performerViewVideoUrl ?? venue.ambientVideoUrl ?? venue.audienceViewVideoUrl ?? null;
    return [
      {
        id: `room-${roomId}-viewport-a`,
        label: "VENUE / AUDIENCE",
        kind: "video",
        videoUrl: audienceFeed,
      },
      {
        id: `room-${roomId}-viewport-b`,
        label: "PERFORMER / ACTION",
        kind: "video",
        videoUrl: actionFeed,
      },
    ];
  }, [roomId, venue.ambientVideoUrl, venue.audienceViewVideoUrl, venue.performerViewVideoUrl]);

  return (
    <section style={{ marginTop: 14 }}>
      <div
        style={{
          marginBottom: 8,
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid rgba(0,255,255,0.2)",
          background: "rgba(0,0,0,0.28)",
          fontSize: 9,
          letterSpacing: "0.12em",
          fontWeight: 900,
          color: "#00FFFF",
        }}
      >
        LIVE ROOM · MEDIA VIEWPORT MODE · {role} · {venue.label.toUpperCase()}
      </div>
      <RoomExperienceLayer venueType={venueType}>
        <CommandCenterMediaStack
          slots={slots}
          bezelVariant="chrome"
          seriesLabel={`ROOM ${roomId.toUpperCase()} · VIEWPORT A/B`}
          naturalHeight
          monitorLayoutMode="dual"
          role={role === "PERFORMER" ? "performer" : "fan"}
          continuityContext={{
            venueInstanceId: `venue-instance:${venueType}:${roomId}`,
            roomSessionId: `room-session:${roomId}`,
            rtcSessionId: `daily-room:${roomId}`,
          }}
        />
      </RoomExperienceLayer>
    </section>
  );
}
