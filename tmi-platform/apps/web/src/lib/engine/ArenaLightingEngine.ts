export type ArenaVibe = 'calm' | 'hype' | 'battle' | 'dance';

export interface VibePreset {
  primary: string;
  secondary: string;
  accent: string;
  ambientGlow: string;
  pulseIntensity: number; // 0–1
  bpm: number;
}

export const ARENA_VIBES: Record<ArenaVibe, VibePreset> = {
  calm: {
    primary: '#00FFFF',
    secondary: '#0066AA',
    accent: '#00AAFF',
    ambientGlow: 'rgba(0,170,255,0.12)',
    pulseIntensity: 0.3,
    bpm: 72,
  },
  hype: {
    primary: '#FFD700',
    secondary: '#FF2DAA',
    accent: '#FF8800',
    ambientGlow: 'rgba(255,215,0,0.18)',
    pulseIntensity: 0.8,
    bpm: 128,
  },
  battle: {
    primary: '#FF3333',
    secondary: '#AA2DFF',
    accent: '#FF0066',
    ambientGlow: 'rgba(255,51,51,0.2)',
    pulseIntensity: 1.0,
    bpm: 140,
  },
  dance: {
    primary: '#00FF88',
    secondary: '#00FFFF',
    accent: '#FFD700',
    ambientGlow: 'rgba(0,255,136,0.15)',
    pulseIntensity: 0.7,
    bpm: 120,
  },
};

type LightingListener = (vibe: ArenaVibe, event: ArenaLightEvent) => void;

export type ArenaLightEvent =
  | { type: 'wave_pulse'; vibe: ArenaVibe; intensity: number }
  | { type: 'spotlight_dim'; factor: number }
  | { type: 'bpm_sync'; bpm: number }
  | { type: 'vibe_change'; from: ArenaVibe; to: ArenaVibe };

let currentVibe: ArenaVibe = 'calm';
let dimmed = false;
const listeners = new Set<LightingListener>();

function emit(event: ArenaLightEvent): void {
  listeners.forEach((fn) => fn(currentVibe, event));
}

export const ArenaLightingEngine = {
  getVibe(): ArenaVibe {
    return currentVibe;
  },

  getPreset(): VibePreset {
    return ARENA_VIBES[currentVibe];
  },

  setVibe(vibe: ArenaVibe): void {
    if (vibe === currentVibe) return;
    const from = currentVibe;
    currentVibe = vibe;
    emit({ type: 'vibe_change', from, to: vibe });
  },

  triggerWavePulse(overrideVibe?: ArenaVibe): void {
    const vibe = overrideVibe ?? currentVibe;
    const intensity = ARENA_VIBES[vibe].pulseIntensity;
    emit({ type: 'wave_pulse', vibe, intensity });
  },

  dimArena(factor = 0.4): void {
    dimmed = true;
    emit({ type: 'spotlight_dim', factor });
  },

  undimArena(): void {
    dimmed = false;
    emit({ type: 'spotlight_dim', factor: 1.0 });
  },

  isDimmed(): boolean {
    return dimmed;
  },

  syncLightsToBPM(bpm: number): void {
    emit({ type: 'bpm_sync', bpm });
  },

  /** Auto-select vibe from crowd energy score 0–100 */
  autoVibeFromEnergy(energyScore: number): void {
    let target: ArenaVibe;
    if (energyScore >= 85) target = 'battle';
    else if (energyScore >= 65) target = 'hype';
    else if (energyScore >= 40) target = 'dance';
    else target = 'calm';
    ArenaLightingEngine.setVibe(target);
  },

  subscribe(fn: LightingListener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
