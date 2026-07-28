/**
 * EOS Camera Registry — broadcast shot packs (Rule 16 Broadcast Director).
 * Weights align with BroadcastDirectorEngine room profiles.
 */

import type { CameraPackDefinition } from "@/core/eos/types";

export const CAMERA_REGISTRY: Record<string, CameraPackDefinition> = {
  battle_standard: {
    id: "battle_standard",
    displayName: "Battle Broadcast Pack",
    roomType: "BATTLE",
    shotWeights: { AudienceView: 80, BackstageView: 10, HostView: 10 },
  },
  cypher_standard: {
    id: "cypher_standard",
    displayName: "Cypher Broadcast Pack",
    roomType: "CYPHER",
    shotWeights: { StageView: 75, CrowdView: 15, HostView: 10 },
  },
  challenge_standard: {
    id: "challenge_standard",
    displayName: "Challenge Broadcast Pack",
    roomType: "CHALLENGE",
    shotWeights: { StageView: 85, CrowdView: 10, HostView: 5 },
  },
  fan_lobby_standard: {
    id: "fan_lobby_standard",
    displayName: "Fan Lobby Broadcast Pack",
    roomType: "FAN_LOBBY",
    shotWeights: { HostView: 60, VIPView: 30, CrowdView: 10 },
  },
  dance_party_standard: {
    id: "dance_party_standard",
    displayName: "World Dance Party Pack",
    roomType: "DANCE_PARTY",
    shotWeights: { DJView: 50, DanceFloorView: 30, CrowdView: 10, HostView: 10 },
  },
  lounge_standard: {
    id: "lounge_standard",
    displayName: "Lounge Conversation Pack",
    roomType: "LOUNGE",
    shotWeights: { AudienceView: 70, ReactionView: 20, HostView: 10 },
  },
  game_show_standard: {
    id: "game_show_standard",
    displayName: "Game Show Pack",
    roomType: "GAME_SHOW",
    shotWeights: { StageView: 60, AudienceView: 25, HostView: 15 },
  },
  stage_show_standard: {
    id: "stage_show_standard",
    displayName: "Apollo Stage Pack",
    roomType: "STAGE_SHOW",
    shotWeights: { StageView: 70, CrowdView: 20, HostView: 10 },
  },
  concert_standard: {
    id: "concert_standard",
    displayName: "Concert Broadcast Pack",
    roomType: "CONCERT",
    shotWeights: { StageView: 65, AudienceView: 25, HostView: 10 },
  },
};

export function getCameraPackById(id: string): CameraPackDefinition | undefined {
  return CAMERA_REGISTRY[id];
}
