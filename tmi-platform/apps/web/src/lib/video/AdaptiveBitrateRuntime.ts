/**
 * AdaptiveBitrateRuntime
 * Dynamically selects video quality tier per-feed based on bandwidth and buffer health.
 */

export type BitrateProfile = "4k" | "1080p" | "720p" | "480p" | "360p" | "audio_only";

export interface BitrateLevel {
  profile: BitrateProfile;
  bitrateKbps: number;
  width: number;
  height: number;
  fps: number;
}

const BITRATE_LEVELS: BitrateLevel[] = [
  { profile: "4k",         bitrateKbps: 15000, width: 3840, height: 2160, fps: 60 },
  { profile: "1080p",      bitrateKbps: 5000,  width: 1920, height: 1080, fps: 60 },
  { profile: "720p",       bitrateKbps: 2500,  width: 1280, height: 720,  fps: 30 },
  { profile: "480p",       bitrateKbps: 1000,  width: 854,  height: 480,  fps: 30 },
  { profile: "360p",       bitrateKbps: 400,   width: 640,  height: 360,  fps: 24 },
  { profile: "audio_only", bitrateKbps: 128,   width: 0,    height: 0,    fps: 0  },
];

export interface FeedBitrateState {
  feedId: string;
  currentProfile: BitrateProfile;
  currentLevel: BitrateLevel;
  targetProfile: BitrateProfile;
  estimatedBandwidthKbps: number;
  bufferHealthPct: number;
  upgradeCount: number;
  downgradeCount: number;
  lastChangedAt: number | null;
  locked: boolean;
}

const feedStates = new Map<string, FeedBitrateState>();
type ABRListener = (state: FeedBitrateState) => void;
const abrListeners = new Map<string, Set<ABRListener>>();

function selectProfile(bandwidthKbps: number, bufferHealthPct: number): BitrateProfile {
  const headroom = bufferHealthPct > 50 ? 1.0 : bufferHealthPct > 20 ? 0.7 : 0.4;
  const effective = bandwidthKbps * headroom;
  for (const level of BITRATE_LEVELS) {
    if (level.bitrateKbps * 1.2 <= effective) return level.profile;
  }
  return "audio_only";
}

export function initFeedBitrate(feedId: string, initialBandwidthKbps = 5000): FeedBitrateState {
  const profile = selectProfile(initialBandwidthKbps, 80);
  const level = BITRATE_LEVELS.find(l => l.profile === profile) ?? BITRATE_LEVELS[4];
  const state: FeedBitrateState = {
    feedId, currentProfile: profile, currentLevel: level, targetProfile: profile,
    estimatedBandwidthKbps: initialBandwidthKbps, bufferHealthPct: 80,
    upgradeCount: 0, downgradeCount: 0, lastChangedAt: null, locked: false,
  };
  feedStates.set(feedId, state);
  return state;
}

export function reportNetworkConditions(feedId: string, bandwidthKbps: number, bufferHealthPct: number): FeedBitrateState {
  const current = feedStates.get(feedId) ?? initFeedBitrate(feedId, bandwidthKbps);
  if (current.locked) return current;

  const target = selectProfile(bandwidthKbps, bufferHealthPct);
  const currentIdx = BITRATE_LEVELS.findIndex(l => l.profile === current.currentProfile);
  const targetIdx = BITRATE_LEVELS.findIndex(l => l.profile === target);
  const isUpgrade = targetIdx < currentIdx;
  const isDowngrade = targetIdx > currentIdx;

  const newLevel = BITRATE_LEVELS.find(l => l.profile === target) ?? current.currentLevel;

  const updated: FeedBitrateState = {
    ...current,
    currentProfile: target,
    currentLevel: newLevel,
    targetProfile: target,
    estimatedBandwidthKbps: bandwidthKbps,
    bufferHealthPct,
    upgradeCount: isUpgrade ? current.upgradeCount + 1 : current.upgradeCount,
    downgradeCount: isDowngrade ? current.downgradeCount + 1 : current.downgradeCount,
    lastChangedAt: target !== current.currentProfile ? Date.now() : current.lastChangedAt,
  };
  feedStates.set(feedId, updated);
  abrListeners.get(feedId)?.forEach(l => l(updated));
  return updated;
}

export function lockBitrateProfile(feedId: string, profile: BitrateProfile): FeedBitrateState {
  const current = feedStates.get(feedId) ?? initFeedBitrate(feedId);
  const level = BITRATE_LEVELS.find(l => l.profile === profile) ?? current.currentLevel;
  const updated = { ...current, currentProfile: profile, currentLevel: level, targetProfile: profile, locked: true };
  feedStates.set(feedId, updated);
  abrListeners.get(feedId)?.forEach(l => l(updated));
  return updated;
}

export function unlockBitrateProfile(feedId: string): FeedBitrateState {
  const current = feedStates.get(feedId) ?? initFeedBitrate(feedId);
  const updated = { ...current, locked: false };
  feedStates.set(feedId, updated);
  abrListeners.get(feedId)?.forEach(l => l(updated));
  return updated;
}

export function getFeedBitrate(feedId: string): FeedBitrateState | null {
  return feedStates.get(feedId) ?? null;
}

export function subscribeToFeedBitrate(feedId: string, listener: ABRListener): () => void {
  if (!abrListeners.has(feedId)) abrListeners.set(feedId, new Set());
  abrListeners.get(feedId)!.add(listener);
  const current = feedStates.get(feedId);
  if (current) listener(current);
  return () => abrListeners.get(feedId)?.delete(listener);
}

export function getBitrateLevels(): BitrateLevel[] {
  return BITRATE_LEVELS;
}
