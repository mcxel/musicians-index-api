"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRoomInfrastructure, type RoomType } from "@/components/room/RoomInfrastructureProvider";

export type VenueType = "arena" | "club" | "studio" | "festival" | "street" | "digital";
export type VenueLiveStatus = "live" | "not_live";

type DigitalVenueTwinState = {
  venueId: string;
  venueName: string;
  venueType: VenueType;
  city: string;
  region: string;
  environmentThemeKey: string;
  roomTemplateKey: string;
  eventId: string | null;
  sponsorSkin: string | null;
  liveStatus: VenueLiveStatus;
};

type DigitalVenueTwinAttachment = {
  roomId: string;
  roomType: RoomType;
};

type DigitalVenueTwinContextValue = DigitalVenueTwinState & {
  attachedRoom: DigitalVenueTwinAttachment;
  setVenueIdentity: (next: Partial<DigitalVenueTwinState>) => void;
};

const DEFAULT_VENUE: DigitalVenueTwinState = {
  venueId: "venue-global",
  venueName: "Global Digital Venue",
  venueType: "digital",
  city: "TBD",
  region: "TBD",
  environmentThemeKey: "theme.neon.stage.default",
  roomTemplateKey: "template.room.default",
  eventId: null,
  sponsorSkin: null,
  liveStatus: "not_live",
};

const DigitalVenueTwinContext = createContext<DigitalVenueTwinContextValue | undefined>(undefined);

export function useDigitalVenueTwin() {
  const context = useContext(DigitalVenueTwinContext);
  if (!context) {
    throw new Error("useDigitalVenueTwin must be used within DigitalVenueTwinProvider");
  }
  return context;
}

export default function DigitalVenueTwinProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { roomId, roomType } = useRoomInfrastructure();
  const [venue, setVenue] = useState<DigitalVenueTwinState>(DEFAULT_VENUE);

  const setVenueIdentity = useCallback((next: Partial<DigitalVenueTwinState>) => {
    setVenue((prev) => ({ ...prev, ...next }));
  }, []);

  const value = useMemo<DigitalVenueTwinContextValue>(
    () => ({
      ...venue,
      attachedRoom: {
        roomId,
        roomType,
      },
      setVenueIdentity,
    }),
    [venue, roomId, roomType, setVenueIdentity]
  );

  return <DigitalVenueTwinContext.Provider value={value}>{children}</DigitalVenueTwinContext.Provider>;
}
