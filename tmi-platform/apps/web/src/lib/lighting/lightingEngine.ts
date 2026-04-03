/**
 * Lighting & Atmosphere Engine
 * Controls strobe, beam, crowd wash, prize burst, and room mood lighting.
 * All values are CSS/animation-friendly (opacity, color, duration).
 */

export type LightMode =
  | 'IDLE'
  | 'INTRO'
  | 'LIVE'
  | 'BATTLE'
  | 'VOTE'
  | 'WINNER'
  | 'DANCE'
  | 'DROP'
  | 'PREMIERE'
  | 'DANGER'
  | 'SAFE';

export interface LightCue {
  mode: LightMode;
  primaryColor: string;
  accentColor: string;
  strobeHz: number;     // 0 = off, max 4 for safety (≤4 Hz)
  beamAngle: number;    // 0-360
  intensity: number;    // 0-1
  crowdWash: boolean;
  spotlight: boolean;
  duration: number;     // ms
}

export interface RoomLightPreset {
  roomId: string;
  roomName: string;
  defaultMode: LightMode;
  cues: Record<LightMode, LightCue>;
}

/** Safe strobe cap — never exceed 3 Hz to protect photosensitive users */
const SAFE_STROBE_MAX = 3;

function cue(
  mode: LightMode,
  primary: string,
  accent: string,
  strobeHz: number,
  intensity: number,
  crowdWash: boolean,
  spotlight: boolean,
  duration = 2000,
): LightCue {
  return {
    mode,
    primaryColor: primary,
    accentColor: accent,
    strobeHz: Math.min(strobeHz, SAFE_STROBE_MAX),
    beamAngle: 0,
    intensity,
    crowdWash,
    spotlight,
    duration,
  };
}

export const ROOM_PRESETS: Record<string, RoomLightPreset> = {
  'monday-stage': {
    roomId: 'monday-stage',
    roomName: "Marcel's Monday Night Stage",
    defaultMode: 'IDLE',
    cues: {
      IDLE:     cue('IDLE',    '#AA2DFF', '#050510', 0,   0.3, false, false),
      INTRO:    cue('INTRO',   '#FF2DAA', '#AA2DFF', 0,   0.8, true,  true,  3000),
      LIVE:     cue('LIVE',    '#00FFFF', '#FF2DAA', 0,   1.0, true,  true),
      BATTLE:   cue('BATTLE',  '#FF2DAA', '#AA2DFF', 1,   0.9, true,  true),
      VOTE:     cue('VOTE',    '#FFD700', '#AA2DFF', 0,   0.7, true,  false),
      WINNER:   cue('WINNER',  '#FFD700', '#00FFFF', 2,   1.0, true,  true,  4000),
      DANCE:    cue('DANCE',   '#00FFFF', '#FF2DAA', 2,   0.9, true,  false),
      DROP:     cue('DROP',    '#FF2DAA', '#FFD700', 3,   1.0, true,  true,  1500),
      PREMIERE: cue('PREMIERE','#FFD700', '#00FFFF', 0,   0.9, true,  true,  5000),
      DANGER:   cue('DANGER',  '#FF0000', '#FF2DAA', 1,   0.6, false, false),
      SAFE:     cue('SAFE',    '#ffffff', '#00FFFF', 0,   0.4, false, false),
    },
  },
  'cypher': {
    roomId: 'cypher',
    roomName: 'Cypher Arena',
    defaultMode: 'IDLE',
    cues: {
      IDLE:     cue('IDLE',    '#AA2DFF', '#050510', 0,   0.3, false, false),
      INTRO:    cue('INTRO',   '#AA2DFF', '#FF2DAA', 0,   0.8, true,  true,  3000),
      LIVE:     cue('LIVE',    '#AA2DFF', '#00FFFF', 0,   1.0, true,  true),
      BATTLE:   cue('BATTLE',  '#FF2DAA', '#AA2DFF', 2,   1.0, true,  true),
      VOTE:     cue('VOTE',    '#FFD700', '#AA2DFF', 0,   0.7, true,  false),
      WINNER:   cue('WINNER',  '#FFD700', '#FF2DAA', 3,   1.0, true,  true,  4000),
      DANCE:    cue('DANCE',   '#00FFFF', '#AA2DFF', 2,   0.9, true,  false),
      DROP:     cue('DROP',    '#AA2DFF', '#FFD700', 3,   1.0, true,  true,  1500),
      PREMIERE: cue('PREMIERE','#FFD700', '#AA2DFF', 0,   0.9, true,  true,  5000),
      DANGER:   cue('DANGER',  '#FF0000', '#FF2DAA', 1,   0.6, false, false),
      SAFE:     cue('SAFE',    '#ffffff', '#00FFFF', 0,   0.4, false, false),
    },
  },
  'world-dance-party': {
    roomId: 'world-dance-party',
    roomName: 'World Dance Party',
    defaultMode: 'DANCE',
    cues: {
      IDLE:     cue('IDLE',    '#00FFFF', '#050510', 0,   0.3, false, false),
      INTRO:    cue('INTRO',   '#FF2DAA', '#00FFFF', 0,   0.8, true,  true,  3000),
      LIVE:     cue('LIVE',    '#00FFFF', '#FF2DAA', 0,   1.0, true,  true),
      BATTLE:   cue('BATTLE',  '#FF2DAA', '#FFD700', 2,   1.0, true,  true),
      VOTE:     cue('VOTE',    '#FFD700', '#FF2DAA', 0,   0.7, true,  false),
      WINNER:   cue('WINNER',  '#FFD700', '#00FFFF', 3,   1.0, true,  true,  4000),
      DANCE:    cue('DANCE',   '#FF2DAA', '#00FFFF', 2,   1.0, true,  false),
      DROP:     cue('DROP',    '#00FFFF', '#FFD700', 3,   1.0, true,  true,  1500),
      PREMIERE: cue('PREMIERE','#FFD700', '#00FFFF', 0,   0.9, true,  true,  5000),
      DANGER:   cue('DANGER',  '#FF0000', '#FF2DAA', 1,   0.6, false, false),
      SAFE:     cue('SAFE',    '#ffffff', '#00FFFF', 0,   0.4, false, false),
    },
  },
};

export function getLightCue(roomId: string, mode: LightMode): LightCue {
  const preset = ROOM_PRESETS[roomId];
  if (!preset) return ROOM_PRESETS['monday-stage'].cues[mode];
  return preset.cues[mode];
}
