"use client";

/**
 * RoomExperienceLayer — existing overlay/underlay chrome on the canonical
 * dual-monitor deck. Does not invent 3D geometry or fake contestants.
 *
 * Battle overlay mounts in idle mode only (no Jay Carter / Mike Wave defaults).
 */

import type { ReactNode } from "react";
import type { VenueType } from "@/lib/venues/VenueAssetRegistry";
import CipherFloorUnderlay from "@/components/cipher/CipherFloorUnderlay";
import SongChallengeOverlaySystem from "@/components/challenge/SongChallengeOverlaySystem";
import BattleOverlaySystem from "@/components/broadcast/BattleOverlaySystem";

interface RoomExperienceLayerProps {
  venueType: VenueType;
  children: ReactNode;
}

export default function RoomExperienceLayer({ venueType, children }: RoomExperienceLayerProps) {
  const showCypherFloor = venueType === "cypher";
  const showChallengeHud = venueType === "challenge";
  const showBattleIdle = venueType === "battle";

  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      {showCypherFloor ? (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
          <CipherFloorUnderlay mode="IDLE" />
        </div>
      ) : null}
      <div style={{ position: "relative", zIndex: 3 }}>{children}</div>
      {showBattleIdle ? (
        <div style={{ marginTop: 10 }}>
          <BattleOverlaySystem mode="battle" showOverlayLibrary={false} showPhaseControls={false} />
        </div>
      ) : null}
      {showChallengeHud ? (
        <div style={{ marginTop: 10 }}>
          <SongChallengeOverlaySystem phase="recruiting" needsCount={0} />
        </div>
      ) : null}
    </div>
  );
}
