/**
 * PerformanceExitSequence
 * Manages the post-show exit arc — applause, tips, replay, audience voting, return to lobby.
 */

export type ExitBeat =
  | "curtain_closing"
  | "applause_wave"
  | "reaction_overlay"
  | "tip_prompt"
  | "replay_highlight"
  | "audience_vote"
  | "encore_prompt"
  | "lobby_return_countdown"
  | "complete";

export interface ExitSequenceState {
  roomId: string;
  beat: ExitBeat;
  applauseLevel: number;         // 0-100
  tipPromptVisible: boolean;
  replayAvailable: boolean;
  audienceVoteOpen: boolean;
  encorePromptVisible: boolean;
  lobbyReturnCountdownMs: number;
  totalTipsReceived: number;
  voteYay: number;
  voteNay: number;
  reactionsCount: number;
  beatStartedAt: number;
}

type ExitListener = (state: ExitSequenceState) => void;

const exitStates = new Map<string, ExitSequenceState>();
const exitListeners = new Map<string, Set<ExitListener>>();

function defaultExit(roomId: string): ExitSequenceState {
  return {
    roomId, beat: "curtain_closing", applauseLevel: 0, tipPromptVisible: false,
    replayAvailable: false, audienceVoteOpen: false, encorePromptVisible: false,
    lobbyReturnCountdownMs: 0, totalTipsReceived: 0, voteYay: 0, voteNay: 0,
    reactionsCount: 0, beatStartedAt: Date.now(),
  };
}

function setBeat(roomId: string, beat: ExitBeat, patch?: Partial<ExitSequenceState>): ExitSequenceState {
  const current = exitStates.get(roomId) ?? defaultExit(roomId);
  const updated = { ...current, ...(patch ?? {}), beat, beatStartedAt: Date.now() };
  exitStates.set(roomId, updated);
  exitListeners.get(roomId)?.forEach(l => l(updated));
  return updated;
}

export function startExitSequence(roomId: string): ExitSequenceState {
  return setBeat(roomId, "curtain_closing", { applauseLevel: 60 });
}

export function triggerApplause(roomId: string, intensity: number): ExitSequenceState {
  return setBeat(roomId, "applause_wave", { applauseLevel: Math.min(100, intensity) });
}

export function showReactionOverlay(roomId: string, reactionsCount: number): ExitSequenceState {
  return setBeat(roomId, "reaction_overlay", { reactionsCount });
}

export function showTipPrompt(roomId: string): ExitSequenceState {
  return setBeat(roomId, "tip_prompt", { tipPromptVisible: true });
}

export function recordTip(roomId: string, amount: number): ExitSequenceState {
  const current = exitStates.get(roomId) ?? defaultExit(roomId);
  const updated = { ...current, totalTipsReceived: current.totalTipsReceived + amount };
  exitStates.set(roomId, updated);
  exitListeners.get(roomId)?.forEach(l => l(updated));
  return updated;
}

export function showReplayHighlights(roomId: string): ExitSequenceState {
  return setBeat(roomId, "replay_highlight", { replayAvailable: true, tipPromptVisible: false });
}

export function openAudienceVote(roomId: string): ExitSequenceState {
  return setBeat(roomId, "audience_vote", { audienceVoteOpen: true });
}

export function castVote(roomId: string, vote: "yay" | "nay"): ExitSequenceState {
  const current = exitStates.get(roomId) ?? defaultExit(roomId);
  const patch = vote === "yay" ? { voteYay: current.voteYay + 1 } : { voteNay: current.voteNay + 1 };
  const updated = { ...current, ...patch };
  exitStates.set(roomId, updated);
  exitListeners.get(roomId)?.forEach(l => l(updated));
  return updated;
}

export function showEncorePrompt(roomId: string): ExitSequenceState {
  return setBeat(roomId, "encore_prompt", { encorePromptVisible: true, audienceVoteOpen: false });
}

export function startLobbyReturnCountdown(roomId: string, countdownMs: number): ExitSequenceState {
  return setBeat(roomId, "lobby_return_countdown", { lobbyReturnCountdownMs: countdownMs, encorePromptVisible: false });
}

export function completeExit(roomId: string): ExitSequenceState {
  return setBeat(roomId, "complete", { tipPromptVisible: false, encorePromptVisible: false, lobbyReturnCountdownMs: 0 });
}

export function getExitState(roomId: string): ExitSequenceState {
  return exitStates.get(roomId) ?? defaultExit(roomId);
}

export function subscribeToExit(roomId: string, listener: ExitListener): () => void {
  if (!exitListeners.has(roomId)) exitListeners.set(roomId, new Set());
  exitListeners.get(roomId)!.add(listener);
  const current = exitStates.get(roomId);
  if (current) listener(current);
  return () => exitListeners.get(roomId)?.delete(listener);
}

export function getExitVerdicts(roomId: string): { rating: "great" | "good" | "neutral"; encoreDeserved: boolean } {
  const state = exitStates.get(roomId) ?? defaultExit(roomId);
  const total = state.voteYay + state.voteNay;
  const yayRatio = total > 0 ? state.voteYay / total : 0.5;
  return {
    rating: yayRatio > 0.75 ? "great" : yayRatio > 0.5 ? "good" : "neutral",
    encoreDeserved: yayRatio > 0.65,
  };
}
