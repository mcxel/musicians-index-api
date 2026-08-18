/**
 * TMI Lounge HUD Runtime Engine — Sibling Runtime to Venue HUD.
 *
 * User-facing Name: TMI Interactive Lounge HUD
 * Technical Engine: TMI Lounge HUD Runtime
 *
 * Laws:
 *   1. Reuses shared primitives (HudCommandBus, HudSafeArea, HudRecallControl, MotionRegistry) from Venue HUD.
 *   2. Dedicated strictly to social 3D world navigation (MOVE, TALK, SIT, EMOTE, DANCE, FRIENDS, PRIVATE TALK).
 *   3. Proximity engine injects context-sensitive pills when near seats, tables, kiosks, dance floors, pool tables.
 */

export type LoungeMode =
  | "CHILL_LOUNGE"
  | "PLAYLIST_LOUNGE"
  | "MUSIC_LOUNGE"
  | "MOVIE_LOUNGE"
  | "DANCE_LOUNGE"
  | "POOL_LOUNGE"
  | "VIP_LOUNGE"
  | "SINGLES_LOUNGE"
  | "COUPLES_LOUNGE";

export type ProximityObjectType =
  | "AVATAR"
  | "SEAT"
  | "DANCE_FLOOR"
  | "JUKEBOX"
  | "POOL_TABLE"
  | "BAR_KIOSK"
  | "PRIVATE_BOOTH";

export interface ProximityTarget {
  id: string;
  type: ProximityObjectType;
  label: string;
  distanceMeters: number;
  availableActions: string[];
}

export interface LoungeHudState {
  loungeMode: LoungeMode;
  isSeated: boolean;
  activeSeatId?: string;
  isPrivateTalking: boolean;
  privateTalkTargetUserId?: string;
  activeProximityTarget?: ProximityTarget;
  activeDanceStyle?: string;
}

export function resolveLoungeProximityActions(target: ProximityTarget): { actionId: string; label: string; icon: string }[] {
  switch (target.type) {
    case "AVATAR":
      return [
        { actionId: "LOUNGE_WAVE", label: "Wave", icon: "👋" },
        { actionId: "LOUNGE_PRIVATE_TALK", label: "Private Talk", icon: "💬" },
        { actionId: "LOUNGE_ADD_FRIEND", label: "Add Friend", icon: "➕" },
      ];
    case "SEAT":
      return [{ actionId: "LOUNGE_SIT", label: `Sit on ${target.label}`, icon: "🪑" }];
    case "DANCE_FLOOR":
      return [{ actionId: "LOUNGE_DANCE", label: "Join Dance Floor", icon: "🕺" }];
    case "JUKEBOX":
      return [{ actionId: "LOUNGE_JUKEBOX", label: "Pick Song", icon: "🎵" }];
    case "POOL_TABLE":
      return [{ actionId: "LOUNGE_PLAY_POOL", label: "Play Game", icon: "🎱" }];
    case "BAR_KIOSK":
      return [{ actionId: "LOUNGE_ORDER_DRINK", label: "Order Drink", icon: "🍸" }];
    default:
      return [];
  }
}
