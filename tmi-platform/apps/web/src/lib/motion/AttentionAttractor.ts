/**
 * AttentionAttractor
 * Triggers targeted motion sequences to draw user attention to key UI elements:
 * new tips, vote windows, battle moments, sponsor slots, and CTA buttons.
 */

import { setMotionState, type MotionTarget } from "@/lib/motion/UniversalMotionRuntime";

export type AttentionTrigger =
  | "tip-received"
  | "vote-window-open"
  | "battle-drop"
  | "winner-declared"
  | "sponsor-flash"
  | "cta-pulse"
  | "new-performer"
  | "encore-call"
  | "merch-drop"
  | "chat-milestone";

export interface AttentionSequence {
  sequenceId: string;
  elementId: string;
  trigger: AttentionTrigger;
  steps: Array<{ state: string; durationMs: number }>;
  priority: number;
  startedAt: number;
  expiresAt: number;
}

type AttentionListener = (sequence: AttentionSequence) => void;

const TRIGGER_SEQUENCES: Record<AttentionTrigger, { steps: Array<{ state: string; durationMs: number }>; priority: number; durationMs: number }> = {
  "tip-received":     { priority: 3, durationMs: 2000, steps: [{ state: "energy-pulse", durationMs: 800 }, { state: "breathing", durationMs: 1200 }] },
  "vote-window-open": { priority: 4, durationMs: 5000, steps: [{ state: "shimmer", durationMs: 2000 }, { state: "energy-pulse", durationMs: 3000 }] },
  "battle-drop":      { priority: 5, durationMs: 3000, steps: [{ state: "energy-pulse", durationMs: 500 }, { state: "active", durationMs: 2500 }] },
  "winner-declared":  { priority: 5, durationMs: 4000, steps: [{ state: "entrance", durationMs: 1000 }, { state: "energy-pulse", durationMs: 3000 }] },
  "sponsor-flash":    { priority: 2, durationMs: 3000, steps: [{ state: "shimmer", durationMs: 3000 }] },
  "cta-pulse":        { priority: 2, durationMs: 2000, steps: [{ state: "active", durationMs: 500 }, { state: "breathing", durationMs: 1500 }] },
  "new-performer":    { priority: 3, durationMs: 2500, steps: [{ state: "entrance", durationMs: 1000 }, { state: "active", durationMs: 1500 }] },
  "encore-call":      { priority: 4, durationMs: 5000, steps: [{ state: "energy-pulse", durationMs: 5000 }] },
  "merch-drop":       { priority: 3, durationMs: 3000, steps: [{ state: "shimmer", durationMs: 1000 }, { state: "active", durationMs: 2000 }] },
  "chat-milestone":   { priority: 2, durationMs: 1500, steps: [{ state: "breathing", durationMs: 1500 }] },
};

const activeSequences = new Map<string, AttentionSequence>();
const attentionListeners = new Set<AttentionListener>();
const stepTimers = new Map<string, ReturnType<typeof setTimeout>>();

function notify(sequence: AttentionSequence): void {
  attentionListeners.forEach(l => l(sequence));
}

function runStep(sequenceId: string, stepIndex: number): void {
  const sequence = activeSequences.get(sequenceId);
  if (!sequence || Date.now() > sequence.expiresAt) {
    activeSequences.delete(sequenceId);
    return;
  }

  const step = sequence.steps[stepIndex];
  if (!step) {
    setMotionState(sequence.elementId, "idle");
    activeSequences.delete(sequenceId);
    return;
  }

  setMotionState(sequence.elementId, step.state as Parameters<typeof setMotionState>[1]);

  const timer = setTimeout(() => runStep(sequenceId, stepIndex + 1), step.durationMs);
  stepTimers.set(sequenceId, timer);
}

export function triggerAttention(
  elementId: string,
  trigger: AttentionTrigger
): AttentionSequence | null {
  const config = TRIGGER_SEQUENCES[trigger];
  const sequenceId = `attn_${elementId}_${trigger}_${Date.now()}`;

  // Cancel any lower-priority active sequence for this element
  for (const [id, seq] of activeSequences) {
    if (seq.elementId === elementId && seq.priority <= config.priority) {
      const timer = stepTimers.get(id);
      if (timer) clearTimeout(timer);
      activeSequences.delete(id);
    }
  }

  const sequence: AttentionSequence = {
    sequenceId,
    elementId,
    trigger,
    steps: config.steps,
    priority: config.priority,
    startedAt: Date.now(),
    expiresAt: Date.now() + config.durationMs,
  };

  activeSequences.set(sequenceId, sequence);
  notify(sequence);
  runStep(sequenceId, 0);
  return sequence;
}

export function cancelAttention(elementId: string): void {
  for (const [id, seq] of activeSequences) {
    if (seq.elementId === elementId) {
      const timer = stepTimers.get(id);
      if (timer) clearTimeout(timer);
      activeSequences.delete(id);
      stepTimers.delete(id);
    }
  }
  setMotionState(elementId, "idle");
}

export function broadcastAttention(
  elementIds: string[],
  trigger: AttentionTrigger
): AttentionSequence[] {
  return elementIds.map(id => triggerAttention(id, trigger)).filter(Boolean) as AttentionSequence[];
}

export function subscribeToAttention(listener: AttentionListener): () => void {
  attentionListeners.add(listener);
  return () => attentionListeners.delete(listener);
}

export function getActiveSequences(): AttentionSequence[] {
  const now = Date.now();
  return [...activeSequences.values()].filter(s => s.expiresAt > now);
}
