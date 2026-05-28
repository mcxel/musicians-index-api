/**
 * LegendaryMomentDetector
 * The platform's intelligence layer — autonomously declares legendary moments.
 * Watches crowd energy, synchronized emotes, donation surges, vote explosions,
 * chat velocity, and standing ovation duration.
 *
 * When conditions are met, the platform itself says: "that moment mattered."
 * Auto-captures a snapshot and triggers MemoryArtifactGenerator.
 */

import { captureSnapshot } from './PersistentWorldSnapshotEngine';
import { generateArtifactBundle } from './MemoryArtifactGenerator';
import { getWorldState } from './WorldStateReplicator';
import { dispatch } from './EventPulseDistributor';
import { universalNow } from './UniversalClockRuntime';
import type { EnergyFieldState } from './AdaptiveCrowdEnergyEngine';

export type LegendaryTriggerType =
  | 'crowd-energy-peak'       // energy > 95% sustained 3+ seconds
  | 'synchronized-emote'      // >60% of room same gesture simultaneously
  | 'donation-surge'          // multiple tips within 10s window
  | 'standing-ovation'        // energy >90% sustained >10s
  | 'vote-explosion'          // rapid vote acceleration
  | 'chat-velocity-spike'     // messages per second exceeds threshold
  | 'drop-consensus';         // all rooms reach energy > 90% at same moment

export interface LegendaryDetection {
  id: string;
  roomId: string;
  triggerType: LegendaryTriggerType;
  label: string;
  detectedAt: number;
  energyAtDetection: number;
  snapshotId: string | null;
  artifactBundleId: string | null;
  confidence: number;   // 0–1 how confident the detection is
}

export interface DetectorThresholds {
  energyPeakMin: number;         // default 0.95
  energyPeakSustainMs: number;   // default 3000
  syncEmoteMinPct: number;       // default 0.60
  donationWindowMs: number;      // default 10000
  donationMinCount: number;      // default 3
  ovationSustainMs: number;      // default 10000
  ovationMinEnergy: number;      // default 0.90
  chatVelocityMinPerSec: number; // default 5
  dropConsensusMinPct: number;   // default 0.90 of rooms at once
}

const DEFAULT_THRESHOLDS: DetectorThresholds = {
  energyPeakMin: 0.95,
  energyPeakSustainMs: 3_000,
  syncEmoteMinPct: 0.60,
  donationWindowMs: 10_000,
  donationMinCount: 3,
  ovationSustainMs: 10_000,
  ovationMinEnergy: 0.90,
  chatVelocityMinPerSec: 5,
  dropConsensusMinPct: 0.90,
};

let thresholds = { ...DEFAULT_THRESHOLDS };
const detections: LegendaryDetection[] = [];
const detectionHandlers = new Set<(d: LegendaryDetection) => void>();

// Per-room tracking state
interface RoomTrack {
  roomId: string;
  energyPeakStart: number | null;
  ovationStart: number | null;
  recentDonations: number[];
  recentDetections: Set<LegendaryTriggerType>;
  cooldownUntil: number;
}
const roomTracks = new Map<string, RoomTrack>();
const DETECTION_COOLDOWN_MS = 30_000;  // prevent same room triggering same type twice in 30s

function generateId(): string {
  return `legend-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function getTrack(roomId: string): RoomTrack {
  if (!roomTracks.has(roomId)) {
    roomTracks.set(roomId, {
      roomId, energyPeakStart: null, ovationStart: null,
      recentDonations: [], recentDetections: new Set(), cooldownUntil: 0,
    });
  }
  return roomTracks.get(roomId)!;
}

function isCoolingDown(track: RoomTrack, type: LegendaryTriggerType): boolean {
  return track.cooldownUntil > Date.now() && track.recentDetections.has(type);
}

async function declareLegendary(
  roomId: string,
  triggerType: LegendaryTriggerType,
  label: string,
  energy: number,
  confidence: number,
): Promise<LegendaryDetection> {
  const track = getTrack(roomId);

  if (isCoolingDown(track, triggerType)) {
    return {
      id: generateId(), roomId, triggerType, label,
      detectedAt: universalNow(), energyAtDetection: energy,
      snapshotId: null, artifactBundleId: null, confidence: 0,
    };
  }

  // Capture snapshot
  const snapshot = await captureSnapshot({
    trigger: 'legendary-moment',
    label,
    roomId,
    isLegendary: true,
    metadata: { triggerType, confidence, autoDetected: true },
  });

  // Generate artifacts
  const bundle = generateArtifactBundle(snapshot);

  // Announce via pulse
  dispatch('drop', {
    reason: 'legendary-detected',
    triggerType,
    label,
    roomId,
    snapshotId: snapshot.id,
    crowdEnergy: energy,
    autoDetected: true,
  });

  const detection: LegendaryDetection = {
    id: generateId(),
    roomId, triggerType, label,
    detectedAt: universalNow(),
    energyAtDetection: energy,
    snapshotId: snapshot.id,
    artifactBundleId: bundle.snapshotId,
    confidence,
  };

  detections.push(detection);
  track.recentDetections.add(triggerType);
  track.cooldownUntil = Date.now() + DETECTION_COOLDOWN_MS;

  for (const h of detectionHandlers) {
    try { h(detection); } catch { /* ignore */ }
  }

  return detection;
}

// ── Detection checks (call from energy field updates) ─────────────────────────

export async function checkEnergyPeak(roomId: string, field: EnergyFieldState): Promise<void> {
  const track = getTrack(roomId);
  const now = Date.now();

  if (field.avgEnergy >= thresholds.energyPeakMin) {
    if (!track.energyPeakStart) track.energyPeakStart = now;
    const sustained = now - track.energyPeakStart;

    if (sustained >= thresholds.energyPeakSustainMs && !isCoolingDown(track, 'crowd-energy-peak')) {
      const world = getWorldState();
      await declareLegendary(
        roomId,
        'crowd-energy-peak',
        `${world.vibeConfig.label} — Peak Energy Reached`,
        field.avgEnergy,
        Math.min(1, sustained / (thresholds.energyPeakSustainMs * 2)),
      );
      track.energyPeakStart = null;
    }

    // Standing ovation check
    if (field.avgEnergy >= thresholds.ovationMinEnergy) {
      if (!track.ovationStart) track.ovationStart = now;
      const ovationDuration = now - track.ovationStart;
      if (ovationDuration >= thresholds.ovationSustainMs && !isCoolingDown(track, 'standing-ovation')) {
        await declareLegendary(
          roomId, 'standing-ovation',
          `Standing Ovation — ${Math.round(ovationDuration / 1000)}s at ${Math.round(field.avgEnergy * 100)}%`,
          field.avgEnergy, 0.95,
        );
        track.ovationStart = null;
      }
    } else {
      track.ovationStart = null;
    }
  } else {
    track.energyPeakStart = null;
  }
}

export async function recordDonation(roomId: string): Promise<void> {
  const track = getTrack(roomId);
  const now = Date.now();
  track.recentDonations = track.recentDonations.filter((t) => now - t < thresholds.donationWindowMs);
  track.recentDonations.push(now);

  if (track.recentDonations.length >= thresholds.donationMinCount && !isCoolingDown(track, 'donation-surge')) {
    await declareLegendary(
      roomId, 'donation-surge',
      `Donation Surge — ${track.recentDonations.length} tips in ${thresholds.donationWindowMs / 1000}s`,
      getWorldState().vibeConfig.crowdEnergy, 0.85,
    );
    track.recentDonations = [];
  }
}

export async function recordChatMessage(roomId: string): Promise<void> {
  const track = getTrack(roomId);
  const now = Date.now();
  track.recentDonations = track.recentDonations.filter((t) => now - t < 1000);
  track.recentDonations.push(now);

  if (track.recentDonations.length >= thresholds.chatVelocityMinPerSec && !isCoolingDown(track, 'chat-velocity-spike')) {
    await declareLegendary(
      roomId, 'chat-velocity-spike',
      `Chat Explosion — ${track.recentDonations.length} msg/s`,
      getWorldState().vibeConfig.crowdEnergy, 0.75,
    );
    track.recentDonations = [];
  }
}

export function onLegendaryDetected(handler: (d: LegendaryDetection) => void): () => void {
  detectionHandlers.add(handler);
  return () => detectionHandlers.delete(handler);
}

export function getDetections(limit = 20): LegendaryDetection[] {
  return detections.slice(-limit).reverse();
}

export function configureThresholds(overrides: Partial<DetectorThresholds>): void {
  thresholds = { ...DEFAULT_THRESHOLDS, ...overrides };
}

export function getDetectorStats(): {
  totalDetections: number;
  byType: Partial<Record<LegendaryTriggerType, number>>;
  trackedRooms: number;
} {
  const byType: Partial<Record<LegendaryTriggerType, number>> = {};
  for (const d of detections) {
    byType[d.triggerType] = (byType[d.triggerType] ?? 0) + 1;
  }
  return { totalDetections: detections.length, byType, trackedRooms: roomTracks.size };
}
