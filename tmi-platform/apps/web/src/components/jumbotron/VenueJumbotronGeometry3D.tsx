"use client";

/**
 * VenueJumbotronGeometry3D — architecture-aware R3F world geometry for AudienceScene.
 * Resolves CENTER_HUNG / END_ZONE / DISCO_ORB / WALL_HANGING from PhysicalJumbotronDescriptor.
 * Not a HUD overlay — real world-space mesh group inside SafeReactThreeCanvas.
 */

import type {
  PhysicalJumbotronDescriptor,
  JumbotronPresentationPack,
  JumbotronEvent,
} from "@/lib/jumbotron/JumbotronContracts";
import { ArenaCenterHungJumbotron3D } from "@/components/jumbotron/ArenaCenterHungJumbotron3D";

interface VenueJumbotronGeometry3DProps {
  descriptor: PhysicalJumbotronDescriptor;
  pack: JumbotronPresentationPack;
  event?: JumbotronEvent | null;
  ceilingElevationMeters?: number;
}

function EndZoneDisplay3D({
  descriptor,
  pack,
}: {
  descriptor: PhysicalJumbotronDescriptor;
  pack: JumbotronPresentationPack;
}) {
  const [cx, cy, cz] = descriptor.centerPosition;
  const { widthMeters, heightMeters, depthMeters } = descriptor.dimensions;
  return (
    <group
      data-testid="3d-end-zone-jumbotron-root"
      position={[cx, cy, cz]}
      rotation={[0, (descriptor.viewingOrientationYawDegrees * Math.PI) / 180, 0]}
    >
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[widthMeters, heightMeters, depthMeters]} />
        <meshStandardMaterial color="#060712" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, depthMeters / 2 + 0.04]}>
        <planeGeometry args={[widthMeters * 0.94, heightMeters * 0.92]} />
        <meshBasicMaterial color="#000008" />
      </mesh>
      <mesh position={[0, heightMeters / 2 + 0.15, 0]}>
        <boxGeometry args={[widthMeters * 1.02, 0.25, depthMeters * 1.1]} />
        <meshStandardMaterial
          color="#000000"
          emissive={pack.brandPalette.primary}
          emissiveIntensity={1.6}
        />
      </mesh>
    </group>
  );
}

function DiscoOrb3D({
  descriptor,
  pack,
}: {
  descriptor: PhysicalJumbotronDescriptor;
  pack: JumbotronPresentationPack;
}) {
  const [cx, cy, cz] = descriptor.centerPosition;
  const radius = Math.max(
    descriptor.dimensions.widthMeters,
    descriptor.dimensions.heightMeters,
    descriptor.dimensions.depthMeters,
  ) / 2;
  const cableLen = Math.max(1.2, (descriptor.mountRiggingAnchor[1] ?? cy + radius + 2) - (cy + radius));
  return (
    <group data-testid="3d-disco-orb-jumbotron-root" position={[cx, cy, cz]}>
      <mesh position={[0, radius + cableLen / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, cableLen, 8]} />
        <meshStandardMaterial color="#333344" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius, 32, 24]} />
        <meshStandardMaterial
          color="#0a0618"
          emissive={pack.brandPalette.accent}
          emissiveIntensity={1.4}
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 1.02, 16, 12]} />
        <meshBasicMaterial color={pack.brandPalette.primary} wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function WallHangingLed3D({
  descriptor,
  pack,
}: {
  descriptor: PhysicalJumbotronDescriptor;
  pack: JumbotronPresentationPack;
}) {
  const [cx, cy, cz] = descriptor.centerPosition;
  const { widthMeters, heightMeters, depthMeters } = descriptor.dimensions;
  return (
    <group data-testid="3d-wall-led-jumbotron-root" position={[cx, cy, cz]}>
      <mesh>
        <boxGeometry args={[widthMeters, heightMeters, depthMeters]} />
        <meshStandardMaterial color="#080818" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, depthMeters / 2 + 0.03]}>
        <planeGeometry args={[widthMeters * 0.94, heightMeters * 0.9]} />
        <meshBasicMaterial color="#000006" />
      </mesh>
      <mesh position={[0, 0, depthMeters / 2 + 0.05]}>
        <planeGeometry args={[widthMeters * 0.96, heightMeters * 0.04]} />
        <meshBasicMaterial color={pack.brandPalette.primary} />
      </mesh>
    </group>
  );
}

export function VenueJumbotronGeometry3D({
  descriptor,
  pack,
  event: _event = null,
  ceilingElevationMeters,
}: VenueJumbotronGeometry3DProps) {
  switch (descriptor.architecture) {
    case "CENTER_HUNG_ARENA_JUMBOTRON":
      return (
        <ArenaCenterHungJumbotron3D
          descriptor={descriptor}
          event={_event}
          pack={pack}
          ceilingElevationMeters={ceilingElevationMeters}
        />
      );
    case "END_ZONE_DISPLAY":
      return <EndZoneDisplay3D descriptor={descriptor} pack={pack} />;
    case "CENTER_HUNG_DISCO_ORB":
      return <DiscoOrb3D descriptor={descriptor} pack={pack} />;
    case "WALL_HANGING_LED":
    default:
      return <WallHangingLed3D descriptor={descriptor} pack={pack} />;
  }
}

export default VenueJumbotronGeometry3D;
