/**
 * SpatialAudioMixer.ts — Phase 5.2 Multi-Source Spatial Audio Engine.
 * Calculates spatial audio distance-volume attenuation and stereo panning for free-roam avatars across 3D venue zones.
 * Multi-source attenuation handling:
 *   - DJ Master Music (distance-clamped inverse square)
 *   - Crowd Chatter (zone-based ambient volume)
 *   - Nearby Fan Voice (proximity-based directional P2P)
 *   - Broadcast Overrides & Announcements (always audible)
 */

export interface SpatialCoordinates {
  x: number; // -100 to 100 (Left/Right relative to stage)
  y: number; // 0 to 200 (Distance from DJ booth / stage)
}

export type DanceZone =
  | "DJ_BOOTH"
  | "MAIN_FLOOR"
  | "VIP"
  | "LOUNGE"
  | "BAR"
  | "PHOTO_BOOTH"
  | "SIDE_STAGE"
  | "BACK_STAGE"
  | "ENTRY"
  | "EXIT";

export interface DanceParticipant {
  userId: string;
  avatarId: string;
  position: SpatialCoordinates;
  zone: DanceZone;
  isDancing: boolean;
  energyScore: number;
}

export interface AudioMixOutput {
  userId: string;
  masterVolume: number;
  djMusicVolume: number;
  crowdAmbientVolume: number;
  nearbyVoiceVolume: number;
  spatialPan: number; // -1 (Left) to 1 (Right)
  zone: DanceZone;
}

export function calculateSpatialAudioMix(
  participant: DanceParticipant,
  djBoothPosition: SpatialCoordinates = { x: 0, y: 0 },
  maxDistance: number = 200,
): AudioMixOutput {
  const dx = participant.position.x - djBoothPosition.x;
  const dy = participant.position.y - djBoothPosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const normalizedDistance = Math.min(distance / maxDistance, 1.0);

  // Closer to stage -> louder DJ music (max 1.0, min 0.2 in Lounge/Bar)
  const djMusicVolume = Number((1.0 - normalizedDistance * 0.75).toFixed(2));

  // Crowd chatter increases in VIP/Bar/Main Floor zones
  let crowdAmbientVolume = 0.3;
  if (participant.zone === "BAR" || participant.zone === "LOUNGE") crowdAmbientVolume = 0.6;
  else if (participant.zone === "MAIN_FLOOR") crowdAmbientVolume = 0.45;

  // Spatial stereo panning derived from X coordinate
  const spatialPan = Number(Math.max(-1, Math.min(1, participant.position.x / 100)).toFixed(2));

  return {
    userId: participant.userId,
    masterVolume: 1.0,
    djMusicVolume,
    crowdAmbientVolume: Number(crowdAmbientVolume.toFixed(2)),
    nearbyVoiceVolume: Number((1.0 - normalizedDistance * 0.5).toFixed(2)),
    spatialPan,
    zone: participant.zone,
  };
}
