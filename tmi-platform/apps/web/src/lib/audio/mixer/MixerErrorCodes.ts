/**
 * Mixer + Performance Glue error / health codes (MIX-001…010, GLUE-*).
 * Factual registries only — never decorative ON states.
 */

export type MixerErrorCode =
  | "MIX-001"
  | "MIX-002"
  | "MIX-003"
  | "MIX-004"
  | "MIX-005"
  | "MIX-006"
  | "MIX-007"
  | "MIX-008"
  | "MIX-009"
  | "MIX-010";

export type GlueErrorCode =
  | "GLUE-001"
  | "GLUE-002"
  | "GLUE-003"
  | "GLUE-004"
  | "GLUE-005";

export const MIXER_ERROR_CATALOG: Record<
  MixerErrorCode,
  { title: string; meaning: string }
> = {
  "MIX-001": { title: "NO_AUDIO_OWNER", meaning: "ChannelMixerDirector has no bound AudioOwner" },
  "MIX-002": { title: "PROGRAM_AUTH_DENIED", meaning: "Caller lacks host/operator auth for PROGRAM bus" },
  "MIX-003": { title: "CHANNEL_NOT_FOUND", meaning: "participantId / channelId missing from live roster" },
  "MIX-004": { title: "GAIN_CLAMPED", meaning: "Requested gain soft-clamped to safety range" },
  "MIX-005": { title: "SOURCE_UNAVAILABLE", meaning: "Virtual channel has no real MediaStream / reaction source" },
  "MIX-006": { title: "DUPLICATE_CHANNEL", meaning: "Reconnect restored existing participantId — no Guitar(2)" },
  "MIX-007": { title: "SESSION_MISMATCH", meaning: "roomId / liveSessionId invariant violation" },
  "MIX-008": { title: "AUTO_BALANCE_OFF", meaning: "No measurement path — AUTO BALANCE remains ASSIST/OFF" },
  "MIX-009": { title: "CROWD_ZERO_SAFE", meaning: "Crowd at 0 must not mute performer channels" },
  "MIX-010": { title: "DSP_NOT_SHOWN", meaning: "EQ/DSP knobs omitted — no real DSP graph" },
};

export const GLUE_ERROR_CATALOG: Record<
  GlueErrorCode,
  { title: string; meaning: string }
> = {
  "GLUE-001": { title: "GLUE_SCAFFOLD", meaning: "Performance Glue is scaffold — not live DSP" },
  "GLUE-002": { title: "CLOCK_UNBOUND", meaning: "No CanonicalPerformanceClock bound for this session" },
  "GLUE-003": { title: "SPECTRAL_OFF", meaning: "Spectral masking IMPLEMENTED_NOT_INTEGRATED / OFF" },
  "GLUE-004": { title: "SONG_SCENES_OFF", meaning: "Song scenes IMPLEMENTED_NOT_INTEGRATED / OFF" },
  "GLUE-005": { title: "COMPETITIVE_FAIRNESS", meaning: "Competitors cannot mute/gain opponents' PROGRAM" },
};

export type SystemPowerState = "ON" | "OFF" | "DEGRADED" | "IMPLEMENTED_NOT_INTEGRATED" | "DEFAULT_ONLY";

/** DEFAULT_ONLY ≠ ON — document-only / config defaults without live graph. */
export type MixerSystemId =
  | "AUDIO_MIXER"
  | "PERSONAL_MIX"
  | "PROGRAM_MIX"
  | "CROWD_MIX"
  | "PERFORMANCE_GLUE"
  | "PERFORMANCE_CLOCK";

export interface MixerSystemHealth {
  systemId: MixerSystemId;
  powerState: SystemPowerState;
  detail: string;
  lastCode?: MixerErrorCode | GlueErrorCode;
}
