/**
 * Chevron Action Registry & Entitlement Filtering Engine + Participation Law matrix.
 *
 * Rules:
 *   1. Permanent HUD stays compact.
 *   2. Tapping chevron expands registered action trays.
 *   3. Filters owned items and capability entitlements before rendering.
 *   4. Participation actions resolve via ParticipationStateMachine (role × room × state).
 */

import {
  resolveHudCapabilities,
  type UserRoleCapability,
  type ExperienceType,
} from "./TMIExperienceHudRuntime";
import {
  resolveParticipationEntry,
  type ParticipationRoomKind,
  type ParticipationState,
  type VenueHudAction,
} from "@/lib/live/ParticipationStateMachine";

export type HudActionCategory =
  | "reaction"
  | "emote"
  | "dance"
  | "social"
  | "show"
  | "cosmetic"
  | "host"
  | "queue"
  | "vote";

export interface RegisteredHudAction {
  id: string;
  label: string;
  icon: string;
  category: HudActionCategory;
  requiredRole?: UserRoleCapability;
  skuId?: string;
  unlockRequirement?: string;
  /** Optional face portrait for companion summons (Julius) — screen-space only. */
  portraitUrl?: string;
}

const registeredActions = new Map<string, RegisteredHudAction>();

// Populate canonical default items
const DEFAULT_ACTIONS: RegisteredHudAction[] = [
  { id: "act-fire", label: "Fire", icon: "🔥", category: "reaction" },
  { id: "act-heart", label: "Heart", icon: "❤️", category: "reaction" },
  { id: "act-clap", label: "Clap", icon: "👏", category: "reaction" },
  { id: "act-diamond", label: "Diamond Glow", icon: "💎", category: "reaction", skuId: "cosmetic-diamond-glow" },
  { id: "act-crown", label: "Prestige Crown", icon: "👑", category: "reaction", skuId: "cosmetic-crown" },
  { id: "act-dance-spin", label: "Spin Dance", icon: "💃", category: "dance", skuId: "emote-spin-dance" },
  { id: "act-dance-break", label: "Breakdance", icon: "🕺", category: "dance", skuId: "emote-break-dance" },
  { id: "act-cheer", label: "Audience Cheer", icon: "🙌", category: "reaction" },
  { id: "act-laugh", label: "Laugh", icon: "😂", category: "reaction" },
  { id: "act-boo", label: "Boo", icon: "👎", category: "reaction" },
  { id: "act-yay", label: "Yay", icon: "🙌", category: "reaction" },
  { id: "act-gasp", label: "Gasp", icon: "😮", category: "reaction" },
  { id: "act-oooh", label: "Oooh", icon: "😲", category: "reaction" },
  { id: "act-mns-up", label: "Up", icon: "👍", category: "vote", requiredRole: "fan" },
  { id: "act-mns-down", label: "Down", icon: "👎", category: "vote", requiredRole: "fan" },
  { id: "act-raise-hand", label: "Raise Hand", icon: "✋", category: "social", requiredRole: "fan" },
  { id: "act-intercom", label: "Intercom", icon: "🎙️", category: "host", requiredRole: "performer" },
  { id: "act-ask-crowd", label: "Ask Crowd", icon: "📊", category: "show", requiredRole: "performer" },
  {
    id: "act-julius",
    label: "Julius",
    icon: "🦦",
    category: "show",
    requiredRole: "performer",
    portraitUrl: "/assets/hosts/julius.webp",
  },
  {
    id: "act-visual-fx",
    label: "Visuals",
    icon: "🎨",
    category: "show",
    requiredRole: "performer",
  },
  {
    id: "act-crown-brag",
    label: "Show Crown",
    icon: "👑",
    category: "show",
    requiredRole: "performer",
    unlockRequirement: "ACTIVE_CROWN_ENTITLEMENT",
  },
  {
    id: "act-belt-brag",
    label: "Show Belt",
    icon: "🏆",
    category: "show",
    requiredRole: "performer",
    unlockRequirement: "ACTIVE_YEARLY_BELT_ENTITLEMENT",
  },
  {
    id: "act-trophy-flex",
    label: "Show Trophy",
    icon: "🏅",
    category: "show",
    requiredRole: "performer",
    unlockRequirement: "OWNED_TROPHY_ENTITLEMENT",
  },
  {
    id: "act-challenge-for-crown",
    label: "Challenge For Crown",
    icon: "⚔️",
    category: "queue",
    requiredRole: "performer",
  },
  {
    id: "act-notepad",
    label: "Notepad",
    icon: "📝",
    category: "show",
  },
  {
    id: "act-translate",
    label: "Translate",
    icon: "🌐",
    category: "social",
  },
  { id: "act-support-vote", label: "Support Vote", icon: "🗳️", category: "vote", requiredRole: "fan" },
  { id: "act-collect-card", label: "Collect Card", icon: "🎴", category: "social", requiredRole: "fan" },
  { id: "act-cue-next", label: "Next Cue", icon: "⏭️", category: "show", requiredRole: "performer" },
  { id: "act-join-queue", label: "Join Queue", icon: "📋", category: "queue", requiredRole: "performer" },
  { id: "act-challenge-winner", label: "Challenge Winner", icon: "⚔️", category: "queue", requiredRole: "performer" },
  {
    id: "act-live-challenge",
    label: "Challenge",
    icon: "⚔️",
    category: "queue",
    requiredRole: "performer",
  },
  {
    id: "act-accept-challenge",
    label: "I Accept The Challenge",
    icon: "✅",
    category: "queue",
    requiredRole: "performer",
  },
  { id: "act-approve-next", label: "Approve Next", icon: "✅", category: "host", requiredRole: "host" },
  { id: "act-bring-on-stage", label: "Bring On Stage", icon: "🎤", category: "host", requiredRole: "host" },
];

DEFAULT_ACTIONS.forEach((a) => registeredActions.set(a.id, a));

export function registerHudAction(action: RegisteredHudAction): () => void {
  registeredActions.set(action.id, action);
  return () => {
    registeredActions.delete(action.id);
  };
}

export function getAllRegisteredHudActions(): RegisteredHudAction[] {
  return Array.from(registeredActions.values());
}

export function filterActionsForUser(
  role: UserRoleCapability,
  ownedSkus: Set<string> = new Set(["cosmetic-diamond-glow", "emote-spin-dance"]),
  category?: HudActionCategory,
): RegisteredHudAction[] {
  const caps = resolveHudCapabilities(role);
  return Array.from(registeredActions.values()).filter((act) => {
    if (category && act.category !== category) return false;

    if (act.requiredRole) {
      if (act.requiredRole === "fan" && role !== "fan") return false;
      if (act.requiredRole === "performer" && role !== "performer" && role !== "admin") return false;
      if (act.requiredRole === "host" && role !== "host" && role !== "admin") return false;
    }

    // Fan-only cosmetics / dance — Rule 26: performers never get avatar ownership emotes
    if (role === "performer" && (act.category === "dance" || act.skuId?.startsWith("emote-") || act.skuId?.startsWith("cosmetic-"))) {
      return false;
    }

    if (act.skuId && !ownedSkus.has(act.skuId)) {
      return false;
    }

    void caps;
    return true;
  });
}

/**
 * Experience → ParticipationRoomKind. Aliases reuse existing kinds —
 * never a parallel HUD matrix per show title (§12053–§12070).
 */
export function experienceToRoomKind(experienceType: ExperienceType): ParticipationRoomKind {
  switch (experienceType) {
    case "BATTLE":
    case "MINI_BATTLE":
      return "battle";
    case "CYPHER":
    case "MINI_CYPHER":
      return "cypher";
    case "CHALLENGE":
    case "SONG_CHALLENGE":
    case "DANCE_OFF":
    case "MINI_CHALLENGE":
      return "challenge";
    case "GAME_SHOW":
    case "DIRTY_DOZENS":
    case "DEAL_OR_FEUD":
    case "CIRCLE_SQUARES":
    case "NAME_THAT_TUNE":
      return "game";
    case "LOUNGE":
    case "LISTENING_PARTY":
    case "STREAM_AND_WIN_RADIO":
      return "lounge";
    case "WORLD_CONCERT":
    case "WORLD_RELEASE":
    case "MINI_CONCERT":
    case "MINI_RELEASE":
    case "MONDAY_NIGHT_STAGE":
      return "show_release";
    case "WORLD_DANCE_PARTY":
    case "MINI_DANCE_PARTY":
    case "REHEARSAL":
    case "LIVE":
    default:
      return "live";
  }
}

function hudRoleToParticipation(role: UserRoleCapability): string {
  if (role === "fan") return "FAN";
  if (role === "performer") return "PERFORMER";
  if (role === "host") return "HOST";
  if (role === "admin") return "ADMIN";
  return "OTHER";
}

/**
 * Participation Law action matrix for Venue HUD.
 * Surfaces Host / Join Queue / Vote only when role × room × state allow.
 * disabled actions include honest reason (Rule 20) — never silent no-ops.
 */
export function resolveParticipationHudActions(input: {
  role: UserRoleCapability;
  experienceType: ExperienceType;
  isRoomOwner?: boolean;
  votingOpen?: boolean;
  participationState?: ParticipationState;
  queueEngineAvailable?: boolean;
  hostControlsAvailable?: boolean;
  hostActionCapabilities?: Parameters<typeof resolveParticipationEntry>[0]["hostActionCapabilities"];
  gameActionsAvailable?: boolean;
}): VenueHudAction[] {
  const roomKind = experienceToRoomKind(input.experienceType);
  return resolveParticipationEntry({
    role: hudRoleToParticipation(input.role),
    roomKind,
    ownership: input.isRoomOwner ? "human_owned" : "platform",
    isRoomOwner: input.isRoomOwner,
    votingOpen: input.votingOpen,
    participationState: input.participationState,
    queueEngineAvailable: input.queueEngineAvailable,
    hostControlsAvailable: input.hostControlsAvailable,
    hostActionCapabilities: input.hostActionCapabilities,
    gameActionsAvailable: input.gameActionsAvailable,
  }).hudActions;
}
