export type VenueCinematicProfile = {
  id: string;
  lutFilter: string;
  hazeGradient: string;
  stageKeyLight: string;
  audienceRimLight: string;
  floorReflection: string;
  bloomStrength: number;
  hazeOpacity: number;
  reflectionOpacity: number;
};

export const HOME1_OBSIDIAN_PROFILE: VenueCinematicProfile = {
  id: 'home1-obsidian-cinematic',
  lutFilter: 'contrast(1.07) saturate(1.08) brightness(0.95)',
  hazeGradient:
    'radial-gradient(70% 55% at 50% 28%, rgba(255, 183, 94, 0.22) 0%, rgba(170, 45, 255, 0.12) 38%, rgba(5, 5, 16, 0) 74%)',
  stageKeyLight:
    'radial-gradient(52% 34% at 50% 31%, rgba(255, 176, 79, 0.34) 0%, rgba(255, 176, 79, 0.14) 41%, rgba(255, 176, 79, 0) 82%)',
  audienceRimLight:
    'linear-gradient(90deg, rgba(0, 255, 255, 0.14) 0%, rgba(0, 255, 255, 0) 23%, rgba(255, 45, 170, 0) 77%, rgba(255, 45, 170, 0.14) 100%)',
  floorReflection:
    'linear-gradient(180deg, rgba(255, 201, 120, 0) 0%, rgba(255, 201, 120, 0.06) 42%, rgba(0, 255, 255, 0.11) 100%)',
  bloomStrength: 0.16,
  hazeOpacity: 0.58,
  reflectionOpacity: 0.5,
};
