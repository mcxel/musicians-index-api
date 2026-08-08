/**
 * LobbyPreviewUrlBudget — caps simultaneous discovery previewUrl decodes on the wall.
 */

import {
  getGovernedIdleFallbackPolicy,
  mayDecodeLobbyPreviewUrl,
} from "@/lib/adaptiveWorldRuntime/IdleFallbackGovernor";

const activeRoomIds = new Set<string>();

export function tryClaimLobbyPreviewUrl(roomId: string, focused: boolean): boolean {
  if (activeRoomIds.has(roomId)) return true;
  const allowed = mayDecodeLobbyPreviewUrl({
    focused,
    urlVideoTilesActive: activeRoomIds.size,
  });
  if (!allowed) return false;
  if (getGovernedIdleFallbackPolicy().maxUrlVideoTiles <= activeRoomIds.size) {
    return false;
  }
  activeRoomIds.add(roomId);
  return true;
}

export function releaseLobbyPreviewUrl(roomId: string): void {
  activeRoomIds.delete(roomId);
}

export function getActiveLobbyPreviewUrlCount(): number {
  return activeRoomIds.size;
}
