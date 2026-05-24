/**
 * InteractionBroadcastEngine
 * Full shout-out pipeline: Tip event → spotlight → performer HUD alert
 * → optional video widget → avatar wave → fade-out.
 */

export type ShoutoutPhase =
  | 'idle'
  | 'spotlight_flash'   // 200ms hard flash on seat
  | 'performer_alert'   // HUD notification fires
  | 'video_widget'      // optional 2–3s fan video overlay
  | 'avatar_wave'       // avatar plays wave animation
  | 'fade_out';         // everything fades, back to idle

export interface TipEvent {
  seatId: string;
  fanId: string;
  fanName: string;
  fanAvatar?: string;
  amountUsd: number;
  message?: string;
  videoClipUrl?: string; // optional fan selfie clip
  timestamp: number;
}

export interface ShoutoutState {
  id: string;
  tip: TipEvent;
  phase: ShoutoutPhase;
  startedAt: number;
  durationMs: number;
}

export type ShoutoutListener = (state: ShoutoutState) => void;

// ── Phase durations ───────────────────────────────────────────────────────────
const PHASE_DURATIONS: Record<ShoutoutPhase, number> = {
  idle:             0,
  spotlight_flash:  250,
  performer_alert:  1800,
  video_widget:     3000,
  avatar_wave:      2200,
  fade_out:         600,
};

const PHASE_SEQUENCE: ShoutoutPhase[] = [
  'spotlight_flash',
  'performer_alert',
  'video_widget',
  'avatar_wave',
  'fade_out',
];

let shoutoutCounter = 0;
const activeShoutouts = new Map<string, ShoutoutState>();
const listeners = new Set<ShoutoutListener>();

// Anti-repetition: track recent seatId→timestamp to space shoutouts
const recentSeats = new Map<string, number>();
const COOLDOWN_MS = 8000;

export function canFireShoutout(seatId: string): boolean {
  const last = recentSeats.get(seatId);
  if (!last) return true;
  return Date.now() - last > COOLDOWN_MS;
}

export function fireShoutout(tip: TipEvent): ShoutoutState | null {
  if (!canFireShoutout(tip.seatId)) return null;

  recentSeats.set(tip.seatId, Date.now());
  const id = `shoutout_${++shoutoutCounter}`;

  const state: ShoutoutState = {
    id,
    tip,
    phase: 'spotlight_flash',
    startedAt: Date.now(),
    durationMs: PHASE_DURATIONS.spotlight_flash,
  };

  activeShoutouts.set(id, state);
  notifyListeners(state);

  // Walk through phases
  let offset = 0;
  for (const phase of PHASE_SEQUENCE) {
    offset += phase === 'spotlight_flash' ? 0 : PHASE_DURATIONS[PHASE_SEQUENCE[PHASE_SEQUENCE.indexOf(phase) - 1]];
    const thisPhase = phase;
    const shouldShowVideo = tip.videoClipUrl || thisPhase !== 'video_widget';

    setTimeout(() => {
      const current = activeShoutouts.get(id);
      if (!current) return;

      if (thisPhase === 'video_widget' && !tip.videoClipUrl) {
        // skip video phase if no clip
        const next = advancePhase(current, 'avatar_wave');
        activeShoutouts.set(id, next);
        notifyListeners(next);
        return;
      }

      const updated: ShoutoutState = {
        ...current,
        phase: thisPhase,
        durationMs: PHASE_DURATIONS[thisPhase],
      };
      activeShoutouts.set(id, updated);
      notifyListeners(updated);
    }, offset + PHASE_DURATIONS['spotlight_flash']);

    offset += PHASE_DURATIONS[phase];
  }

  // Cleanup after full sequence
  setTimeout(() => {
    activeShoutouts.delete(id);
  }, offset + PHASE_DURATIONS['spotlight_flash'] + 500);

  return state;
}

function advancePhase(state: ShoutoutState, toPhase: ShoutoutPhase): ShoutoutState {
  return { ...state, phase: toPhase, durationMs: PHASE_DURATIONS[toPhase] };
}

function notifyListeners(state: ShoutoutState) {
  listeners.forEach((fn) => {
    try { fn(state); } catch { /* isolated */ }
  });
}

export function subscribeShoutouts(fn: ShoutoutListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getActiveShoutouts(): ShoutoutState[] {
  return Array.from(activeShoutouts.values());
}

// ── Spotlight color by tip amount ────────────────────────────────────────────
export function spotlightColorForTip(amountUsd: number): string {
  if (amountUsd >= 100) return '#FFD700'; // gold — whale tip
  if (amountUsd >= 50)  return '#AA2DFF'; // purple — big tip
  if (amountUsd >= 20)  return '#00FFFF'; // cyan — solid tip
  return '#FF2DAA';                        // fuchsia — base
}
