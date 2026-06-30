import { WindowState } from './WindowTypes';

export function getWindowAnimationPreset(state: WindowState) {
  switch (state) {
    case 'hidden':
      return { opacity: 0, scale: 0.96, x: 24 };
    case 'peek':
      return { opacity: 1, scale: 0.98, x: 0 };
    case 'docked':
      return { opacity: 1, scale: 1, x: 0 };
    case 'floating':
      return { opacity: 1, scale: 1, x: 0 };
    case 'pinned':
      return { opacity: 1, scale: 1, x: 0 };
    case 'minimized':
      return { opacity: 1, scale: 0.9, x: 0 };
    case 'expanded':
      return { opacity: 1, scale: 1.02, x: 0 };
    case 'fullscreen':
      return { opacity: 1, scale: 1, x: 0 };
    default:
      return { opacity: 1, scale: 1, x: 0 };
  }
}

export const WINDOW_SPRING = { type: 'spring', damping: 24, stiffness: 220 };
