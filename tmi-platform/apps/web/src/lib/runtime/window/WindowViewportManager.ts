import { WindowManagerRuntime } from './WindowManagerRuntime';
import { DockSide } from './WindowTypes';

export interface StageInsets {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function sideInset(side?: DockSide, width = 0, height = 0): StageInsets {
  switch (side) {
    case 'left':
      return { left: width, right: 0, top: 0, bottom: 0 };
    case 'right':
      return { left: 0, right: width, top: 0, bottom: 0 };
    case 'top':
      return { left: 0, right: 0, top: height, bottom: 0 };
    case 'bottom':
      return { left: 0, right: 0, top: 0, bottom: height };
    default:
      return { left: 0, right: 0, top: 0, bottom: 0 };
  }
}

export function computeStageInsets(): StageInsets {
  const { windows } = WindowManagerRuntime.getState();

  return Object.values(windows).reduce<StageInsets>(
    (acc, w) => {
      if (!w.visible || w.state === 'hidden' || w.state === 'floating') return acc;
      const inset = sideInset(w.dockSide, w.rect.width, w.rect.height);
      return {
        left: acc.left + inset.left,
        right: acc.right + inset.right,
        top: acc.top + inset.top,
        bottom: acc.bottom + inset.bottom,
      };
    },
    { left: 0, right: 0, top: 0, bottom: 0 },
  );
}
