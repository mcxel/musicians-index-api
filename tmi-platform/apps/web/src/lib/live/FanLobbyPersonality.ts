/**
 * Fan Lobby Personality — avatar + optional WebRTC panel.
 *
 * FAN LOBBY = avatar world (AudienceScene, seating, free-roam avatars).
 * WebRTC is optional — explicit CAM ON only. Never the primary presence model.
 *
 * Wired by Canonical3DRoomRuntime when zone = FAN_AVATAR_LOBBY / auditorium family.
 */

import { CANONICAL_WORLD_ZONE, type CanonicalWorldGate3Status } from "./canonicalWorldViewport";

export const FAN_LOBBY_PERSONALITY = {
  id: "FAN_LOBBY" as const,
  zone: CANONICAL_WORLD_ZONE.FAN_AVATAR_LOBBY,
  allowsAvatars: true,
  allowsAvatarSeating: true,
  allowsBotCrowdFill: true,
  videoPanelsPrimary: false,
  webrtcOptionalPanel: true,
  freeRoam: true,
  locomotionSource: "AvatarLobbyCanvas / AudienceScene seat assignment",
  audienceSceneRequired: true,
  chassisSkinDoesNotRestartWebrtc: true,
  gate3PhysicalWorld: "OPEN" as CanonicalWorldGate3Status,
  collisionMeshCertified: false,
  photorealMesh: false,
} as const;

export type FanLobbyPersonalityId = typeof FAN_LOBBY_PERSONALITY.id;
