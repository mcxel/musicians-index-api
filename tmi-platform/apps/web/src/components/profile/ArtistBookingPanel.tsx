"use client";

/**
 * ArtistBookingPanel — VALID presentation wrapper only (§11180).
 * Mounts BookingCanister with the selected performer identity.
 * No independent booking engine / form / API.
 */

import React from "react";
import { BookingCanister } from "@/components/canisters/BookingCanister";

export interface ArtistBookingPanelProps {
  /** Canonical performer slug or id — becomes BookingCanister entityId. */
  artistId: string;
  artistName?: string;
  accentColor?: string;
}

export function ArtistBookingPanel({
  artistId,
  artistName,
  accentColor = "#00D4FF",
}: ArtistBookingPanelProps) {
  return (
    <div
      data-testid="artist-booking-panel"
      data-booking-performer={artistId}
      data-booking-performer-name={artistName ?? ""}
      style={{
        width: "100%",
        padding: "8px 0",
      }}
    >
      <BookingCanister
        key={artistId}
        entityId={artistId}
        entityType="performer"
        showRequestForm={true}
        accentColor={accentColor}
      />
    </div>
  );
}
