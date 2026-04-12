import { HOMEPAGE_MOTION_PRESETS } from '../motion-presets';

export type HomepageMotionPresetKey = keyof typeof HOMEPAGE_MOTION_PRESETS;

export function getHomepageMotionPreset(key: HomepageMotionPresetKey) {
  return HOMEPAGE_MOTION_PRESETS[key];
}
