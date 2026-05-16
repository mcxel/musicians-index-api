import { SceneGraphNode } from "./lobbyMetadataLoader";
import { RuntimeAvatar } from "./lobbySceneRuntime";

export class VenuePathingEngine {
  static calculatePath(startX: number, startY: number, targetNode: SceneGraphNode) {
    // NavMesh pathfinding simulation bridging SceneGraph coordinates to screen space
    return [
      { x: startX, y: startY },
      { x: targetNode.anchor.x, y: targetNode.anchor.y }
    ];
  }

  static moveAvatar(avatar: RuntimeAvatar, targetNode: SceneGraphNode): RuntimeAvatar {
    return {
      ...avatar,
      state: 'WALK',
      targetNodeId: targetNode.id
    };
  }
}