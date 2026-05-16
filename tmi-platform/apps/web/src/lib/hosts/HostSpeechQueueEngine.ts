/**
 * Host Speech Queue Engine
 * Manages an ordered queue of host dialogue lines.
 * Handles enqueueing, advancing, skipping, and clearing cues.
 */
import { HostSpeechTimingEngine } from './HostSpeechTimingEngine';

export interface SpeechCue {
  id: string;
  hostId: string;
  text: string;
  durationMs: number;
  priority: 'normal' | 'urgent' | 'interject';
  createdAt: number;
}

export interface SpeechQueueState {
  hostId: string;
  queue: SpeechCue[];
  activeCue: SpeechCue | null;
}

const queues = new Map<string, SpeechQueueState>();

function ensureQueue(hostId: string): SpeechQueueState {
  if (!queues.has(hostId)) {
    queues.set(hostId, { hostId, queue: [], activeCue: null });
  }
  return queues.get(hostId)!;
}

let _idCounter = 0;
function nextId(): string {
  return `cue-${Date.now()}-${++_idCounter}`;
}

export class HostSpeechQueueEngine {
  /** Enqueue a new dialogue line for the given host. */
  static enqueue(
    hostId: string,
    text: string,
    priority: SpeechCue['priority'] = 'normal',
  ): SpeechCue {
    const state = ensureQueue(hostId);
    const cue: SpeechCue = {
      id: nextId(),
      hostId,
      text,
      durationMs: HostSpeechTimingEngine.calculateDurationMs(text),
      priority,
      createdAt: Date.now(),
    };

    if (priority === 'urgent' || priority === 'interject') {
      state.queue.unshift(cue);
    } else {
      state.queue.push(cue);
    }
    return cue;
  }

  /** Advance to the next cue (called when active cue finishes). */
  static advance(hostId: string): SpeechCue | null {
    const state = ensureQueue(hostId);
    state.activeCue = state.queue.shift() ?? null;
    return state.activeCue;
  }

  /** Peek at current queue state without mutating. */
  static getState(hostId: string): SpeechQueueState {
    return ensureQueue(hostId);
  }

  /** Clear all pending cues (e.g. on show reset). */
  static clear(hostId: string): void {
    const state = ensureQueue(hostId);
    state.queue = [];
    state.activeCue = null;
  }

  /** Returns true if the host has no pending cues. */
  static isIdle(hostId: string): boolean {
    const state = ensureQueue(hostId);
    return state.activeCue === null && state.queue.length === 0;
  }
}
