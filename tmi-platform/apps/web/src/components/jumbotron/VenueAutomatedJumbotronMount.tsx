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
import { getActiveBattleProgram } from "@/lib/experiencePresentation/composeBattleProgram";
import { getActiveChallengeProgram } from "@/lib/experiencePresentation/composeChallengeProgram";
import { getActiveCypherProgram } from "@/lib/experiencePresentation/composeCypherProgram";
import { getActiveConcertProgram } from "@/lib/experiencePresentation/composeConcertProgram";
import { JumbotronShowDirector } from "@/lib/jumbotron/JumbotronShowDirector";

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
  // Challenge before cypher — "challenge" must not fall through to REGULAR_LIVE.
  if (t.includes("challenge")) return "CHALLENGE_ARENA";
  if (t.includes("cypher") || t.includes("cipher")) return "CYPHER";
  if (t.includes("dance")) return "WORLD_DANCE_PARTY";
  // Concert before monday/auditorium — world/mini concert map to WORLD_CONCERT PROGRAM.
  if (t.includes("concert") || t.includes("mini-concert") || t.includes("world-concert")) {
    return "WORLD_CONCERT";
  }
  if (t.includes("monday") || t.includes("auditorium")) return "AUDITORIUM";
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

  // Seed experience-appropriate program content (real director events, not fake crowds/scores)
  useEffect(() => {
    if (experienceType === "BATTLE_ARENA") {
      const prog = getActiveBattleProgram();
      // Show-critical Battle state outranks ads (P2). Never invent MC Nova / fake scores.
      if (prog?.dualOccupancy && prog.cornerA && prog.cornerB) {
        if (prog.scores) {
          const scored = director.postBattleScoreboard({
            participantA: prog.cornerA.displayName,
            scoreA: prog.scores.scoreA,
            participantB: prog.cornerB.displayName,
            scoreB: prog.scores.scoreB,
          });
          setEvent({
            ...scored,
            sourceEventId: prog.programSourceId,
            title: "BATTLE LIVE",
            headline: `${prog.cornerA.displayName} VS ${prog.cornerB.displayName}`,
          });
        } else {
          setEvent({
            id: `evt-battle-vs-${roomId}`,
            traceId: `tr-battle-${roomId}`,
            priority: JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL,
            eventType: "ROUND_TIMER_TICK",
            experienceType: "BATTLE_ARENA",
            targetClass: pack.primaryTarget,
            sourceEventId: prog.programSourceId,
            title: "BATTLE LIVE",
            headline: `${prog.cornerA.displayName} VS ${prog.cornerB.displayName}`,
            subline: prog.programSourceId,
            durationMs: 120_000,
            createdAtMs: Date.now(),
            expiresAtMs: Date.now() + 120_000,
            accentColor: pack.brandPalette.accent,
            battleScores: {
              participantA: prog.cornerA.displayName,
              scoreA: Number.NaN,
              participantB: prog.cornerB.displayName,
              scoreB: Number.NaN,
            },
          });
        }
        // Face preempt via ShowDirector when hooks exist — P2 show-critical over ads.
        try {
          const show = new JumbotronShowDirector(venueId ?? `venue-${roomId}`, `session:${roomId}`);
          show.handleBusEvent({ type: "ROUND_START", roundId: prog.battleId });
        } catch {
          /* show director optional — AutomatedJumbotronDirector already holds P2 event */
        }
      } else {
        const name = prog?.cornerA?.displayName?.trim() || "Waiting for competitor";
        setEvent({
          id: `evt-battle-solo-${roomId}`,
          traceId: `tr-battle-solo-${roomId}`,
          priority: JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL,
          eventType: "ROUND_TIMER_TICK",
          experienceType: "BATTLE_ARENA",
          targetClass: pack.primaryTarget,
          sourceEventId: prog?.programSourceId ?? "PROGRAM.BATTLE_COMPOSITE",
          title: "BATTLE",
          headline: name,
          subline: "Corner B unlocks when a real competitor joins",
          durationMs: 120_000,
          createdAtMs: Date.now(),
          expiresAtMs: Date.now() + 120_000,
          accentColor: pack.brandPalette.accent,
        });
      }
    } else if (experienceType === "CHALLENGE_ARENA") {
      // Objective-first PROGRAM — never Battle VS scoreboard seed.
      const prog = getActiveChallengeProgram();
      const objectiveText = prog?.objective.objective?.trim() || "Waiting for objective";
      const programId = prog?.programSourceId ?? "PROGRAM.CHALLENGE_PRIMARY";
      const challengerName = prog?.challenger?.displayName?.trim() || null;
      setEvent({
        id: `evt-challenge-obj-${roomId}`,
        traceId: `tr-challenge-${roomId}`,
        priority: JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL,
        eventType: "CHALLENGE_OBJECTIVE_REVEAL",
        experienceType: "CHALLENGE_ARENA",
        targetClass: pack.primaryTarget,
        sourceEventId: programId,
        title: "CHALLENGE",
        headline: objectiveText,
        subline: challengerName ? `${challengerName} · ${programId}` : programId,
        durationMs: 120_000,
        createdAtMs: Date.now(),
        expiresAtMs: Date.now() + 120_000,
        accentColor: pack.brandPalette.secondary ?? pack.brandPalette.accent,
      });
    } else if (experienceType === "CYPHER") {
      // Real Cypher PROGRAM — mic + next-up; never fake Battle scoreboard.
      const prog = getActiveCypherProgram();
      const onMic = prog?.activeMic?.displayName?.trim() || "Waiting for mic";
      const nextName = prog?.nextUp?.displayName?.trim() || "Awaiting handoff";
      const programId = prog?.programSourceId ?? "PROGRAM.CYPHER_FOCUS";
      if (prog?.activeMic) {
        const next = director.postCypherNextUp(onMic, nextName);
        setEvent({
          ...next,
          sourceEventId: programId,
          title: "CYPHER",
          headline: `ON MIC: ${onMic.toUpperCase()}`,
          subline: `NEXT UP: ${nextName.toUpperCase()} · ${programId}`,
        });
      } else {
        setEvent({
          id: `evt-cypher-lobby-${roomId}`,
          traceId: `tr-cypher-${roomId}`,
          priority: JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL,
          eventType: "CYPHER_ROTATION_NEXT",
          experienceType: "CYPHER",
          targetClass: pack.primaryTarget,
          sourceEventId: programId,
          title: "CYPHER",
          headline: onMic,
          subline: programId,
          durationMs: 120_000,
          createdAtMs: Date.now(),
          expiresAtMs: Date.now() + 120_000,
          accentColor: pack.brandPalette.secondary ?? pack.brandPalette.accent,
        });
      }
    } else if (experienceType === "WORLD_CONCERT") {
      // Real Concert PROGRAM — headliner + now-playing; never invent attendance/tips/scores.
      const prog = getActiveConcertProgram();
      const badge = prog?.worldMiniBadge ?? "⭐ MINI";
      const headlinerName = prog?.headliner?.displayName?.trim() || "Waiting for headliner";
      const nowTitle = prog?.nowPlaying?.title?.trim() || null;
      const programId =
        prog?.programSourceId ??
        (prog?.scope === "WORLD" ? "PROGRAM.WORLD_CONCERT" : "PROGRAM.CONCERT_STAGE");
      setEvent({
        id: `evt-concert-${roomId}`,
        traceId: `tr-concert-${roomId}`,
        priority: JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL,
        eventType: "AMBIENT_UPCOMING_SCHEDULE",
        experienceType: "WORLD_CONCERT",
        targetClass: pack.primaryTarget,
        sourceEventId: programId,
        title: badge.includes("WORLD") ? "WORLD CONCERT" : "MINI CONCERT",
        headline: nowTitle ? `${headlinerName} · ${nowTitle}` : headlinerName,
        subline: `${badge} · ${programId}`,
        durationMs: 120_000,
        createdAtMs: Date.now(),
        expiresAtMs: Date.now() + 120_000,
        accentColor: pack.brandPalette.accent,
      });
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
  }, [director, experienceType, pack.brandPalette.accent, pack.primaryTarget, roomId, venueId]);

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
