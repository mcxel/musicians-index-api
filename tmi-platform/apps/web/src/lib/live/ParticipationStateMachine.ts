/**
 * ParticipationStateMachine — canonical room participation law (LOCKED).
 *
 * USER → ROLE/CAPABILITIES → ROOM TYPE → ROOM OWNERSHIP → PARTICIPATION STATE → VENUE HUD ACTIONS
 *
 * Extends existing queue / challenge / seat engines — does not replace them.
 * Rule 20: never invent fake queue positions, votes, or host approvals.
 */

import type { LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";
import {
  allowsVoting,
  allowsWinnerUi,
  resolveExperiencePersonality,
  type ExperiencePersonality,
} from "@/lib/live/ExperiencePersonality";

/** Canonical participation states — ONE shared machine for all room types. */
export type ParticipationState =
  | "SPECTATOR"
  | "REQUESTED"
  | "QUEUED"
  | "READY"
  | "ON_STAGE"
  | "ACTIVE"
  | "COMPLETED"
  | "REMOVED";

/** How the user enters / exists in the room (entry path + HUD mode). */
export type ParticipationEntryMode =
  | "SPECTATOR"
  | "QUEUE"
  | "FAN_SEAT"
  | "PERFORMER_LOBBY"
  | "FAN_AVATAR_LOBBY"
  | "LOUNGE_PANEL"
  | "GAME_PLAY"
  | "HOST_CONTROL";

export type ParticipationRoomKind =
  | "battle"
  | "challenge"
  | "cypher"
  | "game"
  | "performer_lobby"
  | "fan_lobby"
  | "lounge"
  | "live"
  | "show_release"
  | "unknown";

export type ParticipationRole =
  | "FAN"
  | "PERFORMER"
  | "BAND"
  | "HOST"
  | "ADMIN"
  | "VENUE"
  | "OTHER";

export type RoomOwnershipModel = "human_owned" | "bot_operated" | "platform";

/** Venue HUD action ids — only surface when capability + engine exist. */
export type VenueHudActionId =
  | "approve_next"
  | "reject_participant"
  | "reorder_queue"
  | "bring_on_stage"
  | "remove_from_stage"
  | "broadcast_spotlight"
  | "audience_audio"
  | "participant_mic"
  | "audience_mute"
  | "toggle_qa"
  | "allow_reactions"
  | "allow_voting"
  | "lock_entry"
  | "join_queue"
  | "challenge_winner"
  | "vote"
  | "react"
  | "chat"
  | "tip"
  | "play_game"
  | "join_next_round"
  | "spectate_game";

export type VenueHudAction = {
  id: VenueHudActionId;
  label: string;
  icon: string;
  /** false = show disabled / honest empty (Rule 20) — never a silent no-op. */
  enabled: boolean;
  reason?: string;
};

export type ParticipationContext = {
  role: ParticipationRole;
  roomKind: ParticipationRoomKind;
  ownership: RoomOwnershipModel;
  isRoomOwner: boolean;
  participationState: ParticipationState;
  votingOpen: boolean;
  queueEngineAvailable: boolean;
  hostControlsAvailable: boolean;
  /** Per-action engine availability — missing engine → honest disable. */
  hostActionCapabilities?: Partial<
    Record<VenueHudActionId, { available: boolean; reason?: string }>
  >;
  /** Game room exposes real PLAY / JOIN NEXT / SPECTATE handlers. */
  gameActionsAvailable?: boolean;
  /** Shell personality — gates challenge_winner / confrontation HUD. */
  personality?: ExperiencePersonality;
};

export type ParticipationResolution = {
  entryMode: ParticipationEntryMode;
  initialState: ParticipationState;
  claimFanSeat: boolean;
  roomKind: ParticipationRoomKind;
  ownership: RoomOwnershipModel;
  hudActions: VenueHudAction[];
};

const COMPETITION_KINDS = new Set<ParticipationRoomKind>(["battle", "challenge", "cypher"]);

const VALID_TRANSITIONS: Record<ParticipationState, readonly ParticipationState[]> = {
  SPECTATOR: ["REQUESTED", "QUEUED", "REMOVED"],
  REQUESTED: ["QUEUED", "SPECTATOR", "REMOVED"],
  QUEUED: ["READY", "SPECTATOR", "REMOVED"],
  READY: ["ON_STAGE", "QUEUED", "REMOVED"],
  ON_STAGE: ["ACTIVE", "COMPLETED", "REMOVED"],
  ACTIVE: ["COMPLETED", "ON_STAGE", "REMOVED"],
  COMPLETED: ["SPECTATOR", "QUEUED", "REMOVED"],
  REMOVED: ["SPECTATOR"],
};

export function canTransitionParticipation(
  from: ParticipationState,
  to: ParticipationState,
): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function normalizeParticipationRole(role?: string | null): ParticipationRole {
  const r = (role ?? "FAN").trim().toUpperCase();
  if (r === "FAN" || r === "USER" || r === "MEMBER") return "FAN";
  if (r === "PERFORMER" || r === "ARTIST") return "PERFORMER";
  if (r === "BAND") return "BAND";
  if (r === "HOST" || r === "SHOW_HOST") return "HOST";
  if (r === "ADMIN" || r === "SUPERADMIN") return "ADMIN";
  if (r === "VENUE" || r === "PROMOTER") return "VENUE";
  return "OTHER";
}

export function isPerformerCapable(role: ParticipationRole): boolean {
  return (
    role === "PERFORMER" ||
    role === "BAND" ||
    role === "HOST" ||
    role === "ADMIN" ||
    role === "VENUE"
  );
}

export function resolveRoomKindFromDiscovery(
  record: {
    category?: string | null;
    categories?: string[] | null;
    anchorFamily?: string | null;
    roomId: string;
  },
): ParticipationRoomKind {
  const cats = [record.category, ...(record.categories ?? [])].filter(Boolean) as string[];
  if (cats.includes("battles")) return "battle";
  if (cats.includes("challenges")) return "challenge";
  if (cats.includes("cyphers")) return "cypher";
  if (cats.includes("games")) return "game";
  if (cats.includes("concerts")) return "show_release";
  if (cats.includes("fan_lobbies")) return "fan_lobby";
  if (cats.includes("lounges") || cats.includes("listening")) return "lounge";

  const fam = (record.anchorFamily ?? "").toLowerCase();
  if (fam.includes("battle")) return "battle";
  if (fam.includes("challenge")) return "challenge";
  if (fam.includes("cypher") || fam.includes("cipher")) return "cypher";
  if (fam.includes("fan") && fam.includes("lobby")) return "fan_lobby";
  if (fam.includes("lounge") || fam.includes("playlist")) return "lounge";
  if (fam.includes("game")) return "game";
  if (record.roomId.startsWith("fan-avatar-lobby-")) return "fan_lobby";
  if (record.roomId.startsWith("performer-lobby-")) return "performer_lobby";
  if (record.category === "battles") return "battle";
  if (record.category === "challenges") return "challenge";
  if (record.category === "cyphers") return "cypher";
  return "live";
}

export function resolveRoomKindFromGenre(genre?: string | null): ParticipationRoomKind {
  const g = (genre ?? "").toLowerCase();
  if (g.includes("battle")) return "battle";
  if (g.includes("challenge")) return "challenge";
  if (g.includes("cypher") || g.includes("cipher")) return "cypher";
  if (g.includes("game")) return "game";
  if (g.includes("concert") || g.includes("release")) return "show_release";
  if (g.includes("fan") && g.includes("lobby")) return "fan_lobby";
  if (g.includes("lounge") || g.includes("listening")) return "lounge";
  if (g.includes("performer") && g.includes("lobby")) return "performer_lobby";
  return "live";
}

/**
 * Bot/system rooms auto-advance via Queue Director.
 * Human-owned rooms require host approve / bring-on-air.
 */
export function resolveOwnershipModel(
  record?: Pick<LiveDiscoveryRecord, "hostUserId" | "isAnchor" | "anchorFamily"> | null,
): RoomOwnershipModel {
  if (!record) return "platform";
  if (record.isAnchor) return "bot_operated";
  const fam = (record.anchorFamily ?? "").toLowerCase();
  if (fam.includes("official") || fam.includes("bot") || fam.includes("anchor")) {
    return "bot_operated";
  }
  const host = (record.hostUserId ?? "").toLowerCase();
  if (host.startsWith("bot-") || host.startsWith("system-") || host.includes("tmi-bot")) {
    return "bot_operated";
  }
  if (host) return "human_owned";
  return "platform";
}

/**
 * Resolve entry path: competition performers → QUEUE (no fan seat);
 * fans → SPECTATOR / FAN_SEAT; lobbies → role-specific paths.
 */
export function resolveParticipationEntry(input: {
  role?: string | null;
  roomKind: ParticipationRoomKind;
  ownership?: RoomOwnershipModel;
  isRoomOwner?: boolean;
  votingOpen?: boolean;
  /** Honest: queue API / ChallengeQueueEngine reachable */
  queueEngineAvailable?: boolean;
  hostControlsAvailable?: boolean;
  participationState?: ParticipationState;
  hostActionCapabilities?: ParticipationContext["hostActionCapabilities"];
  gameActionsAvailable?: boolean;
  personality?: ExperiencePersonality;
  cypherKing?: boolean;
  featureFlags?: readonly string[] | null;
}): ParticipationResolution {
  const role = normalizeParticipationRole(input.role);
  const ownership = input.ownership ?? "platform";
  const isRoomOwner = Boolean(input.isRoomOwner);
  const state = input.participationState ?? "SPECTATOR";
  const votingOpen = Boolean(input.votingOpen);
  const queueEngineAvailable = input.queueEngineAvailable !== false;
  const hostControlsAvailable = input.hostControlsAvailable !== false;
  const personality =
    input.personality ??
    resolveExperiencePersonality({
      roomKind: input.roomKind,
      cypherKing: input.cypherKing,
      featureFlags: input.featureFlags,
    });

  let entryMode: ParticipationEntryMode = "SPECTATOR";
  let initialState: ParticipationState = "SPECTATOR";
  let claimFanSeat = false;

  if (isRoomOwner || role === "HOST" || role === "ADMIN") {
    entryMode = "HOST_CONTROL";
    initialState = "ACTIVE";
    claimFanSeat = false;
  } else if (COMPETITION_KINDS.has(input.roomKind) && isPerformerCapable(role)) {
    // Performer enters competition as queued participant watching — NOT fan audience seat
    entryMode = "QUEUE";
    initialState = "SPECTATOR"; // watch first; Join Queue / Challenge → REQUESTED → QUEUED
    claimFanSeat = false;
  } else if (input.roomKind === "performer_lobby" && isPerformerCapable(role)) {
    entryMode = "PERFORMER_LOBBY";
    initialState = "ACTIVE";
    claimFanSeat = false;
  } else if (input.roomKind === "fan_lobby" && role === "FAN") {
    entryMode = "FAN_AVATAR_LOBBY";
    initialState = "ACTIVE";
    claimFanSeat = true;
  } else if (input.roomKind === "lounge") {
    entryMode = "LOUNGE_PANEL";
    initialState = "SPECTATOR";
    claimFanSeat = false;
  } else if (input.roomKind === "game") {
    if (isPerformerCapable(role) || role === "FAN") {
      entryMode = "GAME_PLAY";
      initialState = "SPECTATOR";
      claimFanSeat = role === "FAN";
    } else {
      entryMode = "SPECTATOR";
      initialState = "SPECTATOR";
      claimFanSeat = false;
    }
  } else if (role === "FAN") {
    entryMode = "FAN_SEAT";
    initialState = "SPECTATOR";
    claimFanSeat = true;
  } else {
    entryMode = "SPECTATOR";
    initialState = "SPECTATOR";
    claimFanSeat = false;
  }

  const ctx: ParticipationContext = {
    role,
    roomKind: input.roomKind,
    ownership,
    isRoomOwner,
    participationState: state === "SPECTATOR" ? initialState : state,
    votingOpen,
    queueEngineAvailable,
    hostControlsAvailable,
    hostActionCapabilities: input.hostActionCapabilities,
    gameActionsAvailable: input.gameActionsAvailable,
    personality,
  };

  return {
    entryMode,
    initialState,
    claimFanSeat,
    roomKind: input.roomKind,
    ownership,
    hudActions: resolveVenueHudActions(ctx),
  };
}

export function resolveVenueHudActions(ctx: ParticipationContext): VenueHudAction[] {
  const actions: VenueHudAction[] = [];
  const competition = COMPETITION_KINDS.has(ctx.roomKind);
  const personality =
    ctx.personality ?? resolveExperiencePersonality({ roomKind: ctx.roomKind });
  const votingAllowed = allowsVoting(personality);
  const winnerAllowed = allowsWinnerUi(personality);
  const onStage =
    ctx.participationState === "ON_STAGE" || ctx.participationState === "ACTIVE";
  const queued =
    ctx.participationState === "QUEUED" ||
    ctx.participationState === "REQUESTED" ||
    ctx.participationState === "READY";

  // Fan affordances — Cypher STATS_ONLY still gets Vote (feeds metrics, not winner UI).
  if (ctx.role === "FAN" || !isPerformerCapable(ctx.role)) {
    actions.push({ id: "react", label: "React", icon: "🔥", enabled: true });
    actions.push({ id: "chat", label: "Chat", icon: "💬", enabled: true });
    actions.push({ id: "tip", label: "Tip", icon: "💎", enabled: true });
    actions.push({
      id: "vote",
      label: personality.votingMode === "STATS_ONLY" ? "Vote (Stats)" : "Vote",
      icon: "🗳️",
      enabled: ctx.votingOpen && votingAllowed,
      reason: !votingAllowed
        ? "Voting not available for this room"
        : ctx.votingOpen
          ? undefined
          : "Voting closed",
    });
  }

  // Competition performer — join queue always; challenge winner only when winner-stays allowed
  if (competition && isPerformerCapable(ctx.role) && !onStage && !ctx.isRoomOwner) {
    actions.push({
      id: "join_queue",
      label: "Join Queue",
      icon: "📋",
      enabled: ctx.queueEngineAvailable && !queued,
      reason: !ctx.queueEngineAvailable
        ? "Queue unavailable"
        : queued
          ? "Already queued"
          : undefined,
    });
    if (winnerAllowed && personality.allowsWinnerStays) {
      actions.push({
        id: "challenge_winner",
        label: "Challenge Winner",
        icon: "⚔️",
        enabled: ctx.queueEngineAvailable && !queued,
        reason: !ctx.queueEngineAvailable ? "Challenge engine unavailable" : undefined,
      });
    }
  }

  // Games — only enable PLAY / JOIN NEXT when a real game surface exposes them
  if (ctx.roomKind === "game") {
    const gameOk = Boolean(ctx.gameActionsAvailable);
    const gameDefer = gameOk ? undefined : "Game round engine not mounted for this room";
    actions.push({
      id: "play_game",
      label: "Play",
      icon: "🎮",
      enabled: gameOk,
      reason: gameDefer,
    });
    actions.push({
      id: "join_next_round",
      label: "Join Next Round",
      icon: "⏭️",
      enabled: gameOk && !onStage,
      reason: gameOk ? undefined : gameDefer,
    });
    actions.push({
      id: "spectate_game",
      label: "Spectate",
      icon: "👁",
      enabled: true,
    });
  }

  // Room owner / host controls (human-owned) — per-engine availability
  if (ctx.isRoomOwner || ctx.role === "HOST" || ctx.role === "ADMIN") {
    const hostEnabled = ctx.hostControlsAvailable;
    const caps = ctx.hostActionCapabilities;
    const hostAction = (
      id: VenueHudActionId,
      label: string,
      icon: string,
      extraEnabled = true,
    ): VenueHudAction => {
      const cap = caps?.[id];
      if (!hostEnabled) {
        return {
          id,
          label,
          icon,
          enabled: false,
          reason: "Host controls not mounted for this room",
        };
      }
      if (cap && !cap.available) {
        return { id, label, icon, enabled: false, reason: cap.reason ?? "Engine unavailable" };
      }
      return {
        id,
        label,
        icon,
        enabled: extraEnabled,
        reason: extraEnabled ? undefined : "Unavailable in this room type",
      };
    };

    actions.push(
      hostAction("approve_next", "Approve Next", "✅"),
      hostAction("reject_participant", "Reject", "⛔"),
      hostAction("reorder_queue", "Reorder Queue", "⇅"),
      hostAction("bring_on_stage", "Bring On Stage", "🎤"),
      hostAction("remove_from_stage", "Remove From Stage", "🚪"),
      hostAction("broadcast_spotlight", "Spotlight", "💡"),
      hostAction("audience_audio", "Audience Audio", "🔊"),
      hostAction("participant_mic", "Participant Mic", "🎙️"),
      hostAction("audience_mute", "Mute Audience", "🔇"),
      hostAction("toggle_qa", "Q&A", "❓"),
      hostAction("allow_reactions", "Reactions", "👏"),
      hostAction(
        "allow_voting",
        personality.votingMode === "STATS_ONLY" ? "Stats Voting" : "Voting",
        "🗳️",
        votingAllowed,
      ),
      hostAction("lock_entry", "Lock Entry", "🔒"),
    );
  }

  return actions;
}

/** Map queueEngine slot status → participation state. */
export function mapQueueSlotToParticipationState(
  status: "waiting" | "next-up" | "staging" | "on-stage" | "done",
): ParticipationState {
  switch (status) {
    case "waiting":
      return "QUEUED";
    case "next-up":
      return "READY";
    case "staging":
      return "READY";
    case "on-stage":
      return "ON_STAGE";
    case "done":
      return "COMPLETED";
    default:
      return "SPECTATOR";
  }
}
