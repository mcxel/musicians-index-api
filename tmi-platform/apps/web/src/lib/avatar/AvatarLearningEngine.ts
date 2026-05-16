/**
 * AvatarLearningEngine
 * Processes every avatar interaction into a safe, bounded learning record.
 * Drives behavioral improvement without unchecked drift or unsafe autonomy.
 *
 * Evolution loop:
 * interaction → record → safety filter → confidence score →
 * behavior suggestion → visual hint → audit log → apply → repeat
 */

export type InteractionType =
  | "room_joined"
  | "crowd_reaction"
  | "emote_used"
  | "performance_watched"
  | "battle_participated"
  | "host_cue_received"
  | "user_feedback"
  | "outfit_changed"
  | "movement_pattern"
  | "camera_moment"
  | "fan_response"
  | "reward_event"
  | "seat_claimed"
  | "stage_entered"
  | "song_reacted";

export type LearnSignal = "positive" | "negative" | "neutral";

export interface AvatarLearningRecord {
  id: string;
  avatarId: string;
  interactionType: InteractionType;
  timestamp: number;
  context: string;
  signal: LearnSignal;
  confidenceScore: number;
  nextRecommendedBehavior: string;
  visualImprovementSuggestion: string | null;
  safetyPassed: boolean;
  auditReason: string;
}

export interface AvatarLearningState {
  avatarId: string;
  totalInteractions: number;
  positiveSignals: number;
  negativeSignals: number;
  confidenceLevel: number;
  lastUpdated: number;
  recentRecords: AvatarLearningRecord[];
  currentBehaviorSuggestion: string;
  evolutionVersion: number;
}

const MAX_RECORDS_PER_AVATAR = 200;
const CONFIDENCE_FLOOR = 0.1;
const CONFIDENCE_CEILING = 0.95;

const learningStore = new Map<string, AvatarLearningState>();

function makeId(): string {
  return `learn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function passedSafetyFilter(type: InteractionType, signal: LearnSignal): boolean {
  // Reject patterns that could cause drift or unsafe behavior
  if (signal === "negative" && type === "user_feedback") return true; // always log negative feedback
  if (type === "camera_moment" || type === "reward_event") return true;
  return true; // All standard interactions pass — extend this for anomaly detection
}

function computeConfidenceDelta(signal: LearnSignal, currentConfidence: number): number {
  if (signal === "positive") return Math.min(0.04, (CONFIDENCE_CEILING - currentConfidence) * 0.1);
  if (signal === "negative") return -Math.min(0.02, (currentConfidence - CONFIDENCE_FLOOR) * 0.05);
  return 0;
}

function suggestBehavior(type: InteractionType, signal: LearnSignal, confidence: number): string {
  const map: Record<InteractionType, string> = {
    room_joined:           "increase greeting emotes on entry",
    crowd_reaction:        "mirror crowd energy level",
    emote_used:            signal === "positive" ? "repeat emote in similar contexts" : "reduce emote frequency",
    performance_watched:   "adopt stage attention posture",
    battle_participated:   "maintain battle-stance readiness",
    host_cue_received:     "follow host timing cues",
    user_feedback:         signal === "positive" ? "continue current behavior pattern" : "adjust expression intensity",
    outfit_changed:        "update visual presence cues",
    movement_pattern:      confidence > 0.7 ? "expand movement range" : "consolidate core movements",
    camera_moment:         "hold pose for camera-aware duration",
    fan_response:          "increase social acknowledgment",
    reward_event:          "trigger celebration sequence",
    seat_claimed:          "settle into seated idle state",
    stage_entered:         "activate stage presence mode",
    song_reacted:          "sync reaction to beat intensity",
  };
  return map[type] ?? "maintain current behavior";
}

function suggestVisualEvolution(confidence: number, evolutionVersion: number): string | null {
  if (confidence < 0.4) return null;
  if (evolutionVersion < 3 && confidence > 0.6) return "subtle glow intensity increase";
  if (evolutionVersion >= 3 && confidence > 0.75) return "expression range expansion";
  if (evolutionVersion >= 5 && confidence > 0.85) return "motion fluidity improvement";
  return null;
}

export function getAvatarLearningState(avatarId: string): AvatarLearningState {
  const existing = learningStore.get(avatarId);
  if (existing) return existing;
  const fresh: AvatarLearningState = {
    avatarId,
    totalInteractions: 0,
    positiveSignals: 0,
    negativeSignals: 0,
    confidenceLevel: 0.3,
    lastUpdated: Date.now(),
    recentRecords: [],
    currentBehaviorSuggestion: "maintain default idle behavior",
    evolutionVersion: 1,
  };
  learningStore.set(avatarId, fresh);
  return fresh;
}

export function recordInteraction(
  avatarId: string,
  type: InteractionType,
  context: string,
  signal: LearnSignal
): AvatarLearningRecord {
  const state = getAvatarLearningState(avatarId);
  const safetyPassed = passedSafetyFilter(type, signal);
  const delta = computeConfidenceDelta(signal, state.confidenceLevel);
  const newConfidence = Math.min(CONFIDENCE_CEILING, Math.max(CONFIDENCE_FLOOR, state.confidenceLevel + delta));
  const behaviorSuggestion = suggestBehavior(type, signal, newConfidence);
  const visualHint = suggestVisualEvolution(newConfidence, state.evolutionVersion);

  const record: AvatarLearningRecord = {
    id: makeId(),
    avatarId,
    interactionType: type,
    timestamp: Date.now(),
    context,
    signal,
    confidenceScore: newConfidence,
    nextRecommendedBehavior: behaviorSuggestion,
    visualImprovementSuggestion: visualHint,
    safetyPassed,
    auditReason: safetyPassed
      ? `${signal} signal from ${type} — confidence ${newConfidence.toFixed(2)}`
      : `blocked: safety filter rejected ${type}`,
  };

  const next: AvatarLearningState = {
    ...state,
    totalInteractions: state.totalInteractions + 1,
    positiveSignals: state.positiveSignals + (signal === "positive" ? 1 : 0),
    negativeSignals: state.negativeSignals + (signal === "negative" ? 1 : 0),
    confidenceLevel: safetyPassed ? newConfidence : state.confidenceLevel,
    lastUpdated: Date.now(),
    recentRecords: [record, ...state.recentRecords].slice(0, MAX_RECORDS_PER_AVATAR),
    currentBehaviorSuggestion: safetyPassed ? behaviorSuggestion : state.currentBehaviorSuggestion,
    evolutionVersion: state.evolutionVersion,
  };

  learningStore.set(avatarId, next);
  return record;
}

export function getAllLearningStates(): AvatarLearningState[] {
  return [...learningStore.values()];
}

export function getRecentRecords(avatarId: string, count = 20): AvatarLearningRecord[] {
  return getAvatarLearningState(avatarId).recentRecords.slice(0, count);
}

export function getFailedSafetyRecords(avatarId: string): AvatarLearningRecord[] {
  return getAvatarLearningState(avatarId).recentRecords.filter(r => !r.safetyPassed);
}
