/**
 * V2.4 Avatar Movement Chain & Scene Runtime
 * Connects the loaded scene graph to dynamic avatar states.
 */

import { type SceneGraphNode } from "./lobbyMetadataLoader";

// The Canonical Avatar Movement Chain
export type AvatarState = 
  | "SPAWN"       // Enters lobby, instantiating at edge of navmesh
  | "WALK"        // Pathfinding across navmesh towards a node
  | "IDLE"        // Standing in spectator areas or waiting
  | "SOCIAL"      // Engaging with other nearby avatars
  | "QUEUE"       // Anchored to a QUEUE_NODE awaiting performance
  | "SIT"         // Anchored to a SEAT node
  | "TRANSITION"  // Walking into a portal
  | "VENUE";      // Handed off to the Phase D venue engine

export interface RuntimeAvatar {
  id: string;
  state: AvatarState;
  position: { x: number; y: number; z: number };
  targetNodeId: string | null;
}

export function calculatePathToNode(avatar: RuntimeAvatar, node: SceneGraphNode) {
  // NavMesh pathfinding logic drops here
  return {
    ...avatar,
    state: "WALK" as AvatarState,
    targetNodeId: node.id
  };
}

export function triggerGlobalTransition(avatars: RuntimeAvatar[], portalId: string) {
  // Moves all avatars through the portal to the venue
  return avatars.map(a => ({ ...a, state: "TRANSITION" as AvatarState, targetNodeId: portalId }));
}