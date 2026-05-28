/**
 * WorldPremiereOrchestrator
 * The first moment the entire platform reacts to a single timeline event.
 *
 * Coordinates a synchronized premiere sequence across all active rooms:
 * countdown → curtain-drop → legendary broadcast → artifact generation → mythology.
 *
 * This is the "Global Premiere" — the event that defines the platform's identity.
 * When it fires, every avatar in every room experiences the same moment simultaneously.
 */

import { dispatch } from './EventPulseDistributor';
import { triggerVibeChange, triggerManualDrop, triggerCrowdSurge, getHeartbeatStats } from './GlobalEventSyncHeartbeat';
import { captureSnapshot } from './PersistentWorldSnapshotEngine';
import { generateArtifactBundle } from './MemoryArtifactGenerator';
import { scheduleEvent, startWorldClock } from './WorldTimeAuthority';
import { universalNow } from './UniversalClockRuntime';
import { mythFirstLegendary, mythUnanimousPeak } from './MythologyEngine';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PremierePhase =
  | 'idle'
  | 'scheduled'
  | 'countdown'    // T-60s to T-0
  | 'curtain-drop' // T-0 to T+3s
  | 'surge'        // T+3s to T+15s
  | 'legendary'    // T+15s — plateau, legendary detection window
  | 'cooldown'     // T+45s — wind down
  | 'complete';

export interface PremiereConfig {
  title: string;
  performerId: string;
  roomIds: string[];
  countdownSec: number;      // seconds before curtain-drop, default 60
  surgeDurationSec: number;  // default 15
  legendaryWindowSec: number;// default 30
  accentColor?: string;
}

export interface PremiereState {
  phase: PremierePhase;
  config: PremiereConfig | null;
  scheduledAt: number | null;     // when premiere fires (UTC ms)
  startedAt: number | null;
  phaseStartedAt: number | null;
  snapshotId: string | null;
  artifactBundleId: string | null;
  mythId: string | null;
  phaseLogs: Array<{ phase: PremierePhase; timestamp: number; detail: string }>;
}

// ── State ─────────────────────────────────────────────────────────────────────

let state: PremiereState = {
  phase: 'idle',
  config: null,
  scheduledAt: null,
  startedAt: null,
  phaseStartedAt: null,
  snapshotId: null,
  artifactBundleId: null,
  mythId: null,
  phaseLogs: [],
};

const stateHandlers = new Set<(state: PremiereState) => void>();
let countdownInterval: ReturnType<typeof setInterval> | null = null;
let phaseTimeout: ReturnType<typeof setTimeout> | null = null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function logPhase(phase: PremierePhase, detail: string): void {
  state.phaseLogs.push({ phase, timestamp: universalNow(), detail });
  if (state.phaseLogs.length > 30) state.phaseLogs.shift();
}

function setState(patch: Partial<PremiereState>): void {
  state = { ...state, ...patch };
  for (const h of stateHandlers) {
    try { h({ ...state }); } catch { /* ignore */ }
  }
}

function clearTimers(): void {
  if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
  if (phaseTimeout) { clearTimeout(phaseTimeout); phaseTimeout = null; }
}

// ── Phase execution ───────────────────────────────────────────────────────────

async function executeCountdown(config: PremiereConfig): Promise<void> {
  setState({ phase: 'countdown', phaseStartedAt: universalNow() });
  logPhase('countdown', `T-${config.countdownSec}s countdown started`);

  // Broadcast countdown start to all rooms
  dispatch('drop', {
    reason: 'premiere-countdown',
    title: config.title,
    countdownSec: config.countdownSec,
    roomIds: config.roomIds,
    autoDetected: true,
  });

  // Schedule curtain-drop
  phaseTimeout = setTimeout(() => { void executeCurtainDrop(config); }, config.countdownSec * 1_000);
}

async function executeCurtainDrop(config: PremiereConfig): Promise<void> {
  setState({ phase: 'curtain-drop', phaseStartedAt: universalNow(), startedAt: universalNow() });
  logPhase('curtain-drop', `Curtain dropped — ${config.title}`);

  // Trigger a DROP across all rooms
  triggerManualDrop();

  // Switch to highest-energy vibe
  triggerVibeChange('cyber-battle');

  // Broadcast premiere event
  dispatch('drop', {
    reason: 'premiere-fire',
    title: config.title,
    performerId: config.performerId,
    roomIds: config.roomIds,
    isCurtainDrop: true,
  });

  // Capture premiere snapshot
  const snapshot = await captureSnapshot({
    trigger: 'legendary-moment',
    label: `World Premiere: ${config.title}`,
    roomId: config.roomIds[0] ?? 'world',
    isLegendary: true,
    metadata: { phase: 'curtain-drop', performerId: config.performerId, roomIds: config.roomIds },
  });

  const bundle = generateArtifactBundle(snapshot);

  setState({ snapshotId: snapshot.id, artifactBundleId: bundle.snapshotId });
  logPhase('curtain-drop', `Snapshot ${snapshot.id} captured, bundle ${bundle.snapshotId}`);

  phaseTimeout = setTimeout(() => { void executeSurge(config); }, 3_000);
}

async function executeSurge(config: PremiereConfig): Promise<void> {
  setState({ phase: 'surge', phaseStartedAt: universalNow() });
  logPhase('surge', 'Crowd surge phase — all rooms at peak energy');

  // Max crowd surge
  triggerCrowdSurge(1.0);

  // Broadcast surge to all rooms
  dispatch('crowd-surge', {
    reason: 'premiere-surge',
    energy: 1.0,
    roomIds: config.roomIds,
    isSynchronized: true,
  });

  phaseTimeout = setTimeout(() => { void executeLegendary(config); }, config.surgeDurationSec * 1_000);
}

async function executeLegendary(config: PremiereConfig): Promise<void> {
  setState({ phase: 'legendary', phaseStartedAt: universalNow() });
  logPhase('legendary', 'Legendary detection window open');

  // Generate platform mythology
  const myth = mythFirstLegendary(
    config.performerId,
    config.roomIds[0] ?? 'world',
    config.roomIds.length * 20,  // estimate: 20 avatars per room
    state.snapshotId ?? undefined,
  ) ?? mythUnanimousPeak(
    config.roomIds[0] ?? 'world',
    config.roomIds.length * 20,
    config.surgeDurationSec,
    state.snapshotId ?? undefined,
  );

  if (myth) {
    setState({ mythId: myth.id });
    logPhase('legendary', `Myth created: ${myth.id} — "${myth.headline}"`);
  }

  // Broadcast legendary announcement
  dispatch('drop', {
    reason: 'premiere-legendary',
    title: config.title,
    mythId: myth?.id ?? null,
    snapshotId: state.snapshotId,
    roomIds: config.roomIds,
  });

  phaseTimeout = setTimeout(() => { void executeCooldown(config); }, config.legendaryWindowSec * 1_000);
}

async function executeCooldown(config: PremiereConfig): Promise<void> {
  setState({ phase: 'cooldown', phaseStartedAt: universalNow() });
  logPhase('cooldown', 'Premiere winding down');

  triggerVibeChange('neon-arena');
  triggerCrowdSurge(0.6);

  dispatch('vibe-change', {
    reason: 'premiere-cooldown',
    roomIds: config.roomIds,
  });

  phaseTimeout = setTimeout(() => {
    setState({ phase: 'complete', phaseStartedAt: universalNow() });
    logPhase('complete', 'Premiere sequence complete');
    clearTimers();
  }, 30_000);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Schedule a world premiere. The countdown begins immediately.
 * Pass `delayMs=0` for an immediate premiere (useful for testing).
 */
export function scheduleWorldPremiere(config: PremiereConfig, delayMs = 60_000): void {
  if (state.phase !== 'idle' && state.phase !== 'complete') {
    throw new Error(`Cannot schedule premiere — currently in phase: ${state.phase}`);
  }

  clearTimers();

  const scheduledAt = universalNow() + delayMs;
  const fullConfig: PremiereConfig = {
    ...config,
    countdownSec: config.countdownSec ?? 60,
    surgeDurationSec: config.surgeDurationSec ?? 15,
    legendaryWindowSec: config.legendaryWindowSec ?? 30,
  };

  // Register in WorldTimeAuthority
  scheduleEvent({
    type: 'premiere',
    label: config.title,
    startsAt: scheduledAt,
    durationMs: (config.countdownSec + config.surgeDurationSec + config.legendaryWindowSec + 30) * 1_000,
    roomId: config.roomIds[0],
    metadata: { performerId: config.performerId, roomIds: config.roomIds },
  });

  // Start world clock if not running
  startWorldClock();

  setState({
    phase: 'scheduled',
    config: fullConfig,
    scheduledAt,
    startedAt: null,
    phaseStartedAt: universalNow(),
    snapshotId: null,
    artifactBundleId: null,
    mythId: null,
    phaseLogs: [],
  });

  logPhase('scheduled', `Premiere "${config.title}" scheduled — fires in ${Math.round(delayMs / 1000)}s`);

  // Fire countdown when delay elapses
  phaseTimeout = setTimeout(() => { void executeCountdown(fullConfig); }, Math.max(0, delayMs - fullConfig.countdownSec * 1_000));

  // Broadcast scheduling
  dispatch('admin', {
    reason: 'premiere-scheduled',
    title: config.title,
    scheduledAt,
    roomIds: config.roomIds,
  });
}

/**
 * Trigger an immediate premiere — skips countdown delay, fires right now.
 * Used for testing and live operator control.
 */
export function firePremiereNow(config: Partial<PremiereConfig> & { title: string; performerId: string; roomIds: string[] }): void {
  clearTimers();

  const fullConfig: PremiereConfig = {
    ...config,
    countdownSec: config.countdownSec ?? 5,
    surgeDurationSec: config.surgeDurationSec ?? 15,
    legendaryWindowSec: config.legendaryWindowSec ?? 30,
  };

  setState({
    phase: 'scheduled',
    config: fullConfig,
    scheduledAt: universalNow() + 5_000,
    startedAt: null,
    phaseStartedAt: universalNow(),
    snapshotId: null, artifactBundleId: null, mythId: null,
    phaseLogs: [],
  });

  logPhase('scheduled', `Immediate premiere "${fullConfig.title}" — 5s countdown`);
  phaseTimeout = setTimeout(() => { void executeCurtainDrop(fullConfig); }, 5_000);
}

export function cancelPremiere(): void {
  clearTimers();
  setState({ phase: 'idle', config: null, scheduledAt: null });
  logPhase('idle', 'Premiere cancelled by operator');
}

export function getPremiereState(): PremiereState {
  return { ...state };
}

export function onPremiereStateChange(handler: (state: PremiereState) => void): () => void {
  stateHandlers.add(handler);
  return () => stateHandlers.delete(handler);
}

export function msUntilPremiere(): number | null {
  if (!state.scheduledAt || state.phase === 'idle' || state.phase === 'complete') return null;
  return Math.max(0, state.scheduledAt - universalNow());
}

export function getPremiereStats(): {
  phase: PremierePhase;
  title: string | null;
  performerId: string | null;
  roomCount: number;
  snapshotCaptured: boolean;
  mythGenerated: boolean;
  artifactGenerated: boolean;
  heartbeatActive: boolean;
} {
  const hb = getHeartbeatStats();
  return {
    phase: state.phase,
    title: state.config?.title ?? null,
    performerId: state.config?.performerId ?? null,
    roomCount: state.config?.roomIds.length ?? 0,
    snapshotCaptured: !!state.snapshotId,
    mythGenerated: !!state.mythId,
    artifactGenerated: !!state.artifactBundleId,
    heartbeatActive: hb.status !== 'stopped',
  };
}
