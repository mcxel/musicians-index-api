"use client";

/**
 * VenueAutomatedJumbotronMount — world-space Jumbotron surface for ArenaEventShell / UVR.
 *
 * Laws:
 * - Real venue geometry (not HUD overlay). Positioned above stage center from PhysicalJumbotronDescriptor.
 * - LOOK UP / focus uses AvatarCameraDirector — no teleport, seat reset, or session restart.
 * - Media feed mirrors via CanonicalUniversalPlayerFabric (no recursive LiveSession).
 */

import { useEffect, useMemo, useState } from "react";
import { AutomatedJumbotronDirector } from "@/lib/jumbotron/AutomatedJumbotronDirector";
import type { JumbotronExperienceType } from "@/lib/jumbotron/JumbotronContracts";
import { JumbotronSurfaceRenderer } from "@/components/jumbotron/JumbotronSurfaceRenderer";
import { AvatarCameraDirector } from "@/lib/avatar/AvatarCameraDirector";
import { CanonicalUniversalPlayerFabric } from "@/lib/media/CanonicalUniversalPlayerFabric";

export function mapArenaEventToJumbotronExperience(
  eventType: string | undefined | null
): JumbotronExperienceType {
  const t = (eventType ?? "").toLowerCase();
  if (t.includes("battle") || t.includes("gauntlet")) return "BATTLE_ARENA";
  if (t.includes("cypher") || t.includes("cipher")) return "CYPHER";
  if (t.includes("dance")) return "WORLD_DANCE_PARTY";
  if (t.includes("monday") || t.includes("concert") || t.includes("auditorium")) return "AUDITORIUM";
  if (t.includes("feud") || t.includes("game") || t.includes("tune") || t.includes("square")) {
    return "GAME_SHOW";
  }
  return "REGULAR_LIVE";
}

interface VenueAutomatedJumbotronMountProps {
  roomId: string;
  eventType?: string | null;
  venueId?: string;
  /** When true, surface is revealed (LOOK UP / focus). */
  lookUpActive?: boolean;
  /** Optional camera director shared with venue HUD. */
  cameraDirector?: AvatarCameraDirector;
  /**
   * Optional mutable player assignment for JUMBOTRON_FEED (Freedom Law).
   * Never implies a dedicated jumbotron slot — omit to keep feed off all players.
   * Physical Jumbotron continues in world regardless.
   */
  mirrorFeedToPlayerId?: string;
  className?: string;
}

export function VenueAutomatedJumbotronMount({
  roomId,
  eventType,
  venueId,
  lookUpActive = false,
  cameraDirector,
  mirrorFeedToPlayerId,
  className = "",
}: VenueAutomatedJumbotronMountProps) {
  const experienceType = mapArenaEventToJumbotronExperience(eventType);

  const director = useMemo(() => {
    return new AutomatedJumbotronDirector({
      roomId,
      sessionId: `session:${roomId}`,
      experienceType,
      venueId: venueId ?? `venue-${roomId}`,
      venueClass: experienceType === "WORLD_DANCE_PARTY" ? "CLUB" : "ARENA",
      venueSkin: "default",
      isCurtainClosed: false,
      participantCount: 0, // honest empty until real presence wired
      crowdActivityScore: 0,
      venueEnvironment:
        experienceType === "WORLD_DANCE_PARTY"
          ? "WORLD_DANCE_PARTY"
          : experienceType === "AUDITORIUM"
            ? "PROSCENIUM_THEATER"
            : "INDOOR_ARENA",
    });
  }, [roomId, experienceType, venueId]);

  const [focused, setFocused] = useState(false);
  const [cam] = useState(() => cameraDirector ?? new AvatarCameraDirector());
  const physical = director.getPhysicalJumbotronDescriptor();
  const pack = director.getPresentationPack();
  const event = director.getActiveEvent();
  const sightline = useMemo(() => director.certifySightlines(), [director]);

  // Seed experience-appropriate program content (real director events, not fake crowds)
  useEffect(() => {
    if (experienceType === "BATTLE_ARENA") {
      director.postRoundTimerUpdate(60, false);
    } else if (experienceType === "CYPHER") {
      director.postCypherNextUp("Next Performer", "On Deck");
    }
    return () => {
      director.teardown();
    };
  }, [director, experienceType]);

  // LOOK UP / DOUBLE-UP focus — aims camera at best face; no session restart
  useEffect(() => {
    if (!lookUpActive) {
      if (focused) {
        cam.returnToStageView();
        setFocused(false);
      }
      return;
    }
    const eye: [number, number, number] = [0, 1.65, 24];
    cam.focusJumbotron(40, eye, physical.centerPosition);
    setFocused(true);
  }, [lookUpActive, cam, physical.centerPosition, focused]);

  // Physical Jumbotron is venue-owned. Optional feed mirror uses ANY player via prop —
  // never a dedicated "jumbotron slot". Clearing a player does not remove world Jumbotron.
  useEffect(() => {
    if (!mirrorFeedToPlayerId) return;
    const fabric = new CanonicalUniversalPlayerFabric();
    const feed = director.createJumbotronFeedSource();
    fabric.mirrorJumbotronFeedToPlayer(feed, mirrorFeedToPlayerId);
  }, [director, mirrorFeedToPlayerId]);

  // World-space placement: hang above stage center using clearance / architecture (not HUD chrome)
  const hangTopPercent = Math.max(
    4,
    Math.min(28, 100 - (physical.bottomClearanceMeters / Math.max(1, physical.safeRiggingElevationMeters)) * 55)
  );

  if (!lookUpActive && !focused) {
    // Still mount a zero-opacity world anchor so geometry is present for cert/DOM
    return (
      <div
        data-testid="venue-jumbotron-world-anchor"
        data-architecture={physical.architecture}
        data-sightlines-certified={sightline.certifiedSightlinesAllOccupiedZones ? "true" : "false"}
        data-fov={director.getSpatialDimensions().cameraSphereFovDegrees}
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: `${hangTopPercent}%`,
          transform: "translate(-50%, -50%)",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
          zIndex: 4,
        }}
      />
    );
  }

  return (
    <div
      data-testid="venue-jumbotron-world-mount"
      data-architecture={physical.architecture}
      data-sightlines-certified={sightline.certifiedSightlinesAllOccupiedZones ? "true" : "false"}
      data-camera-focus={focused ? "JUMBOTRON" : "STAGE"}
      className={className}
      style={{
        position: "absolute",
        left: "50%",
        top: `${hangTopPercent}%`,
        transform: "translate(-50%, -50%)",
        width: "min(42vw, 420px)",
        zIndex: 6,
        pointerEvents: "none",
        filter: "drop-shadow(0 12px 28px rgba(0,255,255,0.25))",
      }}
    >
      <JumbotronSurfaceRenderer
        event={event}
        pack={pack}
        is3DViewportOverlay={false}
        className="pointer-events-none"
      />
    </div>
  );
}

export default VenueAutomatedJumbotronMount;
