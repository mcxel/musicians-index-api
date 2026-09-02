/**
 * WorldInteractionRegistry — venue interactables contract.
 */

export type WorldInteractableKind =
  | "SEAT"
  | "DOOR"
  | "JUMBOTRON_SCREEN"
  | "PROP"
  | "DJ_BOOTH"
  | "STAGE_EDGE"
  | "PLAYLIST_TERMINAL"
  | "COMMERCE_KIOSK"
  | "SPAWN_PAD"
  | "PRIVATE_SUBROOM_PORTAL";

export interface WorldInteractable {
  interactableId: string;
  venueId: string;
  kind: WorldInteractableKind;
  anchor: { x: number; y: number; z: number };
  allowedRoles: Array<"FAN" | "PERFORMER" | "HOST" | "ADMIN">;
  handlerId: string;
}

export interface WorldInteractionRegistry {
  register(item: WorldInteractable): void;
  get(interactableId: string): WorldInteractable | undefined;
  listForVenue(venueId: string): WorldInteractable[];
  listByKind(venueId: string, kind: WorldInteractableKind): WorldInteractable[];
}

export function createWorldInteractionRegistry(): WorldInteractionRegistry {
  const map = new Map<string, WorldInteractable>();
  return {
    register(item) {
      map.set(item.interactableId, item);
    },
    get(id) {
      return map.get(id);
    },
    listForVenue(venueId) {
      return [...map.values()].filter((i) => i.venueId === venueId);
    },
    listByKind(venueId, kind) {
      return [...map.values()].filter((i) => i.venueId === venueId && i.kind === kind);
    },
  };
}
