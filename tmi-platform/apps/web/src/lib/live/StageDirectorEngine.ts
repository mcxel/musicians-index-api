/**
 * StageDirectorEngine — unified coordinator for lighting, effects, camera, and banners.
 *
 * This is the message bus between the GoLiveRuntime control canisters
 * (LightingCanister, DirectorCanister, BannerCanister) and the venue
 * rendering layer (UniversalVenueRenderer, AudienceScene).
 *
 * Approach:
 * - Module-level state + event emitter pattern (same as AudiencePresenceEngine)
 * - CSS custom properties bridge: changes are applied to document.documentElement
 *   so any component can consume --venue-key-color, --venue-fill-color, etc.
 * - Effect triggers applied as data attributes on the venue root element
 *
 * Inherits data from:
 * - lib/3d/tmiLightingPresets.ts  (key/fill/rim light data)
 * - lib/broadcast/StageBannerEngine.ts  (banner rotation logic)
 * - lib/live/BroadcastDirectorEngine.ts  (camera shot selection)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type StageLightingPreset = {
  id: string;
  label: string;
  primaryColor: string;
  secondaryColor: string;
  rimColor: string;
  fogColor?: string;
  fogEnabled: boolean;
  bloom: number;
};

export type StageEffect =
  | 'none'
  | 'strobe'
  | 'fog-roll'
  | 'laser-scan'
  | 'confetti-burst'
  | 'spotlight-sweep'
  | 'crowd-glow';

export type CameraAngle =
  | 'front'
  | 'side'
  | 'overhead'
  | 'audience'
  | 'wide'
  | 'close-up'
  | 'behind-stage';

export type StageDirectorState = {
  lightingPresetId: string;
  activeEffect: StageEffect;
  effectIntensity: number;
  cameraAngle: CameraAngle;
  bannerText: string | null;
  bannerColor: string;
  autoRotate: boolean;
};

// ─── Lighting presets (extends tmiLightingPresets.ts with stage-specific data) ──

export const STAGE_LIGHTING_PRESETS: Record<string, StageLightingPreset> = {
  'purple-wash': {
    id: 'purple-wash',
    label: 'Purple Wash',
    primaryColor: '#AA2DFF',
    secondaryColor: '#6A1AFF',
    rimColor: '#FF2DAA',
    fogEnabled: true,
    fogColor: '#1A0A2E',
    bloom: 0.65,
  },
  'blue-arena': {
    id: 'blue-arena',
    label: 'Blue Arena',
    primaryColor: '#00E5FF',
    secondaryColor: '#0066FF',
    rimColor: '#00AAFF',
    fogEnabled: true,
    fogColor: '#0A1020',
    bloom: 0.6,
  },
  'concert-red': {
    id: 'concert-red',
    label: 'Concert Red',
    primaryColor: '#FF2020',
    secondaryColor: '#FF6020',
    rimColor: '#FFD700',
    fogEnabled: true,
    fogColor: '#1A0808',
    bloom: 0.7,
  },
  'spotlight': {
    id: 'spotlight',
    label: 'Spotlight',
    primaryColor: '#FFD700',
    secondaryColor: '#FFF5CC',
    rimColor: '#FFFFFF',
    fogEnabled: false,
    bloom: 0.5,
  },
  'audience-glow': {
    id: 'audience-glow',
    label: 'Audience Glow',
    primaryColor: '#FF2DAA',
    secondaryColor: '#FF66CC',
    rimColor: '#AA2DFF',
    fogEnabled: true,
    fogColor: '#1A0818',
    bloom: 0.72,
  },
  'strobe': {
    id: 'strobe',
    label: 'Strobe',
    primaryColor: '#FFFFFF',
    secondaryColor: '#CCCCCC',
    rimColor: '#FFFFFF',
    fogEnabled: false,
    bloom: 0.9,
  },
  'blackout': {
    id: 'blackout',
    label: 'Blackout',
    primaryColor: '#111111',
    secondaryColor: '#000000',
    rimColor: '#222222',
    fogEnabled: false,
    bloom: 0.0,
  },
  'rainbow': {
    id: 'rainbow',
    label: 'Rainbow Cycle',
    primaryColor: '#FF6B35',
    secondaryColor: '#AA2DFF',
    rimColor: '#00E5FF',
    fogEnabled: true,
    fogColor: '#0A0614',
    bloom: 0.75,
  },
};

// ─── Module-level state ───────────────────────────────────────────────────────

const DEFAULT_STATE: StageDirectorState = {
  lightingPresetId: 'purple-wash',
  activeEffect: 'none',
  effectIntensity: 1.0,
  cameraAngle: 'front',
  bannerText: null,
  bannerColor: '#00E5FF',
  autoRotate: true,
};

let _state: StageDirectorState = { ...DEFAULT_STATE };
const _listeners = new Set<(state: StageDirectorState) => void>();

function _emit(): void {
  _listeners.forEach(fn => fn({ ..._state }));
  _applyCssVars();
}

// ─── CSS bridge ───────────────────────────────────────────────────────────────

function _applyCssVars(): void {
  if (typeof document === 'undefined') return;
  const preset = STAGE_LIGHTING_PRESETS[_state.lightingPresetId];
  if (!preset) return;

  const root = document.documentElement;
  root.style.setProperty('--venue-key-color', preset.primaryColor);
  root.style.setProperty('--venue-fill-color', preset.secondaryColor);
  root.style.setProperty('--venue-rim-color', preset.rimColor);
  root.style.setProperty('--venue-bloom', String(preset.bloom));
  root.style.setProperty('--venue-fog-color', preset.fogColor ?? '#0A0614');
  root.style.setProperty('--venue-fog-enabled', preset.fogEnabled ? '1' : '0');

  // Effect class on body for CSS animations
  document.body.setAttribute('data-stage-effect', _state.activeEffect);
  document.body.setAttribute('data-stage-lighting', _state.lightingPresetId);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function setLightingPreset(presetId: string): void {
  if (!STAGE_LIGHTING_PRESETS[presetId]) return;
  _state = { ..._state, lightingPresetId: presetId };
  _emit();
}

export function triggerEffect(effect: StageEffect, intensity = 1.0): void {
  _state = { ..._state, activeEffect: effect, effectIntensity: intensity };
  _emit();
  // Auto-clear one-shot effects after their natural duration
  if (effect === 'confetti-burst') {
    setTimeout(() => clearEffect(), 4000);
  } else if (effect === 'strobe') {
    setTimeout(() => clearEffect(), 3000);
  }
}

export function clearEffect(): void {
  _state = { ..._state, activeEffect: 'none', effectIntensity: 1.0 };
  _emit();
}

export function setCameraAngle(angle: CameraAngle): void {
  _state = { ..._state, cameraAngle: angle };
  _emit();
}

export function showBannerText(text: string, color = '#00E5FF'): void {
  _state = { ..._state, bannerText: text, bannerColor: color };
  _emit();
}

export function clearBannerText(): void {
  _state = { ..._state, bannerText: null };
  _emit();
}

export function setAutoRotate(enabled: boolean): void {
  _state = { ..._state, autoRotate: enabled };
  _emit();
}

export function getStageState(): StageDirectorState {
  return { ..._state };
}

export function getLightingPreset(id: string): StageLightingPreset | null {
  return STAGE_LIGHTING_PRESETS[id] ?? null;
}

export function getCurrentLightingPreset(): StageLightingPreset {
  return STAGE_LIGHTING_PRESETS[_state.lightingPresetId] ?? STAGE_LIGHTING_PRESETS['purple-wash']!;
}

export function onStageDirectorChange(
  callback: (state: StageDirectorState) => void,
): () => void {
  _listeners.add(callback);
  return () => { _listeners.delete(callback); };
}

export function resetStageDirector(): void {
  _state = { ...DEFAULT_STATE };
  _emit();
}

// Hook helper — returns a subscription-ready snapshot
export function useStageDirectorState(): StageDirectorState {
  return { ..._state };
}
