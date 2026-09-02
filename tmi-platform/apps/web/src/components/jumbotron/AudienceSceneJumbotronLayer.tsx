"use client";

/**
 * AudienceSceneJumbotronLayer — R3F world-space Jumbotron inside AudienceScene.
 * Uses AutomatedJumbotronDirector placement (INDOOR / OUTDOOR / WDP / CLUB wall).
 * LOOK UP focus is driven by parent; geometry stays mounted either way.
 */

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useThree } from "@react-three/fiber";
import { AutomatedJumbotronDirector } from "@/lib/jumbotron/AutomatedJumbotronDirector";
import type { JumbotronExperienceType, VenuePhysicalEnvironmentType } from "@/lib/jumbotron/JumbotronContracts";
import { mapArenaEventToJumbotronExperience } from "@/components/jumbotron/VenueAutomatedJumbotronMount";

/** Local venue index type — avoid circular import with AudienceScene.tsx */
type VenueIndex = 0 | 1 | 2 | 3 | 4 | 5;

const SafeReactThreeCanvas = dynamic(
  () => import("@/components/3d/SafeReactThreeCanvas"),
  { ssr: false },
);
const VenueJumbotronGeometry3D = dynamic(
  () =>
    import("@/components/jumbotron/VenueJumbotronGeometry3D").then((m) => m.VenueJumbotronGeometry3D),
  { ssr: false },
);

export function venueIndexToJumbotronEnvironment(
  venue: VenueIndex,
  experienceType?: JumbotronExperienceType,
): VenuePhysicalEnvironmentType {
  if (experienceType === "WORLD_DANCE_PARTY") return "WORLD_DANCE_PARTY";
  if (experienceType === "WORLD_CONCERT") return "OUTDOOR_STADIUM";
  if (experienceType === "AUDITORIUM" || experienceType === "MONDAY_NIGHT_STAGE") {
    return "PROSCENIUM_THEATER";
  }
  if (
    experienceType === "LOUNGE" ||
    experienceType === "FAN_LOBBY" ||
    experienceType === "PERFORMER_LOBBY"
  ) {
    return "CLUB_SMALL_ROOM";
  }
  switch (venue) {
    case 1:
      return "INDOOR_ARENA";
    case 2:
      return "CLUB_SMALL_ROOM";
    case 3:
      return "OUTDOOR_STADIUM";
    case 0:
    case 5:
      return "PROSCENIUM_THEATER";
    case 4:
    default:
      return "CLUB_SMALL_ROOM";
  }
}

export interface AudienceSceneJumbotronLayerProps {
  roomId: string;
  venue?: VenueIndex;
  eventType?: string | null;
  venueId?: string;
  lookUpActive?: boolean;
}

function JumbotronCameraFraming({ lookUpActive }: { lookUpActive: boolean }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(
      0,
      lookUpActive ? 14 : 6,
      lookUpActive ? 38 : 42,
    );
    camera.lookAt(0, lookUpActive ? 12 : 2, 0);
    camera.updateProjectionMatrix();
  }, [camera, lookUpActive]);
  return null;
}

export function AudienceSceneJumbotronLayer({
  roomId,
  venue = 1,
  eventType,
  venueId,
  lookUpActive = false,
}: AudienceSceneJumbotronLayerProps) {
  const experienceType = mapArenaEventToJumbotronExperience(eventType);
  const venueEnvironment = venueIndexToJumbotronEnvironment(venue, experienceType);

  const director = useMemo(() => {
    return new AutomatedJumbotronDirector({
      roomId,
      sessionId: `audience-scene:${roomId}`,
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
      participantCount: 0,
      crowdActivityScore: 0,
      venueEnvironment,
    });
  }, [roomId, experienceType, venueId, venueEnvironment]);

  const descriptor = director.getPhysicalJumbotronDescriptor();
  const pack = director.getPresentationPack();
  const sightline = useMemo(() => director.certifySightlines(), [director]);
  const ceiling = director.getSpatialDimensions().ceilingElevationMeters;

  return (
    <div
      data-testid="audience-scene-jumbotron-layer"
      data-architecture={descriptor.architecture}
      data-experience-type={experienceType}
      data-sightlines-certified={sightline.certifiedSightlinesAllOccupiedZones ? "true" : "false"}
      data-jumbotron-look-up={lookUpActive ? "true" : "false"}
      data-audience-scene-jumbotron-mounted="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        borderRadius: 8,
        overflow: "hidden",
        zIndex: lookUpActive ? 7 : 3,
        opacity: lookUpActive ? 1 : 0.55,
        minHeight: 120,
      }}
    >
      <SafeReactThreeCanvas
        faultContext="AudienceScene Jumbotron"
        fallbackLabel="Jumbotron geometry paused"
        style={{ width: "100%", height: "100%", background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 8, 40], fov: 48, near: 0.1, far: 200 }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[8, 24, 12]} intensity={1.1} />
        <directionalLight position={[-10, 8, -6]} intensity={0.35} color="#AA2DFF" />
        <JumbotronCameraFraming lookUpActive={lookUpActive} />
        <VenueJumbotronGeometry3D
          descriptor={descriptor}
          pack={pack}
          ceilingElevationMeters={ceiling}
        />
      </SafeReactThreeCanvas>
    </div>
  );
}

export default AudienceSceneJumbotronLayer;
