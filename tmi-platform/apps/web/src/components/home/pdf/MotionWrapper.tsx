import type { CSSProperties, ReactNode } from 'react';
import { HOMEPAGE_MOTION_PRESETS } from '@/lib/homepage/motion-presets';

export default function MotionWrapper({ children, style }: Readonly<{ children: ReactNode; style?: CSSProperties }>) {
  const preset = HOMEPAGE_MOTION_PRESETS.pageEnter;
  return (
    <div
      style={{
        opacity: preset.animate.opacity,
        transform: `translateY(${preset.animate.y}px)`,
        transition: `opacity ${preset.transition.durationMs}ms ease, transform ${preset.transition.durationMs}ms ease`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
