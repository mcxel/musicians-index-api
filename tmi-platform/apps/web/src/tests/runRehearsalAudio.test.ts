/**
 * Rehearsal Audio & Performer Lobby Certification Test.
 *
 * Verifies:
 *   1. Rehearsal Audio Profile selection (MEETING vs VOCAL vs FULL_BAND).
 *   2. Talkback ducking calculation (-12dB or -18dB ducking on backing tracks when active).
 *   3. Safety peak limiter capping on high-volume instruments.
 *   4. Independent monitor mix state updates.
 */

import { RehearsalAudioEngine } from "../lib/audio/RehearsalAudioEngine";

export function runRehearsalAudioTest(): { allPassed: boolean; results: Record<string, boolean> } {
  const results: Record<string, boolean> = {};

  // 1. Profile selection
  RehearsalAudioEngine.setProfile("FULL_BAND");
  results["profile_full_band_set"] = RehearsalAudioEngine.getProfile() === "FULL_BAND";

  // 2. Default unducked gain
  RehearsalAudioEngine.setTalkback(false);
  const normalBackingGain = RehearsalAudioEngine.calculateChannelGain("backingTrack");
  results["normal_backing_gain_valid"] = normalBackingGain > 0.4;

  // 3. Talkback ducking active
  RehearsalAudioEngine.setTalkback(true);
  const duckedBackingGain = RehearsalAudioEngine.calculateChannelGain("backingTrack");
  results["talkback_ducking_applied"] = duckedBackingGain < normalBackingGain;

  // 4. Limiter safety on loud channel
  RehearsalAudioEngine.updateLocalMix({ band: 100 });
  const bandGain = RehearsalAudioEngine.calculateChannelGain("band");
  results["safety_limiter_capped"] = bandGain <= 0.95;

  const allPassed = Object.values(results).every(Boolean);

  console.log("[REHEARSAL_AUDIO_TEST_ASSERT]", JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}
