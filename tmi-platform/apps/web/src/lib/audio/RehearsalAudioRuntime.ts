/**
 * RehearsalAudioRuntime — mode profiles + honest OPEN gap for full WebAudio processing.
 *
 * RehearsalAudioEngine holds gain/ducking/limiter *math* only — no real AudioContext
 * graph, no live ducking/limiter on WebRTC tracks yet. This module is the law layer
 * that maps PerformerLobbyMode → profile and documents certification status.
 */

import {
  RehearsalAudioEngine,
  type RehearsalAudioProfile,
} from "./RehearsalAudioEngine";
import type { PerformerLobbyMode } from "@/lib/live/performerLobbyModes";
import { MODE_TO_REHEARSAL_PROFILE } from "@/lib/live/performerLobbyModes";

export const REHEARSAL_AUDIO_RUNTIME_LAW = {
  /** Real-time WebAudio ducking/limiter on live tracks — not built. */
  liveTrackProcessing: "OPEN_NOT_BUILT" as const,
  /** RehearsalAudioEngine.calculateChannelGain — config math only, certified: false */
  configMathOnly: true,
  profiles: ["MEETING", "VOCAL_REHEARSAL", "ACOUSTIC_REHEARSAL", "FULL_BAND", "AUDITION", "LISTENING_SESSION"] as const,
  talkbackDucking: "config_only",
  peakLimiter: "config_only",
} as const;

export function rehearsalProfileForLobbyMode(mode: PerformerLobbyMode): RehearsalAudioProfile {
  const key = MODE_TO_REHEARSAL_PROFILE[mode];
  return key as RehearsalAudioProfile;
}

export function applyRehearsalProfileForMode(mode: PerformerLobbyMode): RehearsalAudioProfile {
  const profile = rehearsalProfileForLobbyMode(mode);
  RehearsalAudioEngine.setProfile(profile);
  return profile;
}

/** Cosmetic entitlement check hook — never blocks join. */
export function rehearsalAudioReadyForMode(_mode: PerformerLobbyMode): {
  profile: RehearsalAudioProfile;
  liveProcessing: false;
  status: "OPEN_NOT_BUILT";
} {
  return {
    profile: rehearsalProfileForLobbyMode(_mode),
    liveProcessing: false,
    status: "OPEN_NOT_BUILT",
  };
}
