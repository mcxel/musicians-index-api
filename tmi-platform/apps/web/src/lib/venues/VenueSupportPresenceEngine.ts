/**
 * VenueSupportPresenceEngine — labeled support agents for Instant Go Live.
 *
 * HARD RULE (Marcel / Rule 20):
 *   Support bots NEVER count as humanViewers / humanParticipants.
 *   Never fake fan names, purchases, votes, applause-as-humans.
 *   Confidence boost = room operational + supported — NOT manufactured popularity.
 *
 * Public identities (subtle platform labels — not fan personas):
 *   TMI Support Crew | AI Venue Technician | Performance Assistant | Environment Inspector
 *
 * Spawns unpredictably (no fixed public timetable). Actions vary.
 * Cues attributed to assistants, e.g. "Your microphone is clear…" — TMI Performance Assistant.
 */

import {
  enforceBotPolicy,
  assertBotLabel,
  getBotTransparencyStatement,
} from "@/lib/bots/botTransparencyPolicy";
import {
  createVenueMission,
  assignVenueMission,
  advanceVenueMission,
  type VenueMissionKind,
} from "@/lib/venues/AtlasVenueCommand";
import {
  EMPTY_VENUE_PRESENCE_METRICS,
  type VenuePresenceMetrics,
} from "@/lib/venues/venuePresenceMetrics";

export type SupportAgentKind =
  | "support_crew"
  | "venue_technician"
  | "performance_assistant"
  | "environment_inspector";

export type SupportAgentAction =
  | "sound_check"
  | "sit_briefly"
  | "test_prop"
  | "verify_chat"
  | "verify_environment"
  | "leave"
  | "mic_cue"
  | "network_probe";

export type SupportSpawnSignal =
  | "low_activity"
  | "new_deploy"
  | "performer_preparing"
  | "device_change"
  | "network_issues"
  | "first_session"
  | "recent_error"
  | "idle_ops";

export interface SupportAgent {
  id: string;
  kind: SupportAgentKind;
  /** Always starts with [BOT] — transparency contract */
  label: string;
  displayName: string;
  action: SupportAgentAction;
  seated: boolean;
  enteredAt: number;
  leaveAt: number;
  lastCue?: string;
}

export interface SupportCue {
  id: string;
  roomId: string;
  agentId: string;
  /** Attribution — never a fake fan name */
  attributedTo: string;
  message: string;
  at: number;
}

export interface VenueSupportRoomState {
  roomId: string;
  agents: SupportAgent[];
  cues: SupportCue[];
  environmentVerified: boolean;
  soundCheckComplete: boolean;
  startedAt: number;
  lastTickAt: number;
}

const AGENT_DEFS: Record<
  SupportAgentKind,
  { displayName: string; label: string }
> = {
  support_crew: {
    displayName: "TMI Support Crew",
    label: "[BOT] TMI Support Crew",
  },
  venue_technician: {
    displayName: "AI Venue Technician",
    label: "[BOT] AI Venue Technician",
  },
  performance_assistant: {
    displayName: "Performance Assistant",
    label: "[BOT] Performance Assistant",
  },
  environment_inspector: {
    displayName: "Environment Inspector",
    label: "[BOT] Environment Inspector",
  },
};

const ACTION_MISSION: Partial<Record<SupportAgentAction, VenueMissionKind>> = {
  sound_check: "sound_check",
  verify_environment: "environment_verify",
  verify_chat: "chat_probe",
  test_prop: "prop_test",
  sit_briefly: "seat_sample",
  network_probe: "network_probe",
  mic_cue: "device_assist",
};

const CUES: { action: SupportAgentAction; message: string; kind: SupportAgentKind }[] = [
  {
    action: "mic_cue",
    kind: "performance_assistant",
    message: "Your microphone is clear and levels look stable.",
  },
  {
    action: "sound_check",
    kind: "venue_technician",
    message: "Sound check complete — monitors and house feed verified.",
  },
  {
    action: "verify_environment",
    kind: "environment_inspector",
    message: "Environment verified — lighting and stage zones nominal.",
  },
  {
    action: "verify_chat",
    kind: "support_crew",
    message: "Chat channel probe OK — moderation hooks responsive.",
  },
  {
    action: "network_probe",
    kind: "venue_technician",
    message: "Network probe finished — uplink within expected range.",
  },
];

const rooms = new Map<string, VenueSupportRoomState>();
let agentSeq = 1;
let cueSeq = 1;

type Listener = (roomId: string, state: VenueSupportRoomState) => void;
const listeners = new Set<Listener>();

function emit(roomId: string, state: VenueSupportRoomState) {
  for (const l of listeners) l(roomId, state);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("tmi:venue-support", { detail: { roomId, state } }),
    );
  }
}

function ensureRoom(roomId: string): VenueSupportRoomState {
  let s = rooms.get(roomId);
  if (!s) {
    s = {
      roomId,
      agents: [],
      cues: [],
      environmentVerified: false,
      soundCheckComplete: false,
      startedAt: Date.now(),
      lastTickAt: Date.now(),
    };
    rooms.set(roomId, s);
  }
  return s;
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function pickSignal(explicit?: SupportSpawnSignal): SupportSpawnSignal {
  if (explicit) return explicit;
  return rand([
    "low_activity",
    "new_deploy",
    "performer_preparing",
    "device_change",
    "network_issues",
    "first_session",
    "recent_error",
    "idle_ops",
  ]);
}

function pickKind(signal: SupportSpawnSignal): SupportAgentKind {
  switch (signal) {
    case "network_issues":
    case "device_change":
      return rand(["venue_technician", "performance_assistant"]);
    case "new_deploy":
    case "recent_error":
      return rand(["environment_inspector", "venue_technician"]);
    case "first_session":
    case "performer_preparing":
      return rand(["performance_assistant", "support_crew"]);
    default:
      return rand([
        "support_crew",
        "venue_technician",
        "performance_assistant",
        "environment_inspector",
      ]);
  }
}

function pickAction(kind: SupportAgentKind): SupportAgentAction {
  const byKind: Record<SupportAgentKind, SupportAgentAction[]> = {
    support_crew: ["verify_chat", "sit_briefly", "leave"],
    venue_technician: ["sound_check", "network_probe", "test_prop", "leave"],
    performance_assistant: ["mic_cue", "sound_check", "sit_briefly", "leave"],
    environment_inspector: ["verify_environment", "sit_briefly", "leave"],
  };
  return rand(byKind[kind]);
}

function logSupportAction(agent: SupportAgent, roomId: string, action: string): boolean {
  const policy = enforceBotPolicy({
    botId: agent.id,
    botLabel: agent.label,
    action,
    botLabelVisible: assertBotLabel(agent.label),
    isImpersonatingHuman: false,
    involvesRealMoney: false,
    involvesRewardManipulation: false,
    targetIsPrivateRoom: false,
    isLogged: true,
  });
  return policy.allowed;
}

/**
 * Build metrics for a room. human* counts come only from caller-supplied humans.
 * Support agents never increment humanViewers / humanParticipants.
 */
export function buildVenuePresenceMetrics(input: {
  roomId: string;
  humanViewers: number;
  humanParticipants?: number;
  moderators?: number;
}): VenuePresenceMetrics {
  const state = rooms.get(input.roomId);
  const supportAgents = state?.agents.length ?? 0;
  const supportSeated = state?.agents.filter((a) => a.seated).length ?? 0;
  const humanViewers = Math.max(0, input.humanViewers);
  const humanParticipants = Math.max(0, input.humanParticipants ?? 0);
  const moderators = Math.max(0, input.moderators ?? 0);
  return {
    humanViewers,
    humanParticipants,
    supportAgents,
    moderators,
    occupiedPositions: humanViewers + humanParticipants + supportSeated + moderators,
  };
}

export function getVenueSupportState(roomId: string): VenueSupportRoomState | null {
  return rooms.get(roomId) ?? null;
}

export function subscribeVenueSupport(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function spawnSupportAgent(
  roomId: string,
  opts?: { signal?: SupportSpawnSignal; isPrivateRoom?: boolean },
): SupportAgent | null {
  if (opts?.isPrivateRoom) {
    // Public rooms only unless escalation — Instant Go Live public stage path
    return null;
  }

  const state = ensureRoom(roomId);
  // Soft cap — ops presence, not a crowd
  if (state.agents.length >= 4) return null;

  const signal = pickSignal(opts?.signal);
  const kind = pickKind(signal);
  const def = AGENT_DEFS[kind];
  if (!assertBotLabel(def.label)) return null;

  const action = pickAction(kind);
  const now = Date.now();
  // Unpredictable dwell — 8–45s, jittered (no fixed 3-min pattern)
  const dwellMs = 8000 + Math.floor(Math.random() * 37000) + (Math.random() * 5000);

  const agent: SupportAgent = {
    id: `support-${agentSeq++}-${now.toString(36)}`,
    kind,
    label: def.label,
    displayName: def.displayName,
    action,
    seated: action === "sit_briefly" || action === "sound_check",
    enteredAt: now,
    leaveAt: now + dwellMs,
  };

  if (!logSupportAction(agent, roomId, `spawn:${action}:${signal}`)) return null;

  state.agents.push(agent);

  const missionKind = ACTION_MISSION[action] ?? "environment_verify";
  const mission = createVenueMission({
    roomId,
    kind: missionKind,
    signal,
    note: `${agent.displayName} entered for ${action}`,
  });
  assignVenueMission(mission.id, agent.id, agent.label);
  advanceVenueMission(mission.id, "EXECUTE", "executing");

  maybeEmitCue(roomId, agent);
  if (action === "sound_check" || action === "mic_cue") state.soundCheckComplete = true;
  if (action === "verify_environment") state.environmentVerified = true;

  state.lastTickAt = now;
  emit(roomId, state);
  return agent;
}

function maybeEmitCue(roomId: string, agent: SupportAgent) {
  const match = CUES.find((c) => c.action === agent.action && c.kind === agent.kind)
    ?? CUES.find((c) => c.action === agent.action);
  if (!match) return;

  const state = ensureRoom(roomId);
  const cue: SupportCue = {
    id: `cue-${cueSeq++}`,
    roomId,
    agentId: agent.id,
    attributedTo: agent.displayName,
    message: match.message,
    at: Date.now(),
  };
  agent.lastCue = cue.message;
  state.cues = [...state.cues.slice(-12), cue];
  emit(roomId, state);
}

/**
 * Tick room support lifecycle — call on interval from Instant Go Live stage.
 * Spawns unpredictably based on signals; retires agents past leaveAt.
 */
export function tickVenueSupport(
  roomId: string,
  ctx?: {
    humanViewers?: number;
    isFirstSession?: boolean;
    hadRecentError?: boolean;
    performerPreparing?: boolean;
  },
): VenueSupportRoomState {
  const state = ensureRoom(roomId);
  const now = Date.now();

  // Retire expired agents
  const before = state.agents.length;
  state.agents = state.agents.filter((a) => {
    if (now < a.leaveAt) return true;
    logSupportAction(a, roomId, "leave");
    return false;
  });
  if (state.agents.length !== before) emit(roomId, state);

  // Unpredictable spawn — probability varies with signals (not a fixed timetable)
  let chance = 0.08;
  if ((ctx?.humanViewers ?? 0) === 0) chance += 0.12; // low activity
  if (ctx?.isFirstSession) chance += 0.1;
  if (ctx?.hadRecentError) chance += 0.14;
  if (ctx?.performerPreparing) chance += 0.1;
  // Time since start jitter — avoid "always at 3 min"
  const elapsed = now - state.startedAt;
  chance += Math.sin(elapsed / 17000) * 0.04 + Math.random() * 0.05;

  if (state.agents.length < 3 && Math.random() < Math.min(0.35, chance)) {
    const signal = pickSignal(
      ctx?.hadRecentError
        ? "recent_error"
        : ctx?.isFirstSession
          ? "first_session"
          : ctx?.performerPreparing
            ? "performer_preparing"
            : (ctx?.humanViewers ?? 0) === 0
              ? "low_activity"
              : undefined,
    );
    spawnSupportAgent(roomId, { signal });
  }

  // Mark ops ready after first successful checks or a short settle
  if (!state.environmentVerified && state.agents.some((a) => a.kind === "environment_inspector")) {
    state.environmentVerified = true;
  }
  if (!state.soundCheckComplete && elapsed > 4000) {
    // Ambient readiness without inventing fans — ops confidence only
    state.soundCheckComplete = true;
  }
  if (!state.environmentVerified && elapsed > 5000) {
    state.environmentVerified = true;
  }

  state.lastTickAt = now;
  return state;
}

/** Start Instant Go Live support loop for a room; returns disposer */
export function startVenueSupportPresence(
  roomId: string,
  opts?: { isFirstSession?: boolean },
): () => void {
  ensureRoom(roomId);
  // Immediate light presence — 0–2 agents, not a full house
  const initial = 1 + (Math.random() > 0.55 ? 1 : 0);
  for (let i = 0; i < initial; i++) {
    spawnSupportAgent(roomId, {
      signal: opts?.isFirstSession ? "first_session" : "performer_preparing",
    });
  }

  const interval = window.setInterval(() => {
    tickVenueSupport(roomId, {
      humanViewers: 0, // caller should also tick with real counts via tickVenueSupport
      isFirstSession: opts?.isFirstSession,
      performerPreparing: true,
    });
  }, 4500 + Math.floor(Math.random() * 2500));

  return () => {
    window.clearInterval(interval);
  };
}

export function getLatestSupportCue(roomId: string): SupportCue | null {
  const state = rooms.get(roomId);
  if (!state || state.cues.length === 0) return null;
  return state.cues[state.cues.length - 1] ?? null;
}

export function getSupportTransparencyBlurb(agent: SupportAgent): string {
  return getBotTransparencyStatement(agent.label);
}

export function getEmptyMetrics(): VenuePresenceMetrics {
  return { ...EMPTY_VENUE_PRESENCE_METRICS };
}
