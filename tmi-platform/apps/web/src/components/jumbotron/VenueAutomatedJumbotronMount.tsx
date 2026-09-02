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
import dynamic from "next/dynamic";
import { AutomatedJumbotronDirector } from "@/lib/jumbotron/AutomatedJumbotronDirector";
import type { JumbotronExperienceType } from "@/lib/jumbotron/JumbotronContracts";
import { JumbotronPriority } from "@/lib/jumbotron/JumbotronContracts";
import { JumbotronSurfaceRenderer } from "@/components/jumbotron/JumbotronSurfaceRenderer";
import { AvatarCameraDirector } from "@/lib/avatar/AvatarCameraDirector";
import { CanonicalUniversalPlayerFabric } from "@/lib/media/CanonicalUniversalPlayerFabric";
import { getActivePerformerLiveProgram } from "@/lib/experiencePresentation/composePerformerLiveProgram";

const SafeReactThreeCanvas = dynamic(
  () => import("@/components/3d/SafeReactThreeCanvas"),
  { ssr: false },
);
const VenueJumbotronGeometry3D = dynamic(
  () =>
    import("@/components/jumbotron/VenueJumbotronGeometry3D").then((m) => m.VenueJumbotronGeometry3D),
  { ssr: false },
);

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
  if (t.includes("fan-lobby") || t.includes("fan_lobby") || t.includes("lobby")) return "FAN_LOBBY";
  if (t.includes("lounge") || t.includes("club")) return "LOUNGE";
  if (t.includes("performer-lobby") || t.includes("performer_lobby")) return "PERFORMER_LOBBY";
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
      venueClass:
        experienceType === "WORLD_DANCE_PARTY" ||
        experienceType === "LOUNGE" ||
        experienceType === "FAN_LOBBY"
          ? "CLUB"
          : experienceType === "AUDITORIUM" || experienceType === "MONDAY_NIGHT_STAGE"
            ? "AUDITORIUM"
            : "ARENA",
      venueSkin: "default",
      isCurtainClosed: false,
      participantCount: 0, // honest empty until real presence wired
      crowdActivityScore: 0,
      venueEnvironment:
        experienceType === "WORLD_DANCE_PARTY"
          ? "WORLD_DANCE_PARTY"
          : experienceType === "AUDITORIUM" || experienceType === "MONDAY_NIGHT_STAGE"
            ? "PROSCENIUM_THEATER"
            : experienceType === "WORLD_CONCERT"
              ? "OUTDOOR_STADIUM"
              : experienceType === "LOUNGE" ||
                  experienceType === "FAN_LOBBY" ||
                  experienceType === "PERFORMER_LOBBY"
                ? "CLUB_SMALL_ROOM"
                : "INDOOR_ARENA",
    });
  }, [roomId, experienceType, venueId]);

  const [focused, setFocused] = useState(false);
  const [cam] = useState(() => cameraDirector ?? new AvatarCameraDirector());
  const physical = director.getPhysicalJumbotronDescriptor();
  const pack = director.getPresentationPack();
  const [event, setEvent] = useState(() => director.getActiveEvent());
  const sightline = useMemo(() => director.certifySightlines(), [director]);

  // Seed experience-appropriate program content (real director events, not fake crowds)
  useEffect(() => {
    if (experienceType === "BATTLE_ARENA") {
      const scored = director.postBattleScoreboard({
        participantA: "MC Nova",
        scoreA: 84,
        participantB: "DJ Phantom",
        scoreB: 79,
      });
      // Keep scoreboard on-air; attach timer fields so both pack surfaces render.
      const withTimer = {
        ...scored,
        roundTimerSeconds: 60,
        headline: scored.headline,
        title: "BATTLE LIVE",
      };
      setEvent(withTimer);
    } else if (experienceType === "CYPHER") {
      const next = director.postCypherNextUp("Next Performer", "On Deck");
      setEvent(next ?? director.getActiveEvent());
    } else if (experienceType === "WORLD_DANCE_PARTY") {
      const welcome = director.triggerSafetyAlert(
        "WELCOME TO WORLD DANCE PARTY",
        "DISCO ORB ONLINE • DANCE FLOOR ACTIVE"
      );
      setEvent(welcome ?? director.getActiveEvent());
    } else if (experienceType === "REGULAR_LIVE") {
      // Same PROGRAM as Performer Live — host identity only, never fake scores/crowd.
      const prog = getActivePerformerLiveProgram();
      const hostName = prog?.hostDisplayName?.trim() || "LIVE NOW";
      const programId = prog?.programSourceId ?? "PROGRAM.PERFORMER_CAMERA";
      setEvent({
        id: `evt-regular-live-${roomId}`,
        traceId: `tr-performer-live-${roomId}`,
        priority: JumbotronPriority.P6_AMBIENT,
        eventType: "AMBIENT_UPCOMING_SCHEDULE",
        experienceType: "REGULAR_LIVE",
        targetClass: pack.primaryTarget,
        sourceEventId: programId,
        title: "PERFORMER LIVE",
        headline: hostName,
        subline: programId,
        durationMs: 120_000,
        createdAtMs: Date.now(),
        expiresAtMs: Date.now() + 120_000,
        accentColor: pack.brandPalette.accent,
      });
    } else {
      setEvent(director.getActiveEvent());
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

  const tierClasses = sightline.tierResults
    .map((t) => t.tierClass)
    .filter(Boolean)
    .join(",");

  const showSurface = lookUpActive || focused;
  const ceiling = director.getSpatialDimensions().ceilingElevationMeters;

  return (
    <>
      {/* R3F architecture mesh — always mounted in production AES/UVR shells */}
      <div
        data-testid="audience-scene-jumbotron-layer"
        data-aes-jumbotron-geometry="true"
        data-architecture={physical.architecture}
        data-experience-type={experienceType}
        data-sightlines-certified={sightline.certifiedSightlinesAllOccupiedZones ? "true" : "false"}
        data-jumbotron-look-up={showSurface ? "true" : "false"}
        data-audience-scene-jumbotron-mounted="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: showSurface ? 5 : 3,
          opacity: showSurface ? 1 : 0.55,
          minHeight: 160,
        }}
      >
        <SafeReactThreeCanvas
          faultContext="AES Jumbotron Geometry"
          fallbackLabel="Jumbotron geometry paused"
          style={{ width: "100%", height: "100%", background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
          camera={{
            position: showSurface ? [0, 14, 38] : [0, 6, 42],
            fov: showSurface ? 42 : 50,
            near: 0.1,
            far: 200,
          }}
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[8, 24, 12]} intensity={1.1} />
          <VenueJumbotronGeometry3D
            descriptor={physical}
            pack={pack}
            event={event}
            ceilingElevationMeters={ceiling}
          />
        </SafeReactThreeCanvas>
      </div>

      {!showSurface ? (
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
      ) : (
        <div
          data-testid="venue-jumbotron-world-mount"
          data-architecture={physical.architecture}
          data-experience-type={experienceType}
          data-sightlines-certified={sightline.certifiedSightlinesAllOccupiedZones ? "true" : "false"}
          data-sightline-tiers={tierClasses}
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
      )}
    </>
  );
}

export default VenueAutomatedJumbotronMount;
