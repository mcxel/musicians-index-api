/**
 * Personal audio resolution order (hard law — do not reorder).
 *
 * 1. blocked / unauthorized
 * 2. local mute
 * 3. private-channel policy
 * 4. pinned audio
 * 5. normal proximity attenuation
 *
 * PIN AUDIO never overrides safety, privacy, or explicit mute.
 */

export const AUDIO_RESOLUTION_ORDER = [
  "blocked_unauthorized",
  "local_mute",
  "private_channel_policy",
  "pinned_audio",
  "proximity_attenuation",
] as const;

export type AudioResolutionLayer = (typeof AUDIO_RESOLUTION_ORDER)[number];

export type PersonalAudioResolution = {
  audible: boolean;
  resolvedBy: AudioResolutionLayer;
};

export type PersonalAudioResolutionInput = {
  blocked?: boolean;
  unauthorized?: boolean;
  localMuted: boolean;
  privateChannelRestricted: boolean;
  pinned: boolean;
  withinProximity: boolean;
};

export const DEFAULT_PROXIMITY_RANGE_METERS = 8;

export function isWithinProximity(
  distanceMeters: number,
  rangeMeters: number = DEFAULT_PROXIMITY_RANGE_METERS,
): boolean {
  return distanceMeters <= rangeMeters;
}

export function resolvePersonalAudio(input: PersonalAudioResolutionInput): PersonalAudioResolution {
  if (input.blocked || input.unauthorized) {
    return { audible: false, resolvedBy: "blocked_unauthorized" };
  }
  if (input.localMuted) {
    return { audible: false, resolvedBy: "local_mute" };
  }
  if (input.privateChannelRestricted) {
    return { audible: false, resolvedBy: "private_channel_policy" };
  }
  if (input.pinned) {
    return { audible: true, resolvedBy: "pinned_audio" };
  }
  return {
    audible: input.withinProximity,
    resolvedBy: "proximity_attenuation",
  };
}
