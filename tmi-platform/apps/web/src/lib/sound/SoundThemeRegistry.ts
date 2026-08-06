/**
 * TMI Sound Theme Registry — Production Specification
 * Defines audio profiles and procedural sound synthesis parameters for all 8 platform sound themes.
 */

export type SoundThemeId =
  | "studio"
  | "concert"
  | "dj"
  | "piano"
  | "rock"
  | "orchestra"
  | "futuristic"
  | "hiphop";

export interface SoundThemeSpec {
  id: SoundThemeId;
  name: string;
  icon: string;
  description: string;
  basePitch: number;      // Hz frequency scaling
  waveform: OscillatorType;
  decayRate: number;      // Envelope decay in seconds
  reverbAmount: number;   // Wet/dry mix 0..1
  accentHarmonic: number; // Multiplier for success/reward harmonics
}

export const SOUND_THEMES: Record<SoundThemeId, SoundThemeSpec> = {
  studio: {
    id: "studio",
    name: "Studio Theme",
    icon: "🌟",
    description: "Clean digital clicks, precise acoustic taps, and reference monitor tones.",
    basePitch: 800,
    waveform: "sine",
    decayRate: 0.04,
    reverbAmount: 0.05,
    accentHarmonic: 1.5,
  },
  concert: {
    id: "concert",
    name: "Concert Theme",
    icon: "🦤",
    description: "Crowd-inspired ambient warmth, arena resonance, and live stage cues.",
    basePitch: 650,
    waveform: "triangle",
    decayRate: 0.08,
    reverbAmount: 0.35,
    accentHarmonic: 2.0,
  },
  dj: {
    id: "dj",
    name: "DJ Theme",
    icon: "🎥",
    description: "Electronic taps, pitch bends, turntable blips, and synth transients.",
    basePitch: 950,
    waveform: "sawtooth",
    decayRate: 0.05,
    reverbAmount: 0.15,
    accentHarmonic: 1.75,
  },
  piano: {
    id: "piano",
    name: "Piano Theme",
    icon: "🎹",
    description: "Soft ivory key tones, warm harmonics, and gentle chord progressions.",
    basePitch: 523.25,
    waveform: "sine",
    decayRate: 0.12,
    reverbAmount: 0.25,
    accentHarmonic: 1.25,
  },
  rock: {
    id: "rock",
    name: "Rock Theme",
    icon: "🏸",
    description: "Subtle guitar pluck transients, tube warmth, and punchy UI snaps.",
    basePitch: 440,
    waveform: "square",
    decayRate: 0.06,
    reverbAmount: 0.2,
    accentHarmonic: 2.2,
  },
  orchestra: {
    id: "orchestra",
    name: "Orchestra Theme",
    icon: "🌜",
    description: "Rich orchestral brass stings, woodwind blips, and timpani accents.",
    basePitch: 587.33,
    waveform: "triangle",
    decayRate: 0.15,
    reverbAmount: 0.4,
    accentHarmonic: 1.6,
  },
  futuristic: {
    id: "futuristic",
    name: "Futuristic Theme",
    icon: "🌰",
    description: "Sci-fi interface chirps, energy hums, and sub-bass resonance.",
    basePitch: 1200,
    waveform: "sine",
    decayRate: 0.03,
    reverbAmount: 0.3,
    accentHarmonic: 3.0,
  },
  hiphop: {
    id: "hiphop",
    name: "Hip-Hop Theme",
    icon: "🧁",
    description: "Percussive 808 rimshots, hi-hat ticks, and vinyl crackle accents.",
    basePitch: 350,
    waveform: "triangle",
    decayRate: 0.05,
    reverbAmount: 0.1,
    accentHarmonic: 1.8,
  },
};
