/**
 * ChaosRuntimeTester
 * Controlled chaos scenarios for stress-testing synchronization.
 * ONLY for admin/development use — never activate in production without authorization.
 *
 * Tests: RTT spikes, missed pulses, rapid vibe cycling, concurrent crowd surges,
 * delivery backlog simulation, and simultaneous multi-room drop storms.
 */

import { triggerManualDrop, triggerVibeChange, triggerCrowdSurge } from './GlobalEventSyncHeartbeat';
import { registerRoomLatency } from './LatencyCompensator';
import { dispatch } from './EventPulseDistributor';
import { VIBE_PRESETS } from './WorldStateReplicator';
import type { VibePreset } from './WorldStateReplicator';

export type ChaosScenario =
  | 'rtt-spike'             // simulate poor network for all rooms
  | 'multi-room-surge'      // simultaneous crowd surge in 5+ rooms
  | 'rapid-vibe-cycle'      // cycle through all 12 vibes in 12s
  | 'drop-storm'            // fire 10 drops in 5 seconds
  | 'empty-room-flush'      // remove all rooms, verify graceful handling
  | 'simultaneous-enters';  // 50 rooms join at once

export interface ChaosTestResult {
  scenario: ChaosScenario;
  startedAt: number;
  completedAt: number | null;
  durationMs: number | null;
  passed: boolean;
  notes: string[];
}

const testLog: ChaosTestResult[] = [];
let isRunning = false;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomRoomId(): string {
  return `chaos-room-${Math.random().toString(36).slice(2, 8)}`;
}

async function runRttSpike(): Promise<string[]> {
  const notes: string[] = [];
  const syntheticRooms = Array.from({ length: 10 }, () => randomRoomId());

  for (const roomId of syntheticRooms) {
    registerRoomLatency({ roomId, rttMs: 800 + Math.random() * 400, offsetMs: 0, updatedAt: Date.now() });
  }
  notes.push(`Injected ${syntheticRooms.length} high-RTT rooms (800–1200ms)`);

  await sleep(500);
  triggerManualDrop({ chaosTest: 'rtt-spike', description: 'drop under high-latency conditions' });
  notes.push('Drop fired — latency compensator should have extended deadlines');

  await sleep(500);
  for (const roomId of syntheticRooms) {
    registerRoomLatency({ roomId, rttMs: 40, offsetMs: 0, updatedAt: Date.now() });
  }
  notes.push('RTT restored to normal — rooms should re-sync within 2 pulses');

  return notes;
}

async function runMultiRoomSurge(): Promise<string[]> {
  const notes: string[] = [];
  const targetRooms = Array.from({ length: 6 }, () => randomRoomId());

  dispatch('crowd-surge', {
    energy: 1.0,
    chaosTest: 'multi-room-surge',
    simultaneousRooms: targetRooms.length,
  }, { broadcastAll: false, targetRooms });

  notes.push(`Simultaneous crowd surge dispatched to ${targetRooms.length} rooms`);
  notes.push('Verify: no duplicate events, no bot stampede, clean delivery log');
  return notes;
}

async function runRapidVibeCycle(): Promise<string[]> {
  const notes: string[] = [];
  const presets = Object.keys(VIBE_PRESETS) as VibePreset[];

  for (const preset of presets) {
    triggerVibeChange(preset, 'chaos-tester');
    await sleep(1_000);
  }

  notes.push(`Cycled through all ${presets.length} vibe presets in ${presets.length}s`);
  notes.push('Verify: BPM intervals updated, no zombie interval handles');
  return notes;
}

async function runDropStorm(): Promise<string[]> {
  const notes: string[] = [];

  for (let i = 0; i < 10; i++) {
    triggerManualDrop({ chaosTest: 'drop-storm', dropIndex: i });
    await sleep(500);
  }

  notes.push('Fired 10 drops over 5 seconds');
  notes.push('Verify: distributor delivered all 10, no backlog, no memory growth');
  return notes;
}

async function runSimultaneousEnters(): Promise<string[]> {
  const notes: string[] = [];
  const rooms = Array.from({ length: 50 }, () => randomRoomId());

  for (const roomId of rooms) {
    registerRoomLatency({ roomId, rttMs: 30 + Math.random() * 100, offsetMs: Math.random() * 20 - 10, updatedAt: Date.now() });
  }

  notes.push(`Registered ${rooms.length} rooms simultaneously`);
  triggerManualDrop({ chaosTest: 'simultaneous-enters', roomCount: rooms.length });
  notes.push('Drop fired into 50-room scenario — verify compensated delays are reasonable');
  return notes;
}

export async function runChaosScenario(scenario: ChaosScenario): Promise<ChaosTestResult> {
  if (isRunning) {
    return {
      scenario, startedAt: Date.now(), completedAt: null,
      durationMs: null, passed: false,
      notes: ['Another chaos scenario is already running — wait for it to complete'],
    };
  }

  isRunning = true;
  const startedAt = Date.now();
  let notes: string[] = [];
  let passed = true;

  try {
    switch (scenario) {
      case 'rtt-spike':            notes = await runRttSpike(); break;
      case 'multi-room-surge':     notes = await runMultiRoomSurge(); break;
      case 'rapid-vibe-cycle':     notes = await runRapidVibeCycle(); break;
      case 'drop-storm':           notes = await runDropStorm(); break;
      case 'simultaneous-enters':  notes = await runSimultaneousEnters(); break;
      default:
        notes = [`Unknown scenario: ${String(scenario)}`];
        passed = false;
    }
  } catch (err) {
    notes.push(`ERROR: ${err instanceof Error ? err.message : String(err)}`);
    passed = false;
  } finally {
    isRunning = false;
  }

  const completedAt = Date.now();
  const result: ChaosTestResult = {
    scenario, startedAt, completedAt,
    durationMs: completedAt - startedAt,
    passed, notes,
  };
  testLog.push(result);
  return result;
}

export function getChaosTestLog(): ChaosTestResult[] {
  return [...testLog];
}

export function isChaosRunning(): boolean {
  return isRunning;
}
