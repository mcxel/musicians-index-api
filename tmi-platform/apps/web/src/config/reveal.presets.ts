/**
 * reveal.presets.ts
 * Repo: apps/web/src/config/reveal.presets.ts
 * Action: CREATE | Wave: B7
 * Purpose: Single source of truth for all reveal camera presets and transitions.
 * DO NOT scatter these values in individual components.
 */

export interface CameraPreset {
  id: string;
  label: string;
  description: string;
  defaultTransition?: string;
  suitedFor: ('small_game' | 'big_contest' | 'single' | 'all')[];
  isDefault?: boolean;
}

export interface TransitionPreset {
  id: string;
  label: string;
  durationMs: number;
  style: 'fade' | 'cut' | 'push' | 'dissolve' | 'sweep' | 'zoom';
  isDefault?: boolean;
}

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'hero_zoom',
    label: 'Hero Zoom',
    description: 'Camera pushes in to winner face — final reveal moment',
    defaultTransition: 'push_dramatic',
    suitedFor: ['all'],
    isDefault: true,
  },
  {
    id: 'group_celebration',
    label: 'Group Celebration Wide',
    description: 'Wide shot showing all winners celebrating',
    defaultTransition: 'fade_gold',
    suitedFor: ['small_game', 'big_contest'],
  },
  {
    id: 'podium_pan',
    label: 'Podium Pan',
    description: 'Camera pans across winner rankings 1 to max',
    defaultTransition: 'cut_sharp',
    suitedFor: ['big_contest', 'small_game'],
  },
  {
    id: 'winner_isolation',
    label: 'Winner Isolation',
    description: 'Other winners blur/fade, featured winner stays sharp',
    defaultTransition: 'dissolve_soft',
    suitedFor: ['all'],
  },
  {
    id: 'chaotic_reaction_sweep',
    label: 'Chaotic Reaction Sweep',
    description: 'Quick cuts between winners reacting',
    defaultTransition: 'cut_sharp',
    suitedFor: ['small_game', 'big_contest'],
  },
  {
    id: 'sponsor_overlay_cut',
    label: 'Sponsor Overlay Cut',
    description: 'Featured sponsor overlay appears during transition',
    defaultTransition: 'fade_gold',
    suitedFor: ['all'],
  },
  {
    id: 'crowd_bounce_shot',
    label: 'Crowd Bounce',
    description: 'Simulated crowd energy camera bounce',
    defaultTransition: 'cut_sharp',
    suitedFor: ['big_contest'],
  },
  {
    id: 'final_goodbye_orbit',
    label: 'Final Goodbye Orbit',
    description: 'Closing orbit around featured winner',
    defaultTransition: 'dissolve_soft',
    suitedFor: ['all'],
  },
];

export const TRANSITION_PRESETS: TransitionPreset[] = [
  { id: 'fade_gold', label: 'Fade Gold', durationMs: 600, style: 'fade', isDefault: true },
  { id: 'cut_sharp', label: 'Sharp Cut', durationMs: 80, style: 'cut' },
  { id: 'push_dramatic', label: 'Dramatic Push', durationMs: 800, style: 'push' },
  { id: 'dissolve_soft', label: 'Soft Dissolve', durationMs: 500, style: 'dissolve' },
  { id: 'sweep_left', label: 'Sweep Left', durationMs: 400, style: 'sweep' },
  { id: 'zoom_blast', label: 'Zoom Blast', durationMs: 300, style: 'zoom' },
];

export const DEFAULT_CAMERA_PRESET = CAMERA_PRESETS.find(p => p.isDefault) ?? CAMERA_PRESETS[0];
export const DEFAULT_TRANSITION = TRANSITION_PRESETS.find(t => t.isDefault) ?? TRANSITION_PRESETS[0];
