/**
 * VenueHudExperienceConnectionPolicy — §11978–§12081
 *
 * CONNECT existing Venue HUD + ParticipationStateMachine.
 * NEW_VENUE_HUD_CREATED = NO. NEW_CAPABILITY_RESOLVER = NO.
 *
 * Laws:
 * - One HUD system; experience aliases map to existing ParticipationRoomKind
 * - Controls resolve ROLE × EXPERIENCE × STATE × CAPABILITIES
 * - Missing capability → honest disable / omit — never fake buttons
 */

import type { ExperienceType, HudFamily, UserRoleCapability } from "./TMIExperienceHudRuntime";
import { resolveCanonicalHudFamily, resolveHudCapabilities } from "./TMIExperienceHudRuntime";
import {
  experienceToRoomKind,
  resolveParticipationHudActions,
} from "./HudActionRegistry";
import type { ParticipationRoomKind, ParticipationState, VenueHudAction } from "@/lib/live/ParticipationStateMachine";

export const VENUE_HUD_EXPERIENCE_CONNECTION_POLICY_ID =
  "VENUE_HUD_EXPERIENCE_CONNECTION_POLICY_v1" as const;

/** Explicit audit flag — this pass must never spawn VenueHUDV2. */
export const NEW_VENUE_HUD_CREATED = false as const;
export const NEW_CAPABILITY_RESOLVER_CREATED = false as const;

/** Full experience vocabulary the HUD runtime now accepts (aliases included). */
export const CONNECTED_EXPERIENCE_TYPES: readonly ExperienceType[] = [
  "BATTLE",
  "WORLD_CONCERT",
  "WORLD_RELEASE",
  "LIVE",
  "CYPHER",
  "CHALLENGE",
  "GAME_SHOW",
  "STREAM_AND_WIN_RADIO",
  "LOUNGE",
  "LISTENING_PARTY",
  "MONDAY_NIGHT_STAGE",
  "DIRTY_DOZENS",
  "DANCE_OFF",
  "DEAL_OR_FEUD",
  "CIRCLE_SQUARES",
  "NAME_THAT_TUNE",
  "SONG_CHALLENGE",
  "REHEARSAL",
  "WORLD_DANCE_PARTY",
  "MINI_CONCERT",
  "MINI_RELEASE",
  "MINI_BATTLE",
  "MINI_CYPHER",
  "MINI_CHALLENGE",
  "MINI_DANCE_PARTY",
] as const;

export type ExperienceHudConnection = {
  experienceType: ExperienceType;
  hudFamily: HudFamily;
  roomKind: ParticipationRoomKind;
  usesExistingParticipationMatrix: true;
  newHudEngine: false;
};

export function resolveExperienceHudConnection(
  experienceType: ExperienceType,
): ExperienceHudConnection {
  return {
    experienceType,
    hudFamily: resolveCanonicalHudFamily(experienceType),
    roomKind: experienceToRoomKind(experienceType),
    usesExistingParticipationMatrix: true,
    newHudEngine: false,
  };
}

/**
 * ArenaEventShell eventType → HUD ExperienceType.
 * Stops MNS / Deal-or-Feud / Song Challenge / WDP from silently collapsing to LIVE
 * when a distinct alias already exists on the connection policy.
 */
export function mapArenaEventToExperienceType(eventType: string): ExperienceType {
  switch (eventType) {
    case "battle":
      return "BATTLE";
    case "cypher":
      return "CYPHER";
    case "challenge":
      return "CHALLENGE";
    case "song-challenge":
      return "SONG_CHALLENGE";
    case "deal-or-feud":
      return "DEAL_OR_FEUD";
    case "monday-stage":
      return "MONDAY_NIGHT_STAGE";
    case "concert":
      return "WORLD_CONCERT";
    case "world-dance-party":
      return "WORLD_DANCE_PARTY";
    case "lounge":
      return "LOUNGE";
    case "slow-jams":
    case "listening-party":
      return "LISTENING_PARTY";
    case "live-show":
    default:
      return "LIVE";
  }
}

export function auditExperienceHudConnections(): ExperienceHudConnection[] {
  return CONNECTED_EXPERIENCE_TYPES.map(resolveExperienceHudConnection);
}

/**
 * Resolves live HUD actions for role × experience × state through the
 * existing ParticipationStateMachine — no parallel game-button registry.
 */
export function resolveConnectedVenueHudActions(input: {
  role: UserRoleCapability;
  experienceType: ExperienceType;
  isRoomOwner?: boolean;
  votingOpen?: boolean;
  participationState?: ParticipationState;
  queueEngineAvailable?: boolean;
  hostControlsAvailable?: boolean;
  gameActionsAvailable?: boolean;
}): {
  hudFamily: HudFamily;
  roomKind: ParticipationRoomKind;
  capabilities: ReturnType<typeof resolveHudCapabilities>;
  actions: VenueHudAction[];
  NEW_VENUE_HUD_CREATED: false;
} {
  const connection = resolveExperienceHudConnection(input.experienceType);
  return {
    hudFamily: connection.hudFamily,
    roomKind: connection.roomKind,
    capabilities: resolveHudCapabilities(input.role),
    actions: resolveParticipationHudActions({
      role: input.role,
      experienceType: input.experienceType,
      isRoomOwner: input.isRoomOwner,
      votingOpen: input.votingOpen,
      participationState: input.participationState,
      queueEngineAvailable: input.queueEngineAvailable,
      hostControlsAvailable: input.hostControlsAvailable,
      gameActionsAvailable: input.gameActionsAvailable,
    }),
    NEW_VENUE_HUD_CREATED: false,
  };
}
