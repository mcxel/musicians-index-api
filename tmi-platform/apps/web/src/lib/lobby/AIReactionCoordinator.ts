/**
 * AIReactionCoordinator
 * Generates contextual AI reactions to live events — synchronized across the lobby.
 * Drives avatar expressions, chat bursts, emoji storms, and sound cue triggers.
 */

export type ReactionTrigger =
  | "tip_received"
  | "vote_cast"
  | "battle_win"
  | "encore_triggered"
  | "performer_revealed"
  | "crowd_surge"
  | "hype_peak"
  | "goal_unlocked"
  | "chat_milestone"
  | "countdown_end";

export type ReactionType = "emoji_storm" | "avatar_cheer" | "chat_burst" | "sound_cue" | "confetti" | "spotlight_flash";

export interface AIReaction {
  id: string;
  trigger: ReactionTrigger;
  types: ReactionType[];
  intensity: number;     // 0-100
  emojis: string[];
  chatLines: string[];
  durationMs: number;
  triggeredAt: number;
}

export interface ReactionCoordinatorState {
  roomId: string;
  activeReactions: AIReaction[];
  reactionLog: AIReaction[];
  totalReactionsTriggered: number;
  lastTriggeredAt: number | null;
}

const REACTION_TEMPLATES: Record<ReactionTrigger, Omit<AIReaction, "id" | "triggeredAt">> = {
  tip_received:       { trigger: "tip_received",       types: ["emoji_storm", "chat_burst"],       intensity: 60,  emojis: ["💎", "🙌", "🔥"],   chatLines: ["Sheesh! Big tipper!", "They came to SUPPORT!", "Legend behavior!"],        durationMs: 3000 },
  vote_cast:          { trigger: "vote_cast",          types: ["avatar_cheer"],                     intensity: 30,  emojis: ["✅", "🗳️"],          chatLines: ["Vote in!", "The people have spoken!"],                                      durationMs: 1500 },
  battle_win:         { trigger: "battle_win",         types: ["confetti", "emoji_storm", "sound_cue", "chat_burst"], intensity: 100, emojis: ["🏆", "👑", "🎉", "🔥"], chatLines: ["WINNER!", "No contest!", "Absolute domination!", "The crown goes to the rightful heir!"], durationMs: 8000 },
  encore_triggered:   { trigger: "encore_triggered",   types: ["spotlight_flash", "emoji_storm"],   intensity: 90,  emojis: ["🎤", "🔥", "🎶"],   chatLines: ["ENCORE! ENCORE!", "They want more!", "This crowd is HUNGRY!"],               durationMs: 5000 },
  performer_revealed: { trigger: "performer_revealed", types: ["confetti", "spotlight_flash"],       intensity: 80,  emojis: ["👀", "😱", "🎤"],   chatLines: ["HERE THEY COME!", "The stage has been set!", "I've been waiting for this!"], durationMs: 4000 },
  crowd_surge:        { trigger: "crowd_surge",        types: ["emoji_storm", "sound_cue"],          intensity: 70,  emojis: ["🌊", "🔥", "💥"],   chatLines: ["The crowd is ELECTRIC!", "Feel the surge!", "ENERGY SPIKE!"],               durationMs: 3000 },
  hype_peak:          { trigger: "hype_peak",          types: ["emoji_storm", "avatar_cheer", "sound_cue"], intensity: 95, emojis: ["💥", "🔥", "👑", "🌊"], chatLines: ["MAXIMUM HYPE!", "WE ARE PEAKING!", "This is what it feels like!"],  durationMs: 6000 },
  goal_unlocked:      { trigger: "goal_unlocked",      types: ["confetti", "chat_burst"],            intensity: 75,  emojis: ["🎯", "🏆", "✨"],   chatLines: ["GOAL UNLOCKED!", "Community came through!", "We did it!"],                  durationMs: 5000 },
  chat_milestone:     { trigger: "chat_milestone",     types: ["emoji_storm"],                       intensity: 50,  emojis: ["💬", "🗣️", "🔥"],  chatLines: ["The chat is POPPING!", "1000 messages!", "Y'all are wild!"],                durationMs: 2000 },
  countdown_end:      { trigger: "countdown_end",      types: ["spotlight_flash", "sound_cue", "confetti"], intensity: 85, emojis: ["⏱️", "🚀", "🔥"], chatLines: ["IT'S TIME!", "Let's GO!", "The moment has arrived!"],                    durationMs: 4000 },
};

const MAX_ACTIVE = 5;
const MAX_LOG = 100;

const coordinatorStates = new Map<string, ReactionCoordinatorState>();
type CoordinatorListener = (state: ReactionCoordinatorState) => void;
const coordinatorListeners = new Map<string, Set<CoordinatorListener>>();

function notify(roomId: string, state: ReactionCoordinatorState): void {
  coordinatorListeners.get(roomId)?.forEach(l => l(state));
}

export function initReactionCoordinator(roomId: string): ReactionCoordinatorState {
  const state: ReactionCoordinatorState = {
    roomId, activeReactions: [], reactionLog: [], totalReactionsTriggered: 0, lastTriggeredAt: null,
  };
  coordinatorStates.set(roomId, state);
  return state;
}

export function triggerReaction(roomId: string, trigger: ReactionTrigger): AIReaction {
  const current = coordinatorStates.get(roomId) ?? initReactionCoordinator(roomId);
  const template = REACTION_TEMPLATES[trigger];
  const reaction: AIReaction = {
    ...template,
    id: `rxn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    triggeredAt: Date.now(),
  };

  const now = Date.now();
  const active = [...current.activeReactions, reaction]
    .filter(r => now - r.triggeredAt < r.durationMs)
    .slice(-MAX_ACTIVE);

  const updated: ReactionCoordinatorState = {
    ...current,
    activeReactions: active,
    reactionLog: [reaction, ...current.reactionLog].slice(0, MAX_LOG),
    totalReactionsTriggered: current.totalReactionsTriggered + 1,
    lastTriggeredAt: now,
  };
  coordinatorStates.set(roomId, updated);
  notify(roomId, updated);

  // Auto-expire reaction
  setTimeout(() => {
    const s = coordinatorStates.get(roomId);
    if (!s) return;
    const n = Date.now();
    const filtered = s.activeReactions.filter(r => n - r.triggeredAt < r.durationMs);
    const next = { ...s, activeReactions: filtered };
    coordinatorStates.set(roomId, next);
    notify(roomId, next);
  }, reaction.durationMs);

  return reaction;
}

export function getActiveReactions(roomId: string): AIReaction[] {
  return coordinatorStates.get(roomId)?.activeReactions ?? [];
}

export function getReactionCoordinator(roomId: string): ReactionCoordinatorState | null {
  return coordinatorStates.get(roomId) ?? null;
}

export function subscribeToReactions(roomId: string, listener: CoordinatorListener): () => void {
  if (!coordinatorListeners.has(roomId)) coordinatorListeners.set(roomId, new Set());
  coordinatorListeners.get(roomId)!.add(listener);
  const current = coordinatorStates.get(roomId);
  if (current) listener(current);
  return () => coordinatorListeners.get(roomId)?.delete(listener);
}
